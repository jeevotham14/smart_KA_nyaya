from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from app.services.legal_tools_data import KARNATAKA_COURT_FEES, LIMITATION_PERIODS, RIGHTS_INFO

# Router prefix is /tools because main.py mounts all routers under settings.api_prefix (/api)
router = APIRouter(prefix="/tools", tags=["Legal Tools"])

class CourtFeeRequest(BaseModel):
    case_type: Optional[str] = None
    caseType: Optional[str] = None
    suit_value: Optional[float] = None
    claimAmount: Optional[float] = None
    court_level: Optional[str] = "district"

class LimitationPeriodRequest(BaseModel):
    case_type: Optional[str] = None
    caseCategory: Optional[str] = None
    incident_date: Optional[str] = None
    incidentDate: Optional[str] = None

class RightsExplainerRequest(BaseModel):
    category: str
    language: Optional[str] = "English"

@router.post("/court-fee")
async def calculate_court_fee(request: CourtFeeRequest):
    # Support either snake_case or camelCase
    raw_type = (request.case_type or request.caseType or "civil").strip().lower().replace(" ", "_")
    suit_val = request.suit_value if request.suit_value is not None else (request.claimAmount or 0.0)

    # Normalize aliases
    if raw_type in ("civil", "civil_suit", "money", "damages"):
        norm_key = "civil"
    elif raw_type in ("family", "family_court", "matrimonial", "divorce", "maintenance"):
        norm_key = "family"
    elif raw_type in ("appeal", "first_appeal", "rfa"):
        norm_key = "appeal"
    elif raw_type in ("property", "property_dispute", "land", "partition", "injunction"):
        norm_key = "property"
    else:
        norm_key = "civil"

    fee_data = KARNATAKA_COURT_FEES.get(norm_key, KARNATAKA_COURT_FEES["civil"])
    calculated_fee = fee_data["base_fee"] + (suit_val * fee_data["percentage"])
    final_fee = min(calculated_fee, fee_data["max_fee"])

    return {
        "case_type": norm_key,
        "suit_value": suit_val,
        "calculated_fee": round(final_fee, 2),
        "estimatedFee": round(final_fee, 2),
        "fee": round(final_fee, 2),
        "currency": "INR",
        "details": fee_data.get("details", f"Estimated court fee based on {fee_data.get('schedule', 'Karnataka Court Fees Act, 1958')}."),
        "schedule": fee_data.get("schedule", ""),
        "name": fee_data.get("name", "")
    }

@router.post("/limitation-period")
async def check_limitation_period(request: LimitationPeriodRequest):
    raw_type = (request.case_type or request.caseCategory or "money_recovery").strip().lower().replace(" ", "_")
    raw_date = (request.incident_date or request.incidentDate or "").strip()

    if not raw_date:
        raise HTTPException(status_code=400, detail="Date of incident is required (YYYY-MM-DD format).")

    # Normalize aliases
    if "money" in raw_type or "loan" in raw_type or "debt" in raw_type:
        norm_key = "money_recovery"
    elif "contract" in raw_type or "breach" in raw_type or "agreement" in raw_type:
        norm_key = "breach_of_contract"
    elif "prop" in raw_type or "land" in raw_type or "possession" in raw_type:
        norm_key = "property_dispute"
    elif "defam" in raw_type or "tort" in raw_type or "slander" in raw_type or "libel" in raw_type:
        norm_key = "tort_defamation"
    else:
        norm_key = "money_recovery"

    try:
        incident_date = datetime.strptime(raw_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Please use YYYY-MM-DD.")

    period_data = LIMITATION_PERIODS.get(norm_key, LIMITATION_PERIODS["money_recovery"])
    period_years = period_data["period_years"]

    try:
        expiry_date = incident_date.replace(year=incident_date.year + period_years)
    except ValueError:
        # handle Feb 29 leap year
        expiry_date = incident_date.replace(year=incident_date.year + period_years, day=28)

    now = datetime.now()
    is_expired = now > expiry_date
    days_diff = (expiry_date - now).days

    return {
        "case_type": norm_key,
        "incident_date": raw_date,
        "limitation_period_years": period_years,
        "period": f"{period_years} Years ({period_data.get('description', '')})",
        "description": period_data["description"],
        "expiry_date": expiry_date.strftime("%Y-%m-%d"),
        "deadline": expiry_date.strftime("%d %B %Y"),
        "is_expired": is_expired,
        "isExpired": is_expired,
        "days_remaining": max(0, days_diff) if not is_expired else 0,
        "notes": period_data.get("notes", "Limitation periods are strictly enforced in civil courts.")
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
