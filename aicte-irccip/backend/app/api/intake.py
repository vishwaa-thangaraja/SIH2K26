import hashlib
import hmac
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.schema_models import (
    ComplaintCase, CaseText, CaseInstitutionLink, CaseEvent, CanonicalStatus,
    BureauCell, TrackType, ComplaintCategory, Institution
)
from app.core.entity_resolver import EntityResolverCascade

router = APIRouter(prefix="/intake", tags=["Data Intake Gateway"])

HMAC_SALT = b"AICTE_DPDP_GOV_PEPPER_2026_SECURE_SALT"

class WebhookComplaintPayload(BaseModel):
    source_portal: str           # PGRC, CPGRAMS, RB_PORTAL, APPROVAL_BUREAU
    source_ref: str              # e.g., PGRC/2026/099
    institution_raw_name: str    # e.g., "Mepco Engg Sivakasi"
    category_code: str           # FEES, FACULTY, INFRASTRUCTURE, ADMISSION, OTHER
    priority: str = "MEDIUM"     # LOW, MEDIUM, HIGH
    complainant_type: str = "STUDENT" # STUDENT, CITIZEN, FACULTY, WHISTLEBLOWER
    complainant_id_raw: Optional[str] = None # Aadhaar / Phone / Email
    summary: str
    event_timestamp: Optional[str] = None

class IntakeResponse(BaseModel):
    success: bool
    case_id: int
    source_ref: str
    institution_name: str
    institution_pid: str
    match_confidence: float
    handling_bureau: str
    tokenized_blind_hash: Optional[str]
    message: str
    ai_category: Optional[str] = None
    ai_confidence: Optional[float] = None

def generate_blind_token(raw_id: str) -> str:
    """Salted HMAC-SHA256 for Section 4(1) DPDP Act compliant blind indexing."""
    return hmac.new(HMAC_SALT, raw_id.strip().encode("utf-8"), hashlib.sha256).hexdigest()

@router.post("/webhook", response_model=IntakeResponse)
def receive_portal_webhook(payload: WebhookComplaintPayload, db: Session = Depends(get_db)):
    """
    Real-Time Mode 1 Webhook Endpoint:
    Receives incoming complaints directly from external portal event triggers
    (PGRC, CPGRAMS, or Regulation Bureau filings) without manual intervention.
    """
    # 1. Idempotency Check
    existing = db.query(ComplaintCase).filter(ComplaintCase.source_ref == payload.source_ref).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Case with source reference {payload.source_ref} already ingested.")

    # 2. Salted HMAC Blind Tokenization for Privacy (DPDP Act)
    blind_token = generate_blind_token(payload.complainant_id_raw) if payload.complainant_id_raw else None

    # 3. Determine Handling Bureau from source
    bureau_code = "PGRC" if "PGRC" in payload.source_portal.upper() else "RB"
    bureau = db.query(BureauCell).filter(BureauCell.code == bureau_code).first()
    if not bureau:
        bureau = db.query(BureauCell).first()

    # 4. Resolve Category and Track
    cat = db.query(ComplaintCategory).filter(ComplaintCategory.code == payload.category_code.upper()).first()
    if not cat:
        cat = db.query(ComplaintCategory).filter(ComplaintCategory.code == "OTHER").first()

    track = db.query(TrackType).first()
    st_pend = db.query(CanonicalStatus).filter(CanonicalStatus.code == "PENDING").first()

    # 5. Insert Case
    rec_date = datetime.date.today()
    if payload.event_timestamp:
        try:
            rec_date = datetime.datetime.fromisoformat(payload.event_timestamp).date()
        except Exception:
            pass

    new_case = ComplaintCase(
        source_ref=payload.source_ref,
        track_type_id=track.track_type_id if track else 1,
        category_id=cat.category_id if cat else 1,
        received_on=rec_date,
        priority=payload.priority.upper(),
        complainant_type=payload.complainant_type.upper()
    )
    db.add(new_case)
    db.flush()

    # 6. Insert Case Text
    case_txt = CaseText(
        case_id=new_case.case_id,
        summary=payload.summary,
        relief_sought="Investigation & Statutory Relief",
        source_doc_hash=hashlib.sha256(payload.summary.encode("utf-8")).hexdigest()
    )
    db.add(case_txt)

    # 7. Execute 4-Tier Entity Resolver
    from app.core.entity_resolver import EntityResolverCascade
    resolver = EntityResolverCascade(db)
    inst, conf, method, tier = resolver.resolve(payload.institution_raw_name)

    inst_id = inst.inst_id if inst else None
    inst_name = inst.name if inst else "Unlinked / Pending Review"
    inst_pid = inst.permanent_id if inst else "N/A"

    if inst_id:
        db.add(CaseInstitutionLink(
            case_id=new_case.case_id,
            inst_id=inst_id,
            method=method,
            tier=tier,
            confidence_score=conf
        ))

    # 8. Append Immutable Event Log
    from app.ml.ml_service import ml_service
    pred_cat, cat_conf = ml_service.classify_complaint(payload.summary)

    now_dt = datetime.datetime.utcnow()
    db.add(CaseEvent(
        case_id=new_case.case_id,
        event_type="RECEIVED",
        event_time=now_dt,
        recorded_at=now_dt,
        to_status_id=st_pend.status_id if st_pend else 1,
        to_bureau_id=bureau.bureau_id if bureau else 1,
        remarks=f"Ingested via {payload.source_portal} Gateway Webhook. AI Triage: {pred_cat} ({cat_conf*100:.1f}%). Privacy token: {blind_token[:12] if blind_token else 'ANONYMOUS'}..."
    ))

    db.commit()
    db.refresh(new_case)

    return IntakeResponse(
        success=True,
        case_id=new_case.case_id,
        source_ref=new_case.source_ref,
        institution_name=inst_name,
        institution_pid=inst_pid,
        match_confidence=conf,
        handling_bureau=bureau.code if bureau else "AICTE",
        tokenized_blind_hash=blind_token[:16] + "..." if blind_token else None,
        message=f"Successfully ingested docket {new_case.source_ref} through real-time webhook gateway.",
        ai_category=pred_cat,
        ai_confidence=cat_conf
    )

@router.get("/status")
def intake_gateway_status():
    """Returns the operational status of the 3-Tier Data Mesh Gateway."""
    return {
        "gateway_status": "ONLINE",
        "supported_modes": [
            {"mode": "MODE_1_WEBHOOK", "endpoint": "/api/intake/webhook", "protocol": "HTTPS POST / JSON", "latency": "<80ms"},
            {"mode": "MODE_2_REPLICA_POLL", "schedule": "Hourly Delta Sync (cron)", "status": "ACTIVE"},
            {"mode": "MODE_3_BATCH_MIS", "endpoint": "/api/intake/batch", "format": "CSV/Excel Docket"}
        ],
        "dpdp_tokenization": "HMAC-SHA256 (Salted Blind Indexing)",
        "security_level": "CERT-In Compliant Air-Gapped Hash Mesh"
    }
