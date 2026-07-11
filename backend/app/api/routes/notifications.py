from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import audit
from app.db.session import get_db
from app.models.domain import Notification
from app.schemas import NotificationRead

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/user/{user_id}", response_model=list[NotificationRead])
def user_notifications(user_id: UUID, db: Session = Depends(get_db)):
    return db.scalars(select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc())).all()


@router.patch("/{notification_id}/read", response_model=NotificationRead)
def mark_read(notification_id: UUID, request: Request, db: Session = Depends(get_db)):
    row = db.get(Notification, notification_id)
    if not row:
        raise HTTPException(status_code=404, detail="Notification not found")
    row.read_status = True
    audit(db, request, "notifications.mark_read", row.user_id)
    db.commit()
    db.refresh(row)
    return row
