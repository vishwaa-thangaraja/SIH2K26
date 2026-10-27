from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime

class KpiStats(BaseModel):
    total_cases: int
    pending_cases: int
    under_process_cases: int
    disposed_cases: int
    transferred_cases: int
    escalated_cases: int
    sla_breached_cases: int
    institutions_monitored: int
    active_overlaps_count: int
    active_contradictions_count: int

class BureauWorkloadItem(BaseModel):
    bureau_id: int
    bureau_code: str
    bureau_name: str
    total_cases: int
    pending_cases: int
    under_process_cases: int
    disposed_cases: int
    sla_breached_cases: int
    avg_disposal_days: float

class AgingBucketItem(BaseModel):
    bureau_code: str
    bureau_name: str
    age_less_15d: int
    age_15_to_30d: int
    age_30_to_60d: int
    age_over_60d_breached: int

class CaseEventSchema(BaseModel):
    event_id: int
    event_type: str
    event_time: datetime
    recorded_at: datetime
    status_code: Optional[str]
    bureau_code: Optional[str]
    officer_name: Optional[str]
    remarks: Optional[str]

class CaseSummary(BaseModel):
    case_id: int
    source_ref: str
    received_on: date
    track_type: Optional[str]
    category: Optional[str]
    priority: str
    status_code: str
    status_name: str
    bureau_code: str
    bureau_name: str
    officer_name: Optional[str]
    institution_id: Optional[int]
    institution_pid: Optional[str]
    institution_name: Optional[str]
    region_name: Optional[str]
    summary: str
    age_days: int
    aging_bucket: str
    is_sla_breached: bool
    next_action_due: str

class ContradictionAlert(BaseModel):
    institution_id: int
    permanent_id: str
    institution_name: str
    bureau_a_case_id: int
    bureau_a_ref: str
    bureau_a_code: str
    bureau_a_status: str
    bureau_b_case_id: int
    bureau_b_ref: str
    bureau_b_code: str
    bureau_b_status: str
    severity: str
    warning_message: str

class EntityResolveRequest(BaseModel):
    raw_name: str
    state_id: Optional[int] = None
    district_id: Optional[int] = None
    pincode: Optional[str] = None

class EntityMatchCandidate(BaseModel):
    inst_id: int
    permanent_id: str
    name: str
    district: Optional[str]
    state: Optional[str]
    confidence_score: float
    method: str
    tier: str

class EntityResolveResponse(BaseModel):
    query: str
    matched: bool
    best_match: Optional[EntityMatchCandidate] = None
    all_candidates: List[EntityMatchCandidate] = []
    requires_human_review: bool

class JointReviewCreate(BaseModel):
    institution_id: int
    initiator_bureau_code: str
    target_bureau_code: str
    case_ids: List[int]
    coordination_reason: str

class JointReviewResolve(BaseModel):
    outcome_memo: str
    status: str = "RESOLVED"

class MLInferenceRequest(BaseModel):
    complaint_text: str

class MLInferenceResponse(BaseModel):
    predicted_category: str
    category_confidence: float
    suggested_priority: str
    recommended_bureau: str
    potential_duplicate_score: float
    is_probable_duplicate: bool
