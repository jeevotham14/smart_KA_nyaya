from enum import StrEnum


class UserRole(StrEnum):
    citizen = "citizen"
    legal_aid_officer = "legal_aid_officer"
    lawyer_advisor = "lawyer_advisor"
    police_officer = "police_officer"
    admin = "admin"


class RecordStatus(StrEnum):
    submitted = "submitted"
    under_review = "under_review"
    routed = "routed"
    resolved = "resolved"
    rejected = "rejected"


class AppointmentStatus(StrEnum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"
    RESCHEDULE_REQUESTED = "RESCHEDULE_REQUESTED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"


class BroadcastStatus(StrEnum):
    OPEN = "OPEN"
    MATCHED = "MATCHED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"


class ConsultationDocumentType(StrEnum):
    LEGAL_NOTICE = "LEGAL_NOTICE"
    FIR = "FIR"
    COURT_ORDER = "COURT_ORDER"
    AGREEMENT = "AGREEMENT"
    PROPERTY_DOCUMENT = "PROPERTY_DOCUMENT"
    IDENTITY_DOCUMENT = "IDENTITY_DOCUMENT"
    EVIDENCE = "EVIDENCE"
    APPLICATION = "APPLICATION"
    RECEIPT = "RECEIPT"
    OTHER = "OTHER"

