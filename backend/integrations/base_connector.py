from abc import ABC, abstractmethod
from typing import Any, Optional
from pydantic import BaseModel

class ConnectorResponse(BaseModel):
    success: bool
    source: str
    data: Optional[dict] = None
    error: Optional[str] = None
    latency_ms: int = 0

class BaseConnector(ABC):
    """Abstract base for all external system connectors."""
    
    @property
    @abstractmethod
    def source_name(self) -> str: ...
    
    @abstractmethod
    async def fetch_record(self, identifier: str) -> ConnectorResponse: ...
    
    @abstractmethod
    async def verify_identity(self, trainee_id: str, anchor_type: str, anchor_value: str) -> ConnectorResponse: ...
    
    @abstractmethod
    async def get_status(self, reference_id: str) -> ConnectorResponse: ...
    
    async def health_check(self) -> bool:
        return True  # Mock always healthy
