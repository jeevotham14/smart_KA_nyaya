from dataclasses import dataclass

LEGAL_DISCLAIMER = (
    "This is legal information only and is not a substitute for advice from a qualified advocate. "
    "For official legal action, consult an advocate, DLSA, TLSC, or appropriate authority."
)


@dataclass
class Classification:
    language: str
    category: str
    urgency_level: str
    sections: list[str]
    facts: list[str]


class LegalFactExtractionAgent:
    def run(self, text: str, language: str = "English") -> Classification:
        lowered = text.lower()
        category = "general"
        urgency = "normal"
        sections = ["Constitution of India Article 39A"]
        if any(word in lowered for word in ["violence", "harassment", "stalking", "dowry", "threat"]):
            category = "women_protection"
            urgency = "high"
            sections = ["BNS provisions on assault/criminal intimidation", "Protection of Women from Domestic Violence Act"]
        elif any(word in lowered for word in ["land", "property", "tenant", "rent"]):
            category = "property"
            sections = ["Transfer of Property Act", "Karnataka Land Revenue Act"]
        elif any(word in lowered for word in ["wage", "salary", "job", "labour", "worker"]):
            category = "labour"
            sections = ["Industrial Disputes Act", "Code on Wages"]
        elif any(word in lowered for word in ["fir", "police", "crime", "theft"]):
            category = "criminal"
            urgency = "high"
            sections = ["Bharatiya Nagarik Suraksha Sanhita", "Bharatiya Nyaya Sanhita"]
        facts = [sentence.strip() for sentence in text.replace("\n", " ").split(".") if sentence.strip()][:5]
        return Classification(language=language, category=category, urgency_level=urgency, sections=sections, facts=facts)


class RagRetrievalAgent:
    def run(self, query: str, top_k: int = 3) -> dict:
        return {
            "statutes": [
                {"act_name": "Legal Services Authorities Act", "section_number": "12", "summary": "Eligibility categories for free legal services."},
                {"act_name": "Karnataka State Legal Services Authority", "section_number": "DLSA/TLSC", "summary": "District and taluk level legal aid access."},
            ][:top_k],
            "precedents": [
                {
                    "title": "Mock Karnataka High Court legal aid reference",
                    "court": "Karnataka High Court",
                    "year": 2024,
                    "summary": "Illustrative precedent placeholder until Indian Kanoon or curated judgment ingestion is enabled.",
                }
            ][:top_k],
            "retrieval_mode": "mock_pgvector_ready",
        }


class LegalGuidanceAgent:
    def run(self, text: str, classification: Classification) -> dict:
        steps = [
            "Write a clear chronology of events with dates, places, and people involved.",
            "Preserve documents, messages, photographs, receipts, notices, and witness details.",
            "Approach the relevant Karnataka authority, DLSA/TLSC, police, court, or department based on urgency.",
        ]
        if classification.category == "women_protection":
            steps.insert(0, "If there is immediate danger, call 112. For women support, call 181; for child safety, call 1098.")
        return {
            "answer": (
                f"Your issue appears to fall under {classification.category.replace('_', ' ')} with "
                f"{classification.urgency_level} urgency. Possible legal references include "
                f"{', '.join(classification.sections)}. {LEGAL_DISCLAIMER}"
            ),
            "steps": steps,
            "classification": classification.__dict__,
        }


# ── Section 12 Legal Services Authorities Act 1987 ─────────────────────────
# Categories that are automatically eligible regardless of income.
_AUTO_ELIGIBLE_CATEGORIES = {
    "sc/st", "sc", "st",
    "women",
    "child",          # person under 18
    "disability", "person with disability", "pwd",
    "transgender",
    "trafficking victim", "bonded labour",
    "industrial workmen", "workmen",
    "disaster victim", "communal violence victim",
    "person in custody", "custody",
    "senior citizen",
    "ex-serviceman", "ex-servicemen",
    "freedom fighter",
    "hiv", "aids", "hiv/aids",
    "minority",       # Karnataka DLSA extends to minorities in practice
}

_SECTION_12_COVERS = (
    "Free legal aid under Section 12 of the Legal Services Authorities Act, 1987 covers: "
    "services of a panel advocate, payment of court fees and process fees, preparation of documents, "
    "printing of paper books and translated copies of judgments, and other incidental expenses."
)

_DLSA_ALTERNATE_PATHS = [
    "Approach the nearest Lok Adalat for out-of-court settlement — no court fees payable on settlement.",
    "Visit the District Legal Services Authority (DLSA) legal aid clinic — free walk-in consultations.",
    "Contact an empanelled NGO legal aid clinic in your district.",
    "File an online application at nalsa.gov.in for National Legal Services Authority assistance.",
]


class LegalAidAgent:
    """
    Implements the Section 12 Legal Services Authorities Act 1987 eligibility check.

    Logic:
    1. If the applicant belongs to an auto-eligible category → ELIGIBLE (no income check).
    2. If General category AND income <= income_limit → ELIGIBLE.
    3. Otherwise → NOT ELIGIBLE via DLSA route; provide alternate paths.
    """

    def check(self, payload, income_limit: int = 300000) -> dict:
        reasons = []
        ineligible_reasons = []
        category_match = False

        # Normalise inputs
        gender = (payload.gender or "").strip().lower()
        category = (payload.category or "").strip().lower()
        annual_income = payload.annual_income  # int or None
        disability = getattr(payload, "disability", False)
        is_child = getattr(payload, "is_child", False)
        is_senior_citizen = getattr(payload, "is_senior_citizen", False)
        is_transgender = getattr(payload, "is_transgender", False)
        is_ex_serviceman = getattr(payload, "is_ex_serviceman", False)
        is_freedom_fighter = getattr(payload, "is_freedom_fighter", False)
        is_hiv_affected = getattr(payload, "is_hiv_affected", False)
        is_industrial_workmen = getattr(payload, "is_industrial_workmen", False)
        in_custody = getattr(payload, "in_custody", False)
        trafficking_victim = getattr(payload, "trafficking_victim", False)
        case_type = (getattr(payload, "case_type", "") or "").lower()

        # ── Step 1: Check auto-eligible categories ──────────────────────────

        # Women (automatic — Section 12(c))
        if gender == "female":
            reasons.append("Women are automatically eligible for free legal aid (Section 12(c), Legal Services Authorities Act 1987).")
            category_match = True

        # SC/ST (automatic — Section 12(a))
        if category in {"sc/st", "sc", "st"}:
            reasons.append("Persons belonging to SC/ST communities are automatically eligible (Section 12(a)).")
            category_match = True

        # Disability (automatic — Section 12(d))
        if disability:
            reasons.append("Persons with disabilities are automatically eligible (Section 12(d)).")
            category_match = True

        # Child (automatic — Section 12(e))
        if is_child or "child" in category:
            reasons.append("Children (persons under 18) are automatically eligible (Section 12(e)).")
            category_match = True

        # Senior citizen (automatic — KSLSA guidelines, Section 12(h))
        if is_senior_citizen or "senior" in category:
            reasons.append("Senior citizens are automatically eligible under KSLSA guidelines.")
            category_match = True

        # Transgender (automatic — Section 12(h) as amended)
        if is_transgender or "transgender" in category:
            reasons.append("Transgender persons are automatically eligible (Section 12(h)).")
            category_match = True

        # Ex-serviceman
        if is_ex_serviceman or "ex-serviceman" in category or "ex-servicemen" in category:
            reasons.append("Ex-servicemen are automatically eligible (Section 12(h)).")
            category_match = True

        # Freedom fighter
        if is_freedom_fighter or "freedom fighter" in category:
            reasons.append("Freedom fighters are automatically eligible (Section 12(h)).")
            category_match = True

        # HIV/AIDS
        if is_hiv_affected or "hiv" in category or "aids" in category:
            reasons.append("Persons affected by HIV/AIDS are automatically eligible (Section 12(h)).")
            category_match = True

        # Industrial workmen
        if is_industrial_workmen or "workmen" in category or "industrial" in category:
            reasons.append("Industrial workmen are automatically eligible (Section 12(g)).")
            category_match = True

        # Person in custody
        if in_custody or "custody" in category:
            reasons.append("Persons in custody or under detention are automatically eligible (Section 12(f)).")
            category_match = True

        # Trafficking / bonded labour
        if trafficking_victim or "trafficking" in category or "bonded" in category:
            reasons.append("Victims of trafficking and bonded labour are automatically eligible (Section 12(h)).")
            category_match = True

        # Domestic violence case type
        if "domestic" in case_type or "violence" in case_type:
            reasons.append("Domestic violence matters are prioritised for legal aid support.")
            category_match = True

        # ── Step 2: If not auto-eligible, check income ──────────────────────
        income_match = False
        if not category_match:
            if annual_income is not None:
                if annual_income <= income_limit:
                    income_match = True
                    reasons.append(
                        f"Annual income (Rs. {annual_income:,}) is within the Karnataka DLSA threshold "
                        f"of Rs. {income_limit:,} per year."
                    )
                else:
                    ineligible_reasons.append(
                        f"Annual income (Rs. {annual_income:,}) exceeds the Karnataka DLSA threshold "
                        f"of Rs. {income_limit:,} per year."
                    )
            else:
                ineligible_reasons.append(
                    "Income information is required for 'General' category applicants. "
                    "Please visit your nearest DLSA for a means test."
                )

        eligible = bool(reasons)

        result = {
            "eligible": eligible,
            "category_match": category_match,
            "income_match": income_match,
            "reason": "; ".join(reasons) if reasons else "; ".join(ineligible_reasons) if ineligible_reasons else "Not eligible under current criteria.",
            "reason_list": reasons if reasons else ineligible_reasons,
            "disclaimer": "Eligibility is indicative only and does not guarantee DLSA/TLSC approval. Final determination is made by the DLSA officer.",
            "what_it_covers": _SECTION_12_COVERS,
            "alternate_paths": _DLSA_ALTERNATE_PATHS if not eligible else [],
        }

        return result


class DocumentGenerationAgent:
    """Generates structured legal document drafts."""

    def run(self, doc_type: str, facts: dict) -> dict:
        name = facts.get("name", "Applicant")
        issue = facts.get("issue", "the matter described")
        authority = facts.get("authority", "the Concerned Authority")
        district = facts.get("district", "Karnataka")
        date = facts.get("issue_date", "recent date")
        relief = facts.get("relief", "appropriate relief")

        content = (
            f"TO,\nThe {authority},\n{district}, Karnataka.\n\n"
            f"SUBJECT: {doc_type.upper()} — {issue.upper()[:60]}\n\n"
            f"Respected Sir/Madam,\n\n"
            f"I, {name}, resident of {district}, Karnataka, respectfully submit this {doc_type} "
            f"in connection with {issue} which occurred on {date}.\n\n"
            f"I pray that the Honourable Authority may be pleased to grant {relief}.\n\n"
            f"Yours faithfully,\n{name}\nDate: {date}"
        )

        return {
            "content_text": content,
            "format_compliant": True,
            "doc_type": doc_type,
        }


class WomenProtectionAgent:
    """Specialized agent for emergency safety guidance and Sakhi/police center routing."""

    def run(self, text: str) -> dict:
        return {
            "emergency_numbers": [
                {"name": "Emergency Unified", "number": "112"},
                {"name": "Women Helpline", "number": "181"},
                {"name": "Childline", "number": "1098"},
            ],
            "guidance": "If you are in immediate danger, call 112 or visit the nearest Women Police Station / Sakhi One Stop Centre.",
        }


class MockAIOrchestrator:
    def run(self, text: str, language: str = "English", db=None) -> dict:
        extractor = LegalFactExtractionAgent()
        guidance_agent = LegalGuidanceAgent()
        classification = extractor.run(text, language)
        return guidance_agent.run(text, classification)
