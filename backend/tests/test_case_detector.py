import pytest
from app.services.case_detector import extract_case_number

# Test cases: tuples of (input_text, expected_normalized_output)
# If expected is None, it means no valid case number should be found.
TEST_CASES = [
    # Basic Traditional Formats
    ("Please check status of WP 1234/2025", "WP/1234/2025"),
    ("My case is W.P.No.1234/2025", "WP/1234/2025"),
    ("Look up WP No. 1234 of 2025", "WP/1234/2025"),
    ("Check CRL.P 456/2024", "CRLP/456/2024"),
    ("Status for CRL.A 789/2023", "CRLA/789/2023"),
    ("Can you find MFA 123/2022?", "MFA/123/2022"),
    ("I have an RSA 456/2020", "RSA/456/2020"),
    ("My suit is O.S. 45/2019", "OS/45/2019"),
    ("What about CC 234/2024", "CC/234/2024"),
    ("Accident claim MVC 345/2023", "MVC/345/2023"),
    ("Criminal case C.C.No.123/2022", "CC/123/2022"),
    
    # CNR Numbers
    ("Here is my CNR: KABC010012342024", "KABC010012342024"),
    ("kabc010012342024 is the number", "KABC010012342024"),
    ("CNR MHBO010056782023 status", "MHBO010056782023"),
    ("DLND010099992021", "DLND010099992021"),
    
    # Variations with spaces, dots, hyphens
    ("Check wp-123-2021", "WP/123/2021"),
    ("Check WP - 123 - 2021", "WP/123/2021"),
    ("W.P. 123 / 2021", "WP/123/2021"),
    ("OSNo 45 of 2019", "OS/45/2019"),
    ("O.S. NO 45 OF 2019", "OS/45/2019"),
    ("C.C. No. 123/2022", "CC/123/2022"),
    ("MVC No 345-2023", "MVC/345/2023"),
    ("S.C. 12/2020", "SC/12/2020"),
    ("EX 4/2024", "EX/4/2024"),
    ("RFA 100/2015", "RFA/100/2015"),
    ("CRP 50/2018", "CRP/50/2018"),
    ("COM.O.S. 1/2024", "COMOS/1/2024"),
    
    # Case insensitivity
    ("wp 1234/2025", "WP/1234/2025"),
    ("c.c.no.123/2022", "CC/123/2022"),
    ("mfa 123 of 2022", "MFA/123/2022"),
    ("crl.p 456/2024", "CRLP/456/2024"),
    
    # Edge cases - embedded in text
    ("Hello, I wanted to know the status of my case WP 9999/2023. Thank you.", "WP/9999/2023"),
    ("Is KABC010012342024 resolved yet?", "KABC010012342024"),
    
    # Invalid formats (Should return None)
    ("I have a case number 12345", None), # Missing prefix/year
    ("WP 1234", None), # Missing year
    ("1234/2025", None), # Missing prefix
    ("What are my rights in a property dispute?", None), # Pure chat
    ("KABC010012", None), # Incomplete CNR
]

@pytest.mark.parametrize("input_text, expected", TEST_CASES)
def test_extract_case_number(input_text, expected):
    assert extract_case_number(input_text) == expected
