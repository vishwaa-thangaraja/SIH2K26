from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import date, datetime

class OutcomeEventBase(SQLModel):
    event_id: str
    trainee_id: str
    event_type: str
    employer_name: Optional[str] = None
    employer_gstn: Optional[str] = None
    role: Optional[str] = None
    wage_monthly: Optional[int] = None
    start_date: date
    end_date: Optional[date] = None
    milestone: str
    confidence_score: float
    verification_status: str
    evidence_count: int

class OutcomeEvent(OutcomeEventBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class EvidenceRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    evidence_id: str
    trainee_id: str
    event_id: Optional[str] = None
    evidence_type: str
    filename: str
    upload_date: datetime
    ocr_status: str
    extracted_fields_json: Optional[str] = None
    document_consistency: Optional[float] = None
    claim_match_score: Optional[float] = None

class OutcomeEventRead(OutcomeEventBase):
    id: int

class EvidenceRead(SQLModel):
    id: int
    evidence_id: str
    trainee_id: str
    event_id: Optional[str]
    evidence_type: str
    filename: str
    upload_date: datetime
    ocr_status: str
    extracted_fields_json: Optional[str]
    document_consistency: Optional[float]
    claim_match_score: Optional[float]

class OutcomeListResponse(SQLModel):
    events: List[OutcomeEventRead]
