from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_db
from models.outcome import OutcomeEvent, OutcomeEventRead, OutcomeListResponse, EvidenceRecord
from typing import Optional

router = APIRouter()

@router.get("", response_model=OutcomeListResponse)
def get_outcomes(trainee_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = select(OutcomeEvent)
    if trainee_id:
        query = query.where(OutcomeEvent.trainee_id == trainee_id)
    events = db.exec(query).all()
    return OutcomeListResponse(events=events)

@router.post("", response_model=OutcomeEventRead)
def create_outcome(event: OutcomeEvent, db: Session = Depends(get_db)):
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.get("/{event_id}")
def get_outcome_detail(event_id: str, db: Session = Depends(get_db)):
    event = db.exec(select(OutcomeEvent).where(OutcomeEvent.event_id == event_id)).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    evidence = db.exec(select(EvidenceRecord).where(EvidenceRecord.event_id == event_id)).all()
    return {"event": event, "evidence": evidence}

@router.patch("/{event_id}/verify")
def verify_outcome(event_id: str, status: str, db: Session = Depends(get_db)):
    event = db.exec(select(OutcomeEvent).where(OutcomeEvent.event_id == event_id)).first()
    if not event:
        raise HTTPException(status_code=404)
    event.verification_status = status
    db.commit()
    return {"status": "success"}
