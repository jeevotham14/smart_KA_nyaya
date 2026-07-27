from typing import Dict, Any
from app.services.case_detector import extract_case_number

def parse_user_input(text: str) -> Dict[str, Any]:
    """
    Parses the user input to determine if it contains a structured request
    such as a case number lookup.
    
    Args:
        text (str): The raw input text from the user.
        
    Returns:
        Dict[str, Any]: A dictionary containing parsing results.
            - is_case_query (bool): True if a case number was detected.
            - case_number (str | None): The normalized case number.
            - original_text (str): The raw input.
            - confidence (float): Confidence score of the detection (1.0 for regex matches).
    """
    case_number = extract_case_number(text)
    
    if case_number:
        return {
            "is_case_query": True,
            "case_number": case_number,
            "original_text": text,
            "confidence": 1.0,
        }
        
    return {
        "is_case_query": False,
        "case_number": None,
        "original_text": text,
        "confidence": 0.0,
    }
