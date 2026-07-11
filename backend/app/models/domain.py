import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import JSONVariant, TextArray, Vector
from app.models.enums import RecordStatus, UserRole


def uuid_pk() -> Mapped[uuid.UUID]:
    return mapped_column(primary_key=True, default=uuid.uuid4)


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
