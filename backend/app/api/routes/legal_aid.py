from uuid import UUID

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.agents import LegalAidAgent
from app.api.deps import audit
from app.core.config import get_settings
from app.db.session import get_db
from app.models.domain import DlsaApplication, DirectoryService
from app.schemas import (
    DlsaApplicationRead,
    EligibilityRequest,
    EligibilityResponse,
    LegalAidApply,
    TailoredGuidance,
    ActionButton,
)

router = APIRouter(prefix="/legal-aid", tags=["Legal Aid"])

CASE_TYPE_ROUTING = {
    "consumer": {
        "document": "consumer_complaint",
        "resource": "consumer-rights-guide"
    },
    "property": {
        "document": "property_notice",
        "resource": "property-dispute-guide"
    },
    "family": {
        "document": "maintenance_petition",
        "resource": "family-law-guide"
    },
    "employment": {
        "document": "labour_complaint",
        "resource": "labour-rights-guide"
    },
    "cyber": {
        "document": "cyber_complaint",
        "resource": "cyber-crime-guide"
    }
}

agent = LegalAidAgent()


@router.post("/check-eligibility", response_model=EligibilityResponse)
def check_eligibility(payload: EligibilityRequest, db: Session = Depends(get_db)):
    if payload.urgent_safety_concern:
        return EligibilityResponse(
            eligible=True,
            reason="Emergency override triggered.",
            disclaimer="Please prioritize your physical safety and contact authorities immediately.",
            tailored_guidance=TailoredGuidance(
                title="Emergency Safety Protocol Activated",
                description="Immediate assistance is recommended for your safety.",
                priority="emergency",
                actions=[
                    ActionButton(label="Call 181", action="call", value="181"),
                    ActionButton(label="Call 112", action="call", value="112"),
                    ActionButton(label="Open Domestic Violence Application", action="navigate", value="domestic_violence_application"),
                    ActionButton(label="Find Protection Officer", action="navigate", value="protection_officer"),
                ],
                emergency_numbers=["181", "112"],
                recommended_documents=["Domestic Violence Application"]
            )
        )

    settings = get_settings()
    result = agent.check(payload, income_limit=settings.legal_aid_income_limit)

    # If eligible, try to find the nearest DLSA from the directory
    nearest_dlsa = None
    if result["eligible"] and payload.category:
        # Try to infer district from request (not always available; best-effort)
        pass

    # Fetch alternate-path NGO/DLSA results for ineligible applicants
    alternate_services = []
    if not result["eligible"]:
        rows = db.scalars(
            select(DirectoryService)
            .where(DirectoryService.service_type.in_(["dlsa", "ngo", "legal_aid"]))
            .limit(3)
        ).all()
        alternate_services = [
            {"name": r.name, "address": r.address, "phone": r.phone, "type": r.service_type}
            for r in rows
        ]

    recommended_documents = []
    recommended_resources = []
    if payload.case_type and payload.case_type.lower() in CASE_TYPE_ROUTING:
        route = CASE_TYPE_ROUTING[payload.case_type.lower()]
        if route.get("document"):
            recommended_documents.append(route["document"])
        if route.get("resource"):
            recommended_resources.append(route["resource"])

    if result["eligible"]:
        guidance = TailoredGuidance(
            title="Eligible for Free Legal Aid",
            description="You are eligible for free legal representation and advice.",
            priority="normal",
            actions=[
                ActionButton(label="Apply for Free Legal Aid", action="navigate", value="apply_legal_aid"),
                ActionButton(label="Open Recommended Document", action="navigate", value="documents"),
                ActionButton(label="Read Related Guide", action="navigate", value="guides"),
                ActionButton(label="Find Nearby DLSA", action="navigate", value="dlsa"),
            ],
            recommended_documents=recommended_documents,
            recommended_resources=recommended_resources,
            directory_filter=payload.district
        )
    else:
        guidance = TailoredGuidance(
            title="Alternative Legal Resources",
            description="While you may not qualify for free legal aid, other options are available.",
            priority="normal",
            actions=[
                ActionButton(label="Find DLSA Office", action="navigate", value="dlsa"),
                ActionButton(label="Explore Lok Adalat", action="navigate", value="lok_adalat"),
                ActionButton(label="Read Legal Guide", action="navigate", value="guides"),
                ActionButton(label="Download Suggested Document", action="navigate", value="documents"),
            ],
            recommended_documents=recommended_documents,
            recommended_resources=recommended_resources,
            directory_filter=payload.district
        )

    return EligibilityResponse(
        eligible=result["eligible"],
        category_match=result.get("category_match", False),
        income_match=result.get("income_match", False),
        reason=result["reason"],
        reason_list=result.get("reason_list", []),
        disclaimer=result["disclaimer"],
        what_it_covers=result.get("what_it_covers", ""),
        alternate_paths=result.get("alternate_paths", []),
        tailored_guidance=guidance
    )


@router.post("/apply", response_model=DlsaApplicationRead)
def apply(payload: LegalAidApply, request: Request, db: Session = Depends(get_db)):
    settings = get_settings()
    eligibility = agent.check(EligibilityRequest(category=payload.category), income_limit=settings.legal_aid_income_limit)
    row = DlsaApplication(
        user_id=payload.user_id,
        case_id=payload.case_id,
        income_proof=payload.income_proof,
        category=payload.category,
        eligible=eligibility["eligible"],
        assigned_officer="District Legal Services Authority desk",
    )
    db.add(row)
    db.flush()
    audit(db, request, "legal_aid.apply", payload.user_id)
    db.commit()
    db.refresh(row)
    return row


@router.get("/applications/{user_id}", response_model=list[DlsaApplicationRead])
def applications(user_id: UUID, db: Session = Depends(get_db)):
    return db.scalars(select(DlsaApplication).where(DlsaApplication.user_id == user_id)).all()
