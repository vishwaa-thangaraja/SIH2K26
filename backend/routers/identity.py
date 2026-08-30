from fastapi import APIRouter, Depends, Body
from sqlmodel import Session, select
from database import get_db
from services.identity_match import compute_identity_match_score
from models.verification import IdentityRecoveryRequest
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/match")
def match_identity(payload: dict = Body(...), db: Session = Depends(get_db)):
    candidate = payload.get("candidate_data", {})
    # Mock existing trainee data fetch
    existing = {"name": "Ravi Kumar", "program": candidate.get("program")}
    return compute_identity_match_score(candidate, existing)

@router.post("/recovery/request")
def request_recovery(payload: dict = Body(...), db: Session = Depends(get_db)):
    req = IdentityRecoveryRequest(
        request_id=str(uuid.uuid4()),
        trainee_id=payload.get("trainee_id", "T001"),
        status="initiated",
        new_phone=payload.get("new_phone", ""),
        anchors_used="Aadhaar, Email",
        match_score=0.9,
        created_at=datetime.utcnow()
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

@router.get("/recovery/{request_id}/status")
def get_recovery_status(request_id: str, db: Session = Depends(get_db)):
    req = db.exec(select(IdentityRecoveryRequest).where(IdentityRecoveryRequest.request_id == request_id)).first()
    return req

@router.patch("/recovery/{request_id}/approve")
def approve_recovery(request_id: str, db: Session = Depends(get_db)):
    req = db.exec(select(IdentityRecoveryRequest).where(IdentityRecoveryRequest.request_id == request_id)).first()
    if req:
        req.status = "approved"
        db.commit()
    return {"status": "approved"}

@router.patch("/update/phone")
def update_phone(payload: dict = Body(...), db: Session = Depends(get_db)):
    return {"status": "success"}
