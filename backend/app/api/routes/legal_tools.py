from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Any, List
from datetime import datetime
from app.services.legal_tools_data import RIGHTS_INFO
from app.services.court_fee_rules import find_court_fee_rule
from app.services.limitation_rules import find_limitation_rule

# Router prefix is /tools because main.py mounts all routers under settings.api_prefix (/api)
router = APIRouter(prefix="/tools", tags=["Legal Tools"])

class CourtFeeRequest(BaseModel):
    category: str
    proceeding: str
    relief: str
    valuation: Optional[float] = None

class LimitationPeriodRequest(BaseModel):
    category: str
    proceeding: str
    relief: str
    trigger_date: str
    has_exceptions: Optional[bool] = False

class RightsExplainerRequest(BaseModel):
    category: str
    language: Optional[str] = "English"

@router.post("/court-fee")
async def calculate_court_fee(request: CourtFeeRequest):
    rule = find_court_fee_rule(request.category, request.proceeding, request.relief)
    
    if not rule:
        return {
            "status": "RULE_NOT_CONFIGURED",
            "estimated_fee": None,
            "calculation_summary": "The court fee for this specific combination is not configured.",
            "legal_basis": None,
            "disclaimer": "This checker provides estimates based on limited rules. Please verify the applicable fee with the court registry or a qualified advocate."
        }

    if rule["valuation_required"] and (request.valuation is None or request.valuation < 0):
        return {
            "status": "MORE_INFORMATION_REQUIRED",
            "estimated_fee": None,
            "calculation_summary": f"Valuation is required for this rule.",
            "legal_basis": rule["legal_basis"],
            "disclaimer": "This is an estimated court fee for informational purposes. Actual court fees may depend on the exact relief, valuation method, applicable amendments, exemptions, and court procedure. Verify with the court registry or a qualified advocate before filing."
        }

    final_fee = 0.0
    calculation_summary = rule["notes"]
    if rule["calculation_type"] == "fixed":
        final_fee = float(rule["fixed_fee"])
    elif rule["calculation_type"] == "percentage":
        base_fee = rule.get("base_fee", 0)
        percentage = rule.get("percentage", 0.0)
        calc = base_fee + (request.valuation * percentage)
        final_fee = float(min(calc, rule.get("max_fee", float('inf'))))

    return {
        "status": "CALCULATED",
        "estimated_fee": round(final_fee, 2),
        "currency": "INR",
        "calculation_summary": calculation_summary,
        "legal_basis": rule["legal_basis"],
        "disclaimer": "This is an estimated court fee for informational purposes. Actual court fees may depend on the exact relief, valuation method, applicable amendments, exemptions, and court procedure. Verify with the court registry or a qualified advocate before filing."
    }

@router.post("/limitation-period")
async def check_limitation_period(request: LimitationPeriodRequest):
    rule = find_limitation_rule(request.category, request.proceeding, request.relief)

    if not rule:
        return {
            "status": "RULE_NOT_CONFIGURED",
            "period": None,
            "start_date": None,
            "estimated_deadline": None,
            "legal_basis": None,
            "notes": ["Limitation rule not configured for this specific proceeding."],
            "disclaimer": "This checker provides an estimated limitation period based on the information entered. Actual limitation may depend on the precise cause of action, relief sought, statutory exclusions, acknowledgments, continuing causes, condonation provisions, and judicial interpretation. Verify with a qualified advocate before relying on the deadline."
        }

    if not request.trigger_date:
        return {
            "status": "MORE_INFORMATION_REQUIRED",
            "period": None,
            "start_date": None,
            "estimated_deadline": None,
            "legal_basis": rule["legal_basis"],
            "notes": ["Trigger date is required to calculate limitation."],
            "disclaimer": "This checker provides an estimated limitation period based on the information entered. Actual limitation may depend on the precise cause of action, relief sought, statutory exclusions, acknowledgments, continuing causes, condonation provisions, and judicial interpretation. Verify with a qualified advocate before relying on the deadline."
        }

    try:
        trigger_date = datetime.strptime(request.trigger_date, "%Y-%m-%d")
    except ValueError:
        return {
            "status": "INVALID_INPUT",
            "period": None,
            "start_date": None,
            "estimated_deadline": None,
            "legal_basis": None,
            "notes": ["Invalid date format."],
            "disclaimer": ""
        }

    period_years = rule["period_years"]
    try:
        expiry_date = trigger_date.replace(year=trigger_date.year + period_years)
    except ValueError:
        # Handle leap year
        expiry_date = trigger_date.replace(year=trigger_date.year + period_years, day=28)

    now = datetime.now()
    
    if request.has_exceptions:
        status = "UNCERTAIN"
    elif now > expiry_date:
        status = "POSSIBLY_EXPIRED"
    else:
        status = "WITHIN_LIMITATION"

    return {
        "status": status,
        "period": f"{period_years} years",
        "start_date": trigger_date.strftime("%d %B %Y"),
        "estimated_deadline": expiry_date.strftime("%d %B %Y"),
        "legal_basis": rule["legal_basis"],
        "notes": [rule["exceptions_note"], "Actual limitation may be affected by acknowledgments, continuing causes of action, exclusions, disability, fraud, condonation provisions, or judicial interpretation."],
        "disclaimer": "This checker provides an estimated limitation period based on the information entered. Actual limitation may depend on the precise cause of action, relief sought, statutory exclusions, acknowledgments, continuing causes, condonation provisions, and judicial interpretation. Verify with a qualified advocate before relying on the deadline."
    }

@router.post("/rights-explainer")
async def get_rights_explainer(request: RightsExplainerRequest):
    raw_cat = request.category.strip().lower()

    # Search for matching category in RIGHTS_INFO
    matched_key = None
    for key in RIGHTS_INFO:
        if key in raw_cat or raw_cat in key:
            matched_key = key
            break

    if not matched_key:
        # Fallback to consumer rights
        matched_key = "consumer rights"

    info = RIGHTS_INFO[matched_key]
    return {
        "category": matched_key,
        "title": info.get("title", ""),
        "rights": info.get("rights", []),
        "laws": info.get("laws", []),
        "documents": info.get("documents", []),
        "authority": info.get("authority", "District Legal Services Authority (DLSA) / Consumer Commission"),
        "timeLimit": info.get("timeLimit", "Refer to specific statutory period."),
        "process": info.get("process", "Consult DLSA or advocate for formal petition."),
        "outcomes": info.get("outcomes", ["Legal relief and compensation as per applicable statute."])
    }
