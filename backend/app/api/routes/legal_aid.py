from uuid import UUID

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.agents import LegalAidAgent
from app.api.deps import audit
from app.core.config import get_settings
from app.db.session import get_db
from app.models.domain import DlsaApplication, DirectoryService
from app.schemas import DlsaApplicationRead, EligibilityRequest, EligibilityResponse, LegalAidApply

router = APIRouter(prefix="/legal-aid", tags=["Legal Aid"])
agent = LegalAidAgent()


@router.post("/check-eligibility", response_model=EligibilityResponse)
def check_eligibility(payload: EligibilityRequest, db: Session = Depends(get_db)):
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

    return EligibilityResponse(
        eligible=result["eligible"],
        category_match=result.get("category_match", False),
        income_match=result.get("income_match", False),
        reason=result["reason"],
        reason_list=result.get("reason_list", []),
        disclaimer=result["disclaimer"],
        what_it_covers=result.get("what_it_covers", ""),
        alternate_paths=result.get("alternate_paths", []),
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
