from fastapi import APIRouter, Depends, Request
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import audit, require_roles
from app.db.session import get_db
from app.models.domain import Complaint, DirectoryService, LegalQuery, LegalStatute, User
from app.schemas import DirectoryServiceCreate, DirectoryServiceRead, LegalContentCreate, UserRead

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(require_roles("admin"))])


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
