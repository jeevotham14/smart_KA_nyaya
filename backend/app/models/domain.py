import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, func, Column
import sqlalchemy.types as types
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import timezone
from app.db.base import Base
from app.db.types import JSONVariant, TextArray, Vector
from app.models.enums import RecordStatus, UserRole, ConsultationDocumentType


def uuid_pk() -> Mapped[uuid.UUID]:
    return mapped_column(primary_key=True, default=uuid.uuid4)


def _generate_case_number() -> str:
    """Generate eCourt-style case number: CC/NNNN/YYYY"""
    import random
    from datetime import datetime
    year = datetime.now().year
    seq = random.randint(1, 99999)
    return f"CC/{seq:05d}/{year}"


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class User(Base, TimestampMixin):
    __tablename__ = "users"

    user_id: Mapped[uuid.UUID] = uuid_pk()
    name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    aadhaar_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    language_pref: Mapped[str] = mapped_column(String(32), default="English")
    role: Mapped[str] = mapped_column(String(40), default=UserRole.citizen.value, index=True)
    district: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    taluk: Mapped[str | None] = mapped_column(String(100), nullable=True)
    dlsa_eligible: Mapped[bool] = mapped_column(Boolean, default=False)

    queries = relationship("LegalQuery", back_populates="user")
    cases = relationship("CaseObject", back_populates="user")


class LegalQuery(Base, TimestampMixin):
    __tablename__ = "legal_queries"

    query_id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.user_id"), nullable=True, index=True)
    grievance_text: Mapped[str] = mapped_column(Text)
    language: Mapped[str] = mapped_column(String(32), default="English")
    legal_category: Mapped[str] = mapped_column(String(120), index=True)
    urgency_level: Mapped[str] = mapped_column(String(40), default="normal")
    ai_response: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(40), default=RecordStatus.submitted.value)

    user = relationship("User", back_populates="queries")


class CaseObject(Base, TimestampMixin):
    __tablename__ = "case_objects"

    case_id: Mapped[uuid.UUID] = uuid_pk()
    case_number: Mapped[str] = mapped_column(String(30), unique=True, index=True, default=_generate_case_number)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.user_id"), nullable=True, index=True)
    grievance_text: Mapped[str] = mapped_column(Text)
    legal_sections: Mapped[dict | list | None] = mapped_column(JSONVariant, default=list)
    court_type: Mapped[str | None] = mapped_column(String(120), nullable=True)
    documents: Mapped[dict | list | None] = mapped_column(JSONVariant, default=list)
    status: Mapped[str] = mapped_column(String(40), default=RecordStatus.submitted.value, index=True)
    prediction_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    estimated_duration_days: Mapped[int | None] = mapped_column(nullable=True)

    user = relationship("User", back_populates="cases")


class LegalStatute(Base):
    __tablename__ = "legal_statutes"

    section_id: Mapped[uuid.UUID] = uuid_pk()
    act_name: Mapped[str] = mapped_column(String(180), index=True)
    section_number: Mapped[str] = mapped_column(String(80))
    section_text: Mapped[str] = mapped_column(Text)
    keywords: Mapped[list[str] | None] = mapped_column(TextArray, default=list)
    applicable_courts: Mapped[list[str] | None] = mapped_column(TextArray, default=list)
    state_applicability: Mapped[str] = mapped_column(String(100), default="Karnataka")


class Precedent(Base):
    __tablename__ = "precedent_store"

    case_ref: Mapped[uuid.UUID] = uuid_pk()
    title: Mapped[str] = mapped_column(String(255), index=True)
    court: Mapped[str] = mapped_column(String(180))
    jurisdiction: Mapped[str] = mapped_column(String(120), default="Karnataka")
    year: Mapped[int | None] = mapped_column(nullable=True)
    outcome: Mapped[str | None] = mapped_column(String(255), nullable=True)
    summary: Mapped[str] = mapped_column(Text)
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    embedding_vector = mapped_column(Vector(1536), nullable=True)


class GeneratedDocument(Base, TimestampMixin):
    __tablename__ = "generated_documents"

    doc_id: Mapped[uuid.UUID] = uuid_pk()
    case_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("case_objects.case_id"), nullable=True, index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.user_id"), nullable=True, index=True)
    doc_type: Mapped[str] = mapped_column(String(100))
    content_text: Mapped[str] = mapped_column(Text)
    file_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    format_compliant: Mapped[bool] = mapped_column(Boolean, default=True)


class DlsaApplication(Base, TimestampMixin):
    __tablename__ = "dlsa_applications"

    app_id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.user_id"), nullable=True, index=True)
    case_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("case_objects.case_id"), nullable=True)
    income_proof: Mapped[str | None] = mapped_column(String(500), nullable=True)
    category: Mapped[str] = mapped_column(String(100))
    eligible: Mapped[bool] = mapped_column(Boolean, default=False)
    assigned_officer: Mapped[str | None] = mapped_column(String(160), nullable=True)
    status: Mapped[str] = mapped_column(String(40), default=RecordStatus.submitted.value)


class Complaint(Base, TimestampMixin):
    __tablename__ = "complaints"

    complaint_id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.user_id"), nullable=True, index=True)
    complaint_type: Mapped[str] = mapped_column(String(100), index=True)
    description: Mapped[str] = mapped_column(Text)
    district: Mapped[str] = mapped_column(String(100), index=True)
    taluk: Mapped[str | None] = mapped_column(String(100), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(50), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    routed_authority: Mapped[str] = mapped_column(String(180))
    status: Mapped[str] = mapped_column(String(40), default=RecordStatus.submitted.value)
    uploaded_documents: Mapped[dict | list | None] = mapped_column(JSONVariant, default=list)


class DirectoryService(Base):
    __tablename__ = "directory_services"

    service_id: Mapped[uuid.UUID] = uuid_pk()
    name: Mapped[str] = mapped_column(String(180), index=True)
    service_type: Mapped[str] = mapped_column(String(80), index=True)
    district: Mapped[str] = mapped_column(String(100), index=True)
    taluk: Mapped[str | None] = mapped_column(String(100), nullable=True)
    address: Mapped[str] = mapped_column(Text)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)


class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    notification_id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.user_id"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(160))
    message: Mapped[str] = mapped_column(Text)
    channel: Mapped[str] = mapped_column(String(40), default="in_app")
    read_status: Mapped[bool] = mapped_column(Boolean, default=False)


class AuditLog(Base, TimestampMixin):
    __tablename__ = "audit_logs"

    log_id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID | None] = mapped_column(nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(180))
    ip_address: Mapped[str | None] = mapped_column(String(80), nullable=True)


class CaseNote(Base, TimestampMixin):
    __tablename__ = "case_notes"

    note_id: Mapped[uuid.UUID] = uuid_pk()
    case_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("case_objects.case_id"), nullable=False)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.user_id"), nullable=True)
    content: Mapped[str] = mapped_column(Text, default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now())


class CaseTask(Base, TimestampMixin):
    __tablename__ = "case_tasks"

    task_id: Mapped[uuid.UUID] = uuid_pk()
    case_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("case_objects.case_id"), nullable=False)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.user_id"), nullable=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    due_date: Mapped[str | None] = mapped_column(String(50), nullable=True)


class DocumentDraft(Base, TimestampMixin):
    __tablename__ = "document_drafts"

    draft_id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.user_id"), nullable=True, index=True)
    doc_type: Mapped[str] = mapped_column(String(100))
    form_data: Mapped[dict | list | None] = mapped_column(JSONVariant, nullable=True)
    content_text: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now())


class EvidenceFile(Base, TimestampMixin):
    __tablename__ = "evidence_files"

    file_id: Mapped[uuid.UUID] = uuid_pk()
    case_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("case_objects.case_id"), nullable=True, index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.user_id"), nullable=True, index=True)
    filename: Mapped[str] = mapped_column(String(255))
    content_type: Mapped[str] = mapped_column(String(100))
    size_kb: Mapped[int] = mapped_column(Integer)
    category: Mapped[str] = mapped_column(String(100))
    data: Mapped[bytes] = mapped_column(types.LargeBinary)


class AdvocateProfile(Base, TimestampMixin):
    __tablename__ = "advocate_profiles"

    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.user_id"), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(160))
    bar_council_number: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    verification_status: Mapped[str] = mapped_column(String(40), default="PENDING")
    specializations: Mapped[list[str] | None] = mapped_column(TextArray, default=list)
    district: Mapped[str] = mapped_column(String(100), index=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    languages: Mapped[list[str] | None] = mapped_column(TextArray, default=list)
    years_of_experience: Mapped[int] = mapped_column(Integer, default=0)
    consultation_fee: Mapped[float] = mapped_column(Float, default=0.0)
    broadcast_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("consultation_broadcasts.id", ondelete="SET NULL"), nullable=True, unique=True)
    online_consultation: Mapped[bool] = mapped_column(Boolean, default=False)
    offline_consultation: Mapped[bool] = mapped_column(Boolean, default=False)
    pro_bono_available: Mapped[bool] = mapped_column(Boolean, default=False)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    profile_image: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    user = relationship("User", backref="advocate_profile")
    availabilities = relationship("AdvocateAvailability", back_populates="advocate")
    appointments = relationship("ConsultationAppointment", foreign_keys="ConsultationAppointment.advocate_id", back_populates="advocate")


class AdvocateAvailability(Base, TimestampMixin):
    __tablename__ = "advocate_availability"

    id: Mapped[uuid.UUID] = uuid_pk()
    advocate_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("advocate_profiles.id"), index=True)
    date: Mapped[str] = mapped_column(String(20), index=True)  # YYYY-MM-DD
    start_time: Mapped[str] = mapped_column(String(10)) # HH:MM
    end_time: Mapped[str] = mapped_column(String(10)) # HH:MM
    consultation_mode: Mapped[str] = mapped_column(String(20), default="ONLINE") # ONLINE, OFFLINE, BOTH
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)

    advocate = relationship("AdvocateProfile", back_populates="availabilities")
    appointments = relationship("ConsultationAppointment", back_populates="availability")


class ConsultationAppointment(Base, TimestampMixin):
    __tablename__ = "consultation_appointments"

    id: Mapped[uuid.UUID] = uuid_pk()
    citizen_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.user_id"), index=True)
    advocate_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("advocate_profiles.id"), index=True)
    availability_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("advocate_availability.id"))
    legal_category: Mapped[str] = mapped_column(String(120))
    case_summary: Mapped[str] = mapped_column(Text)
    consultation_mode: Mapped[str] = mapped_column(String(20)) # ONLINE or OFFLINE
    appointment_date: Mapped[str] = mapped_column(String(20))
    start_time: Mapped[str] = mapped_column(String(10))
    end_time: Mapped[str] = mapped_column(String(10))
    status: Mapped[str] = mapped_column(String(40), default="PENDING")
    consultation_fee: Mapped[float] = mapped_column(Float, default=0.0)
    broadcast_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("consultation_broadcasts.id", ondelete="SET NULL"), nullable=True, unique=True)
    meeting_details: Mapped[str | None] = mapped_column(Text, nullable=True)
    advocate_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    proposed_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    proposed_start_time: Mapped[str | None] = mapped_column(String(10), nullable=True)
    proposed_end_time: Mapped[str | None] = mapped_column(String(10), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    citizen = relationship("User", backref="appointments")
    advocate = relationship("AdvocateProfile", foreign_keys=[advocate_id], back_populates="appointments")
    availability = relationship("AdvocateAvailability", back_populates="appointments")
    documents = relationship("ConsultationDocument", back_populates="appointment", cascade="all, delete-orphan")


import sqlalchemy as sa

class ConsultationBroadcast(Base, TimestampMixin):
    __tablename__ = "consultation_broadcasts"

    id: Mapped[uuid.UUID] = uuid_pk()
    citizen_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.user_id"), index=True)
    legal_category: Mapped[str] = mapped_column(String(120))
    district: Mapped[str] = mapped_column(String(100), index=True)
    preferred_language: Mapped[str] = mapped_column(String(50))
    consultation_mode: Mapped[str] = mapped_column(String(20))
    short_summary: Mapped[str] = mapped_column(Text)
    preferred_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    preferred_time: Mapped[str | None] = mapped_column(String(10), nullable=True)
    pro_bono_requested: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(40), default="OPEN")
    selected_advocate_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("advocate_profiles.id", ondelete="SET NULL"), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    citizen = relationship("User")
    recipients = relationship("ConsultationBroadcastRecipient", back_populates="broadcast")
    responses = relationship("ConsultationBroadcastResponse", back_populates="broadcast")


class ConsultationBroadcastRecipient(Base):
    __tablename__ = "consultation_broadcast_recipients"

    id: Mapped[uuid.UUID] = uuid_pk()
    broadcast_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("consultation_broadcasts.id", ondelete="CASCADE"), index=True)
    advocate_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("advocate_profiles.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    broadcast = relationship("ConsultationBroadcast", back_populates="recipients")
    advocate = relationship("AdvocateProfile")


class ConsultationBroadcastResponse(Base, TimestampMixin):
    __tablename__ = "consultation_broadcast_responses"

    id: Mapped[uuid.UUID] = uuid_pk()
    broadcast_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("consultation_broadcasts.id", ondelete="CASCADE"), index=True)
    advocate_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("advocate_profiles.id", ondelete="CASCADE"), index=True)
    status: Mapped[str] = mapped_column(String(40), default="INTERESTED")
    advocate_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    proposed_fee: Mapped[float | None] = mapped_column(Float, nullable=True)
    consultation_mode: Mapped[str] = mapped_column(String(20))

    broadcast = relationship("ConsultationBroadcast", back_populates="responses")
    advocate = relationship("AdvocateProfile")

    __table_args__ = (
        sa.UniqueConstraint("broadcast_id", "advocate_id", name="uq_broadcast_advocate_response"),
    )


class ConsultationDocument(Base, TimestampMixin):
    __tablename__ = "consultation_documents"

    id: Mapped[uuid.UUID] = uuid_pk()
    appointment_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("consultation_appointments.id"), nullable=False, index=True)
    uploaded_by_user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.user_id"), nullable=False, index=True)
    original_filename: Mapped[str] = mapped_column(String(255))
    storage_key: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    mime_type: Mapped[str] = mapped_column(String(100))
    file_size: Mapped[int] = mapped_column(Integer)
    document_type: Mapped[str] = mapped_column(String(60), default=ConsultationDocumentType.OTHER.value)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    appointment = relationship("ConsultationAppointment", back_populates="documents")
    uploader = relationship("User", foreign_keys=[uploaded_by_user_id])