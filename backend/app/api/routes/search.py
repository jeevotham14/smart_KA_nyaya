from fastapi import APIRouter, Query
from typing import List, Dict, Any

router = APIRouter(prefix="/search", tags=["Search"])

# Dummy data for mock search
MOCK_DATA = [
    {"type": "LegalStatute", "title": "Karnataka Police Act, 1963", "snippet": "An act to consolidate and amend the law relating to the police force..."},
    {"type": "Precedent", "title": "State of Karnataka vs. XYZ (2020)", "snippet": "The court held that in cases of emergency..."},
    {"type": "GeneratedDocument", "title": "Lease Agreement Draft", "snippet": "Drafting of commercial lease agreement for properties in Bangalore..."},
    {"type": "CaseObject", "title": "Case No. 1234/2023", "snippet": "Ongoing dispute regarding land ownership in Mysore..."},
]

@router.get("", response_model=List[Dict[str, Any]])
async def search(q: str = Query(..., description="Search query")):
    """
    Implements a simple text search mock (since we don't have full text setup yet) 
    across dummy data for LegalStatute, Precedent, GeneratedDocument, CaseObject.
    """
    query = q.lower()
    results = []
    for item in MOCK_DATA:
        if query in item["title"].lower() or query in item["snippet"].lower() or query in item["type"].lower():
            results.append(item)
    return results
