from fastapi import APIRouter
from typing import List

router = APIRouter()

@router.get("/pending")
def get_pending_attestations():
    return [{"attestation_id": "A001", "trainee_name": "Ravi Kumar", "status": "pending"}]

@router.post("/{attestation_id}/confirm")
def confirm_attestation(attestation_id: str):
    return {"status": "confirmed", "attestation_id": attestation_id}

@router.post("/{attestation_id}/dispute")
def dispute_attestation(attestation_id: str):
    return {"status": "disputed", "attestation_id": attestation_id}

@router.post("/trigger-notification")
def trigger_notification():
    return {"status": "notification_sent", "channel": "WhatsApp"}
