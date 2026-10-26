import os
import re
import uuid
import time
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

try:
    import urllib.request
    import urllib.error
except ImportError:
    pass

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
        if match or (normalized.startswith("+") and len(normalized) >= 11):
            return True
        return False

    def send_sms(self, phone_number: str, message: str) -> Dict[str, Any]:
        normalized = self.normalize_phone(phone_number)
        is_valid = self.validate_phone(phone_number)

        # Instant mock simulation for cellular network

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

class Fast2SMSProvider(BaseMessagingProvider):
    """
    Fast2SMS Indian Cellular Gateway.
    Transmits real SMS to Indian mobile numbers (+91) via HTTP API.
    """
    def __init__(self):
        self.api_key = os.getenv("FAST2SMS_API_KEY", "").strip()
        self.provider_name = "Fast2SMS India Cellular Gateway"

    def send_sms(self, phone_number: str, message: str) -> Dict[str, Any]:
        if not self.api_key:
            return {
                "success": False,
                "status": "failed",
                "error": "FAST2SMS_API_KEY not configured in backend/.env",
                "provider": self.provider_name,
                "is_simulated": False,
            }

        clean_digits = re.sub(r"[^\d]", "", phone_number)
        if clean_digits.startswith("91") and len(clean_digits) == 12:
            clean_digits = clean_digits[2:]
        elif len(clean_digits) > 10:
            clean_digits = clean_digits[-10:]

        if len(clean_digits) != 10:
            return {
                "success": False,
                "status": "failed",
                "error": f"Fast2SMS requires a valid 10-digit Indian phone number, got '{clean_digits}'.",
                "provider": self.provider_name,
                "is_simulated": False,
            }

        url = "https://www.fast2sms.com/dev/bulkV2"
        payload = {
            "route": "q",
            "message": message[:155],
            "language": "english",
            "flash": 0,
            "numbers": clean_digits,
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "authorization": self.api_key,
                "Content-Type": "application/json",
                "User-Agent": "CONTINUUM-MSDE-Outreach/1.0",
            },
        )

        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                res_body = response.read().decode("utf-8")
                res_json = json.loads(res_body)
                if res_json.get("return") is True:
                    request_id = res_json.get("request_id") or uuid.uuid4().hex[:8].upper()
                    return {
                        "success": True,
                        "status": "delivered",
                        "phone_number": f"+91{clean_digits}",
                        "delivery_reference": f"F2S-{request_id}",
                        "provider": self.provider_name,
                        "is_simulated": False,
                        "raw_response": res_json,
                    }
                else:
                    return {
                        "success": False,
                        "status": "failed",
                        "error": res_json.get("message", "Fast2SMS error"),
                        "provider": self.provider_name,
                        "is_simulated": False,
                    }
        except Exception as e:
            return {
                "success": False,
                "status": "failed",
                "error": f"Fast2SMS dispatch error: {str(e)}",
                "provider": self.provider_name,
                "is_simulated": False,
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

class EmailProvider:
    """
    Real SMTP Email Gateway (Gmail, SendGrid SMTP, Outlook, or custom SMTP).
    Falls back to mock simulation if credentials are not configured.
    """
    def __init__(self):
        self.host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.port = int(os.getenv("SMTP_PORT", "587"))
        self.user = os.getenv("SMTP_USER", "").strip()
        self.password = os.getenv("SMTP_PASSWORD", "").strip()
        self.from_email = os.getenv("FROM_EMAIL", self.user or "outreach@continuum.gov.in")
        self.from_name = os.getenv("FROM_NAME", "Ministry of Skill Development & Entrepreneurship")

    def is_configured(self) -> bool:
        return bool(self.user and self.password)

    def send_email(
        self,
        to_email: str,
        trainee_name: str,
        milestone: str,
        portal_link: str,
        trainee_id: str,
        force_simulation: bool = False,
    ) -> Dict[str, Any]:
        clean_email = to_email.strip()
        if not clean_email or "@" not in clean_email:
            return {
                "success": False,
                "status": "failed",
                "error": f"Invalid recipient email '{to_email}'",
                "is_simulated": True,
            }

        subject = f"CONTINUUM: Official {milestone} Livelihood Outcome Verification Notice — Trainee {trainee_id}"
        
        # HTML Email Template
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }}
            .card {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }}
            .header {{ background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }}
            .header p {{ margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }}
            .badge {{ display: inline-block; background: #38bdf8; color: #0f172a; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; margin-top: 10px; }}
            .content {{ padding: 28px; color: #334155; font-size: 14px; line-height: 1.6; }}
            .detail-box {{ background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 20px 0; }}
            .detail-box table {{ width: 100%; border-collapse: collapse; }}
            .detail-box td {{ padding: 6px 0; font-size: 13px; }}
            .detail-box td.label {{ color: #64748b; font-weight: 600; width: 40%; }}
            .detail-box td.val {{ color: #0f172a; font-weight: 700; }}
            .button-wrapper {{ text-align: center; margin: 30px 0; }}
            .btn {{ display: inline-block; background: #0284c7; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 12px 28px; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.3); }}
            .footer {{ background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }}
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <p>Government of India • MSDE</p>
              <h1>CONTINUUM Outcome Verification</h1>
              <span class="badge">{milestone} Longitudinal Follow-Up</span>
            </div>
            <div class="content">
              <p>Dear <strong>{trainee_name}</strong> (Candidate ID: <strong>{trainee_id}</strong>),</p>
              <p>As part of the National Skills Qualification Framework (NSQF) longitudinal impact tracking, your periodic <strong>{milestone}</strong> outcome verification is now due.</p>
              
              <div class="detail-box">
                <table>
                  <tr><td class="label">Candidate Name:</td><td class="val">{trainee_name}</td></tr>
                  <tr><td class="label">National Trainee ID:</td><td class="val">{trainee_id}</td></tr>
                  <tr><td class="label">Verification Milestone:</td><td class="val">{milestone} Post-Completion</td></tr>
                  <tr><td class="label">Authorized Channel:</td><td class="val">National Skills Registry Registry Gateway</td></tr>
                </table>
              </div>

              <p>Please click the button below to confirm your current employer, designation, and monthly wage. You may also attach your latest payslip or offer letter for automated OCR verification.</p>

              <div class="button-wrapper">
                <a href="{portal_link}" class="btn">Confirm Employment &amp; Wage Details →</a>
              </div>

              <p style="font-size: 12px; color: #64748b; text-align: center;">
                If the button above does not work, paste this secure link into your browser:<br>
                <a href="{portal_link}" style="color: #0284c7; word-break: break-all;">{portal_link}</a>
              </p>
            </div>
            <div class="footer">
              This is an automated administrative notification dispatched under the CONTINUUM Longitudinal Tracking Protocol.<br>
              Ministry of Skill Development and Entrepreneurship, Government of India.
            </div>
          </div>
        </body>
        </html>
        """

        plain_text = (
            f"Dear {trainee_name} (ID: {trainee_id}),\n\n"
            f"Your CONTINUUM {milestone} longitudinal employment outcome verification is due.\n"
            f"Please update your current wage and workplace details using this secure portal link:\n"
            f"{portal_link}\n\n"
            f"Ministry of Skill Development & Entrepreneurship, Government of India."
        )

        is_demo_domain = clean_email.lower().endswith(("@example.com", "@test.com", "@sample.gov.in"))
        if force_simulation or not self.is_configured() or is_demo_domain:
            # Simulated Email delivery for demo accounts / rate protection
            ref = f"SIM-EMAIL-{uuid.uuid4().hex[:8].upper()}"
            return {
                "success": True,
                "status": "delivered",
                "to_email": clean_email,
                "delivery_reference": ref,
                "provider": "Mock Government SMTP Gateway",
                "is_simulated": True,
            }

        # Real SMTP Delivery
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.from_name} <{self.from_email}>"
            msg["To"] = clean_email

            part1 = MIMEText(plain_text, "plain")
            part2 = MIMEText(html_body, "html")
            msg.attach(part1)
            msg.attach(part2)

            with smtplib.SMTP(self.host, self.port, timeout=12) as server:
                server.starttls()
                server.login(self.user, self.password)
                server.sendmail(self.from_email, [clean_email], msg.as_string())

            return {
                "success": True,
                "status": "delivered",
                "to_email": clean_email,
                "delivery_reference": f"SMTP-{uuid.uuid4().hex[:8].upper()}",
                "provider": f"Real SMTP ({self.host})",
                "is_simulated": False,
            }
        except Exception as e:
            return {
                "success": False,
                "status": "failed",
                "to_email": clean_email,
                "error": f"SMTP delivery failed: {str(e)}",
                "provider": f"SMTP ({self.host})",
                "is_simulated": False,
            }

def get_messaging_provider() -> BaseMessagingProvider:
    """Returns active SMS provider based on environment configuration."""
    provider_type = os.getenv("MESSAGING_PROVIDER", "").lower()

    if provider_type == "fast2sms" or os.getenv("FAST2SMS_API_KEY"):
        return Fast2SMSProvider()
    elif provider_type == "twilio" or os.getenv("TWILIO_ACCOUNT_SID"):
        return TwilioSMSProvider()
    return MockSMSProvider()

def get_email_provider() -> EmailProvider:
    """Returns active Email provider."""
    return EmailProvider()

