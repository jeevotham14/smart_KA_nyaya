from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: str | None = None
    password: str = Field(min_length=8, max_length=128)
    language_pref: str = "English"
    district: str | None = None
    taluk: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(ORMModel):
    user_id: UUID
    name: str
    email: EmailStr
    phone: str | None = None
    language_pref: str
    role: str
    district: str | None = None
    taluk: str | None = None
    dlsa_eligible: bool
    created_at: datetime


class LegalQueryCreate(BaseModel):
    grievance_text: str = Field(min_length=5)
    language: str = "English"
    legal_category: str | None = None
    urgency_level: str | None = None
    consent_to_store: bool = True


class LegalQueryRead(ORMModel):
    query_id: UUID
    user_id: UUID | None = None
    grievance_text: str
    language: str
    legal_category: str
    urgency_level: str
    ai_response: str
    status: str
    created_at: datetime


class ClassifyIssueRequest(BaseModel):
    text: str = Field(min_length=3)
    language: str = "English"


class PrecedentSearchRequest(BaseModel):
    query: str = Field(min_length=3)
    top_k: int = Field(default=3, ge=1, le=10)


class RiskAssessmentRequest(BaseModel):
    grievance_text: str = Field(min_length=5)
    legal_category: str | None = None


class EligibilityRequest(BaseModel):
    gender: str | None = None
    category: str | None = None
    annual_income: int | None = Field(default=None, ge=0)
    disability: bool = False
    case_type: str | None = None
    is_child: bool = False
    is_senior_citizen: bool = False


class EligibilityResponse(BaseModel):
    eligible: bool
    reason: str
    disclaimer: str


class LegalAidApply(BaseModel):
    user_id: UUID | None = None
    case_id: UUID | None = None
    income_proof: str | None = None
    category: str


class DlsaApplicationRead(ORMModel):
    app_id: UUID
    user_id: UUID | None = None
    case_id: UUID | None = None
    income_proof: str | None = None
    category: str
    eligible: bool
    assigned_officer: str | None = None
    status: str
    created_at: datetime


class ComplaintCreate(BaseModel):
    complaint_type: str
    description: str = Field(min_length=5)
    district: str
    taluk: str | None = None
    uploaded_documents: list[dict] = []


class ComplaintRead(ORMModel):
    complaint_id: UUID
    user_id: UUID | None = None
    complaint_type: str
    description: str
    district: str
    taluk: str | None = None
    routed_authority: str
    status: str
    uploaded_documents: list[dict] | dict | None = None
    created_at: datetime


class StatusPatch(BaseModel):
    status: str


class DocumentGenerateRequest(BaseModel):
    doc_type: str
    facts: dict = {}
    case_id: UUID | None = None
    user_id: UUID | None = None


class GeneratedDocumentRead(ORMModel):
    doc_id: UUID
    case_id: UUID | None = None
    user_id: UUID | None = None
    doc_type: str
    content_text: str
    file_url: str | None = None
    format_compliant: bool
    created_at: datetime


class DirectoryServiceCreate(BaseModel):
    name: str
    service_type: str
    district: str
    taluk: str | None = None
    address: str
    phone: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class DirectoryServiceRead(ORMModel):
    service_id: UUID
    name: str
    service_type: str
    district: str
    taluk: str | None = None
    address: str
    phone: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class NotificationRead(ORMModel):
    notification_id: UUID
    user_id: UUID | None = None
    title: str
    message: str
    channel: str
    read_status: bool
    created_at: datetime


class LegalContentCreate(BaseModel):
    act_name: str
    section_number: str
    section_text: str
    keywords: list[str] = []
    applicable_courts: list[str] = []
    state_applicability: str = "Karnataka"
