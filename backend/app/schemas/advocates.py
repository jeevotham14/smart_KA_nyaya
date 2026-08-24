from datetime import datetime
from uuid import UUID
from typing import List, Optional

from app.schemas.common import ORMModel

# ---------------- Advocate Profile ----------------

class AdvocateProfileBase(ORMModel):
    full_name: str
    bar_council_number: str
    specializations: List[str] = []
    district: str
    city: Optional[str] = None
    languages: List[str] = []
    years_of_experience: int = 0
    consultation_fee: float = 0.0
    online_consultation: bool = False
    offline_consultation: bool = False
    pro_bono_available: bool = False
    bio: Optional[str] = None
    profile_image: Optional[str] = None


class AdvocateProfileCreate(AdvocateProfileBase):
    pass


class AdvocateProfileUpdate(ORMModel):
    full_name: Optional[str] = None
    specializations: Optional[List[str]] = None
    district: Optional[str] = None
    city: Optional[str] = None
    languages: Optional[List[str]] = None
    years_of_experience: Optional[int] = None
    consultation_fee: Optional[float] = None
    online_consultation: Optional[bool] = None
    offline_consultation: Optional[bool] = None
    pro_bono_available: Optional[bool] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    is_active: Optional[bool] = None


class AdvocateProfileRead(AdvocateProfileBase):
    id: UUID
    user_id: UUID
    verification_status: str
    is_active: bool
    updated_at: datetime


# ---------------- Advocate Availability ----------------

class AdvocateAvailabilityBase(ORMModel):
    date: str  # YYYY-MM-DD
    start_time: str  # HH:MM
    end_time: str  # HH:MM
    consultation_mode: str = "ONLINE"


class AdvocateAvailabilityCreate(AdvocateAvailabilityBase):
    pass


class AdvocateAvailabilityUpdate(ORMModel):
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    consultation_mode: Optional[str] = None
    is_available: Optional[bool] = None


class AdvocateAvailabilityRead(AdvocateAvailabilityBase):
    id: UUID
    advocate_id: UUID
    is_available: bool


# ---------------- Consultation Appointment ----------------

class ConsultationAppointmentBase(ORMModel):
    legal_category: str
    case_summary: str
    consultation_mode: str
    appointment_date: str
    start_time: str
    end_time: str
    consultation_fee: float = 0.0


class ConsultationAppointmentCreate(ConsultationAppointmentBase):
    advocate_id: UUID
    availability_id: UUID


class ConsultationAppointmentUpdate(ORMModel):
    status: str
    meeting_details: Optional[str] = None
    advocate_message: Optional[str] = None
    proposed_date: Optional[str] = None
    proposed_start_time: Optional[str] = None
    proposed_end_time: Optional[str] = None


class ConsultationAppointmentRead(ConsultationAppointmentBase):
    id: UUID
    citizen_id: UUID
    advocate_id: UUID
    availability_id: UUID
    status: str
    meeting_details: Optional[str] = None
    advocate_message: Optional[str] = None
    proposed_date: Optional[str] = None
    proposed_start_time: Optional[str] = None
    proposed_end_time: Optional[str] = None
    updated_at: datetime
    # Expanded relationships could be included here if needed
    advocate_name: Optional[str] = None
    citizen_name: Optional[str] = None
