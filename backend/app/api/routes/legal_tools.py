from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.services.legal_tools_data import KARNATAKA_COURT_FEES, LIMITATION_PERIODS, RIGHTS_INFO

router = APIRouter(prefix="/api/tools", tags=["Legal Tools"])

class CourtFeeRequest(BaseModel):
    case_type: str
    suit_value: float
    court_level: Optional[str] = "district"

class LimitationPeriodRequest(BaseModel):
    case_type: str
    incident_date: str # ISO format YYYY-MM-DD

class RightsExplainerRequest(BaseModel):
    category: str

@router.post("/court-fee")
async def calculate_court_fee(request: CourtFeeRequest):
    case_type = request.case_type.lower()
    if case_type not in KARNATAKA_COURT_FEES:
        raise HTTPException(status_code=404, detail="Case type not found in fee schedule")
    
    fee_data = KARNATAKA_COURT_FEES[case_type]
    calculated_fee = fee_data["base_fee"] + (request.suit_value * fee_data["percentage"])
    final_fee = min(calculated_fee, fee_data["max_fee"])
    
    return {
        "case_type": case_type,
        "suit_value": request.suit_value,
        "calculated_fee": final_fee,
        "currency": "INR",
        "details": fee_data
    }

@router.post("/limitation-period")
async def check_limitation_period(request: LimitationPeriodRequest):
    case_type = request.case_type.lower()
    if case_type not in LIMITATION_PERIODS:
        raise HTTPException(status_code=404, detail="Case type not found in limitation periods")
    
    try:
        incident_date = datetime.strptime(request.incident_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        
    period_data = LIMITATION_PERIODS[case_type]
    period_years = period_data["period_years"]
    
    try:
        expiry_date = incident_date.replace(year=incident_date.year + period_years)
    except ValueError:
        # handle leap year issue if Feb 29
        expiry_date = incident_date.replace(year=incident_date.year + period_years, day=28)
        
    is_expired = datetime.now() > expiry_date
    
    return {
        "case_type": case_type,
        "incident_date": request.incident_date,
        "limitation_period_years": period_years,
        "description": period_data["description"],
        "expiry_date": expiry_date.strftime("%Y-%m-%d"),
        "is_expired": is_expired
    }

@router.post("/rights-explainer")
async def get_rights_explainer(request: RightsExplainerRequest):
    category = request.category.lower()
    if category not in RIGHTS_INFO:
        raise HTTPException(status_code=404, detail="Category not found for rights information")
    
    return RIGHTS_INFO[category]
