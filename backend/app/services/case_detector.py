import re
from typing import Optional

# Comprehensive Regex for traditional Indian Court Case Numbers
# E.g., WP 1234/2025, W.P.No.1234/2025, WP No. 1234 of 2025, CRL.P 456/2024, C.C.No.123/2022
# Breakdown:
# (?i) : Case insensitive
# \b : Word boundary
# (?: ... ) : Case Type Prefix (WP, CRL.P, CC, OS, etc.)
# (?:\s*No\.?)? : Optional "No." or "No "
# \s* : Optional spaces
# \d+ : Case number digits
# \s*(?:/|-|of)\s* : Separator (slash, hyphen, or "of")
# \d{4} : 4 digit year
# \b : Word boundary
TRADITIONAL_CASE_PATTERN = re.compile(
    r"(?i)\b(?:W\.?P\.?|CRL\.?P|CRL\.?A|MFA|RSA|O\.?S\.?|C\.?C\.?|MVC|S\.?C\.?|EX|RFA|CRP|CP|EP|ARB\.?A|COM\.?O\.?S\.?)(?:\s*No\.?)?\s*[-/]?\s*\d+\s*(?:/|-|of)\s*\d{4}\b"
)

# Regex for eCourts CNR Number (16 characters: 2 state, 2 district, 2 estab, 6 filing, 4 year)
# E.g., KABC010012342024
CNR_PATTERN = re.compile(r"(?i)\b[A-Z]{2}[A-Z0-9]{2}\d{12}\b")


def extract_case_number(text: str) -> Optional[str]:
    """
    Extracts and normalizes an Indian court case number or CNR number from the given text.
    
    Args:
        text (str): The raw input text from the user.
        
    Returns:
        Optional[str]: The normalized case number if found, else None.
    """
    if not text:
        return None

    # Check for CNR number first as it's highly specific
    cnr_match = CNR_PATTERN.search(text)
    if cnr_match:
        return cnr_match.group(0).upper()

    # Check for traditional case numbers
    traditional_match = TRADITIONAL_CASE_PATTERN.search(text)
    if traditional_match:
        raw_case = traditional_match.group(0)
        return normalize_case_number(raw_case)

    return None


def normalize_case_number(raw_case: str) -> str:
    """
    Normalizes a traditional case number to a standard format (e.g., WP/1234/2025).
    """
    # Convert to uppercase
    normalized = raw_case.upper()
    
    # Standardize 'of' and hyphens to slash
    normalized = re.sub(r"\s+(?:OF|-)\s+", "/", normalized)
    normalized = normalized.replace("-", "/")
    
    # Remove 'NO.', 'NO ', 'NO'
    normalized = re.sub(r"NO\.?\s*", "", normalized)
    
    # Remove dots in prefixes (e.g., W.P. -> WP, C.C. -> CC)
    # But only before the first digit
    match = re.search(r"([A-Z\.]+)\s*(\d+)\s*/\s*(\d{4})", normalized)
    if match:
        prefix = match.group(1).replace(".", "").strip()
        case_no = match.group(2)
        year = match.group(3)
        return f"{prefix}/{case_no}/{year}"
    
    # Fallback cleanup if regex matching structure fails
    normalized = normalized.replace(".", "")
    # Remove all spaces around slash
    normalized = re.sub(r"\s*/\s*", "/", normalized)
    # Ensure a single space between prefix and number if there's no slash there yet
    normalized = re.sub(r"([A-Z]+)(\d+)", r"\1/\2", normalized)
    normalized = re.sub(r"([A-Z]+)\s+(\d+)", r"\1/\2", normalized)
    
    return normalized
