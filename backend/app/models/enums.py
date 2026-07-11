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
