from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class CommunicationLogBase(SQLModel):
    communication_id: str = Field(index=True)
    trainee_id: str = Field(index=True)
    trainee_name: str
    phone_number: str
    channel: str = "sms"  # 'sms' or 'whatsapp'
    message_type: str = "longitudinal_outcome_survey"
    milestone: str = "6M"
    message_body: str
    portal_link: Optional[str] = None
    status: str = "delivered"  # 'queued', 'sent', 'delivered', 'failed'
    delivery_reference: str
    is_simulated: bool = True
    response_received: bool = False
    responded_at: Optional[datetime] = None
    sent_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = "Government Officer (MSDE)"

class CommunicationLog(CommunicationLogBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class CommunicationLogRead(CommunicationLogBase):
    id: int
