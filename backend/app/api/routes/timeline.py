from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import hashlib

router = APIRouter(prefix="/timeline", tags=["Timeline"])

STAGES = [
    {
        "id": "filed",
        "title": "Case Filed",
        "explanation": "The initial case document has been filed in the court.",
        "next_steps": "Wait for court to review and issue notice to the opposing party.",
        "estimated_wait": "1-2 weeks",
    },
    {
        "id": "notice",
        "title": "Notice",
        "explanation": "Notice has been issued to the responding party.",
        "next_steps": "Wait for the respondent to appear and file a written statement.",
        "estimated_wait": "2-4 weeks",
    },
    {
        "id": "written_statement",
        "title": "Written Statement",
        "explanation": "The respondent has filed their written statement or reply.",
        "next_steps": "Court will frame issues and schedule the case for evidence.",
        "estimated_wait": "3-6 weeks",
    },
    {
        "id": "evidence",
        "title": "Evidence",
        "explanation": "Both parties are presenting their evidence (documents and witnesses).",
        "next_steps": "Complete evidence presentation and prepare for final arguments.",
        "estimated_wait": "3-6 months",
    },
    {
        "id": "arguments",
        "title": "Arguments",
        "explanation": "Lawyers from both sides are presenting their final arguments based on evidence.",
        "next_steps": "Court will reserve the case for judgment.",
        "estimated_wait": "1-2 months",
    },
    {
        "id": "judgment",
        "title": "Judgment",
        "explanation": "The court has pronounced its final judgment on the case.",
        "next_steps": "Obtain the certified copy of the judgment and follow court orders, or appeal if necessary.",
        "estimated_wait": "Done",
    },
]

@router.get("/{case_id}", response_model=Dict[str, Any])
async def get_case_timeline(case_id: str):
    if not case_id:
        raise HTTPException(status_code=400, detail="case_id is required")
        
    # Use hashlib to deterministically select an active stage based on case_id
    hash_object = hashlib.md5(case_id.encode())
    hash_int = int(hash_object.hexdigest(), 16)
    
    active_index = hash_int % len(STAGES)
    
    timeline_data = []
    for i, stage in enumerate(STAGES):
        status = "pending"
        if i < active_index:
            status = "completed"
        elif i == active_index:
            status = "active"
            
        stage_data = {
            **stage,
            "status": status,
        }
        timeline_data.append(stage_data)
        
    return {
        "case_id": case_id,
        "active_stage_index": active_index,
        "timeline": timeline_data
    }
