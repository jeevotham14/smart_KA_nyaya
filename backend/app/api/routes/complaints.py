from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
import httpx
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
    api_key = settings.brevo_api_key
    from_email = settings.brevo_sender_email or "jeevpai2005@gmail.com"

    if not api_key:
        raise ValueError("Missing BREVO_API_KEY in environment variables.")

    url = "https://api.brevo.com/v3/smtp/email"
    clean_key = api_key.strip().strip("'").strip('"')
    headers = {
        "accept": "application/json",
        "api-key": clean_key,
        "content-type": "application/json"
    }
    payload = {
        "sender": {"name": "Smart Karnataka Nyaya", "email": from_email},
        "to": [{"email": to_email}],
        "subject": subject,
        "textContent": body
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.post(url, headers=headers, json=payload)
            response.raise_for_status()
        print(f"Successfully sent email to {to_email}", flush=True)
    except httpx.HTTPStatusError as e:
        raise ValueError(f"Email API rejected request: {e.response.text}")
    except Exception as e:
        raise ValueError(f"Email API Connection Error: {e}")

@router.post("/test-email")
def test_email_endpoint():
    settings = get_settings()
    target_email = settings.brevo_sender_email or "jeevpai2005@gmail.com"
    try:
        send_email(
            subject="Test Email from Smart Nyaya", 
            body="If you are reading this, your Email API configuration is working perfectly over HTTPS!", 
            to_email=target_email
        )
        return {"message": f"Test email sent successfully to {target_email}!"}
    except ValueError as e:
        print(f"[Render Log] Test email failed: {e}", flush=True)
        raise HTTPException(status_code=500, detail=str(e))

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
    
    # 1. Send Authority Email (Blocks API until success)
    settings = get_settings()
    authority_email = settings.brevo_sender_email or "jeevpai2005@gmail.com"
    subject = f"Complaint Registered: {row.complaint_type}"
    body = f"""Hello,

A new complaint has been successfully registered on Smart Karnataka Nyaya.

Complaint ID: {row.complaint_id}
Type: {row.complaint_type}
Routed To: {row.routed_authority}

Description:
{row.description}

Thank you,
Smart Karnataka Nyaya Team"""
    
    try:
        send_email(subject, body, authority_email)
    except ValueError as e:
        print(f"[Render Log] Email dispatch failed: {e}", flush=True)
        raise HTTPException(status_code=500, detail="Complaint saved, but failed to dispatch email notification.")
        
    # 2. Send User Confirmation Email (if valid contact_email is provided)
    if payload.contact_email and "@" in payload.contact_email:
        user_subject = "Your Complaint has been received - Smart Karnataka Nyaya"
        user_body = f"""Hello,

Your complaint (ID: {row.complaint_id}) has been successfully received and routed to {row.routed_authority}.

We will contact you shortly.

Thank you,
Smart Karnataka Nyaya"""
        try:
            send_email(user_subject, user_body, payload.contact_email)
        except ValueError as e:
            print(f"[Render Log] User confirmation email failed: {e}", flush=True)
            # Proceed even if user email fails, as long as authority got it.

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
