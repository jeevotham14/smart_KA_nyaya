import re

CATEGORY_A = [
    r"appeal\s+allowed", r"appeal\s+dismissed", 
    r"petition\s+allowed", r"petition\s+dismissed", 
    r"appeal\s+succeeds", r"appeal\s+fails", 
    r"we\s+allow", r"we\s+dismiss", 
    r"\ballowed\b", r"\bdismissed\b", r"\baccepted\b", r"\brejected\b"
]

CATEGORY_B = [
    r"allow\s+appeal", r"dismiss\s+appeal", 
    r"number\s+merit", r"numbermerit", r"no\s+merit", 
    r"without\s+merit", r"fails", r"succeeds", 
    r"cannot\s+be\s+sustained", r"deserves\s+to\s+be\s+allowed",
    r"number\s+force", r"numberforce", r"no\s+force",
    r"numbersubstance", r"number\s+substance", r"no\s+substance"
]

CATEGORY_C = [
    r"court\s+erred", r"high\s+court\s+erred", r"erred",
    r"judgment\s+set\s+aside", r"order\s+set\s+aside", r"set\s+aside", r"\baside\b",
    r"impugned\s+judgment", 
    r"interference\s+warranted", r"no\s+interference", r"number\s+interference",
    r"rightly\s+decided", r"correctly\s+held", r"rightly", r"court\s+rightly", r"court\s+right"
]

def get_ablation_regex(categories):
    patterns = []
    if 'A' in categories:
        patterns.extend(CATEGORY_A)
    if 'B' in categories:
        patterns.extend(CATEGORY_B)
    if 'C' in categories:
        patterns.extend(CATEGORY_C)
        
    if not patterns:
        return None
        
    return re.compile(r'\b(' + '|'.join(patterns) + r')\b', re.IGNORECASE)

