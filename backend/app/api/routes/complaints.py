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

def send_email(subject: str, body: str, user_email: str | None = None):
    settings = get_settings()
    access_key = settings.web3forms_access_key

    if not access_key:
        raise ValueError("Missing WEB3FORMS_ACCESS_KEY in environment variables.")

    url = "https://api.web3forms.com/submit"
    clean_key = access_key.strip().strip("'").strip('"')
    headers = {
        "accept": "application/json",
        "content-type": "application/json"
    }
    
    payload = {
        "access_key": clean_key,
        "subject": subject,
        "from_name": "Smart Karnataka Nyaya",
        "message": body
    }
    
    if user_email and "@" in user_email:
        payload["email"] = user_email
        payload["name"] = "Complainant"

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            
            data = response.json()
            if not data.get("success"):
                raise ValueError(f"Web3Forms API rejected request: {data.get('message', 'Unknown error')}")
                
        print("Successfully sent email via Web3Forms", flush=True)
    except httpx.HTTPStatusError as e:
        raise ValueError(f"Email API rejected request: {e.response.text}")
    except Exception as e:
        if isinstance(e, ValueError) and "Web3Forms API" in str(e):
            raise e
        raise ValueError(f"Email API Connection Error: {e}")

@router.post("/test-email")
def test_email_endpoint():
    try:
        send_email(
            subject="Test Email from Smart Nyaya", 
            body="If you are reading this, your Web3Forms Email API configuration is working perfectly over HTTPS!"
        )
        return {"message": "Test email sent successfully to the Web3Forms access key owner!"}
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
    
    # Dispatch Web3Forms Email (Blocks API until success)
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
        # We pass payload.contact_email so Web3Forms can use it for autoresponder if enabled
        send_email(subject, body, payload.contact_email)
    except ValueError as e:
        print(f"[Render Log] Email dispatch failed: {e}", flush=True)
        raise HTTPException(status_code=500, detail="Complaint saved, but failed to dispatch email notification.")
        
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
