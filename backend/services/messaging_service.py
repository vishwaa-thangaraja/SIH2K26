import os
import re
import uuid
import time
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseMessagingProvider(ABC):
    @abstractmethod
    def send_sms(self, phone_number: str, message: str) -> Dict[str, Any]:
        """Dispatches an SMS and returns delivery details."""
        pass

class MockSMSProvider(BaseMessagingProvider):
    """
    Simulates carrier SMS gateway (Airtel/Jio/BSNL GSM network).
    Runs 100% locally and offline without external API dependencies.
    """
    def __init__(self):
        self.provider_name = "Mock Indian Cellular Gateway (Airtel / Jio DLT)"

    def normalize_phone(self, phone: str) -> str:
        clean = re.sub(r"[^\d+]", "", phone.strip())
        if not clean.startswith("+"):
            if len(clean) == 10:
                clean = "+91" + clean
            elif clean.startswith("91") and len(clean) == 12:
                clean = "+" + clean
        return clean

    def validate_phone(self, phone: str) -> bool:
        normalized = self.normalize_phone(phone)
        # Indian phone numbers: +91 followed by 10 digits starting with 6, 7, 8, or 9
        match = re.match(r"^\+91[6-9]\d{9}$", normalized)
        # Also allow test format or standard E.164 with 10-13 digits
        if match or (normalized.startswith("+") and len(normalized) >= 11):
            return True
        return False

    def send_sms(self, phone_number: str, message: str) -> Dict[str, Any]:
        normalized = self.normalize_phone(phone_number)
        is_valid = self.validate_phone(phone_number)

        # Micro latency to simulate cellular dispatch
        time.sleep(0.05)

        if not is_valid:
            return {
                "success": False,
                "status": "failed",
                "error": f"Invalid mobile phone format '{phone_number}'. Must be a valid 10-digit number.",
                "delivery_reference": f"ERR-{uuid.uuid4().hex[:8].upper()}",
                "provider": self.provider_name,
                "is_simulated": True,
            }

        carrier = "JIO-TEL" if int(normalized[-1]) % 2 == 0 else "AIRTEL-DLT"
        delivery_ref = f"SIM-{carrier}-{uuid.uuid4().hex[:8].upper()}"

        return {
            "success": True,
            "status": "delivered",
            "phone_number": normalized,
            "delivery_reference": delivery_ref,
            "provider": self.provider_name,
            "is_simulated": True,
            "latency_ms": 120,
        }

class TwilioSMSProvider(BaseMessagingProvider):
    """
    Twilio Cloud SMS Provider. Activates automatically if TWILIO_ACCOUNT_SID is configured in .env.
    """
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_phone = os.getenv("TWILIO_PHONE_NUMBER")
        self.provider_name = "Twilio SMS Cloud Gateway"

    def send_sms(self, phone_number: str, message: str) -> Dict[str, Any]:
        if not self.account_sid or not self.auth_token or not self.from_phone:
            return {
                "success": False,
                "status": "failed",
                "error": "Twilio credentials missing in environment (.env).",
                "provider": self.provider_name,
                "is_simulated": False,
            }
        try:
            from twilio.rest import Client
            client = Client(self.account_sid, self.auth_token)
            msg = client.messages.create(body=message, from_=self.from_phone, to=phone_number)
            return {
                "success": True,
                "status": msg.status or "sent",
                "delivery_reference": msg.sid,
                "provider": self.provider_name,
                "is_simulated": False,
            }
        except Exception as e:
            return {
                "success": False,
                "status": "failed",
                "error": str(e),
                "provider": self.provider_name,
                "is_simulated": False,
            }

def get_messaging_provider() -> BaseMessagingProvider:
    """Returns active messaging provider based on environment configuration."""
    provider_type = os.getenv("MESSAGING_PROVIDER", "mock").lower()
    if provider_type == "twilio" and os.getenv("TWILIO_ACCOUNT_SID"):
        return TwilioSMSProvider()
    return MockSMSProvider()
