from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import date, datetime

class TraineeBase(SQLModel):
    trainee_id: str
    name: str
    email: str
    phone: str
    program: str
    provider: str
    enrollment_date: date
    completion_date: Optional[date] = None
    status: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None

class Trainee(TraineeBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class DSIGNode(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    node_id: str
    trainee_id: str
    node_type: str
    label: str
    value: str
    is_active: bool
    valid_from: date
    valid_until: Optional[date] = None
    confidence: float
    verification_method: str
    metadata_json: Optional[str] = None

class DSIGEdge(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    edge_id: str
    trainee_id: str
    source_node_id: str
    target_node_id: str
    edge_type: str
    label: str
    valid_from: date
    valid_until: Optional[date] = None
    confidence: float

class IdentityAnchor(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    trainee_id: str
    anchor_type: str
    anchor_value: str
    is_trusted: bool
    verified_at: Optional[datetime] = None

class TraineeRead(TraineeBase):
    id: int

class DSIGGraphResponse(SQLModel):
    nodes: List[DSIGNode]
    edges: List[DSIGEdge]

class TraineeUpdate(SQLModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    program: Optional[str] = None
    provider: Optional[str] = None
    status: Optional[str] = None
    gender: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    completion_date: Optional[date] = None

