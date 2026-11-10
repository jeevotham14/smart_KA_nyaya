import logging
import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.services.input_parser import parse_user_input
from app.services.case_service import CaseService
from app.services.llm_router import get_llm_router
from app.agents import LEGAL_DISCLAIMER
from app.db.statutes_corpus import get_grounded_statutes_for_query

logger = logging.getLogger(__name__)


def _is_greeting_or_casual(text: str) -> bool:
    """Detect greetings, pleasantries, brief acknowledgments, and meta questions."""
    cleaned = re.sub(r"[^\w\s]", "", text.strip().lower())
    words = cleaned.split()

    if not words:
        return True

    casual_exact = {
        "hi", "hello", "hey", "hlo", "helo", "hy", "hola",
        "namaste", "namaskara", "namaskar", "namaskargalu", "vanakkam",
        "good morning", "good evening", "good afternoon", "good night", "gm", "gn",
        "how are you", "how r u", "who are you", "who r u", "what is your name",
        "what can you do", "what do you do", "help", "help me", "menu",
        "thanks", "thank you", "thank u", "thx", "dhanyavada", "dhanyavadagalu",
        "ok", "okay", "k", "kk", "sure", "cool", "fine", "good", "nice", "great",
        "got it", "understood", "yes", "no", "yep", "nope",
        "bye", "goodbye", "see you", "tata",
        "test", "testing"
    }

    if cleaned in casual_exact:
        return True

    if len(words) <= 3:
        if any(w in {"hi", "hello", "hey", "hlo", "namaste", "namaskara", "ok", "okay", "thanks", "bye", "good"} for w in words):
            legal_signals = [
                "fir", "police", "court", "lawyer", "advocate", "rent", "tenant", "landlord",
                "land", "property", "theft", "stolen", "stole", "cheat", "fraud", "scam", "assault",
                "threat", "abuse", "dowry", "wage", "salary", "job", "bns", "bnss", "cheque",
                "ದೂರು", "ಪೊಲೀಸ್", "ಆಸ್ತಿ", "ಬಾಡಿಗೆ", "ವಕೀಲ", "ಕಳ್ಳತನ", "ಹಲ್ಲೆ"
            ]
            if not any(k in cleaned for k in legal_signals):
                return True

    return False


def _has_substantive_case_facts(text: str) -> bool:
    """
    Checks if the user is describing an actual factual legal grievance or requesting a case assessment.
    Returns False for greetings, general knowledge inquiries (e.g. 'what is rti?'), or single-word queries.
    """
    lowered = text.lower()
    cleaned = re.sub(r"[^\w\s]", "", lowered.strip())
    words = cleaned.split()

    # Explicit diagnostic request
    if any(k in lowered for k in ["diagnose", "case health", "case strength", "viability", "case score", "ವಿಶ್ಲೇಷಣೆ", "ಸಾಮರ್ಥ್ಯ"]):
        return True

    # Needs some minimum substance
    if len(words) < 3:
        return False

    # Keywords indicating an active dispute/grievance
    grievance_indicators = [
        # Crime / Police / Threat
        "theft", "stolen", "stole", "steal", "robbed", "robbery", "snatch", "assault", "beat", "beating",
        "hit", "attack", "threat", "threaten", "threatening", "knife", "police", "fir", "harass", "harassment",
        "cheat", "cheated", "fraud", "scam", "cyber", "hacked", "blackmail", "extort",
        "ಕಳ್ಳತನ", "ದೂರು", "ಹಲ್ಲೆ", "ಬೆದರಿಕೆ", "ವಂಚನೆ",
        # Family / Domestic
        "domestic violence", "dowry", "husband", "wife", "in-laws", "inlaws", "maintenance", "custody",
        "divorce", "cruelty", "deserted", "abandoned", "ಗಂಡ", "ವರದಕ್ಷಿಣೆ", "ಗೃಹ ಹಿಂಸೆ",
        # Tenancy / Housing
        "tenant", "landlord", "rent", "deposit", "evict", "eviction", "vacate", "lease", "utilities",
        "water cut", "electricity cut", "ಬಾಡಿಗೆ", "ಠೇವಣಿ", "ಖಾಲಿ",
        # Land / Property
        "land", "property", "rtc", "pahani", "mutation", "khata", "survey number", "boundary",
        "partition", "ancestral", "encroachment", "sale deed", "gift deed", "title",
        "ಪಹಣಿ", "ಆಸ್ತಿ", "ಜಮೀನು", "ಖಾತೆ",
        # Labour / Employment
        "salary", "wage", "wages", "unpaid", "employer", "boss", "terminated", "fired", "gratuity",
        "pf", "provident fund", "overtime", "workplace harassment", "ವೇತನ", "ಉದ್ಯೋಗ",
        # Consumer
        "defective", "refund", "warranty", "damaged product", "expired product", "consumer court",
        "consumer forum", "replacement", "ಗ್ರಾಹಕ",
        # Financial / Cheque
        "cheque bounce", "check bounce", "loan", "borrowed", "recovery", "dues", "debt", "interest",
        "ಸಾಲ", "ಬಾಕಿ", "ಚೆಕ್"
    ]

    return any(k in lowered for k in grievance_indicators) and len(words) >= 4


def _extract_applicable_statutes(text: str, category: str) -> List[Dict[str, Any]]:
    """
    Extracts relevant statutory references grounded in Bharatiya Nyaya Sanhita (BNS 2023),
    Bharatiya Nagarik Suraksha Sanhita (BNSS 2023), and Karnataka State legislation.
    """
    if _is_greeting_or_casual(text):
        return []

    # First check deterministic verified statutory corpus
    corpus_matches = get_grounded_statutes_for_query(text, category)
    if corpus_matches:
        formatted = []
        for s in corpus_matches:
            formatted.append({
                "act": s["act"],
                "section": f"{s['section']} ({s['title']})",
                "summary": s["summary"],
                "summary_kn": s.get("summary_kn"),
                "title": s.get("title"),
                "title_kn": s.get("title_kn"),
                "gazette_ref": s.get("gazette_ref"),
                "remedy": s.get("remedy"),
                "court": s.get("court")
            })
        return formatted[:3]

    lowered = text.lower()
    statutes: List[Dict[str, Any]] = []

    # 1. Criminal / Police / FIR / Theft / Assault
    if category == "criminal" or any(k in lowered for k in ["fir", "police", "theft", "stolen", "stole", "steal", "rob", "robbed", "robbery", "assault", "beat", "hit", "threat", "crime", "knife", "weapon", "ದೂರು", "ಪೊಲೀಸ್", "ಕಳ್ಳತನ"]):
        statutes.append({
            "act": "Bharatiya Nagarik Suraksha Sanhita, 2023",
            "section": "Section 173 (Zero FIR & Mandatory Registration)",
            "summary": "Mandatory registration of FIR for cognizable offences at any police station regardless of jurisdiction. Complainant is entitled to a free copy of the FIR immediately.",
            "summary_kn": "ಯಾವುದೇ ಪೊಲೀಸ್ ಠಾಣೆಯಲ್ಲಿ ಅಪರಾಧದ ಎಫ್‌ಐಆರ್ ದಾಖಲಿಸುವುದು ಕಡ್ಡಾಯ (ಝೀರೋ ಎಫ್‌ಐಆರ್). ದೂರುದಾರರಿಗೆ ಉಚಿತ ಎಫ್‌ಐಆರ್ ಪ್ರತಿ ಪಡೆಯುವ ಹಕ್ಕಿದೆ."
        })
        if any(k in lowered for k in ["theft", "stolen", "stole", "steal", "robbery", "robbed", "snatch", "jewel", "laptop", "ಕಳ್ಳತನ"]):
            statutes.append({
                "act": "Bharatiya Nyaya Sanhita, 2023",
                "section": "Section 303 (Theft)",
                "summary": "Covers theft and dishonestly moving movable property without consent. Punishable with imprisonment up to 3 years or fine.",
                "summary_kn": "ಸಮ್ಮತಿಯಿಲ್ಲದೆ ಚರ ಆಸ್ತಿಯನ್ನು ಕದಿಯುವ ಅಪರಾಧಕ್ಕೆ ೩ ವರ್ಷಗಳವರೆಗೆ ಶಿಕ್ಷೆ ಅಥವಾ ದಂಡ."
            })
        elif any(k in lowered for k in ["threat", "intimidation", "threaten", "ಬೆದರಿಕೆ"]):
            statutes.append({
                "act": "Bharatiya Nyaya Sanhita, 2023",
                "section": "Section 351 (Criminal Intimidation)",
                "summary": "Threatening injury to person, reputation, or property to cause alarm or force an unlawful act.",
                "summary_kn": "ವ್ಯಕ್ತಿಯ ಜೀವ, ಗೌರವ ಅಥವಾ ಆಸ್ತಿಗೆ ಹಾನಿ ಮಾಡುವ ಕ್ರಿಮಿನಲ್ ಬೆದರಿಕೆಗೆ ಕಾನೂನು ಕ್ರಮ."
            })

    # 2. Cyber Crime / Online Fraud / Financial Scam
    if category == "cyber" or any(k in lowered for k in ["cyber", "fraud", "scam", "otp", "phishing", "online", "hacked", "account", "ವಂಚನೆ", "ಖಾತೆ"]):
        statutes.append({
            "act": "Bharatiya Nyaya Sanhita, 2023",
            "section": "Section 318 (Cheating & Dishonest Inducement)",
            "summary": "Cheating and dishonestly inducing delivery of property or money. Cognizable offence punishable up to 7 years imprisonment (formerly IPC 420).",
            "summary_kn": "ಹಣ ಅಥವಾ ಆಸ್ತಿಯನ್ನು ವಂಚಿಸಿ ಪಡೆಯುವ ಅಪರಾಧಕ್ಕೆ ೭ ವರ್ಷಗಳವರೆಗೆ ಜೈಲು ಶಿಕ್ಷೆ (ಹಿಂದಿನ ಐಪಿಸಿ ೪೨೦)."
        })
        statutes.append({
            "act": "Information Technology Act, 2000",
            "section": "Section 66D (Cheating by Personation using Computer)",
            "summary": "Punishment for cheating by personation using digital devices or online portals. Imprisonment up to 3 years and fine up to ₹1,00,000.",
            "summary_kn": "ಕಂಪ್ಯೂಟರ್ ಅಥವಾ ಮೊಬೈಲ್ ಮೂಲಕ ನಕಲಿ ಸೋಗು ಹಾಕಿ ವಂಚನೆ ಮಾಡುವ ಅಪರಾಧಕ್ಕೆ ₹೧ ಲಕ್ಷ ದಂಡ ಮತ್ತು ಜೈಲು ಶಿಕ್ಷೆ."
        })

    # 3. Women Protection & Domestic Abuse
    if category == "women_protection" or any(k in lowered for k in ["violence", "domestic", "harassment", "husband", "dowry", "in-laws", "stalking", "cruelty", "wife", "ಮಹಿಳೆ", "ಕಿರುಕುಳ", "ಗಂಡ", "ವರದಕ್ಷಿಣೆ"]):
        statutes.append({
            "act": "Bharatiya Nyaya Sanhita, 2023",
            "section": "Section 85 & 86 (Cruelty by Husband or Relatives)",
            "summary": "Subjecting a woman to cruelty or harassment for unlawful property/dowry demands. Cognizable and non-bailable (formerly IPC 498A).",
            "summary_kn": "ಗಂಡ ಅಥವಾ ಆತನ ಸಂಬಂಧಿಕರಿಂದ ಮಹಿಳೆಗೆ ಆಗುವ ದೌರ್ಜನ್ಯ ಮತ್ತು ವರದಕ್ಷಿಣೆ ಕಿರುಕುಳಕ್ಕೆ ಕಠಿಣ ಶಿಕ್ಷೆ (ಹಿಂದಿನ ಐಪಿಸಿ ೪೯೮ಎ)."
        })
        statutes.append({
            "act": "Protection of Women from Domestic Violence Act, 2005",
            "section": "Section 12, 18, 19 (Protection & Residence Orders)",
            "summary": "Allows women to obtain protection orders, right to reside in shared household, and emergency monetary maintenance from the Magistrate.",
            "summary_kn": "ಮ್ಯಾಜಿಸ್ಟ್ರೇಟ್ ನ್ಯಾಯಾಲಯದಿಂದ ರಕ್ಷಣಾ ಆದೇಶ, ಮನೆಯಲ್ಲಿ ವಾಸಿಸುವ ಹಕ್ಕು ಮತ್ತು ತುರ್ತು ಪರಿಹಾರ ಭತ್ಯೆ ಪಡೆಯುವ ಅವಕಾಶ."
        })

    # 4. Property, Tenancy & Land Revenue (Karnataka Specific)
    if any(k in lowered for k in ["tenant", "rent", "landlord", "evict", "deposit", "ಬಾಡಿಗೆ", "ಮಾಲೀಕ", "ಅಮಾನತು"]):
        statutes.append({
            "act": "Karnataka Rent Act, 1999",
            "section": "Section 27 (Protection Against Unlawful Eviction)",
            "summary": "Landlord cannot evict a tenant or cut essential utilities (water/power) without an order from the competent Rent Controller or Court.",
            "summary_kn": "ಸಕ್ಷಮ ನ್ಯಾಯಾಲಯದ ಆದೇಶವಿಲ್ಲದೆ ಬಾಡಿಗೆದಾರರನ್ನು ಬಲವಂತವಾಗಿ ಹೊರಹಾಕುವುದು ಅಥವಾ ನೀರು/ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಳಿಸುವುದು ಕಾನೂನುಬಾಹಿರ."
        })
        statutes.append({
            "act": "Transfer of Property Act, 1882",
            "section": "Section 106 (Notice of Termination)",
            "summary": "Requires mandatory 15-day written notice expiring with the end of a month of tenancy before seeking eviction or recovery.",
            "summary_kn": "ಬಾಡಿಗೆ ಕರಾರು ರದ್ದುಪಡಿಸಲು ಕನಿಷ್ಠ ೧೫ ದಿನಗಳ ಮುಂಚಿತ ಲಿಖಿತ ನೋಟಿಸ್ ನೀಡುವುದು ಕಡ್ಡಾಯ."
        })
    elif any(k in lowered for k in ["land", "property", "rtc", "pahani", "mutation", "survey", "boundary", "ಜಮೀನು", "ಆಸ್ತಿ", "ಪಹಣಿ"]):
        statutes.append({
            "act": "Karnataka Land Revenue Act, 1964",
            "section": "Section 136 (Appeal & Revision of Revenue Records)",
            "summary": "Appeals against disputed RTC / mutation entries lie before the Assistant Commissioner (Sub-Divisional Officer) within limitation.",
            "summary_kn": "ವಿವಾದಿತ ಪಹಣಿ (RTC) ಅಥವಾ ಖಾತೆ ಬದಲಾವಣೆ ವಿರುದ್ಧ ಉಪವಿಭಾಗಾಧಿಕಾರಿಗಳಿಗೆ (AC) ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸುವ ಅಧಿಕಾರ."
        })
        statutes.append({
            "act": "Karnataka Sakala Services Act, 2011",
            "section": "Section 5 (Time-bound Delivery of Citizen Services)",
            "summary": "Statutory guarantee for delivery of land records, caste/income certificates, and mutation extracts within specified number of working days.",
            "summary_kn": "ಸಕಾಲ ಕಾಯಿದೆಯಡಿ ಪಹಣಿ, ಖಾತೆ ಬದಲಾವಣೆ ಮತ್ತು ಕಂದಾಯ ದಾಖಲೆಗಳನ್ನು ನಿಗದಿತ ದಿನಗಳೊಳಗೆ ನೀಡಲು ಸರ್ಕಾರ ಬದ್ಧ."
        })

    # 5. Consumer Grievance
    if any(k in lowered for k in ["consumer", "defective", "product", "warranty", "refund", "damaged", "repair", "ಗ್ರಾಹಕ", "ಹಣ ವಾಪಸ್"]):
        statutes.append({
            "act": "Consumer Protection Act, 2019",
            "section": "Section 35 (Filing Complaint before District Commission)",
            "summary": "Direct filing before District Consumer Disputes Redressal Commission for product defect, deficiency in service, or unfair trade practice.",
            "summary_kn": "ಸೇವೆಯಲ್ಲಿನ ಲೋಪ ಅಥವಾ ದೋಷಯುಕ್ತ ವಸ್ತುಗಳ ವಿರುದ್ಧ ಜಿಲ್ಲಾ ಗ್ರಾಹಕರ ನ್ಯಾಯಾಲಯಕ್ಕೆ ನೇರ ದೂರು ಸಲ್ಲಿಸಲು ಅವಕಾಶ."
        })

    # 6. RTI / Government Grievance
    if any(k in lowered for k in ["rti", "information", "government", "officer", "delay", "ಮಾಹಿತಿ ಹಕ್ಕು", "ಸರ್ಕಾರಿ"]):
        statutes.append({
            "act": "Right to Information Act, 2005",
            "section": "Section 6(1) Form A (Application for Information)",
            "summary": "Any citizen can seek public information with ₹10 court fee stamp in Karnataka. Reply must be provided within 30 days.",
            "summary_kn": "₹೧೦ ಕೋರ್ಟ್ ಫೀ ಸ್ಟಾಂಪ್ ನೊಂದಿಗೆ ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ ೩೦ ದಿನಗಳೊಳಗೆ ಮಾಹಿತಿ ಪಡೆಯುವ ಹಕ್ಕು."
        })

    # 7. Section 12 Free Legal Aid (when legal aid, free lawyer, or poverty is discussed)
    if any(k in lowered for k in ["legal aid", "free lawyer", "free advocate", "dlsa", "kslsa", "afford a lawyer", "poor", "court fee waiver", "ಉಚಿತ ವಕೀಲ", "ಕಾನೂನು ನೆರವು"]):
        statutes.append({
            "act": "Legal Services Authorities Act, 1987",
            "section": "Section 12 (Eligibility for Free Legal Aid)",
            "summary": "Guarantees free legal assistance, panel advocates, and exemption from court fees for women, SC/ST, children, and low-income citizens (annual income ≤ ₹3,00,000 in Karnataka).",
            "summary_kn": "ಮಹಿಳೆಯರು, ಪರಿಶಿಷ್ಟ ಜಾತಿ/ಪಂಗಡದವರು, ಮಕ್ಕಳು ಮತ್ತು ವಾರ್ಷಿಕ ಆದಾಯ ₹೩ ಲಕ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ ಇರುವವರಿಗೆ ಉಚಿತ ವಕೀಲರ ಸೇವೆ ಮತ್ತು ಶುಲ್ಕ ವಿನಾಯಿತಿ."
        })

    return statutes[:3]


def _extract_action_widgets(text: str, category: str, urgency: str, language: str) -> List[Dict[str, Any]]:
    """
    Constructs contextual, interactive action cards linking to internal platform tools:
    Document Generator, Emergency Assistance, Legal Aid (DLSA), Calculators, and Directory.
    """
    if _is_greeting_or_casual(text):
        return []

    lowered = text.lower()
    widgets: List[Dict[str, Any]] = []

    # 1. Emergency SOS Widget (Top priority for emergency/violence/danger)
    if urgency in ("emergency", "high") or any(k in lowered for k in ["violence", "threat", "attack", "kill", "danger", "abuse", "suicide", "ತುರ್ತು", "ಹಲ್ಲೆ", "ಬೆದರಿಕೆ"]):
        widgets.append({
            "id": "action-emergency",
            "type": "emergency_sos",
            "title": "Emergency SOS Helplines (Karnataka)",
            "title_kn": "ಕರ್ನಾಟಕ ತುರ್ತು ರಕ್ಷಣಾ ಸಹಾಯವಾಣಿಗಳು",
            "description": "Call 112 (Unified Police Emergency) or 181 (Women Helpline - Vanitha Sahayavani) immediately.",
            "description_kn": "ತಕ್ಷಣವೇ ೧೧೨ (ಪೊಲೀಸ್ ತುರ್ತು) ಅಥವಾ ೧೮೧ (ಮಹಿಳಾ ಸಹಾಯವಾಣಿ) ಗೆ ಕರೆ ಮಾಡಿ.",
            "target_url": "/emergency",
            "action_label": "Open Emergency Page ↗",
            "action_label_kn": "ತುರ್ತು ಪುಟ ತೆರೆಯಿರಿ ↗",
            "badge": "Urgent",
            "icon": "ShieldAlert"
        })

    # 2. Targeted Document Generator Widget
    if category == "criminal" or any(k in lowered for k in ["police", "fir", "theft", "stolen", "stole", "steal", "rob", "robbery", "robbed", "crime", "ದೂರು", "ಕಳ್ಳತನ"]):
        widgets.append({
            "id": "action-draft-police",
            "type": "draft_document",
            "title": "Draft Police Complaint / FIR Request",
            "title_kn": "ಪೊಲೀಸ್ ಠಾಣಾ ದೂರು / ಎಫ್‌ಐಆರ್ ಅರ್ಜಿ ಸಿದ್ಧಪಡಿಸಿ",
            "description": "Generate a High Court-compliant SHO Police Complaint with standard cause title.",
            "description_kn": "ಕರ್ನಾಟಕ ಹೈಕೋರ್ಟ್ ಮಾನ್ಯತೆ ಪಡೆದ ಪೂರ್ಣ ಪೊಲೀಸ್ ದೂರು ಅರ್ಜಿಯನ್ನು ೨ ನಿಮಿಷದಲ್ಲಿ ಸಿದ್ಧಪಡಿಸಿ.",
            "target_url": "/document-generator?type=Police%20Complaint",
            "action_label": "Draft Police Complaint ↗",
            "action_label_kn": "ದೂರು ಸಿದ್ಧಪಡಿಸಿ ↗",
            "badge": "Police Complaint",
            "icon": "FileWarning"
        })
    elif any(k in lowered for k in ["cyber", "online fraud", "phishing", "scam", "otp", "ವಂಚನೆ"]):
        widgets.append({
            "id": "action-draft-cyber",
            "type": "draft_document",
            "title": "Draft Cyber Crime Police Complaint",
            "title_kn": "ಸೈಬರ್ ಅಪರಾಧ ದೂರು ಅರ್ಜಿ ಸಿದ್ಧಪಡಿಸಿ",
            "description": "Draft a formal fraud complaint for submission to Karnataka Cyber Police Station.",
            "description_kn": "ಕರ್ನಾಟಕ ಸೈಬರ್ ಪೊಲೀಸ್ ಠಾಣೆಗೆ ಸಲ್ಲಿಸಲು ಅಧಿಕೃತ ವಂಚನೆ ದೂರು ಅರ್ಜಿಯನ್ನು ಸಿದ್ಧಪಡಿಸಿ.",
            "target_url": "/document-generator?type=Cyber%20Crime%20Complaint",
            "action_label": "Draft Cyber Complaint ↗",
            "action_label_kn": "ಸೈಬರ್ ದೂರು ಸಿದ್ಧಪಡಿಸಿ ↗",
            "badge": "Cyber Police",
            "icon": "Laptop"
        })
    elif any(k in lowered for k in ["tenant", "landlord", "rent", "deposit", "evict", "ಬಾಡಿಗೆ"]):
        widgets.append({
            "id": "action-draft-notice",
            "type": "draft_document",
            "title": "Draft 15-Day Legal Demand Notice",
            "title_kn": "೧೫ ದಿನಗಳ ಲೀಗಲ್ ಡಿಮಾಂಡ್ ನೋಟಿಸ್ ಸಿದ್ಧಪಡಿಸಿ",
            "description": "Serve formal statutory legal notice for return of rental deposit or breach of tenancy.",
            "description_kn": "ಬಾಡಿಗೆ ಮುಂಗಡ ಮರುಪಾವತಿ ಅಥವಾ ಒಪ್ಪಂದ ಉಲ್ಲಂಘನೆಗಾಗಿ ಅಧಿಕೃತ ಲೀಗಲ್ ನೋಟಿಸ್ ಕಳುಹಿಸಿ.",
            "target_url": "/document-generator?type=Legal%20Notice",
            "action_label": "Draft Legal Notice ↗",
            "action_label_kn": "ಲೀಗಲ್ ನೋಟಿಸ್ ರಚಿಸಿ ↗",
            "badge": "Legal Notice",
            "icon": "ScrollText"
        })
    elif any(k in lowered for k in ["consumer", "defective", "refund", "product", "company", "ಗ್ರಾಹಕ"]):
        widgets.append({
            "id": "action-draft-consumer",
            "type": "draft_document",
            "title": "Draft Consumer Forum Redressal Complaint",
            "title_kn": "ಗ್ರಾಹಕರ ವೇದಿಕೆ ಪರಿಹಾರ ದೂರು ಸಿದ್ಧಪಡಿಸಿ",
            "description": "Draft petition under Section 35 of Consumer Protection Act for compensation and refund.",
            "description_kn": "ದೋಷಯುಕ್ತ ವಸ್ತು ಅಥವಾ ಸೇವಾ ಲೋಪದ ವಿರುದ್ಧ ಪರಿಹಾರ ಕೋರಿ ಗ್ರಾಹಕರ ವೇದಿಕೆಗೆ ದೂರು ಅರ್ಜಿ ಸಿದ್ಧಪಡಿಸಿ.",
            "target_url": "/document-generator?type=Consumer%20Complaint",
            "action_label": "Draft Consumer Complaint ↗",
            "action_label_kn": "ಗ್ರಾಹಕರ ದೂರು ಸಿದ್ಧಪಡಿಸಿ ↗",
            "badge": "Consumer Court",
            "icon": "ShoppingBag"
        })
    elif any(k in lowered for k in ["rti", "information", "government", "record", "ಮಾಹಿತಿ ಹಕ್ಕು"]):
        widgets.append({
            "id": "action-draft-rti",
            "type": "draft_document",
            "title": "Draft RTI Application (Form A)",
            "title_kn": "ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ (ನಮೂನೆ ಎ) ಸಿದ್ಧಪಡಿಸಿ",
            "description": "Draft standard Form A RTI application for Karnataka state departments.",
            "description_kn": "ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಇಲಾಖೆಗಳಿಂದ ಅಧಿಕೃತ ದಾಖಲೆ ಪಡೆಯಲು ಆರ್‌ಟಿಐ ನಮೂನೆ ಎ ಅರ್ಜಿ ಸಿದ್ಧಪಡಿಸಿ.",
            "target_url": "/document-generator?type=RTI%20Application",
            "action_label": "Draft RTI Form A ↗",
            "action_label_kn": "ಆರ್‌ಟಿಐ ಅರ್ಜಿ ರಚಿಸಿ ↗",
            "badge": "RTI Act 2005",
            "icon": "FileText"
        })
    elif _has_substantive_case_facts(text):
        # General Complaint draft fallback only for substantive grievances
        widgets.append({
            "id": "action-draft-general",
            "type": "draft_document",
            "title": "Draft Legal Complaint / Representation",
            "title_kn": "ಕಾನೂನು ದೂರು / ಮನವಿ ಅರ್ಜಿ ಸಿದ್ಧಪಡಿಸಿ",
            "description": "Generate a structured representation to present before Karnataka civil or administrative authorities.",
            "description_kn": "ಸಂಬಂಧಪಟ್ಟ ಸರ್ಕಾರಿ ಪ್ರಾಧಿಕಾರ ಅಥವಾ ನ್ಯಾಯಾಲಯಕ್ಕೆ ಸಲ್ಲಿಸಲು ಕ್ರಮಬದ್ಧ ಅರ್ಜಿ ಸಿದ್ಧಪಡಿಸಿ.",
            "target_url": "/document-generator?type=Complaint",
            "action_label": "Draft Document ↗",
            "action_label_kn": "ದಾಖಲೆ ಸಿದ್ಧಪಡಿಸಿ ↗",
            "badge": "Legal Draft",
            "icon": "FileText"
        })

    # 3. Free Legal Aid Check (Section 12 DLSA)
    if any(k in lowered for k in ["lawyer", "advocate", "fee", "cost", "afford", "poor", "free", "dlsa", "kslsa", "sc", "st", "woman", "ಉಚಿತ", "ವಕೀಲ", "ಬಡತನ"]):
        widgets.append({
            "id": "action-legal-aid",
            "type": "legal_aid",
            "title": "Free Legal Aid Eligibility Check (Section 12 DLSA)",
            "title_kn": "ಉಚಿತ ಕಾನೂನು ನೆರವು ಪರಿಶೀಲನೆ (ಕಲಂ ೧೨)",
            "description": "Check if you qualify for a free panel advocate and fee exemption under Karnataka DLSA rules.",
            "description_kn": "ಕರ್ನಾಟಕ ಡಿಎಲ್‌ಎಸ್‌ಎ ನಿಯಮಗಳಡಿ ಉಚಿತ ವಕೀಲರು ಮತ್ತು ನ್ಯಾಯಾಲಯ ಶುಲ್ಕ ವಿನಾಯಿತಿಗೆ ನಿಮ್ಮ ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ.",
            "target_url": "/legal-aid",
            "action_label": "Check DLSA Eligibility ↗",
            "action_label_kn": "ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ ↗",
            "badge": "Free Legal Aid",
            "icon": "BadgeCheck"
        })

    # 4. Limitation Period / Court Fee Calculator (for civil/property/monetary disputes)
    if any(k in lowered for k in ["money", "dues", "recover", "cheque", "deposit", "property", "contract", "salary", "loan", "ಹಣ", "ಸಾಲ", "ಬಾಕಿ"]):
        widgets.append({
            "id": "action-limitation",
            "type": "limitation",
            "title": "Verify Legal Limitation Period",
            "title_kn": "ಕಾನೂನು ಕಾಲಮಿತಿ ಪರಿಶೀಲಿಸಿ (Limitation Period)",
            "description": "Check if your cause of action is within the statutory limitation window under Limitation Act 1963.",
            "description_kn": "ನಿಮ್ಮ ವಿವಾದದ ಅವಧಿ ಕಾಲಮಿತಿ ಕಾಯಿದೆಯಡಿ ಮಾನ್ಯವಾಗಿದೆಯೇ ಎಂದು ತಕ್ಷಣವೇ ಪರಿಶೀಲಿಸಿ.",
            "target_url": "/limitation-checker",
            "action_label": "Check Limitation Period ↗",
            "action_label_kn": "ಕಾಲಮಿತಿ ಪರಿಶೀಲಿಸಿ ↗",
            "badge": "Limitation Act",
            "icon": "Clock"
        })
        widgets.append({
            "id": "action-court-fee",
            "type": "court_fee",
            "title": "Karnataka Court Fee Calculator",
            "title_kn": "ಕರ್ನಾಟಕ ಕೋರ್ಟ್ ಫೀ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
            "description": "Calculate exact ad-valorem court fees under the Karnataka Court Fees and Suits Valuation Act.",
            "description_kn": "ಕರ್ನಾಟಕ ನ್ಯಾಯಾಲಯ ಶುಲ್ಕ ಕಾಯಿದೆಯಡಿ ನಿಮ್ಮ ದಾವೆಗೆ ಅಗತ್ಯವಾದ ನಿಖರ ಶುಲ್ಕವನ್ನು ಲೆಕ್ಕ ಹಾಕಿ.",
            "target_url": "/court-fee-calculator",
            "action_label": "Calculate Court Fee ↗",
            "action_label_kn": "ಶುಲ್ಕ ಲೆಕ್ಕ ಹಾಕಿ ↗",
            "badge": "Court Fees",
            "icon": "Scale"
        })

    # 5. Directory Locator Widget (only if substantive grievance or asking for court/police/DLSA location)
    if any(k in lowered for k in ["court", "station", "police station", "dlsa", "tlsc", "where", "location", "address", "phone", "contact", "office", "ಸ್ಥಳ", "ವಿಳಾಸ", "ಕಚೇರಿ"]) or _has_substantive_case_facts(text):
        widgets.append({
            "id": "action-directory",
            "type": "directory",
            "title": "Karnataka Legal Services Directory",
            "title_kn": "ಕರ್ನಾಟಕ ಕಾನೂನು ಸೇವೆಗಳ ನಿರ್ದೇಶಿಕೆ",
            "description": "Find your nearest DLSA office, Taluk Legal Services Committee (TLSC), or local police station.",
            "description_kn": "ನಿಮ್ಮ ತಾಲ್ಲೂಕಿನ ಕಾನೂನು ಸೇವಾ ಸಮಿತಿ (TLSC), ಡಿಎಲ್‌ಎಸ್‌ಎ ಅಥವಾ ಪೊಲೀಸ್ ಠಾಣೆಯ ವಿಳಾಸ ಮತ್ತು ದೂರವಾಣಿ ಸಂಖ್ಯೆ ಪಡೆಯಿರಿ.",
            "target_url": "/directory",
            "action_label": "Find Local Authority ↗",
            "action_label_kn": "ಸ್ಥಳೀಯ ಪ್ರಾಧಿಕಾರ ಹುಡುಕಿ ↗",
            "badge": "31 Districts",
            "icon": "Building2"
        })

    return widgets[:4]


def _compute_quick_diagnostic(text: str, category: str) -> Optional[Dict[str, Any]]:
    """
    Computes an instant Case Health Diagnostic Score:
    Evaluates factual clarity, evidence readiness, limitation risk, and next statutory steps.
    Returns None for casual greetings, general informational questions, or non-dispute messages.
    """
    if _is_greeting_or_casual(text) or not _has_substantive_case_facts(text):
        return None

    lowered = text.lower()
    word_count = len(text.split())

    # Strength calculation
    strength = 50
    if word_count > 40:
        strength += 15
    elif word_count > 15:
        strength += 10

    # Evidence readiness
    evidence = 35
    if any(k in lowered for k in ["receipt", "agreement", "message", "whatsapp", "photo", "cctv", "audio", "video", "paper", "document", "ದಾಖಲೆ", "ರಶೀದಿ"]):
        evidence += 35
        strength += 10

    # Limitation check
    limitation = "safe"
    if any(k in lowered for k in ["years ago", "5 years", "10 years", "long back", "ಹಿಂದೆ", "ವರ್ಷಗಳ"]):
        limitation = "warning"
        strength -= 15

    # Missing evidence based on category
    missing: List[str] = []
    if "tenant" in lowered or "rent" in lowered or "ಬಾಡಿಗೆ" in lowered:
        missing = ["Rental Agreement Copy", "Security Deposit Payment Receipt", "WhatsApp/SMS conversation history"]
        step = "Send a 15-day statutory Legal Notice to the landlord demanding deposit refund before approaching civil court."
        step_kn = "ಸಿವಿಲ್ ನ್ಯಾಯಾಲಯಕ್ಕೆ ಹೋಗುವ ಮುನ್ನ ೧೫ ದಿನಗಳ ಲೀಗಲ್ ನೋಟಿಸ್ ನೀಡಿ ಠೇವಣಿ ಮರುಪಾವತಿಗೆ ಆಗ್ರಹಿಸಿ."
    elif "police" in lowered or "theft" in lowered or "assault" in lowered or "crime" in lowered:
        missing = ["Written chronology of events", "CCTV / Photographic evidence", "Details of witnesses"]
        step = "Approach the jurisdictional SHO Station with a written complaint under Section 173 BNSS to register an FIR."
        step_kn = "ಬಿಎನ್‌ಎಸ್‌ಎಸ್ ಕಲಂ ೧೭೩ ರ ಅಡಿಯಲ್ಲಿ ಎಫ್‌ಐಆರ್ ದಾಖಲಿಸಲು ಲಿಖಿತ ದೂರನ್ನು ಠಾಣಾಧಿಕಾರಿಗೆ ಸಲ್ಲಿಸಿ."
    elif "land" in lowered or "property" in lowered or "ಜಮೀನು" in lowered:
        missing = ["Current RTC / Pahani extract", "Registered Sale Deed / Title", "Encumbrance Certificate (EC)"]
        step = "Obtain certified copies of RTC and mutation register extract from the Nadakacheri / Bhoomi portal."
        step_kn = "ನಾಡಕಚೇರಿ ಅಥವಾ ಭೂಮಿ ಪೋರ್ಟಲ್‌ನಿಂದ ಪಹಣಿ ಮತ್ತು ಖಾತೆ ಬದಲಾವಣೆ ದೃಢೀಕೃತ ಪ್ರತಿಗಳನ್ನು ಪಡೆದುಕೊಳ್ಳಿ."
    else:
        missing = ["Written evidence / receipts", "Names and contact details of witnesses"]
        step = "Gather relevant receipts and consult your local DLSA clinic for free legal evaluation."
        step_kn = "ದಾಖಲೆಗಳನ್ನು ಒಟ್ಟುಗೂಡಿಸಿ ನಿಮ್ಮ ತಾಲ್ಲೂಕಿನ ಡಿಎಲ್‌ಎಸ್‌ಎ ಕ್ಲಿನಿಕ್‌ನಲ್ಲಿ ಉಚಿತ ಕಾನೂನು ಸಮಾಲೋಚನೆ ಪಡೆಯಿರಿ."

    return {
        "strength_score": min(strength, 95),
        "evidence_readiness": min(evidence, 90),
        "limitation_risk": limitation,
        "missing_evidence": missing,
        "recommended_step": step,
        "recommended_step_kn": step_kn
    }


def _extract_quick_replies_and_live_draft(text: str, category: str) -> tuple[List[str], Optional[Dict[str, Any]]]:
    """
    Extracts dynamic 1-Tap Quick-Reply suggestion chips and real-time auto-drafting templates
    for the live Split-Screen Workspace (Plan A).
    """
    lowered = text.lower()
    
    # Tenancy / Deposit Dispute
    if "tenant" in lowered or "rent" in lowered or "deposit" in lowered or "ಬಾಡಿಗೆ" in lowered or "ಠೇವಣಿ" in lowered:
        replies = [
            "✓ Have signed 11-month agreement & UPI receipts",
            "✕ Verbal agreement only (paid cash)",
            "⚡ Landlord disconnected power or water supply"
        ]
        draft = {
            "doc_type": "15-day-demand-notice",
            "title": "15-Day Statutory Legal Demand Notice",
            "title_kn": "೧೫ ದಿನಗಳ ಲೀಗಲ್ ಡಿಮಾಂಡ್ ನೋಟಿಸ್",
            "court_level": "Court of Small Causes / Rent Controller",
            "estimated_court_fee": "₹2,500 (Karnataka Court Fees Act 1958)",
            "limitation": "3 Years (Article 22, Limitation Act 1963)",
            "merit_score": 78,
            "completion": 65,
            "preview_text": (
                "FORMAL DEMAND NOTICE UNDER SEC 106 T.P. ACT & KARNATAKA RENT ACT, 1999\n\n"
                "TO:\n[Landlord / Premises Owner, Bengaluru Urban, Karnataka]\n\n"
                "SUBJECT: Demand for immediate refund of withheld security deposit and damages for unlawful harassment.\n\n"
                "Sir/Madam,\n"
                "Under instructions from my client, I hereby state that you have unlawfully failed to refund the security deposit "
                "upon peaceful handover of the schedule residential premises. Take notice that under Section 27 and 34 of the "
                "Karnataka Rent Act, 1999, you are mandated to refund the deposit within 15 days of this notice, failing which "
                "proceedings under Order 37 of the CPC with 12% p.a. interest shall be instituted at your entire cost and peril."
            )
        }
        return replies, draft

    # Theft / Police / Crime
    if "theft" in lowered or "stolen" in lowered or "stole" in lowered or "rob" in lowered or "laptop" in lowered or "gold" in lowered or "ಕಳ್ಳತನ" in lowered:
        replies = [
            "📹 Have CCTV footage / suspect photos",
            "🧾 Have purchase bill / invoice / serial number",
            "👮 Police station refused to register FIR"
        ]
        draft = {
            "doc_type": "police-complaint-fir",
            "title": "Police Complaint for Immediate FIR Registration",
            "title_kn": "ಪೊಲೀಸ್ ದೂರು ಮತ್ತು ಎಫ್‌ಐಆರ್ ಅರ್ಜಿ",
            "court_level": "Station House Officer / JMFC Court",
            "estimated_court_fee": "Nil (Free under BNSS 2023)",
            "limitation": "Immediate / Within 3 Years",
            "merit_score": 82,
            "completion": 70,
            "preview_text": (
                "FORMAL COMPLAINT UNDER SECTION 173 BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023\n\n"
                "TO:\nThe Station House Officer (SHO),\n[Jurisdictional Police Station, Karnataka]\n\n"
                "SUBJECT: Registration of Zero FIR under Section 303 Bharatiya Nyaya Sanhita (BNS), 2023 for theft.\n\n"
                "Respected Officer,\n"
                "I am lodging this formal information regarding a cognizable offence of theft committed at the address mentioned above. "
                "The stolen articles, approximate value, and evidence are enclosed. As mandated by Section 173 BNSS, please register "
                "the FIR forthwith and furnish a certified copy free of cost."
            )
        }
        return replies, draft

    # Domestic Violence
    if "domestic" in lowered or "husband" in lowered or "dowry" in lowered or "cruelty" in lowered or "ಗೃಹ ಹಿಂಸೆ" in lowered or "ವರದಕ್ಷಿಣೆ" in lowered:
        replies = [
            "🚨 Need immediate police protection / 112 SOS",
            "🏠 Want residence and protection order",
            "💼 Need free DLSA woman advocate"
        ]
        draft = {
            "doc_type": "domestic-violence-application",
            "title": "Application for Protection & Residence Order",
            "title_kn": "ಮಹಿಳಾ ಸಂರಕ್ಷಣೆ ಮತ್ತು ವಾಸಸ್ಥಳ ಆದೇಶದ ಅರ್ಜಿ",
            "court_level": "Judicial Magistrate First Class (JMFC) / Family Court",
            "estimated_court_fee": "Nil (Exempted for Women)",
            "limitation": "Continuous Cause of Action",
            "merit_score": 85,
            "completion": 60,
            "preview_text": (
                "IN THE COURT OF THE JUDICIAL MAGISTRATE FIRST CLASS / METROPOLITAN MAGISTRATE\n\n"
                "APPLICATION UNDER SECTIONS 12, 18, 19 & 20 OF THE PROTECTION OF WOMEN FROM DOMESTIC VIOLENCE ACT, 2005\n\n"
                "In the matter of:\n[Aggrieved Woman / Applicant]  ... Petitioner\nVersus\n[Respondent Husband & Relatives]  ... Respondents\n\n"
                "The applicant respectfully submits that the respondents have subjected the applicant to physical cruelty, mental harassment, "
                "and unlawful dowry demands under Section 85 BNS 2023. Urgent Protection Orders under Section 18 and Residence Orders under Section 19 "
                "are prayed for."
            )
        }
        return replies, draft

    # Land / Revenue / RTC
    if "land" in lowered or "rtc" in lowered or "pahani" in lowered or "mutation" in lowered or "khata" in lowered or "ಜಮೀನು" in lowered or "ಪಹಣಿ" in lowered:
        replies = [
            "📄 Have Registered Sale Deed & current RTC",
            "🏛️ Village Accountant delayed mutation past 30 days",
            "⚖️ Disputed survey boundary / encroachment"
        ]
        draft = {
            "doc_type": "rtc-mutation-appeal",
            "title": "Representation for RTC Mutation & Khata Transfer",
            "title_kn": "ಪಹಣಿ ಮತ್ತು ಖಾತೆ ಬದಲಾವಣೆ ಮನವಿ ಅರ್ಜಿ",
            "court_level": "Tahsildar / Assistant Commissioner Revenue Court",
            "estimated_court_fee": "₹50 (Revenue Court Fee Stamp)",
            "limitation": "30 Days for Sakala / 60 Days for S.136 Appeal",
            "merit_score": 75,
            "completion": 65,
            "preview_text": (
                "BEFORE THE TAHSILDAR / ASSISTANT COMMISSIONER (REVENUE)\n\n"
                "APPLICATION UNDER SECTION 128 & 129 OF THE KARNATAKA LAND REVENUE ACT, 1964\n\n"
                "Applicant: [Title Holder / Khatedar]\nSchedule Land: Survey No. [XXX], Hobli, Taluk, Karnataka\n\n"
                "Subject: Application for updating mutation register extract and issuance of certified computerized Pahani (RTC).\n\n"
                "The applicant submits that the schedule property was lawfully acquired and reported under Section 128. "
                "As guaranteed under the Karnataka Sakala Services Act, 2011, the revenue authorities are requested to certify the mutation."
            )
        }
        return replies, draft

    return [
        "✓ I have written receipts and documents",
        "✕ No written proof (verbal transaction)",
        "🏛️ Need guidance on nearest court / police station"
    ], None


def route_chat_request(message: str, language: str, history: List[Dict[str, str]], db: Session) -> Dict[str, Any]:
    """
    Routes a chat request either to the CaseService (if a case number is detected)
    or to the enhanced LLM router with actionable widgets, statutory references,
    and diagnostic health assessment.
    """
    logger.info(f"Incoming chat message: '{message}'")
    
    # 1. Parse input to detect case numbers (e.g. CC/00042/2026)
    parsed_input = parse_user_input(message)
    
    if parsed_input["is_case_query"] and parsed_input["case_number"]:
        logger.info(f"Routing to CaseService for case: {parsed_input['case_number']}")
        
        case_svc = CaseService(db)
        case_details = case_svc.get_case_details(parsed_input["case_number"])
        district_param = case_details.get("district", "Bengaluru Urban")
        
        answer = (
            f"### 📋 eCourts Case Registry: `{case_details['case_number']}`\n\n"
            f"- **CNR Number**: `{case_details.get('cnr', 'N/A')}`\n"
            f"- **Court Establishment**: {case_details['court']}\n"
            f"- **Current Stage**: **`{case_details.get('stage', 'Hearing')}`**\n"
            f"- **Parties**: {case_details['petitioner']} **vs** {case_details['respondent']}\n"
            f"- **Filing Date**: {case_details['filing_date']}\n"
            f"- **Next Hearing**: **{case_details['next_hearing']}**\n"
            f"- **Coram (Judge)**: {case_details.get('coram', 'Judicial Officer')}\n\n"
            f"_{case_details['message']}_\n\n"
            f"You can view the full hearing diary, upload case documents, and track court orders directly in the Case Tracker."
        )
        action_widgets = [
            {
                "id": "action-view-case",
                "type": "case_tracker",
                "title": f"View Case Timeline ({case_details['case_number']})",
                "title_kn": f"ಪ್ರಕರಣದ ವಿವರ ವೀಕ್ಷಿಸಿ ({case_details['case_number']})",
                "description": f"Stage: {case_details.get('stage', 'Hearing')} | Next Date: {case_details['next_hearing']}",
                "description_kn": f"ಹಂತ: {case_details.get('stage', 'Hearing')} | ಮುಂದಿನ ವಿಚಾರಣೆ: {case_details['next_hearing']}",
                "target_url": f"/case-tracker?caseNumber={case_details['case_number']}&district={district_param}",
                "action_label": "Open Case Timeline ↗",
                "action_label_kn": "ಪ್ರಕರಣ ಪುಟ ತೆರೆಯಿರಿ ↗",
                "badge": "Active Case",
                "icon": "Scale"
            },
            {
                "id": "action-ecourts-link",
                "type": "directory",
                "title": "National eCourts Services Portal",
                "title_kn": "ರಾಷ್ಟ್ರೀಯ ಇ-ಕೋರ್ಟ್ಸ್ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ",
                "description": f"Official eCourts portal entry for CNR {case_details.get('cnr', case_details['case_number'])}",
                "description_kn": "ಸಿಎನ್‌ಆರ್ ಸಂಖ್ಯೆ ಅಥವಾ ಪಕ್ಷಗಾರರ ಹೆಸರಿನ ಮೂಲಕ ಪರಿಶೀಲಿಸಿ.",
                "target_url": case_details.get("external_link", "https://services.ecourts.gov.in/ecourtindia_v6/"),
                "action_label": "Visit eCourts Portal ↗",
                "action_label_kn": "ಇ-ಕೋರ್ಟ್ಸ್ ಭೇಟಿ ನೀಡಿ ↗",
                "badge": "eCourts Portal",
                "icon": "Building2"
            }
        ]
            
        return {
            "answer": answer,
            "provider": "system",
            "model": "case-tracker-module",
            "category": "case_tracking",
            "urgency": "normal",
            "disclaimer": LEGAL_DISCLAIMER,
            "action_widgets": action_widgets,
            "applicable_statutes": [
                {
                    "act": "Code of Civil Procedure, 1908 / BNSS 2023",
                    "section": "Cause Title & Registry Rules",
                    "summary": "Formal registration and tracking of pending suits before Karnataka District & Civil Courts.",
                    "summary_kn": "ಕರ್ನಾಟಕ ಸಿವಿಲ್ ಮತ್ತು ಜಿಲ್ಲಾ ನ್ಯಾಯಾಲಯಗಳಲ್ಲಿ ಪ್ರಕರಣ ದಾಖಲಾತಿ ಮತ್ತು ವಿಚಾರಣೆ ನಿಯಮಗಳು."
                }
            ],
            "diagnostic_score": None,
            "quick_replies": [
                f"Track hearing on {case_details['next_hearing']}",
                "How to apply for certified copy of order?",
                "Find DLSA office in this district"
            ],
            "live_draft": None
        }
        
    # 2. Standard AI legal assistance flow
    logger.info("Routing to LLM legal assistance router.")
    llm_router = get_llm_router()
    try:
        result = llm_router.legal_chat(message, language, history)
        # PRESERVE MARKDOWN! Do not strip '*', '#', or '='
        answer_text = result["text"]

        # Determine category & urgency
        is_casual = _is_greeting_or_casual(message)
        lowered = message.lower()
        category = "general"
        urgency = "normal"

        quick_replies = []
        live_draft = None

        if is_casual:
            action_widgets = []
            applicable_statutes = []
            diagnostic_score = None
        else:
            if any(w in lowered for w in ["suicide", "kill", "attack", "violence", "threat", "emergency", "danger"]):
                urgency = "emergency"
                category = "women_protection"
            elif any(w in lowered for w in ["domestic", "harassment", "dowry", "stalking", "cruelty", "wife", "husband"]):
                category = "women_protection"
                urgency = "high"
            elif any(w in lowered for w in ["police", "fir", "theft", "stolen", "fraud", "scam", "cyber", "crime"]):
                category = "criminal"
                urgency = "high"
            elif any(w in lowered for w in ["tenant", "landlord", "rent", "deposit", "evict", "property", "land", "rtc", "pahani"]):
                category = "property"
            elif any(w in lowered for w in ["consumer", "refund", "defective", "warranty"]):
                category = "consumer"
            elif any(w in lowered for w in ["wage", "salary", "job", "worker", "employment", "labour"]):
                category = "labour"

            # Generate contextual action cards & statutory references
            action_widgets = _extract_action_widgets(message, category, urgency, language)
            applicable_statutes = _extract_applicable_statutes(message, category)
            diagnostic_score = _compute_quick_diagnostic(message, category)
            quick_replies, live_draft = _extract_quick_replies_and_live_draft(message, category)

        return {
            "answer": answer_text,
            "provider": result["provider"],
            "model": result["model"],
            "category": category,
            "urgency": urgency,
            "disclaimer": LEGAL_DISCLAIMER,
            "action_widgets": action_widgets,
            "applicable_statutes": applicable_statutes,
            "diagnostic_score": diagnostic_score,
            "quick_replies": quick_replies,
            "live_draft": live_draft
        }
    except Exception as e:
        logger.error(f"LLM API error: {str(e)}")
        raise

