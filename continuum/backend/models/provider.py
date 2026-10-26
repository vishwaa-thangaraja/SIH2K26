from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime

class ProviderScorecard(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    provider_id: str
    provider_name: str
    total_trainees: int
    placement_rate_3m: float
    placement_rate_6m: float
    placement_rate_12m: float
    wage_adequacy_score: float
    retention_rate_6m: float
    evidence_quality_score: float
    outcome_data_json: str
    updated_at: datetime

class RegionalSkillGap(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    district_name: str
    state: str
    lat: float
    lng: float
    skill_demand_score: int
    skill_supply_score: int
    gap_ratio: float
    top_demanded_skills: str
    top_supplied_skills: str

class ProviderScorecardRead(SQLModel):
    id: int
    provider_id: str
    provider_name: str
    total_trainees: int
    placement_rate_3m: float
    placement_rate_6m: float
    placement_rate_12m: float
    wage_adequacy_score: float
    retention_rate_6m: float
    evidence_quality_score: float
    outcome_data_json: str
    updated_at: datetime

class RegionalSkillGapRead(SQLModel):
    id: int
    district_name: str
    state: str
    lat: float
    lng: float
    skill_demand_score: int
    skill_supply_score: int
    gap_ratio: float
    top_demanded_skills: str
    top_supplied_skills: str
