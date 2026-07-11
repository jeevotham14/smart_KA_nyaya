from uuid import UUID

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.agents import LegalAidAgent
from app.api.deps import audit
from app.db.session import get_db
from app.models.domain import DlsaApplication
from app.schemas import DlsaApplicationRead, EligibilityRequest, EligibilityResponse, LegalAidApply

router = APIRouter(prefix="/legal-aid", tags=["Legal Aid"])
agent = LegalAidAgent()


@router.post("/check-eligibility", response_model=EligibilityResponse)
def check_eligibility(payload: EligibilityRequest):
    return agent.check(payload)


@router.post("/apply", response_model=DlsaApplicationRead)
def apply(payload: LegalAidApply, request: Request, db: Session = Depends(get_db)):
    eligibility = agent.check(EligibilityRequest(category=payload.category))
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
