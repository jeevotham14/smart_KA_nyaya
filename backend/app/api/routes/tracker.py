import base64
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import audit
from app.db.session import get_db
from app.models.domain import CaseObject, Notification
from app.schemas import StatusPatch

router = APIRouter(prefix="/tracker", tags=["Tracking"])

ALLOWED_TYPES = {
    "application/pdf", "image/jpeg", "image/png", "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAX_FILE_SIZE_MB = 5


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


@router.post("/{case_id}/upload-document")
async def upload_document(
    case_id: UUID,
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a supporting document for a case. Stored as base64 in the case's documents JSON field."""
    row = db.get(CaseObject, case_id)
    if not row:
        raise HTTPException(status_code=404, detail="Case not found")

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

    # Create a notification for the case owner
    if row.user_id:
        db.add(Notification(
            user_id=row.user_id,
            title="Document uploaded",
            message=f"Document '{file.filename}' ({round(size_mb * 1024, 1)} KB) was successfully uploaded to your case.",
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
        "case_id": str(case_id),
    }


@router.get("/{case_id}/documents")
def list_documents(case_id: UUID, db: Session = Depends(get_db)):
    """List all documents uploaded for a case (without the base64 data to keep response small)."""
    row = db.get(CaseObject, case_id)
    if not row:
        raise HTTPException(status_code=404, detail="Case not found")
    docs = row.documents or []
    # Return metadata only — not the binary data
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
