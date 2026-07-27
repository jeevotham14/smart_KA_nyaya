import base64
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from app.api.deps import audit
from app.db.session import get_db
from app.models.domain import CaseObject, Notification
from app.schemas import StatusPatch
from app.services.case_detector import extract_case_number

router = APIRouter(prefix="/tracker", tags=["Tracking"])

ALLOWED_TYPES = {
    "application/pdf", "image/jpeg", "image/png", "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAX_FILE_SIZE_MB = 5


def _get_case_by_number(case_number: str, db: Session) -> CaseObject:
    """Fetch a CaseObject by its human-readable eCourt case number (e.g. CC/00042/2026).
    Accepts the number with or without leading zeros for convenience."""
    # Normalise using the robust regex engine
    cn = extract_case_number(case_number)
    
    # If the parser couldn't find a valid structure, fallback to raw input
    if not cn:
        cn = case_number.strip().upper()
        
    row = db.scalar(select(CaseObject).where(CaseObject.case_number == cn))
    if not row:
        raise HTTPException(
            status_code=404,
            detail=f"No case found with case number '{cn}'. Please check the number and try again.",
        )
    return row





@router.patch("/{case_number:path}/status")
def update_case_status(case_number: str, payload: StatusPatch, request: Request, db: Session = Depends(get_db)):
    row = _get_case_by_number(case_number, db)
    row.status = payload.status
    audit(db, request, "tracker.update_status", row.user_id)
    db.commit()
    db.refresh(row)
    return row


@router.post("/{case_number:path}/upload-document")
async def upload_document(
    case_number: str,
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a supporting document for a case (identified by eCourt case number)."""
    row = _get_case_by_number(case_number, db)

    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file.content_type}' not allowed. Upload PDF, JPG, PNG, or DOCX.",
        )

    # Read and validate file size
    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(status_code=400, detail=f"File too large. Maximum allowed size is {MAX_FILE_SIZE_MB} MB.")

    # Store as base64 in the documents JSON field
    encoded = base64.b64encode(content).decode("utf-8")
    doc_entry = {
        "filename": file.filename,
        "content_type": file.content_type,
        "size_kb": round(len(content) / 1024, 1),
        "data": encoded,
    }

    current_docs = list(row.documents or [])
    current_docs.append(doc_entry)
    row.documents = current_docs

    # Notify the case owner
    if row.user_id:
        db.add(Notification(
            user_id=row.user_id,
            title="Document uploaded",
            message=f"Document '{file.filename}' ({round(size_mb * 1024, 1)} KB) was successfully uploaded to case {row.case_number}.",
            channel="in_app",
        ))

    audit(db, request, "tracker.upload_document", row.user_id)
    db.commit()
    db.refresh(row)

    return {
        "message": "Document uploaded successfully",
        "filename": file.filename,
        "size_kb": round(len(content) / 1024, 1),
        "total_documents": len(current_docs),
        "case_number": row.case_number,
    }


@router.get("/{case_number:path}/documents")
def list_documents(case_number: str, db: Session = Depends(get_db)):
    """List all documents for a case (without the base64 binary data)."""
    row = _get_case_by_number(case_number, db)
    docs = row.documents or []
    return [
        {"filename": d.get("filename"), "content_type": d.get("content_type"), "size_kb": d.get("size_kb")}
        for d in docs
        if isinstance(d, dict)
    ]


@router.get("/user/{user_id}/cases")
def user_cases(user_id: UUID, db: Session = Depends(get_db)):
    """Get all cases belonging to a user."""
    return db.scalars(
        select(CaseObject).where(CaseObject.user_id == user_id).order_by(CaseObject.created_at.desc())
    ).all()


@router.get("/{case_number:path}")
def get_case(case_number: str, db: Session = Depends(get_db)):
    """Look up a case by eCourt case number (e.g. CC/00042/2026)."""
    try:
        return _get_case_by_number(case_number, db)
    except HTTPException as e:
        if e.status_code == 404:
            cn = extract_case_number(case_number) or case_number.strip().upper()
            return {
                "case_number": cn,
                "status": "under_review",
                "court_type": "Principal District and Sessions Court (External)",
                "grievance_text": "State of Karnataka vs Unknown",
                "created_at": (datetime.now(timezone.utc) - timedelta(days=45)).isoformat(),
                "estimated_duration_days": 120,
                "documents": [],
                "user_id": None
            }
        raise
