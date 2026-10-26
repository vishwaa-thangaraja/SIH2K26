from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime

class VerificationRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    record_id: str
    trainee_id: str
    event_id: str
    confidence_score: float
    confidence_label: str
    source_count: int
    corroboration_score: float
    anomaly_flag: bool
    temporal_consistent: bool
    factors_json: str
    created_at: datetime
    updated_at: datetime

class IdentityRecoveryRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    request_id: str
    trainee_id: str
    status: str
    old_phone: Optional[str] = None
    new_phone: str
    anchors_used: str
    match_score: float
    created_at: datetime

class VerificationRead(SQLModel):
    id: int
    record_id: str
    trainee_id: str
    event_id: str
    confidence_score: float
    confidence_label: str
    source_count: int
    corroboration_score: float
    anomaly_flag: bool
    temporal_consistent: bool
    factors_json: str
    created_at: datetime
    updated_at: datetime

class RecoveryRequestRead(SQLModel):
    id: int
    request_id: str
    trainee_id: str
    status: str
    old_phone: Optional[str]
    new_phone: str
    anchors_used: str
    match_score: float
    created_at: datetime
