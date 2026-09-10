import os
import re
import io
import difflib
from datetime import datetime, date
from typing import Dict, Any, Optional, List, Tuple
from PIL import Image

try:
    import pytesseract
    # Configure Tesseract path if present
    if os.path.exists(r"D:\Tesseract\tesseract.exe"):
        pytesseract.pytesseract.tesseract_cmd = r"D:\Tesseract\tesseract.exe"
except ImportError:
    pytesseract = None

class PayslipOCRService:
    """
    Modular CONTINUUM Payslip OCR and Verification Service.
    Converts unstructured document images into structured fields and runs
    deterministic consistency checks against registered trainee records.
    """

    MONTH_MAP = {
        "january": 1, "jan": 1,
        "february": 2, "feb": 2,
        "march": 3, "mar": 3,
        "april": 4, "apr": 4,
        "may": 5,
        "june": 6, "jun": 6,
        "july": 7, "jul": 7,
        "august": 8, "aug": 8,
        "september": 9, "sep": 9, "sept": 9,
        "october": 10, "oct": 10,
        "november": 11, "nov": 11,
        "december": 12, "dec": 12,
    }

    def run_ocr(self, image_bytes: bytes) -> Tuple[str, str]:
        """Runs Tesseract OCR on image bytes. Returns (raw_text, clarity_grade)."""
        if not pytesseract:
            return "", "low"

        try:
            image = Image.open(io.BytesIO(image_bytes))
            if image.mode not in ("RGB", "L"):
                image = image.convert("RGB")

            raw_text = pytesseract.image_to_string(image)
            clean_text = raw_text.strip()

            word_count = len(clean_text.split())
            if word_count > 40:
                clarity = "high"
            elif word_count > 15:
                clarity = "medium"
            else:
                clarity = "low"

            return clean_text, clarity
        except Exception as e:
            return f"OCR processing error: {str(e)}", "low"

    def parse_numeric(self, val_str: Optional[str]) -> Optional[float]:
        """Parses a currency or numeric value string into float or int."""
        if not val_str:
            return None
        clean = re.sub(r"[^\d.]", "", val_str)
        if not clean:
            return None
        try:
            num = float(clean)
            return int(num) if num.is_integer() else round(num, 2)
        except ValueError:
            return None

    def extract_fields(self, raw_text: str) -> Dict[str, Any]:
        """Extracts structured payslip fields using resilient heuristic regex matching."""
        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]

        # ── 1. EMPLOYER EXTRACTION ──
        company_name = None
        address = None
        cin = None
        establishment_code = None

        for line in lines[:4]:
            if re.search(r"(ltd|pvt|limited|industries|technologies|services|corp|manufacturing|foundation)", line, re.I):
                company_name = re.sub(r"^[^\w]+", "", line).strip()
                break

        if not company_name and len(lines) > 0:
            first_clean = re.sub(r"^[^\w]+", "", lines[0]).strip()
            if len(first_clean) > 4 and first_clean.isupper():
                company_name = first_clean

        for line in lines[:6]:
            if re.search(r"(plot|area|industrial|road|street|nagar|pune|mumbai|chennai|delhi|bengaluru|pin|\d{6})", line, re.I):
                if line != company_name:
                    address = line
                    break

        cin_m = re.search(r"(?:CIN|Registration)[\s:.-]+([A-Z0-9]{15,25})", raw_text, re.I)
        if cin_m:
            cin = cin_m.group(1).strip()

        est_m = re.search(r"(?:Est(?:ablishment)?[\s_]*Code|Code)[\s:.-]+([A-Z0-9/]{6,25})", raw_text, re.I)
        if est_m:
            establishment_code = est_m.group(1).strip()

        gstin = None
        gstin_m = re.search(r"(?:GSTIN|GST[\s_]*N[o0a]|GST)[\s:.-]+([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Zz][0-9A-Z]{1})", raw_text, re.I)
        if gstin_m:
            gstin = gstin_m.group(1).upper().strip()

        # ── 2. EMPLOYEE EXTRACTION ──
        employee_name = None
        employee_id = None
        designation = None
        uan_number = None
        pf_number = None

        name_m = re.search(r"Employee\s*Name[\s:.-]+([^\r\n|]+)", raw_text, re.I)
        if name_m:
            employee_name = re.sub(r"[^\w\s.]", "", name_m.group(1)).strip()

        id_m = re.search(r"Employee\s*ID[\s:.-]+([^\r\n|\s]+)", raw_text, re.I)
        if id_m:
            employee_id = id_m.group(1).strip()

        desig_m = re.search(r"(?:Designation|Role|Position)[\s:.-]+([^\r\n|]+)", raw_text, re.I)
        if desig_m:
            designation = re.sub(r"[^\w\s./-]", "", desig_m.group(1)).strip()

        uan_m = re.search(r"(?:UAN|UUAN)[\s:.-]+([0-9\s]{10,14})", raw_text, re.I)
        if uan_m:
            uan_number = re.sub(r"\s+", "", uan_m.group(1))

        pf_m = re.search(r"(?:PF\s*N[o0a]|PF\s*Number)[\s:.-]+([A-Z0-9/]{8,35})", raw_text, re.I)
        if pf_m:
            pf_number = pf_m.group(1).strip()

        # ── 3. PAY PERIOD EXTRACTION ──
        month = None
        year = None
        paid_days = None

        month_m = re.search(r"(?:FOR|\b)(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\b", raw_text, re.I)
        if month_m:
            month = month_m.group(1).title()

        year_m = re.search(r"\b(20[2-3]\d)\b", raw_text)
        if year_m:
            year = int(year_m.group(1))

        days_m = re.search(r"(?:Paid\s*Days?|Days\s*Worked)[\s:.-]+(\d{1,2})", raw_text, re.I)
        if days_m:
            paid_days = int(days_m.group(1))

        # ── 4. FINANCIALS EXTRACTION ──
        basic_pay = None
        hra = None
        conveyance = None
        special_allowance = None
        gross_earnings = None
        pf = None
        esi = None
        prof_tax = None
        total_deductions = None
        net_payable_wage = None

        basic_m = re.search(r"Bas[ie1l]+[\s_]*Pay[\s:.-]+([0-9,.]+)", raw_text, re.I)
        if basic_m:
            basic_pay = self.parse_numeric(basic_m.group(1))

        hra_m = re.search(r"HRA[\s:.-]+([0-9,.]+)", raw_text, re.I)
        if hra_m:
            hra = self.parse_numeric(hra_m.group(1))

        conv_m = re.search(r"Conveyance[\s:.-]+([0-9,.]+)", raw_text, re.I)
        if conv_m:
            conveyance = self.parse_numeric(conv_m.group(1))

        spec_m = re.search(r"Special[\s_]*Allowance[\s:.-]+([0-9,.]+)", raw_text, re.I)
        if spec_m:
            special_allowance = self.parse_numeric(spec_m.group(1))

        gross_m = re.search(r"(?:G[ro]*ss[\s_]*(?:Earnings?|Salary|Pay)?|Total[\s_]*Earnings?)[\s:.-]+([0-9,.]+)", raw_text, re.I)
        if gross_m:
            gross_earnings = self.parse_numeric(gross_m.group(1))

        pf_ded_m = re.search(r"(?:Provident[\s_]*Fund|EPF|PF)[\s:.-]+([0-9,.]+)", raw_text, re.I)
        if pf_ded_m:
            pf = self.parse_numeric(pf_ded_m.group(1))

        esi_m = re.search(r"(?:ESI|ESIC|\bSt\b)[\s:.-]+([0-9,.]+)", raw_text, re.I)
        if esi_m:
            esi = self.parse_numeric(esi_m.group(1))

        pt_m = re.search(r"(?:Professional[\s_]*Tax|PT)[\s:.-]+([0-9,.]+)", raw_text, re.I)
        if pt_m:
            prof_tax = self.parse_numeric(pt_m.group(1))

        ded_m = re.search(r"(?:Total[\s_]*Deductions?|Deductions?)[\s:.-]+([0-9,.]+)", raw_text, re.I)
        if ded_m:
            total_deductions = self.parse_numeric(ded_m.group(1))

        net_m = re.search(r"(?:Net[\s_]*(?:Payable|Pay)?[\s_]*(?:Wage|Amount|Salary)?|Take[\s_]*Home)[\s:.-]+([0-9,.]+)", raw_text, re.I)
        if net_m:
            net_payable_wage = self.parse_numeric(net_m.group(1))

        # Bank Credit SMS fallback detection for Net Wage & Company
        if not net_payable_wage:
            sms_net_m = re.search(r"(?:credited[\s_]*(?:with|by)?|credit[\s_]*amount|salary[\s_]*of)[\s:.-]*(?:INR|Rs\.?|₹)?[\s]*([0-9,.]+)", raw_text, re.I)
            if sms_net_m:
                net_payable_wage = self.parse_numeric(sms_net_m.group(1))

        if not company_name:
            sms_comp_m = re.search(r"(?:by|from|info\/)[\s:.-]+([A-Za-z0-9\s.,&-]+?)(?:SALARY|PVT|LTD|\bon\b|\bfor\b)", raw_text, re.I)
            if sms_comp_m:
                company_name = sms_comp_m.group(1).strip()

        return {
            "employer": {
                "company_name": company_name,
                "address": address,
                "registration_or_cin": cin,
                "establishment_code": establishment_code,
                "gstin": gstin,
            },
            "employee": {
                "employee_name": employee_name,
                "employee_id": employee_id,
                "designation": designation,
                "uan_number": uan_number,
                "pf_number": pf_number,
            },
            "pay_period": {
                "month": month,
                "year": year,
                "paid_days": paid_days,
            },
            "financials": {
                "basic_pay": basic_pay,
                "hra": hra,
                "conveyance": conveyance,
                "special_allowance": special_allowance,
                "gross_earnings": gross_earnings,
                "provident_fund_pf": pf,
                "esi": esi,
                "professional_tax": prof_tax,
                "total_deductions": total_deductions,
                "net_payable_wage": net_payable_wage,
            }
        }

    def verify_consistency(
        self,
        extracted: Dict[str, Any],
        trainee: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Runs deterministic consistency checks across extracted fields and CONTINUUM records.
        Calculates an explainable Evidence Consistency Assessment score.
        """
        fin = extracted.get("financials", {})
        emp = extracted.get("employee", {})
        period = extracted.get("pay_period", {})
        anomalies: List[str] = []

        # ── 1. MATHEMATICAL CONSISTENCY (Gross - Deductions == Net) ──
        gross = fin.get("gross_earnings")
        deductions = fin.get("total_deductions")
        net = fin.get("net_payable_wage")

        # Fallback derivations if gross or total deductions were not explicitly labeled
        if gross is None and fin.get("basic_pay") is not None:
            allowances = [fin.get("basic_pay"), fin.get("hra"), fin.get("conveyance"), fin.get("special_allowance")]
            valid_allowances = [a for a in allowances if a is not None]
            if len(valid_allowances) >= 1:
                gross = sum(valid_allowances)
                fin["gross_earnings"] = gross

        if deductions is None:
            ded_comp = [fin.get("provident_fund_pf"), fin.get("esi"), fin.get("professional_tax")]
            valid_ded = [d for d in ded_comp if d is not None]
            if len(valid_ded) >= 2:
                deductions = sum(valid_ded)
                fin["total_deductions"] = deductions

        math_consistent: Optional[bool] = None
        math_status = "unverified"  # "verified" | "mismatch" | "unverified"
        math_message = ""

        # Check if numbers are detected
        if gross is not None and deductions is not None and net is not None:
            expected_net = gross - deductions
            diff = abs(expected_net - net)
            if diff <= 2.0:
                math_consistent = True
                math_status = "verified"
                math_message = f"Gross Pay (₹{gross:,.0f}) - Total Deductions (₹{deductions:,.0f}) = Stated Net Pay (₹{net:,.0f}) [Arithmetic Verified]"
            else:
                math_consistent = False
                math_status = "mismatch"
                math_message = f"Arithmetic variance detected: Gross (₹{gross:,.0f}) - Deductions (₹{deductions:,.0f}) = ₹{expected_net:,.0f}, but stated Net Pay is ₹{net:,.0f} (Delta: ₹{diff:,.0f})."
                anomalies.append(
                    f"Arithmetic variance: Gross (₹{gross}) - Deductions (₹{deductions}) = ₹{expected_net}, but stated Net Pay is ₹{net} (Delta: ₹{diff})."
                )
        else:
            math_consistent = None
            math_status = "unverified"
            missing_parts = []
            if gross is None:
                missing_parts.append("Gross Pay")
            if deductions is None:
                missing_parts.append("Total Deductions")
            if net is None:
                missing_parts.append("Net Pay")
            math_message = f"Mathematical report unverified: Required figure(s) ({', '.join(missing_parts)}) were not detected in document scan."
            anomalies.append(
                f"Financial figures unverified: Key figures ({', '.join(missing_parts)}) not detected in document scan."
            )

        # ── Deductions Component Summation ──
        deductions_consistent: Optional[bool] = None
        deductions_status = "unverified"  # "verified" | "mismatch" | "unverified"
        deductions_message = ""
        ded_components = [fin.get("provident_fund_pf"), fin.get("esi"), fin.get("professional_tax")]
        valid_ded_components = [v for v in ded_components if v is not None]

        if deductions is not None and len(valid_ded_components) >= 2:
            sum_comp = sum(valid_ded_components)
            if abs(sum_comp - deductions) <= 2.0:
                deductions_consistent = True
                deductions_status = "verified"
                deductions_message = f"Sum of statutory deduction components (₹{sum_comp:,.0f}) matches stated Total Deductions (₹{deductions:,.0f})."
            else:
                deductions_consistent = False
                deductions_status = "mismatch"
                deductions_message = f"Deductions breakdown variance: Sum of components (₹{sum_comp:,.0f}) vs stated Total Deductions (₹{deductions:,.0f})."
                anomalies.append(
                    f"Deductions breakdown variance: Sum of components (₹{sum_comp}) vs stated Total Deductions (₹{deductions})."
                )
        else:
            deductions_consistent = None
            deductions_status = "unverified"
            deductions_message = "Statutory deduction breakdown components (EPF, ESI, PT) not itemized or detected in document."

        def get_field(obj: Any, *keys: str) -> Optional[Any]:
            if not obj:
                return None
            for k in keys:
                if isinstance(obj, dict) and k in obj:
                    return obj[k]
                val = getattr(obj, k, None)
                if val is not None:
                    return val
            return None

        # ── 2. IDENTITY CONSISTENCY ──
        identity_match = None
        identity_match_score = None
        trainee_name = get_field(trainee, "name", "full_name")

        if trainee_name and emp.get("employee_name"):
            db_name = str(trainee_name).strip().lower()
            ocr_name = emp["employee_name"].strip().lower()
            ratio = difflib.SequenceMatcher(None, db_name, ocr_name).ratio()
            identity_match_score = round(ratio * 100, 1)

            if identity_match_score >= 80.0:
                identity_match = True
            else:
                identity_match = False
                anomalies.append(
                    f"Candidate identity divergence: CONTINUUM registry has '{trainee_name}', payslip shows '{emp['employee_name']}' (Match score: {identity_match_score}%)."
                )
        elif emp.get("employee_name"):
            identity_match = True
            identity_match_score = 90.0

        # ── 3. TIMELINE CONSISTENCY ──
        timeline_consistent = None
        payslip_year = period.get("year")
        payslip_month = period.get("month")
        comp_date = get_field(trainee, "completion_date", "training_completion_date")

        if comp_date and payslip_year and payslip_month:
            if isinstance(comp_date, str):
                try:
                    comp_date = datetime.strptime(comp_date, "%Y-%m-%d").date()
                except Exception:
                    comp_date = None

            if isinstance(comp_date, (datetime, date)):
                p_month_num = self.MONTH_MAP.get(payslip_month.lower(), 1)
                payslip_date = date(payslip_year, p_month_num, 1)

                if payslip_date >= comp_date:
                    timeline_consistent = True
                else:
                    timeline_consistent = False
                    anomalies.append(
                        f"Temporal sequence conflict: Payslip period ({payslip_month} {payslip_year}) occurs before training completion date ({comp_date.strftime('%d-%b-%Y')})."
                    )
        elif payslip_year:
            curr_year = datetime.utcnow().year
            if 2020 <= payslip_year <= curr_year + 1:
                timeline_consistent = True

        # ── 4. OCCUPATIONAL RELEVANCE ──
        employment_relevance = None
        desig = emp.get("designation")
        trainee_program = get_field(trainee, "program", "course_name", "trade")
        if trainee_program and desig:
            prog_words = set(re.findall(r"\w+", str(trainee_program).lower()))
            desig_words = set(re.findall(r"\w+", desig.lower()))
            overlap = prog_words.intersection(desig_words)

            common_roles = {
                "welding": ["welder", "operator", "fabricator", "technician"],
                "data": ["analyst", "operator", "associate", "developer"],
                "cnc": ["operator", "machinist", "programmer"],
                "electrical": ["electrician", "technician", "wireman"],
            }
            is_relevant = bool(overlap)
            if not is_relevant:
                for key, roles in common_roles.items():
                    if any(key in w for w in prog_words) and any(r in desig.lower() for r in roles):
                        is_relevant = True
                        break

            employment_relevance = is_relevant
            if not is_relevant:
                anomalies.append(
                    f"Occupational check: Role '{desig}' has limited direct correlation with enrolled program '{trainee_program}'."
                )
        elif desig:
            employment_relevance = True

        # ── 5. COMPOSITE EVIDENCE SCORE ──
        # Autonomous verification requires arithmetic verification AND candidate identity match
        weights = []
        scores = []

        if math_status == "verified":
            weights.append(35)
            scores.append(35)
        elif math_status == "mismatch":
            weights.append(35)
            scores.append(0)  # Heavy penalty for calculation discrepancy
        else:  # "unverified" (figures not detected)
            weights.append(35)
            scores.append(10)  # Low neutral score; cannot reach autonomous 86-94% without verified figures

        if identity_match_score is not None:
            weights.append(35)
            scores.append(round((identity_match_score / 100.0) * 35, 1))
        elif identity_match is True:
            weights.append(35)
            scores.append(32)
        else:
            weights.append(35)
            scores.append(10)

        if timeline_consistent is not None:
            weights.append(15)
            scores.append(15 if timeline_consistent else 0)
        else:
            weights.append(15)
            scores.append(10)

        if employment_relevance is not None:
            weights.append(15)
            scores.append(15 if employment_relevance else 5)
        else:
            weights.append(15)
            scores.append(10)

        total_weight = sum(weights) or 100
        raw_score = sum(scores)
        evidence_confidence = round((raw_score / total_weight) * 100)

        return {
            "math_status": math_status,
            "math_consistent": math_consistent,
            "math_message": math_message,
            "deductions_status": deductions_status,
            "deductions_consistent": deductions_consistent,
            "deductions_message": deductions_message,
            "identity_match": identity_match,
            "identity_match_score": identity_match_score or 90.0,
            "timeline_consistent": timeline_consistent,
            "employment_relevance": employment_relevance,
            "anomalies": anomalies,
            "evidence_confidence": min(100, max(0, evidence_confidence)),
        }

    def process_payslip(
        self,
        image_bytes: bytes,
        trainee: Optional[Any] = None,
        fallback_raw_text: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Complete end-to-end pipeline:
        Image -> OCR -> Structured Fields -> Deterministic Consistency Verification.
        """
        raw_text = ""
        clarity = "medium"

        if image_bytes and len(image_bytes) > 0:
            raw_text, clarity = self.run_ocr(image_bytes)

        if not raw_text.strip() and fallback_raw_text:
            raw_text = fallback_raw_text.strip()
            clarity = "medium"

        extracted = self.extract_fields(raw_text)
        verification = self.verify_consistency(extracted, trainee=trainee)

        return {
            "document_type": "payslip",
            "ocr": {
                "raw_text": raw_text,
                "text_clarity": clarity,
            },
            "employer": extracted["employer"],
            "employee": extracted["employee"],
            "pay_period": extracted["pay_period"],
            "financials": extracted["financials"],
            "verification": verification,
        }

payslip_ocr_service = PayslipOCRService()
