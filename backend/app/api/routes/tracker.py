from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.deps import audit
from app.db.session import get_db
from app.models.domain import CaseObject
from app.schemas import StatusPatch

router = APIRouter(prefix="/tracker", tags=["Tracking"])


@router.get("/{case_id}")
def get_case(case_id: UUID, db: Session = Depends(get_db)):
    row = db.get(CaseObject, case_id)
    if not row:
        raise HTTPException(status_code=404, detail="Case not found")
    return row


@router.patch("/{case_id}/status")
def update_case_status(case_id: UUID, payload: StatusPatch, request: Request, db: Session = Depends(get_db)):
    row = db.get(CaseObject, case_id)
    if not row:
        raise HTTPException(status_code=404, detail="Case not found")
    row.status = payload.status
    audit(db, request, "tracker.update_status", row.user_id)
    db.commit()
    db.refresh(row)
    return row
