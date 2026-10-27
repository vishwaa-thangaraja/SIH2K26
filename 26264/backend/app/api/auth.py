import os
import secrets
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication & Government SSO"])
security = HTTPBearer(auto_error=False)

# In-memory mock session store for instant production simulation
ACTIVE_SESSIONS = {}

# Standard AICTE Official Roles
ROLES_PERMISSIONS = {
    "SUPER_ADMIN": ["*"],
    "BUREAU_HEAD": ["read:all", "write:bureau", "convene:joint_review", "sign:memo"],
    "INQUIRY_OFFICER": ["read:bureau", "write:case_event", "update:status"],
    "SCRUTINY_OFFICER": ["read:bureau", "write:scrutiny"],
    "VIGILANCE_OFFICER": ["read:all", "write:vigilance", "view:restricted_tokens"],
    "REGIONAL_OFFICER": ["read:region", "upload:batch_dockets"]
}

# Pre-configured Official AICTE User Profiles
GOV_USERS = {
    "adviser.rb@aicte-india.org": {
        "user_id": 101,
        "name": "Dr. K. Ramanathan",
        "designation": "Adviser & Bureau Head",
        "bureau_code": "RB",
        "bureau_name": "Regulation Bureau",
        "role": "BUREAU_HEAD",
        "parichay_id": "PARICHAY-AICTE-RB-001"
    },
    "director.pgrc@aicte-india.org": {
        "user_id": 102,
        "name": "Smt. Anita Sharma",
        "designation": "Director (PGRC)",
        "bureau_code": "PGRC",
        "bureau_name": "Public Grievance Redressal Cell",
        "role": "BUREAU_HEAD",
        "parichay_id": "PARICHAY-AICTE-PGRC-042"
    },
    "ro.sro@aicte-india.org": {
        "user_id": 103,
        "name": "Shri V. Anand",
        "designation": "Regional Officer (SRO)",
        "bureau_code": "RB",
        "bureau_name": "Southern Regional Office",
        "role": "REGIONAL_OFFICER",
        "parichay_id": "PARICHAY-AICTE-SRO-018"
    }
}

class LoginRequest(BaseModel):
    email: str
    auth_method: str = "PARICHAY_SSO"  # or DEMO_INSTANT

class UserProfile(BaseModel):
    user_id: int
    name: str
    designation: str
    email: str
    bureau_code: str
    bureau_name: str
    role: str
    parichay_id: str
    token: str
    permissions: List[str]

@router.post("/login", response_model=UserProfile)
def login_sso(payload: LoginRequest):
    """
    Simulates NIC Parichay / Jan Parichay Government Single Sign-On (SSO).
    """
    user_info = GOV_USERS.get(payload.email)
    if not user_info:
        # Fallback default user for demo convenience
        user_info = GOV_USERS["adviser.rb@aicte-india.org"]
        payload.email = "adviser.rb@aicte-india.org"

    token = "gov_jwt_" + secrets.token_hex(16)
    session_data = {
        **user_info,
        "email": payload.email,
        "token": token,
        "permissions": ROLES_PERMISSIONS.get(user_info["role"], []),
        "expires_at": datetime.utcnow() + timedelta(hours=8)
    }
    ACTIVE_SESSIONS[token] = session_data

    return UserProfile(**session_data)

@router.get("/me", response_model=UserProfile)
def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    """
    Returns the authenticated official's identity profile.
    """
    if credentials and credentials.credentials in ACTIVE_SESSIONS:
        return UserProfile(**ACTIVE_SESSIONS[credentials.credentials])
    
    # Default to Adviser RB if no token provided (fail-safe for demo)
    default_user = GOV_USERS["adviser.rb@aicte-india.org"]
    token = "gov_jwt_demo_default"
    default_session = {
        **default_user,
        "email": "adviser.rb@aicte-india.org",
        "token": token,
        "permissions": ROLES_PERMISSIONS["BUREAU_HEAD"],
        "expires_at": datetime.utcnow() + timedelta(hours=8)
    }
    return UserProfile(**default_session)

@router.get("/profiles")
def list_demo_profiles():
    """
    Lists switchable official profiles for the live jury demo.
    """
    return [
        {"email": k, "name": v["name"], "designation": v["designation"], "bureau": v["bureau_code"]}
        for k, v in GOV_USERS.items()
    ]
