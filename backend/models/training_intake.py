from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import date, datetime

class TrainingRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    record_id: str = Field(index=True)
    trainee_id: str = Field(index=True)
    course: str
    sector: Optional[str] = None
    training_provider: str
    training_centre: str
    batch_id: str
    training_start_date: date
    training_end_date: date
    training_status: str
    attendance_percentage: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AssessmentRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    assessment_id: str = Field(index=True)
    trainee_id: str = Field(index=True)
    training_record_id: Optional[str] = None
    course: str
    assessment_score: float
    assessment_result: str
    assessment_date: Optional[date] = None

class CertificationRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    certification_id: str = Field(index=True)
    trainee_id: str = Field(index=True)
    training_record_id: Optional[str] = None
    course: str
    certification_status: str
    certification_date: Optional[date] = None

class TraineeSkill(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    trainee_id: str = Field(index=True)
    skill_name: str
    source: str = "training_intake"
    acquired_date: Optional[date] = None

class ImportBatchLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    batch_id: str = Field(index=True)
    filename: str
    total_rows: int
    valid_rows: int
    imported_rows: int
    skipped_rows: int
    failed_rows: int
    warnings_count: int
    status: str
    imported_at: datetime = Field(default_factory=datetime.utcnow)
