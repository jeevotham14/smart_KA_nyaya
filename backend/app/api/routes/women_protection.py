from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.agents import WomenProtectionAgent
from app.api.deps import audit
from app.db.session import get_db
from app.models.domain import Complaint

router = APIRouter(prefix="/women-protection", tags=["Women Protection"])
agent = WomenProtectionAgent()


class HelpRequest(BaseModel):
    description: str
    district: str | None = None
    taluk: str | None = None
    user_id: str | None = None


@router.get("/resources")
def resources():
    return agent.resources()


@router.post("/request-help")
def request_help(payload: HelpRequest, request: Request, db: Session = Depends(get_db)):
    guidance = agent.request_help(payload.description, payload.district)
    complaint = Complaint(
        complaint_type="women_protection",
        description=payload.description,
        district=payload.district or "Karnataka",
        taluk=payload.taluk,
        routed_authority="Women helpline 181 / District police 112",
        status="routed",
    )
    db.add(complaint)
    audit(db, request, "women_protection.request_help")
    db.commit()
    return {"guidance": guidance, "complaint_id": complaint.complaint_id}


@router.get("/nearby-services")
def nearby_services(district: str | None = None):
    return [
        {"name": "Women Helpline", "phone": "181", "district": district or "Statewide"},
        {"name": "Emergency Response", "phone": "112", "district": district or "Statewide"},
    ]
