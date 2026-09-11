from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Body, Request
from sqlmodel import Session, select
from database import get_db
from models.trainee import Trainee, DSIGNode, DSIGEdge
from models.training_intake import (
    TrainingRecord,
    AssessmentRecord,
    CertificationRecord,
    TraineeSkill,
    ImportBatchLog,
)
from services.intake_validation import validate_training_csv, parse_date
from datetime import datetime, date
import uuid
import os
import json
from typing import Optional, List, Dict, Any

router = APIRouter()

DEMO_CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "demo_data", "CONTINUUM_Module1_Demo_Training_Import.csv")

@router.get("/demo-csv")
def get_demo_csv():
    """Returns the synthetic 100-record demo CSV content."""
    if os.path.exists(DEMO_CSV_PATH):
        with open(DEMO_CSV_PATH, "r", encoding="utf-8") as f:
            return {"filename": "CONTINUUM_Module1_Demo_Training_Import.csv", "content": f.read()}
    raise HTTPException(status_code=404, detail="Demo CSV file not found.")

@router.post("/validate")
async def validate_csv(request: Request, db: Session = Depends(get_db)):
    """
    Validates training data CSV file without modifying database state.
    Accepts either multipart file upload or JSON payload with 'csv_content'.
    """
    content = ""
    filename = "uploaded_training_data.csv"
    content_type = request.headers.get("content-type", "")

    if "application/json" in content_type:
        try:
            payload = await request.json()
            if payload and isinstance(payload, dict):
                content = payload.get("csv_content", "")
                filename = payload.get("filename", filename)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON body.")
    elif "multipart/form-data" in content_type:
        try:
            form = await request.form()
            file = form.get("file")
            if file and hasattr(file, "read"):
                filename = getattr(file, "filename", filename) or filename
                bytes_data = await file.read()
                content = bytes_data.decode("utf-8", errors="replace")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")

    if not content or not content.strip():
        raise HTTPException(status_code=400, detail="No file or CSV content provided.")

    validation_result = validate_training_csv(content, db=db)
    validation_result["filename"] = filename
    validation_result["valid_rows"] = validation_result.get("valid_rows_count", 0)
    validation_result["invalid_rows"] = validation_result.get("invalid_rows_count", 0)
    validation_result["duplicates_dropped"] = validation_result.get("duplicates_dropped_count", 0)

    # Standardize category counts for frontend keys
    raw_cats = validation_result.get("categories", {})
    validation_result["categories"] = {
        "duplicates": raw_cats.get("duplicates", 0),
        "missing_fields": raw_cats.get("missing", 0) or raw_cats.get("missing_fields", 0),
        "date_format_or_sequence": raw_cats.get("dates", 0) or raw_cats.get("date_format_or_sequence", 0),
        "numeric_out_of_range": raw_cats.get("numerics", 0) or raw_cats.get("numeric_out_of_range", 0),
        "logical_constraint": raw_cats.get("logical", 0) or raw_cats.get("logical_constraint", 0),
    }

    # Normalize issue dictionaries to provide both standard naming conventions
    normalized_issues = []
    for iss in validation_result.get("issues", []):
        normalized_issues.append({
            "row": iss.get("row_number") or iss.get("row") or 0,
            "row_number": iss.get("row_number") or iss.get("row") or 0,
            "trainee_id": iss.get("trainee_id", ""),
            "field": iss.get("field", ""),
            "value": iss.get("current_value") or iss.get("value") or "",
            "current_value": iss.get("current_value") or iss.get("value") or "",
            "problem": iss.get("problem", ""),
            "suggested_fix": iss.get("suggested_correction") or iss.get("suggested_fix") or "",
            "suggested_correction": iss.get("suggested_correction") or iss.get("suggested_fix") or "",
            "category": iss.get("category", ""),
        })
    validation_result["issues"] = normalized_issues
    return validation_result

@router.post("/confirm")
def confirm_import(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Persists validated records into normalized CONTINUUM entities:
    TRAINEE -> TRAINING_RECORD -> ASSESSMENT -> CERTIFICATION -> TRAINEE_SKILL
    Preserves identity continuity for existing trainees.
    """
    records = payload.get("records", [])
    filename = payload.get("filename", "training_import.csv")
    total_processed = payload.get("total_rows", len(records))

    if not records:
        raise HTTPException(status_code=400, detail="No records provided for import.")

    batch_code = f"BATCH-{uuid.uuid4().hex[:8].upper()}"
    imported_count = 0
    skipped_count = 0
    trainees_created = 0
    trainees_updated = 0
    duplicate_count = payload.get("duplicate_count", 0)

    for rec in records:
        # Skip records that have blocking issues
        if rec.get("status") != "valid":
            skipped_count += 1
            continue

        trainee_id = rec.get("trainee_id", "").strip()
        if not trainee_id:
            skipped_count += 1
            continue

        name = rec.get("name", "").strip()
        course = rec.get("course", "").strip()
        provider = rec.get("training_provider", "").strip()
        centre = rec.get("training_centre", "").strip()
        batch_id = rec.get("batch_id", "").strip()
        status = rec.get("training_status", "").strip()
        attendance = float(rec.get("attendance_percentage", 0))
        score = float(rec.get("assessment_score", 0))
        result = rec.get("assessment_result", "Pass").strip()
        cert_status = rec.get("certification_status", "Certified").strip()

        # Parse dates safely using multi-format parser
        start_date, _ = parse_date(rec.get("training_start_date", ""))
        end_date, _ = parse_date(rec.get("training_end_date", ""))
        cert_date, _ = parse_date(rec.get("certification_date", ""))

        # 1. Normalize: TRAINEE (Identity Continuity)
        existing_trainee = db.exec(select(Trainee).where(Trainee.trainee_id == trainee_id)).first()
        if existing_trainee:
            existing_trainee.name = name or existing_trainee.name
            existing_trainee.email = rec.get("email") or existing_trainee.email
            existing_trainee.phone = rec.get("contact_number") or existing_trainee.phone
            existing_trainee.district = rec.get("district") or existing_trainee.district
            existing_trainee.state = rec.get("state") or existing_trainee.state
            existing_trainee.program = course or existing_trainee.program
            existing_trainee.provider = provider or existing_trainee.provider
            if end_date:
                existing_trainee.completion_date = end_date
            trainees_updated += 1
        else:
            new_trainee = Trainee(
                trainee_id=trainee_id,
                name=name,
                email=rec.get("email") or f"{trainee_id.lower()}@example.com",
                phone=rec.get("contact_number") or "+91 90000 00000",
                program=course,
                provider=provider,
                enrollment_date=start_date or date(2026, 1, 1),
                completion_date=end_date,
                status=status.lower() if status else "completed",
                district=rec.get("district"),
                state=rec.get("state"),
                gender=rec.get("gender"),
            )
            db.add(new_trainee)
            trainees_created += 1

            # Initialize Core DSIG Node for newly created trainee
            core_node = DSIGNode(
                node_id=f"core-{trainee_id}",
                trainee_id=trainee_id,
                node_type="identity",
                label="Trainee Core",
                value=trainee_id,
                is_active=True,
                valid_from=start_date or date(2026, 1, 1),
                confidence=1.0,
                verification_method="institute_intake"
            )
            db.add(core_node)

        # 2. Normalize: TRAINING_RECORD
        rec_id = f"TRN-{batch_id}-{trainee_id}"
        existing_training = db.exec(select(TrainingRecord).where(TrainingRecord.record_id == rec_id)).first()
        if not existing_training:
            trn = TrainingRecord(
                record_id=rec_id,
                trainee_id=trainee_id,
                course=course,
                sector=rec.get("sector"),
                training_provider=provider,
                training_centre=centre,
                batch_id=batch_id,
                training_start_date=start_date or date(2026, 1, 1),
                training_end_date=end_date or date(2026, 3, 30),
                training_status=status,
                attendance_percentage=attendance
            )
            db.add(trn)

            # Add Training DSIG Node
            trn_node = DSIGNode(
                node_id=f"trn-{rec_id}",
                trainee_id=trainee_id,
                node_type="training",
                label=f"Training: {course}",
                value=rec_id,
                is_active=True,
                valid_from=start_date or date(2026, 1, 1),
                confidence=1.0,
                verification_method="institute_intake"
            )
            db.add(trn_node)

        # 3. Normalize: ASSESSMENT
        asm_id = f"ASM-{batch_id}-{trainee_id}"
        existing_asm = db.exec(select(AssessmentRecord).where(AssessmentRecord.assessment_id == asm_id)).first()
        if not existing_asm:
            asm = AssessmentRecord(
                assessment_id=asm_id,
                trainee_id=trainee_id,
                training_record_id=rec_id,
                course=course,
                assessment_score=score,
                assessment_result=result,
                assessment_date=end_date
            )
            db.add(asm)

        # 4. Normalize: CERTIFICATION
        crt_id = f"CRT-{batch_id}-{trainee_id}"
        existing_crt = db.exec(select(CertificationRecord).where(CertificationRecord.certification_id == crt_id)).first()
        if not existing_crt:
            crt = CertificationRecord(
                certification_id=crt_id,
                trainee_id=trainee_id,
                training_record_id=rec_id,
                course=course,
                certification_status=cert_status,
                certification_date=cert_date
            )
            db.add(crt)

        # 5. Normalize: TRAINEE_SKILL
        skills = rec.get("skills", [])
        for skill_name in skills:
            if skill_name:
                existing_skill = db.exec(
                    select(TraineeSkill)
                    .where(TraineeSkill.trainee_id == trainee_id)
                    .where(TraineeSkill.skill_name == skill_name)
                ).first()
                if not existing_skill:
                    ts = TraineeSkill(
                        trainee_id=trainee_id,
                        skill_name=skill_name,
                        source="training_intake",
                        acquired_date=cert_date or end_date
                    )
                    db.add(ts)

        imported_count += 1

    # Log Batch
    batch_log = ImportBatchLog(
        batch_id=batch_code,
        filename=filename,
        total_rows=total_processed,
        valid_rows=imported_count,
        imported_rows=imported_count,
        skipped_rows=skipped_count,
        failed_rows=skipped_count,
        warnings_count=payload.get("warnings_count", 0),
        status="completed"
    )
    db.add(batch_log)
    db.commit()

    return {
        "status": "success",
        "batch_id": batch_code,
        "filename": filename,
        "total_rows": total_processed,
        "imported_count": imported_count,
        "skipped_count": skipped_count,
        "trainees_created": trainees_created,
        "trainees_updated": trainees_updated,
        "duplicate_count": duplicate_count,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/batches")
def get_import_batches(db: Session = Depends(get_db)):
    """Returns past import batch history."""
    return db.exec(select(ImportBatchLog).order_by(ImportBatchLog.imported_at.desc())).all()

@router.post("/check-duplicate")
def check_candidate_duplicate(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Evaluates an incoming candidate record against existing database trainees using Jaro-Winkler
    and multi-attribute matching (Model 1 Identity Matcher).
    """
    from services.identity_matching_service import check_for_duplicates
    name = payload.get("name", "")
    phone = payload.get("phone", "")
    email = payload.get("email", "")
    district = payload.get("district", "")
    return check_for_duplicates(name=name, phone=phone, email=email, district=district, db=db)

