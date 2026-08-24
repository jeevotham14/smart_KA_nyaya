from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class ConsultationBroadcastCreate(BaseModel):
    legal_category: str
    district: str
    preferred_language: str
    consultation_mode: str
    short_summary: str = Field(..., max_length=1000)
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    pro_bono_requested: bool = False

class ConsultationBroadcastResponseCreate(BaseModel):
    advocate_message: Optional[str] = None
    proposed_fee: Optional[float] = None
    consultation_mode: str

class ConsultationBroadcastResponseRead(BaseModel):
    id: UUID
    advocate_id: UUID
    status: str
    advocate_message: Optional[str] = None
    proposed_fee: Optional[float] = None
    consultation_mode: str
    created_at: datetime
    # Nested advocate details
    advocate_name: Optional[str] = None
    specializations: Optional[List[str]] = None
    district: Optional[str] = None
    languages: Optional[List[str]] = None
    verification_status: Optional[str] = None

class ConsultationBroadcastRead(ConsultationBroadcastCreate):
    id: UUID
    citizen_id: UUID
    status: str
    expires_at: datetime
