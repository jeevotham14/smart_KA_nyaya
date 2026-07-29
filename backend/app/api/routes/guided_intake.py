from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.llm_router import get_llm_router, TaskType

router = APIRouter(prefix="/ai", tags=["AI – Guided Intake"])


class IntakePayload(BaseModel):
    category: str
    categoryLabel: str
    answers: dict


class HealthScore(BaseModel):
    case_strength: int = 50
    evidence_score: int = 30
    missing_documents: list[str] = []
    urgency: str = "medium"
    limitation_risk: bool = False
    limitation_days_remaining: Optional[int] = None
    settlement_possibility: str = "medium"


def _build_prompt(payload: IntakePayload) -> str:
    """Convert structured intake answers into a detailed analysis prompt."""
    lines = [
        f"A citizen from Karnataka is seeking legal guidance for a {payload.categoryLabel} issue.",
        "",
        "Here are the details they provided:",
    ]
    for key, value in payload.answers.items():
        if value and not isinstance(value, bytes):
            clean_key = key.replace("_", " ").title()
            lines.append(f"- {clean_key}: {value}")
    lines.append("")
    lines.append(
        "Based on the above details, provide comprehensive legal guidance including:\n"
        "1. **Applicable Laws & Sections** relevant under Indian and Karnataka law\n"
        "2. **Your Legal Rights** in this situation\n"
        "3. **Recommended Next Steps** (step-by-step)\n"
        "4. **Required Documents** to gather\n"
        "5. **Authority to Approach** (which court, tribunal, or authority)\n"
        "6. **Time Limits** (limitation periods, if applicable)\n"
        "7. **Possible Outcomes** and what to expect\n\n"
        "Respond in a clear, citizen-friendly format. Reference specific Acts and Sections."
    )
    return "\n".join(lines)


def _compute_health_score(payload: IntakePayload) -> dict:
    """Compute a basic legal health score from the structured answers."""
    answers = payload.answers
    evidence_uploaded = any(
        isinstance(v, str) and v.endswith(('.pdf', '.jpg', '.png', '.docx'))
        for v in answers.values()
    )

    # Heuristic scoring
    case_strength = 45
    evidence_score = 20
    missing = []
    urgency = "medium"
    limitation_risk = False
    settlement = "medium"

    # Boost if description is detailed
    desc = answers.get("description", "")
    if isinstance(desc, str):
        word_count = len(desc.split())
        if word_count > 50:
            case_strength += 15
        elif word_count > 20:
            case_strength += 8

    # Boost if evidence uploaded
    if evidence_uploaded:
        evidence_score += 30
    else:
        missing.append("Supporting evidence / documents")

    # Check category-specific logic
    cat = payload.category
    if cat == "consumer":
        if answers.get("complaint_made", "").startswith("Yes"):
            case_strength += 10
        if not answers.get("date_of_purchase"):
            missing.append("Date of purchase receipt")
        else:
            evidence_score += 10
        missing.append("Invoice / bill copy") if not evidence_uploaded else None
        settlement = "high"

    elif cat == "criminal":
        if answers.get("fir_filed") == "Yes":
            case_strength += 20
            evidence_score += 15
        else:
            missing.append("FIR copy")
        urgency = "high"

    elif cat == "domestic_violence":
        urgency = "critical" if answers.get("safe_now", "") == "No — I need immediate help" else "high"
        case_strength += 15
        if answers.get("is_ongoing", "").startswith("Yes"):
            case_strength += 10
        missing.append("Medical report (if applicable)")
        settlement = "low"

    elif cat == "labour" or cat == "employment":
        if answers.get("amount_due"):
            case_strength += 10
        missing.append("Appointment letter / employment contract")
        missing.append("Salary slips")
        settlement = "high"

    elif cat == "cyber":
        if answers.get("financial_loss") == "Yes":
            urgency = "high"
            case_strength += 10
        if answers.get("reported", "").startswith("Yes"):
            evidence_score += 15
        else:
            missing.append("Cyber crime complaint receipt")
        missing.append("Screenshots of fraud / harassment")

    elif cat == "property":
        missing.append("Sale deed / title document")
        missing.append("RTC (Record of Rights) extract")
        if answers.get("survey_number"):
            evidence_score += 10

    elif cat == "banking":
        if answers.get("complaint_filed", "").startswith("Yes"):
            case_strength += 10
            evidence_score += 10
        missing.append("Bank statement")
        missing.append("Complaint acknowledgement")

    elif cat == "traffic":
        if answers.get("fir_filed") == "Yes":
            case_strength += 15
            evidence_score += 10
        if answers.get("injuries", "") in ("Yes, serious injuries", "Fatal"):
            urgency = "high"
        missing.append("FIR / MLC copy")
        missing.append("Photos of accident")

    elif cat == "tenant":
        if answers.get("agreement_exists") == "Yes":
            case_strength += 15
            evidence_score += 15
        else:
            missing.append("Rental agreement")
        missing.append("Rent payment receipts")

    elif cat == "senior_citizen":
        urgency = "high"
        case_strength += 10
        missing.append("Age proof")

    elif cat == "family":
        if answers.get("legal_action_taken", "") != "No action taken":
            case_strength += 10
        missing.append("Marriage certificate")

    # Cap scores
    case_strength = min(case_strength, 95)
    evidence_score = min(evidence_score, 95)

    # Remove None values from missing
    missing = [m for m in missing if m]

    return {
        "case_strength": case_strength,
        "evidence_score": evidence_score,
        "missing_documents": missing[:6],
        "urgency": urgency,
        "limitation_risk": limitation_risk,
        "limitation_days_remaining": None,
        "settlement_possibility": settlement,
    }


@router.post("/guided-intake")
def guided_intake(payload: IntakePayload, db: Session = Depends(get_db)):
    """Process a guided legal intake and return AI-generated legal guidance with health score."""
    prompt = _build_prompt(payload)
    health = _compute_health_score(payload)

    llm_router = get_llm_router()
    system_prompt = (
        "You are a legal awareness assistant for the Karnataka State Legal Services Authority (KSLSA). "
        "Provide helpful, accurate legal information referencing Indian and Karnataka law. "
        "Always recommend consulting a qualified advocate for official legal action. "
        "Format your response with clear headings and bullet points."
    )
    
    result = llm_router.route(
        TaskType.CHAT,
        [{"role": "user", "content": prompt}],
        system_prompt=system_prompt,
    )

    suggested_docs = []
    cat = payload.category
    if cat == "consumer":
        suggested_docs = ["Consumer Complaint", "Legal Notice to Seller"]
    elif cat == "criminal":
        suggested_docs = ["Police Complaint (FIR)", "Criminal Complaint to Magistrate"]
    elif cat == "domestic_violence":
        suggested_docs = ["Domestic Violence Complaint (Form I)", "Protection Order Application"]
    elif cat in ("labour", "employment"):
        suggested_docs = ["Employment Complaint", "Legal Notice to Employer"]
    elif cat == "cyber":
        suggested_docs = ["Cyber Crime Complaint", "Police Complaint"]
    elif cat == "property":
        suggested_docs = ["Legal Notice", "Civil Suit Plaint"]
    elif cat == "banking":
        suggested_docs = ["Banking Ombudsman Complaint", "Consumer Complaint"]
    elif cat == "traffic":
        suggested_docs = ["Motor Accident Claims Petition", "Insurance Claim Application"]
    elif cat == "tenant":
        suggested_docs = ["Legal Notice", "Rent Control Petition"]
    elif cat == "family":
        suggested_docs = ["Divorce Petition", "Maintenance Application"]
    elif cat == "senior_citizen":
        suggested_docs = ["Maintenance Tribunal Application", "Police Complaint"]

    disclaimer = (
        "⚠️ Legal Disclaimer: This is legal awareness information only and does NOT constitute legal advice. "
        "For official legal action, please consult a qualified advocate, your District Legal Services Authority (DLSA), "
        "or Taluk Legal Services Committee (TLSC). For emergencies: call 112 (Police) or 181 (Women Helpline)."
    )

    text_output = result.get("text", "")

    return {
        "guidance": text_output,
        "answer": text_output,
        "provider": result.get("provider", "unknown"),
        "model": result.get("model", "unknown"),
        "category": payload.category,
        "health_score": health,
        "suggested_documents": suggested_docs,
        "disclaimer": disclaimer,
    }
