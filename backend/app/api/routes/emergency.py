from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/emergency", tags=["Emergency Services"])

class AlertRequest(BaseModel):
    category: str
    location: str
    description: str = ""

MOCK_RESOURCES = {
    "domestic_violence": [
        {"name": "Women Helpline (National)", "contact": "181", "description": "24/7 dedicated helpline for women in distress."},
        {"name": "NCW Domestic Violence Helpline", "contact": "7827170170", "description": "National Commission for Women dedicated WhatsApp number for domestic violence cases."},
        {"name": "Local Police Station", "contact": "100", "description": "Immediate police assistance for physical violence."}
    ],
    "cyber_fraud": [
        {"name": "National Cyber Crime Reporting", "contact": "1930", "description": "Helpline for financial cyber frauds."},
        {"name": "Cyber Crime Portal", "contact": "", "description": "Report anonymously at cybercrime.gov.in."}
    ],
    "child_abuse": [
        {"name": "Childline India", "contact": "1098", "description": "24/7 free emergency phone service for children in need of aid and assistance."},
        {"name": "NCPCR", "contact": "18001212830", "description": "National Commission for Protection of Child Rights helpline."}
    ],
    "police_harassment": [
        {"name": "State Police Complaints Authority", "contact": "", "description": "File a formal complaint against police misconduct."},
        {"name": "National Human Rights Commission", "contact": "14433", "description": "For serious human rights violations by authorities."}
    ],
    "women_safety": [
        {"name": "Women Helpline", "contact": "1091", "description": "Police helpline for women in distress."},
        {"name": "One Stop Centre (Sakhi)", "contact": "", "description": "Integrated support and assistance to women affected by violence."}
    ],
    "senior_citizen_abuse": [
        {"name": "Elderline (National Helpline)", "contact": "14567", "description": "Helpline for senior citizens providing information, guidance, and rescue."},
        {"name": "Maintenance Tribunal", "contact": "", "description": "Local tribunal under the Maintenance and Welfare of Parents and Senior Citizens Act."}
    ]
}

@router.get("/resources/{category}")
async def get_emergency_resources(category: str):
    """
    Returns emergency resources by category.
    """
    cat = category.lower()
    if cat not in MOCK_RESOURCES:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"category": cat, "resources": MOCK_RESOURCES[cat]}

@router.post("/alert")
async def log_emergency_alert(alert: AlertRequest):
    """
    Mock endpoint to log emergency assistance request.
    """
    # In a real system, this would trigger notifications and save to DB
    return {
        "status": "success",
        "message": "Emergency alert logged successfully",
        "details": alert.model_dump()
    }
