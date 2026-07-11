from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.agents import LEGAL_DISCLAIMER
from app.api.deps import audit, get_optional_user
from app.db.session import get_db
from app.models.domain import LegalQuery, User
from app.schemas import ClassifyIssueRequest, LegalQueryCreate, LegalQueryRead, PrecedentSearchRequest, RiskAssessmentRequest
from app.services.ai_service import AIService, get_ai_service

router = APIRouter(prefix="/ai", tags=["Legal Assistant"])


@router.post("/legal-query", response_model=LegalQueryRead)
def legal_query(
    payload: LegalQueryCreate,
    request: Request,
    db: Session = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
    current_user: User | None = Depends(get_optional_user),
):
    result = ai_service.legal_guidance_response(payload.grievance_text, payload.language, db=db)
    classification = result["classification"]
    row = LegalQuery(
        user_id=current_user.user_id if current_user and payload.consent_to_store else None,
        grievance_text=payload.grievance_text if payload.consent_to_store else "[withheld by user consent]",
        language=payload.language,
        legal_category=payload.legal_category or classification["category"],
        urgency_level=payload.urgency_level or classification["urgency_level"],
        ai_response=result["answer"],
    )
    db.add(row)
    db.flush()
    audit(db, request, "ai.legal_query", current_user.user_id if current_user else None)
    db.commit()
    db.refresh(row)
    return row


@router.post("/classify-issue")
def classify_issue(payload: ClassifyIssueRequest, ai_service: AIService = Depends(get_ai_service)):
    return ai_service.classify_legal_issue(payload.text, payload.language)


@router.post("/retrieve-precedents")
def retrieve_precedents(payload: PrecedentSearchRequest, db: Session = Depends(get_db), ai_service: AIService = Depends(get_ai_service)):
    return ai_service.rag_retrieval_placeholder(payload.query, db=db, top_k=payload.top_k)


@router.post("/risk-assessment")
def risk_assessment(payload: RiskAssessmentRequest, ai_service: AIService = Depends(get_ai_service)):
    classification = ai_service.classify_legal_issue(payload.grievance_text)
    score = 0.78 if classification["urgency_level"] == "high" else 0.42
    return {
        "risk_score": score,
        "urgency_level": classification["urgency_level"],
        "estimated_duration_days": 120 if classification["category"] in {"property", "criminal"} else 45,
        "category": payload.legal_category or classification["category"],
        "provider": classification["provider"],
        "disclaimer": LEGAL_DISCLAIMER,
    }
