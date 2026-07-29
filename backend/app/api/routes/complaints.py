from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
import smtplib
from email.message import EmailMessage
import os

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

from app.core.config import get_settings

def send_complaint_email_task(complaint_id: str, complaint_type: str, description: str, routed_authority: str):
    from dotenv import load_dotenv
    import os
    env_path = os.path.join(os.path.dirname(__file__), "../../..", ".env")
    load_dotenv(dotenv_path=env_path, override=True)
    
    settings = get_settings()
    sender_email = settings.smtp_user or os.getenv("SMTP_USER", "noreply@smartnyaya.in")
    sender_pass = settings.smtp_pass or os.getenv("SMTP_PASS", "")
    target_email = "jeevpai2005@gmail.com"

    if not sender_pass:
        print(f"[Email Task] SMTP_PASS not set. Skipping email dispatch to {target_email} for complaint {complaint_id}")
        return

    msg = EmailMessage()
    msg.set_content(f"""
Hello,

A new complaint has been successfully registered on Smart Karnataka Nyaya.

Complaint ID: {complaint_id}
Type: {complaint_type}
Routed To: {routed_authority}

Description:
{description}

Thank you,
Smart Karnataka Nyaya Team
""")

    msg['Subject'] = f"Complaint Registered: {complaint_type}"
    msg['From'] = sender_email
    msg['To'] = target_email

    try:
        # Connect to Gmail SMTP server
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_pass)
            server.send_message(msg)
        print(f"Successfully sent complaint email to {target_email}", flush=True)
    except Exception as e:
        print(f"Failed to send email to {target_email}: {e}", flush=True)

@router.post("", response_model=ComplaintRead)
def create_complaint(payload: ComplaintCreate, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
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
    
    # Dispatch email synchronously to guarantee delivery before returning response
    try:
        send_complaint_email_task(
            str(row.complaint_id), 
            row.complaint_type, 
            row.description, 
            row.routed_authority
        )
    except Exception as err:
        print(f"Error sending email: {err}", flush=True)
    
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
