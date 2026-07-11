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


class LegalAidAgent:
    def check(self, payload) -> dict:
        reasons = []
        if payload.gender and payload.gender.lower() == "female":
            reasons.append("women applicants are eligible under legal services criteria")
        if payload.category and payload.category.lower() in {"sc/st", "sc", "st", "minority", "transgender"}:
            reasons.append("category may qualify for free legal aid")
        if payload.annual_income is not None and payload.annual_income <= 300000:
            reasons.append("income appears within a likely assistance range")
        if payload.disability or payload.is_child or payload.is_senior_citizen:
            reasons.append("personal circumstances may qualify for support")
        if payload.case_type and "domestic" in payload.case_type.lower():
            reasons.append("domestic violence matters should be prioritized for support")
        return {
            "eligible": bool(reasons),
            "reason": "; ".join(reasons) if reasons else "More information or DLSA verification is needed.",
            "disclaimer": "Eligibility is indicative only and does not guarantee DLSA/TLSC approval.",
        }


class WomenProtectionAgent:
    def resources(self) -> list[dict]:
        return [
            {"name": "Emergency Response Support System", "phone": "112", "available": "24x7"},
            {"name": "Women Helpline", "phone": "181", "available": "24x7"},
            {"name": "Childline", "phone": "1098", "available": "24x7"},
        ]

    def request_help(self, description: str, district: str | None = None) -> dict:
        urgent = any(word in description.lower() for word in ["danger", "threat", "violence", "stalking"])
        return {
            "priority": "emergency" if urgent else "standard",
            "recommended_action": "Call 112 immediately and move to a safe public location." if urgent else "Contact 181 or local DLSA for support.",
            "district": district,
            "helplines": self.resources(),
        }


class DocumentGenerationAgent:
    def generate(self, doc_type: str, facts: dict) -> str:
        name = facts.get("name", "[TO BE FILLED]")
        issue = facts.get("issue", "[TO BE FILLED]")
        authority = facts.get("authority", "The Appropriate Authority")
        district = facts.get("district", "[TO BE FILLED]")
        return (
            f"To,\n{authority}\nDistrict: {district}\n\nSubject: {doc_type} regarding {issue}\n\n"
            f"I, {name}, request assistance regarding the following facts:\n{issue}\n\n"
            "Documents attached: [TO BE FILLED]\nRelief requested: [TO BE FILLED]\n\n"
            f"{LEGAL_DISCLAIMER}"
        )


class MockAIOrchestrator:
    def __init__(self):
        self.extractor = LegalFactExtractionAgent()
        self.retriever = RagRetrievalAgent()
        self.guidance = LegalGuidanceAgent()

    def answer_legal_query(self, text: str, language: str = "English") -> dict:
        classification = self.extractor.run(text, language)
        response = self.guidance.run(text, classification)
        response["retrieval"] = self.retriever.run(text)
        return response
