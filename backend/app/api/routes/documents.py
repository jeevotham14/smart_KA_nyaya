from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import audit
from app.db.session import get_db
from app.models.domain import GeneratedDocument
from app.schemas import DocumentGenerateRequest, GeneratedDocumentRead
from app.services.ai_service import AIService, get_ai_service

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/generate", response_model=GeneratedDocumentRead)
def generate(
    payload: DocumentGenerateRequest,
    request: Request,
    db: Session = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
):
    document = ai_service.document_generation_response(payload.doc_type, payload.facts)
    row = GeneratedDocument(
        case_id=payload.case_id,
        user_id=payload.user_id,
        doc_type=payload.doc_type,
        content_text=document["content_text"],
        format_compliant=document["format_compliant"],
    )
    db.add(row)
    db.flush()
    audit(db, request, "documents.generate", payload.user_id)
    db.commit()
    db.refresh(row)
    return row


@router.get("/user/{user_id}", response_model=list[GeneratedDocumentRead])
def user_documents(user_id: UUID, db: Session = Depends(get_db)):
    return db.scalars(select(GeneratedDocument).where(GeneratedDocument.user_id == user_id)).all()


@router.get("/{doc_id}", response_model=GeneratedDocumentRead)
def get_document(doc_id: UUID, db: Session = Depends(get_db)):
    row = db.get(GeneratedDocument, doc_id)
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    return row
