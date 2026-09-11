import csv
import io
from datetime import datetime, date
from typing import List, Dict, Any, Tuple, Optional

REQUIRED_COLUMNS = [
    "trainee_id",
    "name",
    "course",
    "batch_id",
    "training_provider",
    "training_centre",
    "training_start_date",
    "training_end_date",
    "training_status",
    "attendance_percentage",
    "assessment_score",
    "certification_status",
]

def parse_date(date_str: str) -> Tuple[Optional[date], Optional[str]]:
    """
    Parses dates supporting ISO (YYYY-MM-DD), Indian/Commonwealth (DD-MM-YYYY),
    slashed variants (DD/MM/YYYY, YYYY/MM/DD), returning (date, error_message).
    """
    if not date_str or not date_str.strip():
        return None, None
    clean = date_str.strip()

    formats = [
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%d/%m/%Y",
        "%Y/%m/%d",
        "%d.%m.%Y",
        "%Y.%m.%d",
    ]

    for fmt in formats:
        try:
            parsed = datetime.strptime(clean, fmt).date()
            return parsed, None
        except ValueError:
            continue

    return None, f"Invalid date format or non-existent date '{clean}'. Expected DD-MM-YYYY or YYYY-MM-DD."

def validate_training_csv(file_content: str, db: Optional[Any] = None) -> Dict[str, Any]:
    """
    Validates a training intake CSV against CONTINUUM Module 1 ingestion rules.
    Returns summary metrics, categorized issues list, and record previews.
    Automatically checks and flags duplicates within the file and against existing database trainees.
    """
    reader = csv.DictReader(io.StringIO(file_content.strip()))
    fieldnames = reader.fieldnames or []

    # 1. Check Required Columns
    missing_columns = [col for col in REQUIRED_COLUMNS if col not in fieldnames]
    if missing_columns:
        return {
            "success": False,
            "has_blocking_errors": True,
            "column_errors": [f"Missing mandatory column: '{col}'" for col in missing_columns],
            "total_rows": 0,
            "valid_rows_count": 0,
            "invalid_rows_count": 0,
            "categories": {"duplicates": 0, "missing": 0, "dates": 0, "numerics": 0, "logical": 0},
            "issues": [],
            "records": [],
        }

    # Fetch existing trainees from DB to detect duplicates across uploads
    existing_db_ids = set()
    all_db_trainees = []
    if db is not None:
        try:
            from models.trainee import Trainee
            from sqlmodel import select
            all_db_trainees = list(db.exec(select(Trainee)).all())
            existing_db_ids = set(str(t.trainee_id).strip() for t in all_db_trainees if t.trainee_id)
        except Exception:
            pass
    else:
        try:
            from database import engine
            from sqlmodel import Session, select
            from models.trainee import Trainee
            with Session(engine) as db_sess:
                all_db_trainees = list(db_sess.exec(select(Trainee)).all())
                existing_db_ids = set(str(t.trainee_id).strip() for t in all_db_trainees if t.trainee_id)
        except Exception:
            pass

    seen_trainee_ids = {}
    issues: List[Dict[str, Any]] = []
    records: List[Dict[str, Any]] = []

    category_counts = {
        "duplicates": 0,
        "missing": 0,
        "dates": 0,
        "numerics": 0,
        "logical": 0,
    }

    row_num = 1  # Header is row 1, data starts at row 2

    for row in reader:
        row_num += 1
        row_issues: List[Dict[str, Any]] = []

        trainee_id = (row.get("trainee_id") or "").strip()
        name = (row.get("name") or "").strip()
        course = (row.get("course") or "").strip()
        batch_id = (row.get("batch_id") or "").strip()
        provider = (row.get("training_provider") or "").strip()
        centre = (row.get("training_centre") or "").strip()
        start_date_str = (row.get("training_start_date") or "").strip()
        end_date_str = (row.get("training_end_date") or "").strip()
        status = (row.get("training_status") or "").strip()
        attendance_str = (row.get("attendance_percentage") or "").strip()
        score_str = (row.get("assessment_score") or "").strip()
        cert_status = (row.get("certification_status") or "").strip()
        cert_date_str = (row.get("certification_date") or "").strip()
        district = (row.get("district") or "").strip()
        state = (row.get("state") or "").strip()

        # Check Missing Required Fields
        fields_to_check = REQUIRED_COLUMNS + ["district"]
        for req_field in fields_to_check:
            val = (row.get(req_field) or "").strip()
            if not val:
                issue = {
                    "row_number": row_num,
                    "trainee_id": trainee_id or f"ROW-{row_num}",
                    "field": req_field,
                    "current_value": "<EMPTY>",
                    "category": "missing",
                    "problem": f"Mandatory field '{req_field}' is missing or empty.",
                    "suggested_correction": f"Provide valid {req_field.replace('_', ' ')} value.",
                    "is_blocking": True,
                }
                row_issues.append(issue)
                category_counts["missing"] += 1

        # Check Duplicate trainee_id in file or existing in database
        is_duplicate = False
        if trainee_id:
            if trainee_id in seen_trainee_ids:
                first_row = seen_trainee_ids[trainee_id]
                is_duplicate = True
                issue = {
                    "row_number": row_num,
                    "trainee_id": trainee_id,
                    "field": "trainee_id",
                    "current_value": trainee_id,
                    "category": "duplicates",
                    "problem": f"Duplicate Trainee ID '{trainee_id}' detected (first appeared on row {first_row}). Automatically dropped from ingestion.",
                    "suggested_correction": "Automatically dropped to protect identity continuity.",
                    "is_blocking": False,
                    "auto_dropped": True,
                }
                row_issues.append(issue)
                category_counts["duplicates"] += 1
            elif trainee_id in existing_db_ids:
                is_duplicate = True
                issue = {
                    "row_number": row_num,
                    "trainee_id": trainee_id,
                    "field": "trainee_id",
                    "current_value": trainee_id,
                    "category": "duplicates",
                    "problem": f"Trainee ID '{trainee_id}' already exists in CONTINUUM database. Automatically dropped from ingestion.",
                    "suggested_correction": "Automatically dropped to protect identity continuity.",
                    "is_blocking": False,
                    "auto_dropped": True,
                }
                row_issues.append(issue)
                category_counts["duplicates"] += 1
            else:
                seen_trainee_ids[trainee_id] = row_num
                # Also check Model 1 duplicate candidate detection across name, phone, email
                if name and all_db_trainees:
                    from services.identity_matching_service import calculate_entity_similarity, MATCH_THRESHOLD
                    contact_no = (row.get("contact_number") or "").strip()
                    email_str = (row.get("email") or "").strip()
                    best_sim = 0.0
                    matched_t = None
                    for ext in all_db_trainees:
                        sim = calculate_entity_similarity(name, contact_no, email_str, district, ext)
                        if sim > best_sim:
                            best_sim = sim
                            matched_t = ext

                    if matched_t and best_sim >= MATCH_THRESHOLD:
                        is_duplicate = True
                        issue = {
                            "row_number": row_num,
                            "trainee_id": trainee_id,
                            "field": "name",
                            "current_value": f"{name} ({contact_no or email_str})",
                            "category": "duplicates",
                            "problem": f"Duplicate Candidate Alert: {int(best_sim * 100)}% match with existing database trainee {matched_t.trainee_id} ({matched_t.name}, {matched_t.district}).",
                            "suggested_correction": f"Verify identity or confirm continuity linking with existing record {matched_t.trainee_id}.",
                            "is_blocking": False,
                            "auto_dropped": True,
                        }
                        row_issues.append(issue)
                        category_counts["duplicates"] += 1

        # Date Validations
        start_dt, start_err = parse_date(start_date_str)
        if start_err:
            issue = {
                "row_number": row_num,
                "trainee_id": trainee_id,
                "field": "training_start_date",
                "current_value": start_date_str,
                "category": "dates",
                "problem": start_err,
                "suggested_correction": "Format as YYYY-MM-DD (e.g. 2026-01-15).",
                "is_blocking": True,
            }
            row_issues.append(issue)
            category_counts["dates"] += 1

        end_dt, end_err = parse_date(end_date_str)
        if end_err:
            issue = {
                "row_number": row_num,
                "trainee_id": trainee_id,
                "field": "training_end_date",
                "current_value": end_date_str,
                "category": "dates",
                "problem": end_err,
                "suggested_correction": "Format as YYYY-MM-DD (e.g. 2026-03-30).",
                "is_blocking": True,
            }
            row_issues.append(issue)
            category_counts["dates"] += 1

        if start_dt and end_dt and start_dt > end_dt:
            issue = {
                "row_number": row_num,
                "trainee_id": trainee_id,
                "field": "training_end_date",
                "current_value": f"Start: {start_date_str}, End: {end_date_str}",
                "category": "dates",
                "problem": "training_start_date cannot be after training_end_date.",
                "suggested_correction": "Ensure end date succeeds start date.",
                "is_blocking": True,
            }
            row_issues.append(issue)
            category_counts["dates"] += 1

        cert_dt, cert_err = parse_date(cert_date_str)
        if cert_date_str and cert_err:
            issue = {
                "row_number": row_num,
                "trainee_id": trainee_id,
                "field": "certification_date",
                "current_value": cert_date_str,
                "category": "dates",
                "problem": cert_err,
                "suggested_correction": "Format as YYYY-MM-DD.",
                "is_blocking": True,
            }
            row_issues.append(issue)
            category_counts["dates"] += 1

        if cert_dt and end_dt and cert_dt < end_dt:
            issue = {
                "row_number": row_num,
                "trainee_id": trainee_id,
                "field": "certification_date",
                "current_value": f"End: {end_date_str}, Cert: {cert_date_str}",
                "category": "dates",
                "problem": "Certification date should not precede training end date.",
                "suggested_correction": "Certification date must be on or after training completion date.",
                "is_blocking": True,
            }
            row_issues.append(issue)
            category_counts["dates"] += 1

        # Numeric Range Validations: Attendance
        attendance_val: Optional[float] = None
        if attendance_str:
            try:
                attendance_val = float(attendance_str)
                if attendance_val < 0 or attendance_val > 100:
                    issue = {
                        "row_number": row_num,
                        "trainee_id": trainee_id,
                        "field": "attendance_percentage",
                        "current_value": attendance_str,
                        "category": "numerics",
                        "problem": f"Attendance must be between 0 and 100 (got {attendance_str}).",
                        "suggested_correction": "Provide a valid percentage from 0 to 100.",
                        "is_blocking": True,
                    }
                    row_issues.append(issue)
                    category_counts["numerics"] += 1
            except ValueError:
                issue = {
                    "row_number": row_num,
                    "trainee_id": trainee_id,
                    "field": "attendance_percentage",
                    "current_value": attendance_str,
                    "category": "numerics",
                    "problem": "Attendance must be a valid numeric value.",
                    "suggested_correction": "Enter integer or decimal value (e.g. 85).",
                    "is_blocking": True,
                }
                row_issues.append(issue)
                category_counts["numerics"] += 1

        # Numeric Range Validations: Assessment Score
        score_val: Optional[float] = None
        if score_str:
            try:
                score_val = float(score_str)
                if score_val < 0 or score_val > 100:
                    issue = {
                        "row_number": row_num,
                        "trainee_id": trainee_id,
                        "field": "assessment_score",
                        "current_value": score_str,
                        "category": "numerics",
                        "problem": f"Assessment score must be between 0 and 100 (got {score_str}).",
                        "suggested_correction": "Provide a score from 0 to 100.",
                        "is_blocking": True,
                    }
                    row_issues.append(issue)
                    category_counts["numerics"] += 1
            except ValueError:
                issue = {
                    "row_number": row_num,
                    "trainee_id": trainee_id,
                    "field": "assessment_score",
                    "current_value": score_str,
                    "category": "numerics",
                    "problem": "Assessment score must be a valid number.",
                    "suggested_correction": "Enter integer or decimal score (e.g. 78).",
                    "is_blocking": True,
                }
                row_issues.append(issue)
                category_counts["numerics"] += 1

        # Logical Inconsistencies
        if cert_status == "Certified" and not cert_date_str:
            issue = {
                "row_number": row_num,
                "trainee_id": trainee_id,
                "field": "certification_date",
                "current_value": "<EMPTY>",
                "category": "logical",
                "problem": "Certified records must have a certification date.",
                "suggested_correction": "Provide certification date for certified trainee.",
                "is_blocking": True,
            }
            row_issues.append(issue)
            category_counts["logical"] += 1

        if status == "In Progress" and cert_date_str:
            issue = {
                "row_number": row_num,
                "trainee_id": trainee_id,
                "field": "certification_date",
                "current_value": cert_date_str,
                "category": "logical",
                "problem": "In Progress records should not have a certification date.",
                "suggested_correction": "Remove certification date or update training_status to Completed.",
                "is_blocking": True,
            }
            row_issues.append(issue)
            category_counts["logical"] += 1

        # Collect all raw skills
        skills = []
        for s in ["skill_1", "skill_2", "skill_3", "skill_4"]:
            sk = (row.get(s) or "").strip()
            if sk:
                skills.append(sk)

        # Determine record status
        has_blocking = any(iss.get("is_blocking", True) for iss in row_issues)
        if is_duplicate:
            record_status = "duplicate_dropped"
        elif has_blocking:
            record_status = "requires_review"
        else:
            record_status = "valid"

        record_preview = {
            "row_number": row_num,
            "trainee_id": trainee_id,
            "name": name,
            "gender": (row.get("gender") or "").strip(),
            "date_of_birth": (row.get("date_of_birth") or "").strip(),
            "contact_number": (row.get("contact_number") or "").strip(),
            "email": (row.get("email") or "").strip(),
            "district": district,
            "state": state,
            "training_provider": provider,
            "training_centre": centre,
            "course": course,
            "sector": (row.get("sector") or "").strip(),
            "batch_id": batch_id,
            "training_start_date": start_date_str,
            "training_end_date": end_date_str,
            "training_status": status,
            "attendance_percentage": attendance_val if attendance_val is not None else 0,
            "assessment_score": score_val if score_val is not None else 0,
            "assessment_result": (row.get("assessment_result") or "").strip(),
            "certification_status": cert_status,
            "certification_date": cert_date_str or None,
            "skills": skills,
            "status": record_status,
            "is_duplicate_dropped": is_duplicate,
            "issue_count": len(row_issues),
        }

        records.append(record_preview)
        issues.extend(row_issues)

    valid_count = sum(1 for r in records if r["status"] == "valid")
    duplicates_dropped_count = sum(1 for r in records if r["status"] == "duplicate_dropped")
    invalid_count = len(records) - valid_count - duplicates_dropped_count

    return {
        "success": True,
        "has_blocking_errors": invalid_count > 0,
        "total_rows": len(records),
        "valid_rows_count": valid_count,
        "invalid_rows_count": invalid_count,
        "duplicates_dropped_count": duplicates_dropped_count,
        "categories": category_counts,
        "issues": issues,
        "records": records,
    }
