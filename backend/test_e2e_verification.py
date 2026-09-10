import sys, os, json
from fastapi.testclient import TestClient
from main import app
from services.payslip_ocr_service import payslip_ocr_service

client = TestClient(app)

print("====================================================")
print("[TEST 2] Testing All FastAPI Modular Endpoints...")
print("====================================================")

endpoints = [
    ('/', 200),
    ('/trainees', 200),
    ('/trainees/T001', 200),
    ('/outcomes?trainee_id=T001', 200),
    ('/evidence', 200),
    ('/evidence/ev1', 200),
    ('/evidence/DOC-096BF585/extraction', 200),
    ('/intelligence/summary', 200),
    ('/intelligence/provider-comparison', 200),
    ('/intelligence/district-density', 200),
    ('/intelligence/hotspot-deficit', 200),
    ('/intake/demo-csv', 200),
    ('/intake/batches', 200),
    ('/communications/logs', 200),
]

for url, expected_status in endpoints:
    resp = client.get(url)
    assert resp.status_code == expected_status, f"FAILED: {url} returned {resp.status_code}, expected {expected_status}"
    data = resp.json()
    count_str = f"{len(data)} items" if isinstance(data, list) else f"{len(data.keys())} keys"
    print(f"  [PASS] GET {url} -> {resp.status_code} ({count_str})")

# Test specific dynamic values
hotspot_resp = client.get('/intelligence/hotspot-deficit')
hotspot_data = hotspot_resp.json()
assert hotspot_data['hub_name'] == 'Madurai Hub', f"Unexpected hub: {hotspot_data}"
assert hotspot_data['live_trainees_in_db'] == 10, f"Unexpected trainee count: {hotspot_data}"
assert hotspot_data['audited_certified'] == 10, f"Unexpected certified count: {hotspot_data}"
assert 'CNC' in hotspot_data['trades'], f"Trades not dynamic: {hotspot_data}"
print("  [PASS] /intelligence/hotspot-deficit is dynamically querying SQLite!")

density_resp = client.get('/intelligence/district-density')
density_data = density_resp.json()
assert len(density_data) >= 5, f"Too few districts: {len(density_data)}"
madurai = next(d for d in density_data if d['district_name'] == 'Madurai')
assert madurai['trainee_count'] == 10, f"Madurai trainee count mismatch: {madurai}"
assert madurai['certified_count'] == 10, f"Madurai cert count mismatch: {madurai}"
assert isinstance(madurai['top_demanded_skills'], list), f"Skills not list: {madurai}"
print("  [PASS] /intelligence/district-density is dynamically querying RegionalSkillGap & Trainees!")
print("[TEST 2 PASSED] All FastAPI endpoints verified!")

print("\n====================================================")
print("[TEST 3] Testing Autonomous OCR Engine Fallback Logic...")
print("====================================================")

# Test 3.1: Valid payslip arithmetic
text_valid = """
ABC MANUFACTURING PVT LTD
GSTIN: 27AAACA1234A1Z5
Employee Name: Ravi Kumar
Employee ID: T001
Gross Earnings: 25000
Total Deductions: 2500
Net Pay: 22500
"""
res_valid = payslip_ocr_service.process_payslip_text(text_valid, candidate_name="Ravi Kumar")
assert res_valid['verification']['math_status'] == 'verified', f"Expected verified: {res_valid}"
assert res_valid['verification']['math_consistent'] is True, f"Expected True: {res_valid}"
assert res_valid['employer']['gstin'] == '27AAACA1234A1Z5', f"Expected GSTIN: {res_valid}"
assert res_valid['verification']['evidence_confidence'] >= 86.0, f"Expected >=86%: {res_valid}"
print("  [PASS] 3.1: Valid Payslip -> math_status='verified', confidence >= 86%")

# Test 3.2: Discrepant payslip arithmetic
text_mismatch = """
ABC MANUFACTURING PVT LTD
Employee Name: Ravi Kumar
Gross Earnings: 25000
Total Deductions: 1000
Net Pay: 22500
"""
res_mismatch = payslip_ocr_service.process_payslip_text(text_mismatch, candidate_name="Ravi Kumar")
assert res_mismatch['verification']['math_status'] == 'mismatch', f"Expected mismatch: {res_mismatch}"
assert res_mismatch['verification']['math_consistent'] is False, f"Expected False: {res_mismatch}"
print("  [PASS] 3.2: Discrepant Payslip -> math_status='mismatch', math_consistent=False")

# Test 3.3: Missing numbers / blur (NO FALSE VARIANCE!)
text_unverified = """
XYZ TECHNOLOGIES
Employee Name: Ravi Kumar
Monthly salary slip
No numeric amounts printed here
"""
res_unverified = payslip_ocr_service.process_payslip_text(text_unverified, candidate_name="Ravi Kumar")
assert res_unverified['verification']['math_status'] == 'unverified', f"Expected unverified: {res_unverified}"
assert res_unverified['verification']['math_consistent'] is None, f"Expected None: {res_unverified}"
assert 'not detected' in res_unverified['verification']['math_message'].lower(), f"Expected notice: {res_unverified}"
print("  [PASS] 3.3: Missing Numbers -> math_status='unverified', math_consistent=None (NO FALSE MISMATCH)")

# Test 3.4: Bank Credit SMS Fallback
text_sms = """
Dear Customer, your A/C 9876 credited with INR 23,445 on 31-Oct-2026 for SALARY from INFOSYS TECHNOLOGIES. Avl Bal: INR 45,000.
"""
res_sms = payslip_ocr_service.process_payslip_text(text_sms, candidate_name="Ravi Kumar")
assert res_sms['financials']['net_payable_wage'] == 23445, f"Expected net wage 23445: {res_sms}"
assert res_sms['verification']['math_status'] == 'unverified', f"SMS should be unverified (not mismatch): {res_sms}"
print("  [PASS] 3.4: Bank Credit SMS -> Net wage extracted (23445), math marked unverified without false variance")

print("[TEST 3 PASSED] All OCR Fallback and Mathematical engine cases verified!")
