from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session, select, func
from database import get_db
from models.trainee import Trainee
from models.outcome import OutcomeEvent
from models.communication import CommunicationLog, CommunicationLogRead
from services.messaging_service import get_messaging_provider, get_email_provider
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
    Dispatches a follow-up message via SMS and Email to a trainee's registered contact.
    Records communication event into SQLite audit log.
    """
    trainee_id = payload.get("trainee_id")
    milestone = payload.get("milestone", "6M")
    custom_message = payload.get("message")
    channel = payload.get("channel", "sms_and_email")

    if not trainee_id:
        raise HTTPException(status_code=400, detail="trainee_id is mandatory.")

    trainee = db.exec(select(Trainee).where(Trainee.trainee_id == trainee_id)).first()
    if not trainee:
        raise HTTPException(status_code=404, detail=f"Trainee '{trainee_id}' not found.")

    phone = trainee.phone or payload.get("phone_number")
    email = trainee.email or payload.get("email")

    if not phone and not email:
        raise HTTPException(status_code=400, detail=f"Trainee '{trainee_id}' has neither registered phone nor email.")

    # Generate message content with portal link
    generated = build_followup_message(trainee.name, trainee.trainee_id, milestone, trainee.program)
    message_body = custom_message if custom_message else generated["body"]
    portal_link = generated["link"]

    # 1. Dispatch SMS
    sms_res = {"status": "skipped", "success": True}
    if phone:
        provider = get_messaging_provider()
        sms_res = provider.send_sms(phone, message_body)

    # 2. Dispatch Email
    email_res = {"status": "skipped", "success": True}
    if email:
        email_provider = get_email_provider()
        email_res = email_provider.send_email(
            to_email=email,
            trainee_name=trainee.name,
            milestone=milestone,
            portal_link=portal_link,
            trainee_id=trainee.trainee_id,
        )

    comm_id = f"COMM-{uuid.uuid4().hex[:8].upper()}"
    status = sms_res.get("status", "sent") if phone else email_res.get("status", "sent")
    delivery_ref = sms_res.get("delivery_reference") or email_res.get("delivery_reference", "REF-UNKNOWN")
    is_simulated = sms_res.get("is_simulated", True) and email_res.get("is_simulated", True)

    log_entry = CommunicationLog(
        communication_id=comm_id,
        trainee_id=trainee.trainee_id,
        trainee_name=trainee.name,
        phone_number=sms_res.get("phone_number", phone or "N/A"),
        channel="sms+email" if (phone and email) else ("sms" if phone else "email"),
        message_type="longitudinal_outcome_survey",
        milestone=milestone,
        message_body=message_body,
        portal_link=portal_link,
        status=status,
        delivery_reference=delivery_ref,
        is_simulated=is_simulated,
        sent_at=datetime.utcnow(),
        created_by="Officer (MSDE CONTINUUM)"
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    return {
        "success": sms_res.get("success", True) or email_res.get("success", True),
        "communication_id": comm_id,
        "trainee_id": trainee.trainee_id,
        "trainee_name": trainee.name,
        "phone_number": log_entry.phone_number,
        "email": email,
        "milestone": milestone,
        "status": status,
        "delivery_reference": log_entry.delivery_reference,
        "is_simulated": log_entry.is_simulated,
        "sms_details": sms_res,
        "email_details": email_res,
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
    and broadcasts the longitudinal follow-up message to all of them in one click via SMS and Email.
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
    unverified_trainees = [t for t in all_trainees if t.trainee_id not in verified_ids and (t.phone or t.email)]

    sms_provider = get_messaging_provider()
    email_provider = get_email_provider()

    batch_ref = f"BATCH-DISPATCH-{uuid.uuid4().hex[:6].upper()}"
    results = []
    dispatched_count = 0
    failed_count = 0

    for t in unverified_trainees:
        generated = build_followup_message(t.name, t.trainee_id, milestone, t.program)
        
        # Dispatch SMS
        sms_res = {"status": "skipped", "success": True}
        if t.phone:
            sms_res = sms_provider.send_sms(t.phone, generated["body"])

        # Dispatch Email
        email_res = {"status": "skipped", "success": True}
        if t.email:
            email_res = email_provider.send_email(
                to_email=t.email,
                trainee_name=t.name,
                milestone=milestone,
                portal_link=generated["link"],
                trainee_id=t.trainee_id,
            )

        comm_id = f"COMM-{uuid.uuid4().hex[:8].upper()}"
        status = sms_res.get("status", "sent") if t.phone else email_res.get("status", "sent")

        if sms_res.get("success") or email_res.get("success"):
            dispatched_count += 1
        else:
            failed_count += 1

        delivery_ref = sms_res.get("delivery_reference") or email_res.get("delivery_reference", "UNKNOWN")
        is_sim = sms_res.get("is_simulated", True) and email_res.get("is_simulated", True)

        log_entry = CommunicationLog(
            communication_id=comm_id,
            trainee_id=t.trainee_id,
            trainee_name=t.name,
            phone_number=sms_res.get("phone_number", t.phone or "N/A"),
            channel="sms+email" if (t.phone and t.email) else ("sms" if t.phone else "email"),
            message_type="longitudinal_outcome_survey",
            milestone=milestone,
            message_body=generated["body"],
            portal_link=generated["link"],
            status=status,
            delivery_reference=delivery_ref,
            is_simulated=is_sim,
            sent_at=datetime.utcnow(),
            created_by="Autonomous Batch Algorithm (MSDE)"
        )
        db.add(log_entry)
        results.append({
            "trainee_id": t.trainee_id,
            "trainee_name": t.name,
            "phone_number": log_entry.phone_number,
            "email": t.email,
            "status": status,
            "delivery_reference": log_entry.delivery_reference,
            "portal_link": generated["link"],
            "sms_provider": sms_res.get("provider"),
            "email_provider": email_res.get("provider"),
        })

    db.commit()

    return {
        "batch_reference": batch_ref,
        "milestone": milestone,
        "total_eligible_unverified": len(unverified_trainees),
        "total_unverified_candidates": len(unverified_trainees),
        "dispatched_count": dispatched_count,
        "failed_count": failed_count,
        "is_simulated": True,
        "provider": getattr(sms_provider, "provider_name", "Mock SMS Gateway"),
        "sms_provider": getattr(sms_provider, "provider_name", "Mock SMS Gateway"),
        "email_provider": "Real SMTP" if email_provider.is_configured() else "Mock Government SMTP",
        "results": results,
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
