import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.domain import EvidenceFile, CaseObject

router = APIRouter(prefix="/evidence", tags=["Evidence"])


def _classify_evidence(filename: str, content_type: str) -> str:
    """Mock AI or simple heuristic to classify category."""
    lower_name = filename.lower()
    if any(x in lower_name for x in ["bank", "statement", "receipt", "invoice", "tax", "bill"]):
        return "Financial"
    if any(x in lower_name for x in ["email", "chat", "whatsapp", "letter", "message", "communication"]):
        return "Communication"
    if any(x in lower_name for x in ["order", "judgment", "decree", "summons"]):
        return "Court Orders"
    if any(x in lower_name for x in ["aadhaar", "pan", "passport", "id", "license", "voter"]):
        return "Identity"
    if any(x in lower_name for x in ["deed", "sale", "lease", "property", "agreement", "title"]):
        return "Property"
    if any(x in lower_name for x in ["offer", "employment", "salary", "payslip", "contract"]):
        return "Employment"
    return "Evidence"


@router.post("/{case_id}/upload")
async def upload_evidence(
    case_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Verify case exists
    case_obj = db.query(CaseObject).filter(CaseObject.case_id == case_id).first()
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found")

    content = await file.read()
    size_kb = len(content) // 1024
    
    category = _classify_evidence(file.filename, file.content_type)
    
    evidence = EvidenceFile(
        case_id=case_id,
        user_id=case_obj.user_id,
        filename=file.filename,
        content_type=file.content_type,
        size_kb=size_kb,
        category=category,
        data=content
    )
    
    db.add(evidence)
    db.commit()
    db.refresh(evidence)
    
    return {
        "file_id": evidence.file_id,
        "filename": evidence.filename,
        "category": evidence.category,
        "size_kb": evidence.size_kb,
        "message": "File uploaded successfully"
    }


@router.get("/{case_id}")
def list_evidence(case_id: uuid.UUID, db: Session = Depends(get_db)):
    files = db.query(EvidenceFile).filter(EvidenceFile.case_id == case_id).all()
    
    return [
        {
            "file_id": f.file_id,
            "filename": f.filename,
            "category": f.category,
            "size_kb": f.size_kb,
            "content_type": f.content_type,
            "created_at": f.created_at
        } for f in files
    ]


@router.post("/{case_id}/bundle")
def generate_evidence_bundle(case_id: uuid.UUID, db: Session = Depends(get_db)):
    case_obj = db.query(CaseObject).filter(CaseObject.case_id == case_id).first()
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found")
        
    files = db.query(EvidenceFile).filter(EvidenceFile.case_id == case_id).all()
    if not files:
        raise HTTPException(status_code=400, detail="No evidence files found for this case")
        
    # Mock generating a ZIP or PDF bundle
    # For now, return a dummy PDF response
    dummy_pdf_content = b"%PDF-1.4\n%EOF\n"
    
    return Response(
        content=dummy_pdf_content, 
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="evidence_bundle_{case_id}.pdf"'}
    )
