from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.domain import CaseObject
from datetime import datetime
from typing import Dict, Any, Optional

class CaseService:
    def __init__(self, db: Session):
        self.db = db

    def get_case_details(self, case_number: str) -> Dict[str, Any]:
        """
        Retrieves case details for a given normalized case number.
        
        Args:
            case_number (str): The normalized case number.
            
        Returns:
            Dict[str, Any]: A dictionary containing structured case details.
        """
        # First, attempt to find the case in the internal Smart Nyaya database
        case_obj = self.db.scalar(select(CaseObject).where(CaseObject.case_number == case_number))
        
        if case_obj:
            return self._format_internal_case(case_obj)
            
        # If not found internally, we assume it's a physical eCourts case.
        # Since there is no official public API for eCourts, we return a fallback response.
        return self._format_external_fallback(case_number)

    def _format_internal_case(self, case_obj: CaseObject) -> Dict[str, Any]:
        """Formats an internal database case object into a structured response."""
        
        # Calculate next hearing date mock logic based on created_at
        created = case_obj.created_at
        estimated_days = case_obj.estimated_duration_days or 30
        next_hearing = "Not scheduled"
        if case_obj.status != "resolved":
            # Simple mock for demo: next hearing is created_at + estimated_days
            from datetime import timedelta
            next_hearing_date = created + timedelta(days=estimated_days)
            next_hearing = next_hearing_date.strftime("%d-%m-%Y")
            
        parties = case_obj.grievance_text.split(" ")[:2]
        petitioner = " ".join(parties) if parties else "Petitioner"
        
        return {
            "found": True,
            "case_number": case_obj.case_number,
            "status": case_obj.status.replace("_", " ").title(),
            "court": case_obj.court_type or "District & Sessions Court",
            "petitioner": petitioner,
            "respondent": "State of Karnataka",
            "filing_date": created.strftime("%d-%m-%Y"),
            "next_hearing": next_hearing,
            "message": "Case found in Smart Nyaya Registry."
        }

    def _format_external_fallback(self, case_number: str) -> Dict[str, Any]:
        """Returns a fallback response for cases not found in the local database."""
        return {
            "found": False,
            "case_number": case_number,
            "message": (
                f"The case '{case_number}' was not found in the Smart Nyaya Registry. "
                "If this is a physical court case, please check the official eCourts India portal. "
                "No official developer API exists to retrieve physical court cases automatically."
            ),
            "external_link": "https://services.ecourts.gov.in/ecourtindia_v6/"
        }
