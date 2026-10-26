from .base_connector import BaseConnector, ConnectorResponse

class GSTNConnector(BaseConnector):
    @property
    def source_name(self) -> str:
        return "GSTN"
        
    async def fetch_record(self, identifier: str) -> ConnectorResponse:
        return ConnectorResponse(
            success=True,
            source=self.source_name,
            data={"gstn": identifier, "legal_name": "ABC Manufacturing Pvt Ltd"},
            latency_ms=80
        )
        
    async def verify_identity(self, trainee_id: str, anchor_type: str, anchor_value: str) -> ConnectorResponse:
        return ConnectorResponse(success=True, source=self.source_name, data={"verified": True})
        
    async def get_status(self, reference_id: str) -> ConnectorResponse:
        return ConnectorResponse(success=True, source=self.source_name)
