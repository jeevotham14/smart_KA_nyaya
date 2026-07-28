from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/emergency", tags=["Emergency Services"])

class AlertRequest(BaseModel):
    category: str
    location: str
    description: str = ""

MOCK_RESOURCES = {
    "medical": [
        {"name": "General Hospital", "contact": "104", "type": "hospital"},
        {"name": "Ambulance Services", "contact": "108", "type": "ambulance"},
    ],
    "police": [
        {"name": "Police Control Room", "contact": "100", "type": "police"},
        {"name": "Women Helpline", "contact": "1091", "type": "police_special"},
    ],
    "fire": [
        {"name": "Fire and Rescue", "contact": "101", "type": "fire"},
    ],
    "legal": [
        {"name": "Legal Aid Helpline", "contact": "15100", "type": "legal_aid"},
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
