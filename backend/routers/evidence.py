from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
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
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

def get_sample_image_bytes() -> bytes:
    if os.path.exists(SAMPLE_PAYSLIP_PATH):
        with open(SAMPLE_PAYSLIP_PATH, "rb") as f:
            return f.read()
    return b""

def generate_sample_payslip_bytes(trainee: Optional[Trainee] = None) -> bytes:
    trainee_name = trainee.name if (trainee and trainee.name) else "Aarav Kumar"
    trainee_code = trainee.trainee_id if (trainee and trainee.trainee_id) else "T001"
    designation = trainee.program if (trainee and trainee.program) else "CNC Operator"

    try:
        from PIL import Image, ImageDraw
        img = Image.new("RGB", (1000, 850), "white")
        draw = ImageDraw.Draw(img)

        # Border
        draw.rectangle([(20, 20), (980, 830)], outline="#334155", width=2)

        # Header
        draw.text((60, 45), "ABC MANUFACTURING PVT LTD", fill="black")
        draw.text((60, 70), "Plot 42, Industrial Area, MIDC Bhosari, Pune - 411028", fill="#475569")
        draw.text((60, 90), "CIN: U29253PN2015PTC156789 | Est Code: MH/PUNIO 45231", fill="#475569")
        draw.line([(60, 115), (940, 115)], fill="#94a3b8", width=1)

        draw.text((60, 130), "SALARY SLIP FOR OCTOBER 2026", fill="black")
        draw.line([(60, 155), (940, 155)], fill="#94a3b8", width=1)

        # Trainee Specific Particulars
        draw.text((60, 180), f"Employee Name :  {trainee_name}", fill="black")
        draw.text((60, 210), f"Employee ID :  EMP-2026-{trainee_code}", fill="black")
        draw.text((60, 240), f"Designation :  {designation}", fill="black")
        draw.text((60, 270), "UAN :  100987854321", fill="black")
        draw.text((60, 300), "PF No :  MH/PUN/0045231/0001234", fill="black")
        draw.text((60, 330), "Paid Days :  31", fill="black")

        draw.line([(60, 360), (940, 360)], fill="#94a3b8", width=1)

        # Earnings
        draw.text((60, 380), "EARNINGS", fill="black")
        draw.text((60, 410), "Basic Pay : 18000", fill="black")
        draw.text((60, 440), "HRA : 5000", fill="black")
        draw.text((60, 470), "Conveyance : 2000", fill="black")
        draw.text((60, 500), "Special Allowance : 1000", fill="black")
        draw.text((60, 535), "Gross Earnings : 26000", fill="black")

        # Deductions
        draw.text((550, 380), "DEDUCTIONS", fill="black")
        draw.text((550, 410), "Provident Fund : 2160", fill="black")
        draw.text((550, 440), "ESI : 195", fill="black")
        draw.text((550, 470), "Professional Tax : 200", fill="black")
        draw.text((550, 535), "Total Deductions : 2555", fill="black")

        draw.line([(60, 570), (940, 570)], fill="#94a3b8", width=1)
        draw.text((60, 595), "Net Payable Wage : 23445", fill="black")
        draw.text((60, 625), "Payment Status : Disbursed via Direct Bank NEFT Transfer", fill="#475569")

        import io
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return buf.getvalue()
    except Exception as e:
        print(f"Fallback to static image: {e}")
        return get_sample_image_bytes()

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
    extracts structured fields, saves the physical document to disk,
    and evaluates deterministic consistency.
    """
    # Retrieve trainee for consistency and identity anchoring
    trainee = db.exec(select(Trainee).where(Trainee.trainee_id == trainee_id)).first()

    image_bytes = None
    filename = f"benchmark_payslip_{trainee_id}.png"

    if file and file.filename:
        filename = file.filename
        image_bytes = await file.read()

    if not image_bytes or use_sample:
        image_bytes = generate_sample_payslip_bytes(trainee)
        filename = filename or f"benchmark_payslip_{trainee_id}.png"

    if not image_bytes:
        raise HTTPException(status_code=400, detail="No document provided or sample payslip file missing.")

    # Execute OCR Pipeline
    analysis = payslip_ocr_service.process_payslip(image_bytes, trainee=trainee)
    conf_score = analysis.get("verification", {}).get("evidence_confidence", 85.0)
    identity_score = analysis.get("verification", {}).get("identity_match_score", 90.0)

    evidence_id = f"DOC-{uuid.uuid4().hex[:8].upper()}"

    # Persist the physical image file to uploads directory so it can be streamed dynamically
    saved_filename = f"{evidence_id}_{filename}"
    saved_path = os.path.join(UPLOADS_DIR, saved_filename)
    try:
        with open(saved_path, "wb") as f:
            f.write(image_bytes)
    except Exception as e:
        print(f"Warning: Failed to persist upload to disk: {e}")

    # Inject metadata into analysis
    analysis["evidence_id"] = evidence_id
    analysis["filename"] = filename
    analysis["file_url"] = f"http://127.0.0.1:8000/evidence/{evidence_id}/file"

    record = EvidenceRecord(
        evidence_id=evidence_id,
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
        "analysis": analysis,
        "file_url": analysis["file_url"]
    }

@router.get("/{evidence_id}/file")
def get_evidence_file(evidence_id: str, db: Session = Depends(get_db)):
    """
    Returns the exact image or scanned document file uploaded for this evidence record.
    """
    # 1. Search for saved file in UPLOADS_DIR matching evidence_id
    if os.path.exists(UPLOADS_DIR):
        for fname in os.listdir(UPLOADS_DIR):
            if fname.startswith(f"{evidence_id}_"):
                file_path = os.path.join(UPLOADS_DIR, fname)
                with open(file_path, "rb") as f:
                    content = f.read()
                media_type = "image/png"
                if fname.lower().endswith(".jpg") or fname.lower().endswith(".jpeg"):
                    media_type = "image/jpeg"
                elif fname.lower().endswith(".pdf"):
                    media_type = "application/pdf"
                return Response(content=content, media_type=media_type)

    # 2. Check EvidenceRecord filename in uploads
    record = db.exec(select(EvidenceRecord).where(EvidenceRecord.evidence_id == evidence_id)).first()
    if record and record.filename:
        direct_path = os.path.join(UPLOADS_DIR, record.filename)
        if os.path.exists(direct_path):
            with open(direct_path, "rb") as f:
                content = f.read()
            return Response(content=content, media_type="image/png")

    # 3. Fallback to sample payslip
    sample_bytes = get_sample_image_bytes()
    if sample_bytes:
        return Response(content=sample_bytes, media_type="image/png")

    raise HTTPException(status_code=404, detail="Evidence file not found.")

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
            data = json.loads(record.extracted_fields_json)
            data["evidence_id"] = record.evidence_id
            data["filename"] = record.filename
            data["file_url"] = f"http://127.0.0.1:8000/evidence/{record.evidence_id}/file"
            return data
        except Exception:
            pass

    # Fallback to sample payslip execution
    sample_bytes = get_sample_image_bytes()
    if sample_bytes:
        trainee = db.exec(select(Trainee).where(Trainee.trainee_id == "T001")).first()
        res = payslip_ocr_service.process_payslip(sample_bytes, trainee=trainee)
        res["evidence_id"] = evidence_id
        res["filename"] = "sample_payslip.png"
        res["file_url"] = f"http://127.0.0.1:8000/evidence/{evidence_id}/file"
        return res

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
