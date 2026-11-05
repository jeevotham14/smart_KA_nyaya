from fastapi import APIRouter, Depends, File, Request, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.agents import LEGAL_DISCLAIMER
from app.api.deps import audit, get_optional_user
from app.db.session import get_db
from app.models.domain import LegalQuery, User
from app.schemas import ClassifyIssueRequest, LegalQueryCreate, LegalQueryRead, PrecedentSearchRequest, RiskAssessmentRequest
from app.services.ai_service import AIService, get_ai_service
from app.services.llm_router import get_llm_router
from app.services.routing import route_chat_request

router = APIRouter(prefix="/ai", tags=["Legal Assistant"])


# ── New production chat endpoint ────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=2, max_length=4000)
    language: str = "English"
    history: list[ChatMessage] = []
    consent_to_store: bool = True


class ActionWidget(BaseModel):
    id: str
    type: str  # draft_document | legal_aid | emergency_sos | court_fee | limitation | directory | case_tracker
    title: str
    title_kn: str
    description: str
    description_kn: str
    target_url: str
    action_label: str
    action_label_kn: str
    badge: str | None = None
    icon: str | None = None


class StatuteRef(BaseModel):
    act: str
    section: str
    summary: str
    summary_kn: str | None = None


class DiagnosticScore(BaseModel):
    strength_score: int
    evidence_readiness: int
    limitation_risk: str  # safe, warning, expired
    missing_evidence: list[str] = []
    recommended_step: str
    recommended_step_kn: str | None = None


class ChatResponse(BaseModel):
    answer: str
    provider: str
    model: str
    category: str | None = None
    urgency: str | None = None
    disclaimer: str
    action_widgets: list[ActionWidget] = []
    applicable_statutes: list[StatuteRef] = []
    diagnostic_score: DiagnosticScore | None = None


@router.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    """
    Primary AI chat endpoint.
    Routes to Groq (fast) with Gemini/OpenRouter fallback.
    Returns structured action cards, statutory citations, and diagnostic scoring.
    Stores query in database if user is logged in and consents.
    """
    # Build conversation history for the LLM
    history = [{"role": m.role, "content": m.content} for m in payload.history]

    # Route request (checks for case number first, otherwise falls back to LLM)
    routed_result = route_chat_request(payload.message, payload.language, history, db)

    # Classify the issue in the background for storage (if not a system response)
    if routed_result["provider"] == "system":
        classification = {"category": "case_tracking", "urgency_level": "normal"}
    else:
        classification = {
            "category": routed_result.get("category", "general"),
            "urgency_level": routed_result.get("urgency", "normal"),
        }

    # Store in database if user consented
    if payload.consent_to_store:
        row = LegalQuery(
            user_id=current_user.user_id if current_user else None,
            grievance_text=payload.message,
            language=payload.language,
            legal_category=classification["category"],
            urgency_level=classification["urgency_level"],
            ai_response=routed_result["answer"],
        )
        db.add(row)
        audit(db, request, "ai.chat", current_user.user_id if current_user else None)
        db.commit()

    return ChatResponse(
        answer=routed_result["answer"],
        provider=routed_result["provider"],
        model=routed_result["model"],
        category=classification["category"],
        urgency=classification["urgency_level"],
        disclaimer="",
        action_widgets=routed_result.get("action_widgets", []),
        applicable_statutes=routed_result.get("applicable_statutes", []),
        diagnostic_score=routed_result.get("diagnostic_score"),
    )


class DiagnosticQuizRequest(BaseModel):
    category: str
    incident_timeframe: str  # "recent", "within_1_year", "1_to_3_years", "over_3_years"
    has_written_proof: bool
    has_lodged_police_or_notice: bool
    district: str = "Bengaluru Urban"
    summary: str = ""


@router.post("/diagnose", response_model=DiagnosticScore)
def diagnose_case(payload: DiagnosticQuizRequest):
    """
    Interactive Legal Diagnostic Quiz:
    Evaluates case strength, evidence readiness, limitation risk, and immediate statutory steps.
    """
    strength = 45
    evidence = 25
    missing = []

    # Timeframe & Limitation
    if payload.incident_timeframe == "over_3_years":
        limitation_risk = "expired"
        strength -= 25
        missing.append("Section 5 Limitation Act (Condonation of Delay) Application")
    elif payload.incident_timeframe == "1_to_3_years":
        limitation_risk = "warning"
        strength += 5
    else:
        limitation_risk = "safe"
        strength += 20

    # Evidence
    if payload.has_written_proof:
        evidence += 45
        strength += 20
    else:
        missing.append("Written contract / receipts / payment transactions")

    if payload.has_lodged_police_or_notice:
        strength += 15
        evidence += 20
    else:
        missing.append("Prior legal notice or police complaint acknowledgment")

    if payload.category.lower() in ["property", "land", "tenancy"]:
        missing.append("RTC / Pahani / Registered Agreement")
        step = f"Approach the Sub-Divisional Officer (AC) or Civil Court in {payload.district} with certified title extracts."
        step_kn = f"{payload.district} ಉಪವಿಭಾಗಾಧಿಕಾರಿಗಳು ಅಥವಾ ಸಿವಿಲ್ ನ್ಯಾಯಾಲಯಕ್ಕೆ ಪ್ರಮಾಣೀಕೃತ ದಾಖಲೆಗಳೊಂದಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ."
    elif payload.category.lower() in ["criminal", "theft", "assault", "cyber"]:
        missing.append("CCTV or documentary evidence of fraud")
        step = f"File an FIR under Section 173 BNSS at the nearest Police Station in {payload.district}."
        step_kn = f"{payload.district} ವ್ಯಾಪ್ತಿಯ ಪೊಲೀಸ್ ಠಾಣೆಯಲ್ಲಿ ಬಿಎನ್‌ಎಸ್‌ಎಸ್ ಕಲಂ ೧೭೩ ರ ಅಡಿಯಲ್ಲಿ ಎಫ್‌ಐಆರ್ ದಾಖಲಿಸಿ."
    else:
        step = f"Visit the {payload.district} DLSA Legal Aid Clinic at the District Court for free advocate guidance."
        step_kn = f"ಉಚಿತ ವಕೀಲರ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ {payload.district} ಜಿಲ್ಲಾ ನ್ಯಾಯಾಲಯದಲ್ಲಿರುವ ಡಿಎಲ್‌ಎಸ್‌ಎ ಕ್ಲಿನಿಕ್‌ಗೆ ಭೇಟಿ ನೀಡಿ."

    return DiagnosticScore(
        strength_score=max(10, min(strength, 95)),
        evidence_readiness=max(10, min(evidence, 95)),
        limitation_risk=limitation_risk,
        missing_evidence=missing,
        recommended_step=step,
        recommended_step_kn=step_kn,
    )



class TranslateRequest(BaseModel):
    text: str = Field(min_length=2, max_length=5000)
    source_language: str = "English"
    target_language: str = "Kannada"


@router.post("/translate")
def translate(payload: TranslateRequest):
    """Translate legal text between Kannada and English using Gemini."""
    result = get_llm_router().translate(payload.text, payload.source_language, payload.target_language)
    return {"translated_text": result["text"], "provider": result["provider"], "model": result["model"]}


# ── Legacy endpoints (preserved for backward compatibility) ──────────────────

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
        "disclaimer": LEGAL_DISCLAIMER,
    }


class TTSRequest(BaseModel):
    text: str
    target_language_code: str = "en-IN"
    speaker: str = "meera"


@router.post("/tts")
async def text_to_speech(payload: TTSRequest):
    """Convert text to speech using Sarvam AI API."""
    import httpx
    from app.core.config import get_settings
    settings = get_settings()
    url = "https://api.sarvam.ai/text-to-speech"
    headers = {
        "api-subscription-key": settings.sarvam_api_key or "sk_dn271vgk_7oau1Ae1w3KFQ33Zt1HzQnpY",
        "Content-Type": "application/json"
    }
    target_lang = payload.target_language_code
    if target_lang.lower() == "kannada":
        target_lang = "kn-IN"
    elif target_lang.lower() == "english":
        target_lang = "en-IN"

    body = {
        "inputs": [payload.text[:500]],
        "target_language_code": target_lang,
        "speaker": payload.speaker,
        "pitch": 0,
        "pace": 1.0,
        "loudness": 1.5,
        "speech_sample_rate": 8000,
        "enable_preprocessing": True,
        "model": "sarvam-tts",
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=body, timeout=20.0)
            response.raise_for_status()
            data = response.json()
            return {"audio_base64": data.get("audios", [])[0] if data.get("audios") else None}
        except Exception as e:
            from fastapi import HTTPException
            raise HTTPException(status_code=500, detail=str(e))


# ── ASR: Speech-to-Text via Sarvam AI ────────────────────────────────────────

@router.post("/asr")
async def speech_to_text(
    file: UploadFile = File(...),
    language: str = "kn-IN",
):
    """
    Transcribe audio using Sarvam AI speech-to-text.
    Accepts audio/webm, audio/wav, audio/mp4 from the browser MediaRecorder.
    """
    from fastapi import HTTPException
    import httpx
    from app.core.config import get_settings

    settings = get_settings()
    sarvam_key = settings.sarvam_api_key or "sk_dn271vgk_7oau1Ae1w3KFQ33Zt1HzQnpY"

    lang_map = {
        "kannada": "kn-IN",
        "english": "en-IN",
        "kn": "kn-IN",
        "en": "en-IN",
    }
    lang_code = lang_map.get(language.lower(), language)

    audio_bytes = await file.read()
    filename = file.filename or "recording.webm"

    url = "https://api.sarvam.ai/speech-to-text"
    headers = {"api-subscription-key": sarvam_key}

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                url,
                headers=headers,
                data={"language_code": lang_code, "model": "saarika:v2"},
                files={"file": (filename, audio_bytes, file.content_type or "audio/webm")},
                timeout=30.0,
            )
            resp.raise_for_status()
            data = resp.json()
            transcript = data.get("transcript", "")
            return {"transcript": transcript, "language": lang_code}
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=502, detail=f"Sarvam ASR error: {e.response.text}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
