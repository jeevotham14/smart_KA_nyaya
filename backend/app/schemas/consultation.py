from datetime import datetime
from uuid import UUID
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ── Appointment Schemas ──────────────────────────────────────────────────────

class ConsultationAppointmentCreate(BaseModel):
    advocate_id: Optional[UUID] = None
    legal_category: str = Field(min_length=2, max_length=120)
    case_summary: str = Field(min_length=5)
    district: str = Field(min_length=2, max_length=100)
    language: str = "English"
    consultation_mode: str = "online"
    preferred_date_time: str = Field(min_length=3, max_length=100)
    pro_bono: bool = False


class ConsultationAppointmentRead(ORMModel):
    id: UUID
    citizen_id: UUID
    advocate_id: Optional[UUID] = None
    legal_category: str
    case_summary: str
    district: str
    language: str
    consultation_mode: str
    preferred_date_time: str
    scheduled_date_time: Optional[str] = None
    status: str
    reschedule_reason: Optional[str] = None
    pro_bono: bool
    meeting_link: Optional[str] = None
    contact_details: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    citizen_name: Optional[str] = None
    advocate_name: Optional[str] = None


class AppointmentStatusUpdate(BaseModel):
    status: str
    reschedule_reason: Optional[str] = None
    scheduled_date_time: Optional[str] = None
    meeting_link: Optional[str] = None
    contact_details: Optional[str] = None


# ── Broadcast Schemas (Privacy-Safe: ZERO Document Relationships) ───────────

class ConsultationBroadcastCreate(BaseModel):
    legal_category: str = Field(min_length=2, max_length=120)
    case_summary: str = Field(min_length=5)
    district: str = Field(min_length=2, max_length=100)
    language: str = "English"
    consultation_mode: str = "online"
    preferred_date_time: str = Field(min_length=3, max_length=100)
    pro_bono: bool = False


class ConsultationBroadcastRead(ORMModel):
    id: UUID
    citizen_id: UUID
    legal_category: str
    case_summary: str
    district: str
    language: str
    consultation_mode: str
    preferred_date_time: str
    pro_bono: bool
    status: str
    selected_appointment_id: Optional[UUID] = None
    created_at: datetime
    response_count: int = 0


class ConsultationBroadcastResponseCreate(BaseModel):
    message: str = Field(min_length=5)
    available_time: str = Field(min_length=3, max_length=100)
    fee_estimate: Optional[str] = None


class ConsultationBroadcastResponseRead(ORMModel):
    id: UUID
    broadcast_id: UUID
    advocate_id: UUID
    advocate_name: Optional[str] = None
    message: str
    available_time: str
    fee_estimate: Optional[str] = None
    status: str
    created_at: datetime


# ── Document Schemas (Privacy-Safe: Metadata Only, NO Storage Paths) ─────────

class ConsultationDocumentRead(BaseModel):
    """
    Document metadata returned to authorized users.
    Excludes storage_key, disk file path, and raw bytes.
    """
    id: UUID
    appointment_id: UUID
    filename: str
    mime_type: str
    size: int
    document_type: str
    description: Optional[str] = None
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Advocate Profile Schema ──────────────────────────────────────────────────

class AdvocateProfileRead(BaseModel):
    user_id: UUID
    name: str
    district: Optional[str] = None
    taluk: Optional[str] = None
    language_pref: str
    role: str
    phone: Optional[str] = None
    email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
