import logging
from sqlalchemy.orm import Session
from app.services.input_parser import parse_user_input
from app.services.case_service import CaseService
from app.services.llm_router import get_llm_router
from app.agents import LEGAL_DISCLAIMER
from typing import Dict, Any, List

# Configure logging for case detection routing
logger = logging.getLogger(__name__)

def route_chat_request(message: str, language: str, history: List[Dict[str, str]], db: Session) -> Dict[str, Any]:
    """
    Routes a chat request either to the CaseService (if a case number is detected)
    or to the standard LLM router.
    
    Returns a dictionary matching the expected ChatResponse schema.
    """
    logger.info(f"Incoming chat message: '{message}'")
    
    # 1. Parse input to detect case numbers
    parsed_input = parse_user_input(message)
    
    logger.info(
        f"Input parsing result - "
        f"is_case_query: {parsed_input['is_case_query']}, "
        f"case_number: {parsed_input['case_number']}, "
        f"confidence: {parsed_input['confidence']}"
    )
    
    # 2. Route based on intent
    if parsed_input["is_case_query"] and parsed_input["case_number"]:
        logger.info(f"Routing to CaseService for case: {parsed_input['case_number']}")
        
        case_svc = CaseService(db)
        case_details = case_svc.get_case_details(parsed_input["case_number"])
        
        logger.info(f"CaseService response: found={case_details['found']}")
        
        # Format the case details as a conversational markdown response
        if case_details["found"]:
            answer = (
                f"**Case Found: {case_details['case_number']}**\n\n"
                f"- **Status**: {case_details['status']}\n"
                f"- **Court**: {case_details['court']}\n"
                f"- **Petitioner**: {case_details['petitioner']}\n"
                f"- **Respondent**: {case_details['respondent']}\n"
                f"- **Filing Date**: {case_details['filing_date']}\n"
                f"- **Next Hearing**: {case_details['next_hearing']}\n\n"
                f"*{case_details['message']}*"
            )
        else:
            answer = (
                f"**Case Not Found in Smart Nyaya Registry**\n\n"
                f"{case_details['message']}\n\n"
                f"[Search on Official eCourts Portal ↗]({case_details['external_link']})"
            )
            
        return {
            "answer": answer,
            "provider": "system",
            "model": "case-tracker-module",
            "category": "case_tracking",
            "urgency": "normal",
            "disclaimer": LEGAL_DISCLAIMER
        }
        
    # 3. Fallback to normal AI chatbot flow
    logger.info("No case number detected. Routing to standard LLM chat.")
    llm_router = get_llm_router()
    try:
        result = llm_router.legal_chat(message, language, history)
        answer_text = result["text"].replace("*", "").replace("#", "").replace("=", "")
        return {
            "answer": answer_text,
            "provider": result["provider"],
            "model": result["model"],
            "category": None, # Handled by calling function if needed
            "urgency": None,
            "disclaimer": LEGAL_DISCLAIMER
        }
    except Exception as e:
        logger.error(f"LLM API error: {str(e)}")
        raise
