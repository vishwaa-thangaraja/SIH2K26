from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlmodel import Session, select
from database import get_db
from models.outcome import EvidenceRecord, OutcomeEvent
from models.trainee import Trainee
from services.payslip_ocr_service import payslip_ocr_service
from services.evidence_intelligence import compare_claim_to_evidence
from datetime import datetime
from typing import Optional, Dict, Any
import uuid
import json
import os

router = APIRouter()

SAMPLE_PAYSLIP_PATH = os.path.join(os.path.dirname(__file__), "..", "test_payslip.png")

def get_sample_image_bytes() -> bytes:
    if os.path.exists(SAMPLE_PAYSLIP_PATH):
        with open(SAMPLE_PAYSLIP_PATH, "rb") as f:
            return f.read()
    return b""

@router.post("/upload")
async def upload_evidence(
    trainee_id: str = Form("T001"),
    event_id: Optional[str] = Form(None),
    doc_type: str = Form("payslip"),
    use_sample: Optional[bool] = Form(False),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Uploads a payslip or supporting document, executes Tesseract OCR,
    extracts structured fields, and evaluates deterministic consistency.
    """
    image_bytes = None
    filename = "sample_payslip.png"

    if file and file.filename:
        filename = file.filename
        image_bytes = await file.read()

    if not image_bytes or use_sample:
        image_bytes = get_sample_image_bytes()
        filename = filename or "sample_payslip.png"

    if not image_bytes:
        raise HTTPException(status_code=400, detail="No document provided or sample payslip file missing.")

    # Retrieve trainee for consistency and identity anchoring
    trainee = db.exec(select(Trainee).where(Trainee.trainee_id == trainee_id)).first()

    # Execute OCR Pipeline
    analysis = payslip_ocr_service.process_payslip(image_bytes, trainee=trainee)
    conf_score = analysis.get("verification", {}).get("evidence_confidence", 85.0)
    identity_score = analysis.get("verification", {}).get("identity_match_score", 90.0)

    record = EvidenceRecord(
        evidence_id=f"DOC-{uuid.uuid4().hex[:8].upper()}",
        trainee_id=trainee_id,
        event_id=event_id,
        evidence_type=doc_type,
        filename=filename,
        upload_date=datetime.utcnow(),
        ocr_status="completed",
        extracted_fields_json=json.dumps(analysis),
        document_consistency=conf_score,
        claim_match_score=identity_score
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "evidence_id": record.evidence_id,
        "record": record,
        "analysis": analysis
    }

@router.post("/analyze-payslip")
async def analyze_payslip(
    trainee_id: Optional[str] = Form("T001"),
    use_sample: Optional[bool] = Form(False),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Directly runs Tesseract OCR and consistency analysis on an uploaded payslip or sample.
    """
    image_bytes = None
    if file and file.filename:
        image_bytes = await file.read()

    if not image_bytes or use_sample:
        image_bytes = get_sample_image_bytes()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="No image provided and sample payslip unavailable.")

    trainee = db.exec(select(Trainee).where(Trainee.trainee_id == trainee_id)).first()
    analysis = payslip_ocr_service.process_payslip(image_bytes, trainee=trainee)
    return analysis

@router.get("/{evidence_id}/extraction")
def get_extraction(evidence_id: str, db: Session = Depends(get_db)):
    """
    Returns OCR extraction results for a given evidence record ID.
    If record is not found (or is DOC001 demo), runs or returns the standard sample extraction.
    """
    record = db.exec(select(EvidenceRecord).where(EvidenceRecord.evidence_id == evidence_id)).first()
    if record and record.extracted_fields_json:
        try:
            return json.loads(record.extracted_fields_json)
        except Exception:
            pass

    # Fallback to sample payslip execution
    sample_bytes = get_sample_image_bytes()
    if sample_bytes:
        trainee = db.exec(select(Trainee).where(Trainee.trainee_id == "T001")).first()
        return payslip_ocr_service.process_payslip(sample_bytes, trainee=trainee)

    raise HTTPException(status_code=404, detail="Evidence extraction record not found.")

@router.get("/{evidence_id}/comparison")
def get_comparison(evidence_id: str, db: Session = Depends(get_db)):
    record = db.exec(select(EvidenceRecord).where(EvidenceRecord.evidence_id == evidence_id)).first()
    if record and record.extracted_fields_json:
        try:
            extracted = json.loads(record.extracted_fields_json)
            trainee = db.exec(select(Trainee).where(Trainee.trainee_id == record.trainee_id)).first()
            return {
                "evidence_id": evidence_id,
                "trainee_id": record.trainee_id,
                "extracted": extracted,
                "claim": {
                    "trainee_name": trainee.name if trainee else "Aarav Kumar",
                    "course": trainee.program if trainee else "Data Analytics",
                    "completion_date": str(trainee.completion_date) if trainee else "2026-03-06"
                },
                "verification": extracted.get("verification", {})
            }
        except Exception:
            pass
    return compare_claim_to_evidence({}, {})

@router.post("/{evidence_id}/confirm")
def confirm_evidence(evidence_id: str, db: Session = Depends(get_db)):
    record = db.exec(select(EvidenceRecord).where(EvidenceRecord.evidence_id == evidence_id)).first()
    if record:
        record.ocr_status = "verified"
        db.add(record)
        db.commit()
    return {"status": "confirmed", "evidence_id": evidence_id}
