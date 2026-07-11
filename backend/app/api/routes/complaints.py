from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import audit
from app.db.session import get_db
from app.models.domain import Complaint
from app.schemas import ComplaintCreate, ComplaintRead, StatusPatch

router = APIRouter(prefix="/complaints", tags=["Complaints"])


def route_authority(complaint_type: str, district: str) -> str:
    lowered = complaint_type.lower()
    if "police" in lowered or "crime" in lowered:
        return f"{district} District Police"
    if "women" in lowered or "domestic" in lowered:
        return f"{district} Women Protection Cell"
    return f"{district} District Legal Services Authority"


@router.post("", response_model=ComplaintRead)
def create_complaint(payload: ComplaintCreate, request: Request, db: Session = Depends(get_db)):
    row = Complaint(
        complaint_type=payload.complaint_type,
        description=payload.description,
        district=payload.district,
        taluk=payload.taluk,
        routed_authority=route_authority(payload.complaint_type, payload.district),
        uploaded_documents=payload.uploaded_documents,
    )
    db.add(row)
    db.flush()
    audit(db, request, "complaints.create")
    db.commit()
    db.refresh(row)
    return row


@router.get("/user/{user_id}", response_model=list[ComplaintRead])
def user_complaints(user_id: UUID, db: Session = Depends(get_db)):
    return db.scalars(select(Complaint).where(Complaint.user_id == user_id)).all()


@router.get("/{complaint_id}", response_model=ComplaintRead)
def get_complaint(complaint_id: UUID, db: Session = Depends(get_db)):
    row = db.get(Complaint, complaint_id)
    if not row:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return row


@router.patch("/{complaint_id}/status", response_model=ComplaintRead)
def update_status(complaint_id: UUID, payload: StatusPatch, request: Request, db: Session = Depends(get_db)):
    row = db.get(Complaint, complaint_id)
    if not row:
        raise HTTPException(status_code=404, detail="Complaint not found")
    row.status = payload.status
    audit(db, request, "complaints.update_status", row.user_id)
    db.commit()
    db.refresh(row)
    return row
