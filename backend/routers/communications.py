from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session, select, func
from database import get_db
from models.trainee import Trainee
from models.outcome import OutcomeEvent
from models.communication import CommunicationLog, CommunicationLogRead
from services.messaging_service import get_messaging_provider
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

router = APIRouter()

PORTAL_BASE_URL = "http://localhost:3000"

def build_followup_message(name: str, trainee_id: str, milestone: str, course: Optional[str] = None) -> Dict[str, str]:
    """Generates an official MSDE follow-up message with a direct pre-filled update link."""
    link = f"{PORTAL_BASE_URL}/outcomes/new?trainee_id={trainee_id}&milestone={milestone}&source=sms"
    course_name = f" in {course}" if course else ""
    body = (
        f"Gov of India (MSDE - CONTINUUM): Hello {name}, your {milestone} longitudinal outcome check{course_name} "
        f"is due. Please confirm your employment & salary update here: {link}"
    )
    return {"body": body, "link": link}

@router.post("/send")
def send_followup_message(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Dispatches a follow-up message to a single trainee's registered phone number.
    Records communication event into SQLite audit log.
    """
    trainee_id = payload.get("trainee_id")
    milestone = payload.get("milestone", "6M")
    custom_message = payload.get("message")
    channel = payload.get("channel", "sms")

    if not trainee_id:
        raise HTTPException(status_code=400, detail="trainee_id is mandatory.")

    trainee = db.exec(select(Trainee).where(Trainee.trainee_id == trainee_id)).first()
    if not trainee:
        raise HTTPException(status_code=404, detail=f"Trainee '{trainee_id}' not found.")

    phone = trainee.phone or payload.get("phone_number")
    if not phone:
        raise HTTPException(status_code=400, detail=f"Trainee '{trainee_id}' does not have a registered phone number.")

    # Generate message content with portal link
    generated = build_followup_message(trainee.name, trainee.trainee_id, milestone, trainee.program)
    message_body = custom_message if custom_message else generated["body"]
    portal_link = generated["link"]

    provider = get_messaging_provider()
    dispatch_res = provider.send_sms(phone, message_body)

    comm_id = f"COMM-{uuid.uuid4().hex[:8].upper()}"
    status = dispatch_res.get("status", "sent")

    log_entry = CommunicationLog(
        communication_id=comm_id,
        trainee_id=trainee.trainee_id,
        trainee_name=trainee.name,
        phone_number=dispatch_res.get("phone_number", phone),
        channel=channel,
        message_type="longitudinal_outcome_survey",
        milestone=milestone,
        message_body=message_body,
        portal_link=portal_link,
        status=status,
        delivery_reference=dispatch_res.get("delivery_reference", "UNKNOWN"),
        is_simulated=dispatch_res.get("is_simulated", True),
        sent_at=datetime.utcnow(),
        created_by="Officer (MSDE CONTINUUM)"
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    return {
        "success": dispatch_res.get("success", True),
        "communication_id": comm_id,
        "trainee_id": trainee.trainee_id,
        "trainee_name": trainee.name,
        "phone_number": log_entry.phone_number,
        "milestone": milestone,
        "status": status,
        "delivery_reference": log_entry.delivery_reference,
        "is_simulated": log_entry.is_simulated,
        "provider": dispatch_res.get("provider"),
        "portal_link": portal_link,
        "message_body": message_body,
        "sent_at": log_entry.sent_at.isoformat(),
    }

@router.post("/broadcast-unverified")
def broadcast_unverified_followup(
    payload: Dict[str, Any] = Body(default={}),
    db: Session = Depends(get_db)
):
    """
    ONE-CLICK BATCH FOLLOW-UP:
    Finds all trainees who do NOT have verified outcome records for the current milestone
    and broadcasts the longitudinal follow-up message to all of them in one click.
    """
    milestone = payload.get("milestone", "6M")
    max_recipients = payload.get("limit", 100)

    # 1. Fetch all trainees
    all_trainees = db.exec(select(Trainee).limit(max_recipients)).all()

    # 2. Identify verified trainee IDs
    verified_events = db.exec(
        select(OutcomeEvent.trainee_id)
        .where(OutcomeEvent.verification_status == "verified")
    ).all()
    verified_ids = set(verified_events)

    # 3. Filter to candidates requiring outcome verification
    unverified_trainees = [t for t in all_trainees if t.trainee_id not in verified_ids and t.phone]

    provider = get_messaging_provider()
    batch_ref = f"BATCH-DISPATCH-{uuid.uuid4().hex[:6].upper()}"
    results = []
    dispatched_count = 0
    failed_count = 0

    for t in unverified_trainees:
        generated = build_followup_message(t.name, t.trainee_id, milestone, t.program)
        dispatch_res = provider.send_sms(t.phone, generated["body"])

        comm_id = f"COMM-{uuid.uuid4().hex[:8].upper()}"
        status = dispatch_res.get("status", "sent")

        if dispatch_res.get("success"):
            dispatched_count += 1
        else:
            failed_count += 1

        log_entry = CommunicationLog(
            communication_id=comm_id,
            trainee_id=t.trainee_id,
            trainee_name=t.name,
            phone_number=dispatch_res.get("phone_number", t.phone),
            channel="sms",
            message_type="longitudinal_outcome_survey",
            milestone=milestone,
            message_body=generated["body"],
            portal_link=generated["link"],
            status=status,
            delivery_reference=dispatch_res.get("delivery_reference", "UNKNOWN"),
            is_simulated=dispatch_res.get("is_simulated", True),
            sent_at=datetime.utcnow(),
            created_by="Autonomous Batch Algorithm (MSDE)"
        )
        db.add(log_entry)
        results.append({
            "trainee_id": t.trainee_id,
            "trainee_name": t.name,
            "phone_number": log_entry.phone_number,
            "status": status,
            "delivery_reference": log_entry.delivery_reference,
        })

    db.commit()

    return {
        "batch_reference": batch_ref,
        "milestone": milestone,
        "total_eligible_unverified": len(unverified_trainees),
        "dispatched_count": dispatched_count,
        "failed_count": failed_count,
        "is_simulated": True,
        "provider": getattr(provider, "provider_name", "Mock SMS Gateway"),
        "dispatched_candidates": results,
    }

@router.get("/history/{trainee_id}")
def get_trainee_communication_history(trainee_id: str, db: Session = Depends(get_db)):
    """Returns chronological communication audit trail for a candidate."""
    logs = db.exec(
        select(CommunicationLog)
        .where(CommunicationLog.trainee_id == trainee_id)
        .order_by(CommunicationLog.sent_at.desc())
    ).all()
    return logs

@router.get("/summary")
def get_communications_summary(db: Session = Depends(get_db)):
    """Computes communication dashboard metrics."""
    total_logs = db.exec(select(func.count(CommunicationLog.id))).one()
    delivered_count = db.exec(select(func.count(CommunicationLog.id)).where(CommunicationLog.status == "delivered")).one()
    responded_count = db.exec(select(func.count(CommunicationLog.id)).where(CommunicationLog.response_received == True)).one()

    # Unverified count
    all_trainees_count = db.exec(select(func.count(Trainee.id))).one()
    verified_trainees = db.exec(
        select(func.count(func.distinct(OutcomeEvent.trainee_id)))
        .where(OutcomeEvent.verification_status == "verified")
    ).one()
    unverified_count = max(0, all_trainees_count - verified_trainees)

    response_rate = round((responded_count / total_logs * 100), 1) if total_logs > 0 else 0.0

    recent_logs = db.exec(
        select(CommunicationLog)
        .order_by(CommunicationLog.sent_at.desc())
        .limit(10)
    ).all()

    return {
        "total_messages_sent": total_logs,
        "delivered_count": delivered_count,
        "responded_count": responded_count,
        "response_rate_pct": response_rate,
        "unverified_trainees_count": unverified_count,
        "total_trainees_count": all_trainees_count,
        "recent_logs": recent_logs,
    }

@router.post("/respond/{trainee_id}")
def record_trainee_response(
    trainee_id: str,
    payload: Dict[str, Any] = Body(default={}),
    db: Session = Depends(get_db)
):
    """
    Closes the longitudinal feedback loop when a trainee submits their update.
    Marks past communications as 'response_received = True' and records responded_at.
    """
    logs = db.exec(
        select(CommunicationLog)
        .where(CommunicationLog.trainee_id == trainee_id)
        .where(CommunicationLog.response_received == False)
    ).all()

    for l in logs:
        l.response_received = True
        l.responded_at = datetime.utcnow()
        db.add(l)

    db.commit()
    return {
        "success": True,
        "trainee_id": trainee_id,
        "updated_logs_count": len(logs),
        "status": "marked_done_for_period",
        "message": "Trainee response recorded. Validated for current milestone until next periodic follow-up window.",
    }
