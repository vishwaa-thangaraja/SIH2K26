from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlmodel import Session, select
from database import get_db
from models.outcome import EvidenceRecord
from services.evidence_intelligence import extract_fields_from_document, compare_claim_to_evidence
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/upload")
async def upload_evidence(
    trainee_id: str = Form(...),
    event_id: str = Form(...),
    doc_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    record = EvidenceRecord(
        evidence_id=str(uuid.uuid4()),
        trainee_id=trainee_id,
        event_id=event_id,
        evidence_type=doc_type,
        filename=file.filename,
        upload_date=datetime.utcnow(),
        ocr_status="completed",
        extracted_fields_json='{"mock": "data"}'
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.get("/{evidence_id}/extraction")
def get_extraction(evidence_id: str, db: Session = Depends(get_db)):
    # Mock extraction result
    return extract_fields_from_document("payslip", "doc.pdf")

@router.get("/{evidence_id}/comparison")
def get_comparison(evidence_id: str, db: Session = Depends(get_db)):
    return compare_claim_to_evidence({}, {})

@router.post("/{evidence_id}/confirm")
def confirm_evidence(evidence_id: str, db: Session = Depends(get_db)):
    return {"status": "confirmed"}
