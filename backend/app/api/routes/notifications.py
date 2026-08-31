from uuid import UUID
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select, func, update
from sqlalchemy.orm import Session

from app.api.deps import audit, get_current_user
from app.db.session import get_db
from app.models.domain import Notification, User
from app.schemas import NotificationRead

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationRead])
def get_my_notifications(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve authenticated user's notifications ordered from newest to oldest."""
    return db.scalars(
        select(Notification)
        .where(Notification.user_id == current_user.user_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
    ).all()


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the total count of unread notifications for the authenticated user."""
    count = db.scalar(
        select(func.count(Notification.notification_id))
        .where(
            Notification.user_id == current_user.user_id,
            Notification.read_status == False,
        )
    ) or 0
    return {"unread_count": count}


@router.patch("/{notification_id}/read", response_model=NotificationRead)
def mark_read(
    notification_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a specific notification as read. User must be the owner."""
    row = db.get(Notification, notification_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    if row.user_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this notification")

    row.read_status = True
    audit(db, request, "notifications.mark_read", row.user_id)
    db.commit()
    db.refresh(row)
    return row


@router.patch("/read-all")
def mark_all_read(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark all unread notifications as read for the authenticated user."""
    res = db.execute(
        update(Notification)
        .where(
            Notification.user_id == current_user.user_id,
            Notification.read_status == False,
        )
        .values(read_status=True)
    )
    count = res.rowcount
    audit(db, request, "notifications.mark_all_read", current_user.user_id)
    db.commit()
    return {"status": "success", "marked_read": count}


@router.get("/user/{user_id}", response_model=List[NotificationRead])
def user_notifications(user_id: UUID, db: Session = Depends(get_db)):
    """Legacy route for querying notifications by user_id."""
    return db.scalars(
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
    ).all()
