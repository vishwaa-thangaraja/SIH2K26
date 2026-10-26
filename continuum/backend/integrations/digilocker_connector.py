from .base_connector import BaseConnector, ConnectorResponse

class DigiLockerConnector(BaseConnector):
    @property
    def source_name(self) -> str:
        return "DigiLocker"
        
    async def fetch_record(self, identifier: str) -> ConnectorResponse:
        return ConnectorResponse(
            success=True,
            source=self.source_name,
            data={"doc_id": identifier, "verified": True},
            latency_ms=150
        )
        
    async def verify_identity(self, trainee_id: str, anchor_type: str, anchor_value: str) -> ConnectorResponse:
        return ConnectorResponse(success=True, source=self.source_name, data={"verified": True})
        
    async def get_status(self, reference_id: str) -> ConnectorResponse:
        return ConnectorResponse(success=True, source=self.source_name)
