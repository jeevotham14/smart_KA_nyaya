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

def send_email(subject: str, body: str, to_email: str):
    settings = get_settings()
    host = settings.smtp_host
    port = settings.smtp_port
    username = settings.smtp_username
    password = settings.smtp_password
    from_email = settings.smtp_from or username

    if not password or not username:
        print(f"[SMTP Error] Missing SMTP_USERNAME or SMTP_PASSWORD. Cannot send email to {to_email}.")
        return False

    msg = EmailMessage()
    msg.set_content(body)
    msg['Subject'] = subject
    msg['From'] = from_email
    msg['To'] = to_email

    try:
        with smtplib.SMTP(host, port, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(username, password)
            server.send_message(msg)
        print(f"Successfully sent email to {to_email}", flush=True)
        return True
    except Exception as e:
        print(f"[SMTP Error] Failed to send email to {to_email}: {e}", flush=True)
        return False

def send_complaint_email_task(complaint_id: str, complaint_type: str, description: str, routed_authority: str):
    subject = f"Complaint Registered: {complaint_type}"
    body = f"""Hello,

A new complaint has been successfully registered on Smart Karnataka Nyaya.

Complaint ID: {complaint_id}
Type: {complaint_type}
Routed To: {routed_authority}

Description:
{description}

Thank you,
Smart Karnataka Nyaya Team"""
    
    settings = get_settings()
    target_email = settings.smtp_username or "jeevpai2005@gmail.com"
    send_email(subject, body, target_email)

@router.post("/test-email")
def test_email_endpoint():
    settings = get_settings()
    target_email = settings.smtp_username or "jeevpai2005@gmail.com"
    success = send_email(
        subject="Test Email from Smart Nyaya", 
        body="If you are reading this, your SMTP configuration is working perfectly on Port 587 with STARTTLS!", 
        to_email=target_email
    )
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send test email. Check server logs for details.")
    return {"message": f"Test email sent successfully to {target_email}!"}

import threading

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
    
    # Dispatch email in a dedicated background daemon thread for 0ms delay & no Axios timeout
    try:
        t = threading.Thread(
            target=send_complaint_email_task,
            args=(
                str(row.complaint_id), 
                row.complaint_type, 
                row.description, 
                row.routed_authority
            ),
            daemon=True
        )
        t.start()
    except Exception as err:
        print(f"Error starting email thread: {err}", flush=True)
    
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
