from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session
import uuid

from app.api.deps import audit, require_roles
from app.db.session import get_db
from app.models.domain import Complaint, DirectoryService, LegalQuery, LegalStatute, User, AdvocateProfile, ConsultationAppointment, ConsultationBroadcast, DlsaApplication
from app.schemas import DirectoryServiceCreate, DirectoryServiceRead, LegalContentCreate, UserRead
from app.schemas.advocates import AdvocateProfileRead

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(require_roles("admin"))])

class AdvocateStatusUpdate(BaseModel):
    verification_status: str
    is_active: bool

@router.get("/advocates/pending", response_model=list[AdvocateProfileRead])
def pending_advocates(db: Session = Depends(get_db)):
    return db.query(AdvocateProfile).filter(AdvocateProfile.verification_status == "PENDING").all()

@router.patch("/advocates/{advocate_id}/status", response_model=AdvocateProfileRead)
def update_advocate_status(advocate_id: uuid.UUID, payload: AdvocateStatusUpdate, db: Session = Depends(get_db)):
    advocate = db.query(AdvocateProfile).filter(AdvocateProfile.id == advocate_id).first()
    if not advocate:
        raise HTTPException(status_code=404, detail="Advocate profile not found")
    
    advocate.verification_status = payload.verification_status
    advocate.is_active = payload.is_active
    db.commit()
    db.refresh(advocate)
    return advocate

@router.get("/users", response_model=list[UserRead])
def users(db: Session = Depends(get_db)):
    return db.scalars(select(User).order_by(User.created_at.desc()).limit(100)).all()

@router.get("/complaints")
def complaints(db: Session = Depends(get_db)):
    return db.scalars(select(Complaint).order_by(Complaint.created_at.desc()).limit(100)).all()

@router.post("/legal-content")
def legal_content(payload: LegalContentCreate, request: Request, db: Session = Depends(get_db)):
    row = LegalStatute(**payload.model_dump())
    db.add(row)
    audit(db, request, "admin.legal_content.create")
    db.commit()
    db.refresh(row)
    return row

@router.post("/directory-service", response_model=DirectoryServiceRead)
def directory_service(payload: DirectoryServiceCreate, request: Request, db: Session = Depends(get_db)):
    row = DirectoryService(**payload.model_dump())
    db.add(row)
    audit(db, request, "admin.directory_service.create")
    db.commit()
    db.refresh(row)
    return row

@router.get("/analytics")
def analytics(db: Session = Depends(get_db)):
    return {
        "users": db.scalar(select(func.count()).select_from(User)),
        "complaints": db.scalar(select(func.count()).select_from(Complaint)),
        "legal_queries": db.scalar(select(func.count()).select_from(LegalQuery)),
        "open_complaints": db.scalar(select(func.count()).select_from(Complaint).where(Complaint.status != "resolved")),
    }

@router.get("/dashboard")
def get_admin_dashboard(db: Session = Depends(get_db)):
    registered_users = db.scalar(select(func.count()).select_from(User)) or 0
    citizens = db.scalar(select(func.count()).select_from(User).where(User.role == 'citizen')) or 0
    advocates = db.scalar(select(func.count()).select_from(User).where(User.role == 'advocate')) or 0
    active_advocates = db.scalar(select(func.count()).select_from(AdvocateProfile).where(AdvocateProfile.verification_status == 'VERIFIED')) or 0
    complaints = db.scalar(select(func.count()).select_from(Complaint)) or 0
    legal_aid_applications = db.scalar(select(func.count()).select_from(DlsaApplication)) or 0
    consultations = db.scalar(select(func.count()).select_from(ConsultationAppointment)) or 0
    open_broadcasts = db.scalar(select(func.count()).select_from(ConsultationBroadcast).where(ConsultationBroadcast.status == 'OPEN')) or 0
    pending_advocate_profiles = db.scalar(select(func.count()).select_from(AdvocateProfile).where(AdvocateProfile.verification_status == 'PENDING')) or 0
    rejected_advocate_profiles = db.scalar(select(func.count()).select_from(AdvocateProfile).where(AdvocateProfile.verification_status == 'REJECTED')) or 0
    suspended_advocate_profiles = db.scalar(select(func.count()).select_from(AdvocateProfile).where(AdvocateProfile.verification_status == 'SUSPENDED')) or 0

    return {
        "registered_users": registered_users,
        "citizens": citizens,
        "advocates": advocates,
        "active_advocates": active_advocates,
        "complaints": complaints,
        "legal_aid_applications": legal_aid_applications,
        "consultations": consultations,
        "open_broadcasts": open_broadcasts,
        "pending_advocate_profiles": pending_advocate_profiles,
        "rejected_advocate_profiles": rejected_advocate_profiles,
        "suspended_advocate_profiles": suspended_advocate_profiles,
        "recent_activity": []
    }
