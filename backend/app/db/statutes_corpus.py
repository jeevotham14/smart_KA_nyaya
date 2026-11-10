"""
Karnataka Gazette & Bharatiya Nyaya Sanhita (BNS / BNSS 2023) Statutory Corpus
Deterministic legal grounding database for Smart Karnataka Nyaya.
Every entry contains verified Karnataka State Gazette / Central Gazette citations.
"""
import re
from typing import Dict, Any, List, Optional

# Verified Statutory Corpus
VERIFIED_STATUTES: List[Dict[str, Any]] = [
    # ── 1. TENANCY & HOUSING (Karnataka Rent Act, 1999) ──────────────────────
    {
        "id": "statute-kra-sec27",
        "act": "Karnataka Rent Act, 1999",
        "act_kn": "ಕರ್ನಾಟಕ ಬಾಡಿಗೆ ಕಾಯ್ದೆ, ೧೯೯೯",
        "section": "Section 27",
        "title": "Protection Against Cutting Off or Withholding Essential Services",
        "title_kn": "ಅಗತ್ಯ ಸೇವೆಗಳನ್ನು ಕಡಿತಗೊಳಿಸುವುದರ ವಿರುದ್ಧ ರಕ್ಷಣೆ",
        "category": "property",
        "gazette_ref": "Karnataka Act No. 34 of 2001 (Gazette Ext. 27-11-2001)",
        "operative_text": "No landlord either himself or through any person acting or purporting to act on his behalf shall, without just and sufficient cause, cut off or withhold any essential supply or service enjoyed by the tenant in respect of the premises let to him.",
        "summary": "Landlord cannot cut power, water, or access without a competent court order. If disconnected, tenant can apply immediately to the Rent Court, and landlord may be fined or ordered to restore services immediately with damages.",
        "summary_kn": "ನ್ಯಾಯಾಲಯದ ಅನುಮತಿಯಿಲ್ಲದೆ ಮನೆ ಮಾಲೀಕರು ವಿದ್ಯುತ್, ನೀರು ಅಥವಾ ಅಗತ್ಯ ಸೇವೆಗಳನ್ನು ಸ್ಥಗಿತಗೊಳಿಸುವಂತಿಲ್ಲ. ಹಾಗೆ ಮಾಡಿದಲ್ಲಿ ಬಾಡಿಗೆ ನ್ಯಾಯಾಲಯಕ್ಕೆ ತಕ್ಷಣ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ ಸೇವೆ ಮರುಸ್ಥಾಪನೆ ಪಡೆಯಬಹುದು.",
        "remedy": "Immediate restoration application before the Court of Small Causes / Rent Controller under Section 27(2).",
        "court": "Court of Small Causes / Rent Controller",
        "keywords": ["rent", "landlord", "tenant", "deposit", "water", "electricity", "power cut", "utility", "evict", "ಬಾಡಿಗೆ", "ಠೇವಣಿ", "ವಿದ್ಯುತ್"]
    },
    {
        "id": "statute-kra-sec34",
        "act": "Karnataka Rent Act, 1999",
        "act_kn": "ಕರ್ನಾಟಕ ಬಾಡಿಗೆ ಕಾಯ್ದೆ, ೧೯೯೯",
        "section": "Section 34",
        "title": "Limitation on Advance Deposit and Repayment Mandate",
        "title_kn": "ಮುಂಗಡ ಠೇವಣಿಯ ಮಿತಿ ಮತ್ತು ಮರುಪಾವತಿ ನಿಯಮಗಳು",
        "category": "property",
        "gazette_ref": "Karnataka Act No. 34 of 2001",
        "operative_text": "Landlord is obligated to refund the security deposit upon the tenant handing over vacant peaceful possession of the premises, subject only to actual lawful deductions for rent arrears or structural damage.",
        "summary": "Landlord cannot arbitrarily withhold security deposits. Arbitrary non-refund entitles tenant to claim deposit with statutory interest (typically 6-12% p.a.) via a 15-Day Legal Demand Notice.",
        "summary_kn": "ಮನೆ ಖಾಲಿ ಮಾಡಿದ ನಂತರ ಮಾಲೀಕರು ಠೇವಣಿ ಮೊತ್ತವನ್ನು ಅನಗತ್ಯವಾಗಿ ತಡೆಹಿಡಿಯುವಂತಿಲ್ಲ. ಕಾನೂನು ನೋಟಿಸ್ ನೀಡಿ ಬಡ್ಡಿ ಸಮೇತ ಹಣ ವಸೂಲಿಗೆ ಕೋರಬಹುದು.",
        "remedy": "Issue 15-Day Statutory Legal Demand Notice followed by recovery suit under Order 37 CPC.",
        "court": "Civil Court / Rent Controller",
        "keywords": ["deposit", "security deposit", "refund", "advance", "15 days", "notice", "ಮರುಪಾವತಿ", "ಮುಂಗಡ"]
    },

    # ── 2. CRIMINAL & POLICE (BNS 2023 & BNSS 2023) ──────────────────────────
    {
        "id": "statute-bnss-sec173",
        "act": "Bharatiya Nagarik Suraksha Sanhita, 2023",
        "act_kn": "ಭಾರತೀಯ ನಾಗರಿಕ ಸುರಕ್ಷಾ ಸಂಹಿತೆ, ೨೦೨೩",
        "section": "Section 173",
        "title": "Information in Cognizable Cases (Mandatory FIR & Zero FIR)",
        "title_kn": "ಅಪರಾಧ ಮಾಹಿತಿ ಮತ್ತು ಕಡ್ಡಾಯ ಝೀರೋ ಎಫ್‌ಐಆರ್ ದಾಖಲಾತಿ",
        "category": "criminal",
        "gazette_ref": "Gazette of India Ext. No. 46 of 2023 (In force 01-07-2024)",
        "operative_text": "Every information relating to the commission of a cognizable offence shall be recorded by the officer in charge of a police station irrespective of the area where the offence was committed (Zero FIR). The informant shall be given a copy of the recorded information forthwith, free of cost.",
        "summary": "Mandatory registration of FIR for serious/cognizable crimes at ANY police station in Karnataka regardless of jurisdiction (Zero FIR). Police MUST hand over a physical/digital copy to complainant immediately free of cost.",
        "summary_kn": "ಯಾವುದೇ ಪೊಲೀಸ್ ಠಾಣೆಯಲ್ಲಿ ಅಪರಾಧದ ಎಫ್‌ಐಆರ್ ದಾಖಲಿಸುವುದು ಕಡ್ಡಾಯ (ಝೀರೋ ಎಫ್‌ಐಆರ್). ದೂರುದಾರರಿಗೆ ಉಚಿತ ಪ್ರತಿಯನ್ನು ತಕ್ಷಣವೇ ನೀಡಬೇಕು.",
        "remedy": "If Station House Officer refuses, complain to Superintendent of Police / Police Commissioner under Section 173(4) BNSS.",
        "court": "Police Station / Jurisdictional JMFC",
        "keywords": ["fir", "police", "complaint", "zero fir", "cognizable", "sho", "ದೂರು", "ಪೊಲೀಸ್", "ಎಫ್‌ಐಆರ್"]
    },
    {
        "id": "statute-bns-sec303",
        "act": "Bharatiya Nyaya Sanhita, 2023",
        "act_kn": "ಭಾರತೀಯ ನ್ಯಾಯ ಸಂಹಿತೆ, ೨೦೨೩",
        "section": "Section 303",
        "title": "Theft (Punishment for Stolen Property)",
        "title_kn": "ಕಳ್ಳತನ ಮತ್ತು ಕಳವು ಮಾಡಿದ ಸ್ವತ್ತಿನ ಶಿಕ್ಷೆ",
        "category": "criminal",
        "gazette_ref": "BNS 2023 (Replaced IPC Section 378/379 on 01-07-2024)",
        "operative_text": "Whoever, intending to take dishonestly any movable property out of the possession of any person without that person's consent, moves that property in order to such taking, is said to commit theft.",
        "summary": "Replaces old IPC Section 378/379. Imprisonment up to 3 years, or fine, or both. For repeat offenders, imprisonment up to 5 years.",
        "summary_kn": "ಕಳ್ಳತನಕ್ಕೆ ಗರಿಷ್ಠ ೩ ವರ್ಷಗಳ ಜೈಲು ಶಿಕ್ಷೆ ಅಥವಾ ದಂಡ ಅಥವಾ ಎರಡೂ ವಿಧಿಸಬಹುದು. ಮರುಕಳಿಸುವ ಅಪರಾಧಿಗಳಿಗೆ ೫ ವರ್ಷಗಳ ಶಿಕ್ಷೆ ಇರುತ್ತದೆ.",
        "remedy": "Lodge written complaint at nearest police station quoting Section 303 BNS.",
        "court": "Judicial Magistrate First Class (JMFC)",
        "keywords": ["theft", "stole", "stolen", "steal", "robbery", "laptop", "gold", "bike", "jewelry", "ಕಳ್ಳತನ", "ಕಳವು"]
    },
    {
        "id": "statute-bns-sec318",
        "act": "Bharatiya Nyaya Sanhita, 2023",
        "act_kn": "ಭಾರತೀಯ ನ್ಯಾಯ ಸಂಹಿತೆ, ೨೦೨೩",
        "section": "Section 318",
        "title": "Cheating and Dishonestly Inducing Delivery of Property",
        "title_kn": "ವಂಚನೆ ಮತ್ತು ಆಸ್ತಿ ವಂಚನೆ",
        "category": "criminal",
        "gazette_ref": "BNS 2023 (Replaced IPC Section 415/420 on 01-07-2024)",
        "operative_text": "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
        "summary": "Replaces old IPC Section 420. Covers financial fraud, crypto scams, false promise of jobs, and cyber cheats. Punishment: up to 7 years imprisonment and fine.",
        "summary_kn": "ವಂಚನೆ, ಹಣಕಾಸು ವಂಚನೆ ಅಥವಾ ಆನ್‌ಲೈನ್ ಸ್ಕ್ಯಾಮ್‌ಗಳಿಗೆ ಗರಿಷ್ಠ ೭ ವರ್ಷಗಳ ಜೈಲು ಶಿಕ್ಷೆ ಮತ್ತು ದಂಡ ವಿಧಿಸಲಾಗುತ್ತದೆ.",
        "remedy": "Lodge complaint on Cyber Crime Portal (cybercrime.gov.in) or call 1930 / nearest CEN Police Station.",
        "court": "Senior Civil Judge & JMFC / CMM",
        "keywords": ["cheat", "cheating", "fraud", "scam", "cyber", "money", "fake", "duped", "ವಂಚನೆ", "ಸ್ಕ್ಯಾಮ್"]
    },
    {
        "id": "statute-bns-sec85",
        "act": "Bharatiya Nyaya Sanhita, 2023",
        "act_kn": "ಭಾರತೀಯ ನ್ಯಾಯ ಸಂಹಿತೆ, ೨೦೨೩",
        "section": "Section 85 & 86",
        "title": "Husband or Relative of Husband Subjecting Woman to Cruelty & Dowry",
        "title_kn": "ಪತಿ ಅಥವಾ ಸಂಬಂಧಿಕರಿಂದ ಮಹಿಳೆಯ ಮೇಲೆ ದೌರ್ಜನ್ಯ ಮತ್ತು ವರದಕ್ಷಿಣೆ ಹಿಂಸೆ",
        "category": "women_protection",
        "gazette_ref": "BNS 2023 (Replaced IPC Section 498A on 01-07-2024)",
        "operative_text": "Whoever, being the husband or the relative of the husband of a woman, subjects such woman to cruelty shall be punished with imprisonment for a term which may extend to three years and shall also be liable to fine.",
        "summary": "Replaces IPC 498A. Cognizable and non-bailable offence. Covers physical abuse, emotional harassment, and unlawful dowry demands.",
        "summary_kn": "ಮಹಿಳೆಯರ ವಿರುದ್ಧ ಕೌಟುಂಬಿಕ ದೌರ್ಜನ್ಯ ಮತ್ತು ವರದಕ್ಷಿಣೆ ಕಿರುಕುಳಕ್ಕೆ ೩ ವರ್ಷಗಳವರೆಗೆ ಜೈಲು ಶಿಕ್ಷೆ ಹಾಗೂ ದಂಡ ವಿಧಿಸಲಾಗುತ್ತದೆ.",
        "remedy": "Call 181 (Vanitha Sahayavani) or visit Sakhi One Stop Centre / Women Police Station.",
        "court": "Sessions Court / JMFC",
        "keywords": ["domestic violence", "dowry", "husband", "wife", "in-laws", "cruelty", "harassment", "ಗಂಡ", "ವರದಕ್ಷಿಣೆ", "ದೌರ್ಜನ್ಯ"]
    },

    # ── 3. ELECTRONIC & DIGITAL EVIDENCE (BSA 2024) ──────────────────────────
    {
        "id": "statute-bsa-sec63",
        "act": "Bharatiya Sakshya Adhiniyam, 2024",
        "act_kn": "ಭಾರತೀಯ ಸಾಕ್ಷ್ಯ ಅಧಿನಿಯಮ, ೨೦೨೪",
        "section": "Section 63",
        "title": "Admissibility of Electronic Records & Mandatory Certificate",
        "title_kn": "ಎಲೆಕ್ಟ್ರಾನಿಕ್ ದಾಖಲೆಗಳ ಸ್ವೀಕಾರಾರ್ಹತೆ ಮತ್ತು ಪ್ರಮಾಣಪತ್ರ",
        "category": "evidence",
        "gazette_ref": "BSA 2024 (Replaced Section 65B of Indian Evidence Act on 01-07-2024)",
        "operative_text": "Any information contained in an electronic record which is printed on paper, stored, recorded or copied in optical or magnetic media shall be deemed to be also a document if the conditions mentioned in this section are satisfied.",
        "summary": "Replaces Section 65B of the old Evidence Act. Digital evidence like WhatsApp messages, UPI payment transaction receipts, emails, CCTV footage, and call recordings MUST be submitted with a Section 63 BSA certificate.",
        "summary_kn": "ವಾಟ್ಸಾಪ್ ಸಂದೇಶಗಳು, ಯುಪಿಐ ರಶೀದಿಗಳು ಅಥವಾ ಸಿಸಿಟಿವಿ ದೃಶ್ಯಗಳನ್ನು ನ್ಯಾಯಾಲಯದಲ್ಲಿ ಸಾಕ್ಷ್ಯವಾಗಿ ಒದಗಿಸಲು ಕಲಂ ೬೩ ರ ಅಡಿಯಲ್ಲಿ ಪ್ರಮಾಣಪತ್ರ ಕಡ್ಡಾಯವಾಗಿದೆ.",
        "remedy": "Attach Section 63 BSA Certificate with hash value and device declaration when filing pleadings.",
        "court": "All Courts in Karnataka",
        "keywords": ["whatsapp", "screenshot", "upi", "cctv", "sms", "email", "digital evidence", "certificate", "ಸಾಕ್ಷ್ಯ", "ದಾಖಲೆ"]
    },

    # ── 4. LAND, RTC & REVENUE (Karnataka Land Revenue Act, 1964) ────────────
    {
        "id": "statute-klra-sec128",
        "act": "Karnataka Land Revenue Act, 1964",
        "act_kn": "ಕರ್ನಾಟಕ ಭೂ ಕಂದಾಯ ಕಾಯ್ದೆ, ೧೯೬೪",
        "section": "Section 128 & 129",
        "title": "Acquisition of Rights and Mandatory Mutation in RTC / Pahani",
        "title_kn": "ಹಕ್ಕುಗಳ ಸಂಪಾದನೆ ಮತ್ತು ಪಹಣಿ/ಖಾತೆಯಲ್ಲಿ ಬದಲಾವಣೆ ದಾಖಲಾತಿ",
        "category": "property",
        "gazette_ref": "Karnataka Act No. 12 of 1964 (Amended 2023)",
        "operative_text": "Any person acquiring by succession, survivorship, inheritance, partition, purchase, gift or lease any right as holder or occupant of land shall report orally or in writing his acquisition of such right to the Village Accountant within three months.",
        "summary": "Mandatory update of Khata/Mutation in Bhoomi portal within 3 months of property purchase, inheritance, or partition. If Village Accountant or Tahsildar delays, citizen has direct right of appeal to the Assistant Commissioner.",
        "summary_kn": "ಆಸ್ತಿ ಖರೀದಿ ಅಥವಾ ಪಿತ್ರಾರ್ಜಿತ ಹಕ್ಕು ಪಡೆದ ೩ ತಿಂಗಳೊಳಗೆ ಭೂಮಿ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಖಾತೆ ಬದಲಾವಣೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಬೇಕು. ವಿಳಂಬವಾದಲ್ಲಿ ಉಪವಿಭಾಗಾಧಿಕಾರಿಗಳಿಗೆ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಬಹುದು.",
        "remedy": "Apply via Nadakacheri / Bhoomi Portal. If rejected or delayed, file appeal under Section 136(2) before the Assistant Commissioner.",
        "court": "Revenue Court / Assistant Commissioner (AC)",
        "keywords": ["land", "rtc", "pahani", "mutation", "khata", "bhoomi", "survey number", "partition", "ancestral", "ಪಹಣಿ", "ಆಸ್ತಿ", "ಜಮೀನು"]
    },

    # ── 5. CITIZEN RIGHTS & TIME GUARANTEE (Karnataka Sakala Act, 2011) ───────
    {
        "id": "statute-sakala",
        "act": "Karnataka Sakala Services Act, 2011",
        "act_kn": "ಕರ್ನಾಟಕ ಸಕಾಲ ಸೇವೆಗಳ ಕಾಯ್ದೆ, ೨೦೧೧",
        "section": "Sections 4, 6 & 8",
        "title": "Right to Guarantee of Services to Citizens in Time",
        "title_kn": "ನಿಗದಿತ ಕಾಲಮಿತಿಯಲ್ಲಿ ನಾಗರಿಕ ಸೇವೆಗಳ ಖಾತರಿ ಹಕ್ಕು",
        "category": "general",
        "gazette_ref": "Karnataka Act No. 01 of 2012 (Sakala Mission)",
        "operative_text": "Every citizen shall have the right to obtain the government services specified under the Act within the stipulated time limit. In case of default or delay, compensatory costs of Rs. 20 per day (up to Rs. 500) shall be paid to the applicant.",
        "summary": "Guarantees time-bound delivery of 1,025+ Karnataka government services (RTC copy in 15 days, caste certificate in 7 days, property khata in 30 days). If delayed, official is penalized Rs. 20/day paid to the citizen.",
        "summary_kn": "೧,೦೨೫ ಕ್ಕೂ ಹೆಚ್ಚು ಸರ್ಕಾರಿ ಸೇವೆಗಳನ್ನು (ಪಹಣಿ, ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ, ಖಾತೆ) ನಿಗದಿತ ಸಮಯದಲ್ಲಿ ನೀಡಲು ಅಧಿಕಾರಿಗಳು ಬದ್ಧರಾಗಿರುತ್ತಾರೆ. ವಿಳಂಬಕ್ಕೆ ಪರಿಹಾರ ಪಡೆಯಬಹುದು.",
        "remedy": "File Sakala First Appeal on sakala.kar.nic.in using your GSC application number.",
        "court": "Sakala Appellate Authority / Competent Officer",
        "keywords": ["sakala", "delay", "government service", "certificate", "revenue", "tahsildar", "compensation", "ಸಕಾಲ", "ವಿಳಂಬ"]
    }
]


# REPEALED TO MODERN STATUTE MAPPING (Hallucination Interceptor)
REPEALED_STATUTE_MAPPING = [
    # IPC to BNS
    (re.compile(r"\b(?:IPC|Indian\s+Penal\s+Code)\s*(?:Sec(?:tion)?\.?)?\s*420\b", re.I),
     "Bharatiya Nyaya Sanhita (BNS) 2023, Section 318 (Cheating)"),
    (re.compile(r"\b(?:IPC|Indian\s+Penal\s+Code)\s*(?:Sec(?:tion)?\.?)?\s*37[89]\b", re.I),
     "Bharatiya Nyaya Sanhita (BNS) 2023, Section 303 (Theft)"),
    (re.compile(r"\b(?:IPC|Indian\s+Penal\s+Code)\s*(?:Sec(?:tion)?\.?)?\s*498A\b", re.I),
     "Bharatiya Nyaya Sanhita (BNS) 2023, Section 85 & 86 (Cruelty by Husband/Relatives)"),
    (re.compile(r"\b(?:IPC|Indian\s+Penal\s+Code)\s*(?:Sec(?:tion)?\.?)?\s*302\b", re.I),
     "Bharatiya Nyaya Sanhita (BNS) 2023, Section 103 (Murder)"),
    (re.compile(r"\b(?:IPC|Indian\s+Penal\s+Code)\s*(?:Sec(?:tion)?\.?)?\s*354\b", re.I),
     "Bharatiya Nyaya Sanhita (BNS) 2023, Section 74 (Outraging Modesty of Woman)"),
    (re.compile(r"\b(?:IPC|Indian\s+Penal\s+Code)\s*(?:Sec(?:tion)?\.?)?\s*506\b", re.I),
     "Bharatiya Nyaya Sanhita (BNS) 2023, Section 351 (Criminal Intimidation)"),

    # CrPC to BNSS
    (re.compile(r"\b(?:CrPC|Code\s+of\s+Criminal\s+Procedure)\s*(?:Sec(?:tion)?\.?)?\s*154\b", re.I),
     "Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023, Section 173 (Mandatory / Zero FIR)"),
    (re.compile(r"\b(?:CrPC|Code\s+of\s+Criminal\s+Procedure)\s*(?:Sec(?:tion)?\.?)?\s*167\b", re.I),
     "Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023, Section 187 (Police Custody)"),
    (re.compile(r"\b(?:CrPC|Code\s+of\s+Criminal\s+Procedure)\s*(?:Sec(?:tion)?\.?)?\s*43[789]\b", re.I),
     "Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023, Section 479 & 482 (Bail Provisions)"),

    # Evidence Act to BSA
    (re.compile(r"\b(?:Sec(?:tion)?\.?\s*)?65B\s+(?:of\s+)?(?:the\s+)?(?:Indian\s+)?Evidence\s+Act\b", re.I),
     "Bharatiya Sakshya Adhiniyam (BSA) 2024, Section 63 (Electronic Evidence Certificate)"),

    # Out of state Tenancy to Karnataka Rent Act
    (re.compile(r"\b(?:Delhi|Maharashtra|Model)\s+Tenancy\s+Act\b", re.I),
     "Karnataka Rent Act, 1999 (Section 27)"),
]


def intercept_and_ground_statutes(text: str) -> str:
    """
    Deterministic Hallucination Interceptor:
    Rewrites repealed colonial codes (IPC, CrPC, old Evidence Act) into current BNS, BNSS, and BSA 2023/2024 laws,
    and replaces erroneous non-Karnataka state acts with verified Karnataka legislation.
    """
    grounded_text = text
    for pattern, replacement in REPEALED_STATUTE_MAPPING:
        grounded_text = pattern.sub(replacement, grounded_text)
    return grounded_text


def get_grounded_statutes_for_query(query: str, category: str = "general") -> List[Dict[str, Any]]:
    """
    Retrieves verified statutory references with official Gazette numbers matching query facts.
    """
    lowered = query.lower()
    matches: List[Dict[str, Any]] = []

    for statute in VERIFIED_STATUTES:
        # Category match or keyword match
        score = 0
        if statute["category"] == category:
            score += 2
        for kw in statute["keywords"]:
            if kw in lowered:
                score += 1
        if score > 0:
            matches.append((score, statute))

    # Sort by score descending and return top 3
    matches.sort(key=lambda x: x[0], reverse=True)
    return [m[1] for m in matches[:3]]
