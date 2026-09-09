from sqlmodel import Session, select
from database import engine, create_db_and_tables
from models.trainee import Trainee, DSIGNode, DSIGEdge
from models.outcome import OutcomeEvent, EvidenceRecord
from models.provider import ProviderScorecard, RegionalSkillGap
from datetime import date, datetime, timezone
import json

def seed_all():
    create_db_and_tables()
    with Session(engine) as db:
        existing = db.exec(select(Trainee)).first()
        if existing:
            # Delete old gaps to update with Madurai cluster
            for old_gap in db.exec(select(RegionalSkillGap)).all():
                db.delete(old_gap)
            
            gaps = [
                RegionalSkillGap(district_name="Madurai", state="Tamil Nadu", lat=9.9252, lng=78.1198, skill_demand_score=88, skill_supply_score=62, gap_ratio=1.42, top_demanded_skills=json.dumps(["CNC Machine Operation", "Precision Welding (L5)", "Auto Components"]), top_supplied_skills="[]"),
                RegionalSkillGap(district_name="Coimbatore", state="Tamil Nadu", lat=11.0168, lng=76.9558, skill_demand_score=84, skill_supply_score=59, gap_ratio=1.42, top_demanded_skills=json.dumps(["Industrial Automation", "Pump Fabrication", "Textile Machinery"]), top_supplied_skills="[]"),
                RegionalSkillGap(district_name="Tiruchirappalli", state="Tamil Nadu", lat=10.7905, lng=78.7047, skill_demand_score=74, skill_supply_score=51, gap_ratio=1.45, top_demanded_skills=json.dumps(["Heavy Boiler Welding", "Fabrication Quality Audit", "Thermal Plant Mechanics"]), top_supplied_skills="[]"),
                RegionalSkillGap(district_name="Chennai", state="Tamil Nadu", lat=13.0827, lng=80.2707, skill_demand_score=92, skill_supply_score=68, gap_ratio=1.35, top_demanded_skills=json.dumps(["EV Assembly & Diagnostics", "Robotics Technician", "Industrial IoT"]), top_supplied_skills="[]"),
                RegionalSkillGap(district_name="Salem", state="Tamil Nadu", lat=11.6643, lng=78.1460, skill_demand_score=66, skill_supply_score=49, gap_ratio=1.35, top_demanded_skills=json.dumps(["Steel Fabrication", "Textile Dyeing & Process", "Food Automation"]), top_supplied_skills="[]")
            ]
            db.add_all(gaps)
            db.commit()
            return

        # Check if version-controlled initial_seed.json exists for seamless git clone / pull portability
        import os
        from models.training_intake import TrainingRecord, AssessmentRecord, CertificationRecord, TraineeSkill, ImportBatchLog
        seed_path = os.path.join(os.path.dirname(__file__), "initial_seed.json")
        if os.path.exists(seed_path):
            try:
                with open(seed_path, "r", encoding="utf-8") as f:
                    seed_dict = json.load(f)
                
                # Helper date parser
                def p_date(val):
                    if not val:
                        return None
                    if isinstance(val, str):
                        return datetime.strptime(val[:10], "%Y-%m-%d").date()
                    return val

                def p_dt(val):
                    if not val:
                        return None
                    if isinstance(val, str):
                        try:
                            return datetime.fromisoformat(val)
                        except Exception:
                            return datetime.utcnow()
                    return val

                for tr in seed_dict.get("trainees", []):
                    db.add(Trainee(
                        trainee_id=tr["trainee_id"],
                        name=tr["name"],
                        email=tr["email"],
                        phone=tr["phone"],
                        program=tr["program"],
                        provider=tr["provider"],
                        enrollment_date=p_date(tr.get("enrollment_date")),
                        completion_date=p_date(tr.get("completion_date")),
                        status=tr["status"],
                        date_of_birth=p_date(tr.get("date_of_birth")),
                        gender=tr.get("gender"),
                        district=tr.get("district"),
                        state=tr.get("state"),
                    ))

                for r in seed_dict.get("training_records", []):
                    db.add(TrainingRecord(
                        record_id=r["record_id"],
                        trainee_id=r["trainee_id"],
                        course=r["course"],
                        sector=r.get("sector"),
                        training_provider=r["training_provider"],
                        training_centre=r["training_centre"],
                        batch_id=r["batch_id"],
                        training_start_date=p_date(r["training_start_date"]),
                        training_end_date=p_date(r["training_end_date"]),
                        training_status=r["training_status"],
                        attendance_percentage=float(r.get("attendance_percentage", 0)),
                        created_at=p_dt(r.get("created_at")),
                    ))

                for a in seed_dict.get("assessment_records", []):
                    db.add(AssessmentRecord(
                        assessment_id=a["assessment_id"],
                        trainee_id=a["trainee_id"],
                        training_record_id=a.get("training_record_id"),
                        course=a["course"],
                        assessment_score=float(a.get("assessment_score", 0)),
                        assessment_result=a["assessment_result"],
                        assessment_date=p_date(a.get("assessment_date")),
                    ))

                for c in seed_dict.get("certification_records", []):
                    db.add(CertificationRecord(
                        certification_id=c["certification_id"],
                        trainee_id=c["trainee_id"],
                        training_record_id=c.get("training_record_id"),
                        course=c["course"],
                        certification_status=c["certification_status"],
                        certification_date=p_date(c.get("certification_date")),
                    ))

                for s in seed_dict.get("skills", []):
                    db.add(TraineeSkill(
                        trainee_id=s["trainee_id"],
                        skill_name=s["skill_name"],
                        source=s.get("source", "training_intake"),
                        acquired_date=p_date(s.get("acquired_date")),
                    ))

                for b in seed_dict.get("batch_logs", []):
                    db.add(ImportBatchLog(
                        batch_id=b["batch_id"],
                        filename=b["filename"],
                        total_rows=int(b.get("total_rows", 0)),
                        valid_rows=int(b.get("valid_rows", 0)),
                        imported_rows=int(b.get("imported_rows", 0)),
                        skipped_rows=int(b.get("skipped_rows", 0)),
                        failed_rows=int(b.get("failed_rows", 0)),
                        warnings_count=int(b.get("warnings_count", 0)),
                        status=b["status"],
                        imported_at=p_dt(b.get("imported_at")),
                    ))

                db.commit()
                print(f"[CONTINUUM INIT] Successfully initialized database from version-controlled initial_seed.json ({len(seed_dict.get('trainees', []))} trainees).")
                return
            except Exception as e:
                print(f"[CONTINUUM INIT] Warning: Could not initialize from initial_seed.json: {e}")

        # Trainee
        t = Trainee(
            trainee_id="T001", name="Ravi Kumar", email="ravi.kumar@example.com",
            phone="+91 98765 43210", program="Advanced Welding (NSQF L5)",
            provider="PMKVY National Training Center (Madurai)", enrollment_date=date(2023, 1, 15),
            completion_date=date(2023, 4, 30), status="completed"
        )
        db.add(t)

        # DSIG Nodes
        nodes = [
            DSIGNode(node_id="core-T001", trainee_id="T001", node_type="identity", label="Trainee Core", value="T001", is_active=True, valid_from=date(2023, 1, 15), confidence=1.0, verification_method="system"),
            DSIGNode(node_id="phone-A", trainee_id="T001", node_type="phone", label="Primary Phone (Old)", value="+91 87654 32109", is_active=False, valid_from=date(2023, 1, 15), valid_until=date(2023, 9, 1), confidence=0.95, verification_method="otp"),
            DSIGNode(node_id="phone-B", trainee_id="T001", node_type="phone", label="Primary Phone (Active)", value="+91 98765 43210", is_active=True, valid_from=date(2023, 9, 1), confidence=0.98, verification_method="otp"),
            DSIGNode(node_id="email-1", trainee_id="T001", node_type="email", label="Email", value="ravi.kumar@example.com", is_active=True, valid_from=date(2023, 1, 15), confidence=0.97, verification_method="otp"),
            DSIGNode(node_id="training-1", trainee_id="T001", node_type="training", label="Training ID NSQF L5", value="PMKVY-2023-T001", is_active=True, valid_from=date(2023, 1, 15), confidence=1.0, verification_method="system"),
            DSIGNode(node_id="employer-A", trainee_id="T001", node_type="employer", label="ABC Manufacturing (Active)", value="ABC Manufacturing Pvt Ltd", is_active=True, valid_from=date(2023, 9, 15), confidence=0.86, verification_method="attestation"),
            DSIGNode(node_id="employer-B", trainee_id="T001", node_type="employer", label="XYZ Fabricators (Former)", value="XYZ Fabricators", is_active=False, valid_from=date(2023, 6, 1), valid_until=date(2023, 9, 10), confidence=0.78, verification_method="doc")
        ]
        db.add_all(nodes)

        # DSIG Edges
        edges = [
            DSIGEdge(edge_id="e1", trainee_id="T001", source_node_id="core-T001", target_node_id="phone-A", edge_type="has_anchor", label="Primary Phone (Jan-Sep 2023)", valid_from=date(2023, 1, 15), confidence=1.0),
            DSIGEdge(edge_id="e2", trainee_id="T001", source_node_id="phone-A", target_node_id="phone-B", edge_type="phone_change", label="Phone Updated Sep 2023", valid_from=date(2023, 9, 1), confidence=1.0),
            DSIGEdge(edge_id="e3", trainee_id="T001", source_node_id="core-T001", target_node_id="email-1", edge_type="has_anchor", label="Verified Email", valid_from=date(2023, 1, 15), confidence=1.0),
            DSIGEdge(edge_id="e4", trainee_id="T001", source_node_id="core-T001", target_node_id="training-1", edge_type="has_anchor", label="NSQF Training ID", valid_from=date(2023, 1, 15), confidence=1.0),
            DSIGEdge(edge_id="e5", trainee_id="T001", source_node_id="phone-B", target_node_id="employer-A", edge_type="employed_by", label="ABC Manufacturing (Active)", valid_from=date(2023, 9, 15), confidence=0.9),
            DSIGEdge(edge_id="e6", trainee_id="T001", source_node_id="phone-A", target_node_id="employer-B", edge_type="employed_by", label="XYZ Fabricators (Former)", valid_from=date(2023, 6, 1), confidence=0.8)
        ]
        db.add_all(edges)

        # Outcome Events
        now_utc = datetime.now(timezone.utc)
        events = [
            OutcomeEvent(event_id="evt1", trainee_id="T001", event_type="training", start_date=date(2023, 4, 30), milestone="current", confidence_score=1.0, verification_status="verified", evidence_count=1),
            OutcomeEvent(event_id="evt2", trainee_id="T001", event_type="employment", employer_name="XYZ Fabricators", wage_monthly=14000, start_date=date(2023, 7, 30), milestone="3M", confidence_score=0.78, verification_status="verified", evidence_count=1),
            OutcomeEvent(event_id="evt3", trainee_id="T001", event_type="identity_update", start_date=date(2023, 9, 1), milestone="current", confidence_score=1.0, verification_status="verified", evidence_count=0),
            OutcomeEvent(event_id="evt4", trainee_id="T001", event_type="employment", employer_name="ABC Manufacturing", role="CNC Operator", wage_monthly=18000, start_date=date(2023, 10, 30), milestone="6M", confidence_score=0.86, verification_status="verified", evidence_count=2),
            OutcomeEvent(event_id="evt5", trainee_id="T001", event_type="employment", employer_name="ABC Manufacturing", wage_monthly=20000, start_date=date(2024, 4, 30), milestone="12M", confidence_score=0.91, verification_status="verified", evidence_count=1)
        ]
        db.add_all(events)

        # Evidence Records
        evidences = [
            EvidenceRecord(evidence_id="ev1", trainee_id="T001", event_id="evt4", evidence_type="payslip", filename="oct_2023_payslip.pdf", upload_date=now_utc, ocr_status="completed", document_consistency=0.93, claim_match_score=1.0),
            EvidenceRecord(evidence_id="ev2", trainee_id="T001", event_id="evt4", evidence_type="offer_letter", filename="offer_abc.pdf", upload_date=now_utc, ocr_status="completed", document_consistency=0.89, claim_match_score=1.0),
            EvidenceRecord(evidence_id="ev3", trainee_id="T001", event_id="evt4", evidence_type="employer_attestation", filename="attestation.json", upload_date=now_utc, ocr_status="completed", document_consistency=1.0, claim_match_score=1.0)
        ]
        db.add_all(evidences)

        # Provider Scorecards
        providers = [
            ProviderScorecard(provider_id="P001", provider_name="PMKVY National Training Center (Madurai)", total_trainees=500, placement_rate_3m=0.72, placement_rate_6m=0.81, placement_rate_12m=0.76, wage_adequacy_score=0.78, retention_rate_6m=0.68, evidence_quality_score=0.84, outcome_data_json="{}", updated_at=now_utc),
            ProviderScorecard(provider_id="P002", provider_name="DDUGKY Skills Hub (Madurai)", total_trainees=300, placement_rate_3m=0.61, placement_rate_6m=0.69, placement_rate_12m=0.64, wage_adequacy_score=0.65, retention_rate_6m=0.59, evidence_quality_score=0.71, outcome_data_json="{}", updated_at=now_utc)
        ]
        db.add_all(providers)

        # Regional Skill Gaps
        gaps = [
            RegionalSkillGap(district_name="Madurai", state="Tamil Nadu", lat=9.9252, lng=78.1198, skill_demand_score=88, skill_supply_score=62, gap_ratio=1.42, top_demanded_skills=json.dumps(["CNC Machine Operation", "Precision Welding (L5)", "Auto Components"]), top_supplied_skills="[]"),
            RegionalSkillGap(district_name="Coimbatore", state="Tamil Nadu", lat=11.0168, lng=76.9558, skill_demand_score=84, skill_supply_score=59, gap_ratio=1.42, top_demanded_skills=json.dumps(["Industrial Automation", "Pump Fabrication", "Textile Machinery"]), top_supplied_skills="[]"),
            RegionalSkillGap(district_name="Tiruchirappalli", state="Tamil Nadu", lat=10.7905, lng=78.7047, skill_demand_score=74, skill_supply_score=51, gap_ratio=1.45, top_demanded_skills=json.dumps(["Heavy Boiler Welding", "Fabrication Quality Audit", "Thermal Plant Mechanics"]), top_supplied_skills="[]"),
            RegionalSkillGap(district_name="Chennai", state="Tamil Nadu", lat=13.0827, lng=80.2707, skill_demand_score=92, skill_supply_score=68, gap_ratio=1.35, top_demanded_skills=json.dumps(["EV Assembly & Diagnostics", "Robotics Technician", "Industrial IoT"]), top_supplied_skills="[]"),
            RegionalSkillGap(district_name="Salem", state="Tamil Nadu", lat=11.6643, lng=78.1460, skill_demand_score=66, skill_supply_score=49, gap_ratio=1.35, top_demanded_skills=json.dumps(["Steel Fabrication", "Textile Dyeing & Process", "Food Automation"]), top_supplied_skills="[]")
        ]
        db.add_all(gaps)

        db.commit()

if __name__ == "__main__":
    seed_all()
    print("Database re-seeded with Madurai & Southern Corridor clusters.")
