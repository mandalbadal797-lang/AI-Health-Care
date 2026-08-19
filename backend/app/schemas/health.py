from pydantic import BaseModel, Field
from typing import Dict, Any


class HealthData(BaseModel):
    status: str = Field(..., example="ok")
    app_name: str = Field(..., example="MindCampus API")
    environment: str = Field(..., example="development")
    version: str = Field(..., example="1.0.0")
    database_connected: bool = Field(..., example=True)


class HealthResponse(BaseModel):
    success: bool = True
    data: HealthData
    meta: Dict[str, Any] = Field(default_factory=dict)
