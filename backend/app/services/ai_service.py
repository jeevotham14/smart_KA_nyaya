from dataclasses import asdict
from typing import Any

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.agents import DocumentGenerationAgent, LEGAL_DISCLAIMER, LegalFactExtractionAgent, LegalGuidanceAgent, RagRetrievalAgent
from app.core.config import Settings, get_settings
from app.models.domain import LegalStatute, Precedent


class AIService:
    """Provider-facing AI integration layer.

    The service reads provider/API-key configuration from environment-backed
    settings, but stays safe by default with deterministic local agents until a
    real provider client is deliberately enabled.
    """

    def __init__(self, settings: Settings | None = None):
        self.settings = settings or get_settings()
        self.classifier = LegalFactExtractionAgent()
        self.retriever = RagRetrievalAgent()
        self.guidance = LegalGuidanceAgent()
        self.document_generator = DocumentGenerationAgent()

    @property
    def provider_ready(self) -> bool:
        if self.settings.ai_provider.lower() == "openai":
            return bool(self.settings.openai_api_key)
        return self.settings.ai_provider.lower() == "mock"

    def provider_metadata(self) -> dict[str, Any]:
        fallback = self.settings.ai_provider.lower() != "mock" and not self.provider_ready
        return {
            "provider": self.settings.ai_provider,
            "model": self.settings.ai_model,
            "embedding_model": self.settings.embedding_model,
            "provider_ready": self.provider_ready,
            "mode": "mock_fallback" if fallback else self.settings.ai_provider,
        }

    def classify_legal_issue(self, text: str, language: str = "English") -> dict[str, Any]:
        classification = self.classifier.run(text, language)
        return {
            **asdict(classification),
            "provider": self.provider_metadata(),
        }

    def rag_retrieval_placeholder(self, query: str, db: Session | None = None, top_k: int = 3) -> dict[str, Any]:
        retrieved = self.retriever.run(query, top_k)
        if db is not None:
            retrieved["statutes"] = self._retrieve_statutes(query, db, top_k) or retrieved["statutes"]
            retrieved["precedents"] = self._retrieve_precedents(query, db, top_k) or retrieved["precedents"]
        retrieved["provider"] = self.provider_metadata()
        retrieved["pgvector_ready"] = True
        return retrieved

    def legal_guidance_response(self, text: str, language: str = "English", db: Session | None = None) -> dict[str, Any]:
        classification = self.classifier.run(text, language)
        response = self.guidance.run(text, classification)
        response["retrieval"] = self.rag_retrieval_placeholder(text, db=db)
        response["provider"] = self.provider_metadata()
        response["disclaimer"] = LEGAL_DISCLAIMER
        return response

    def document_generation_response(self, doc_type: str, facts: dict[str, Any]) -> dict[str, Any]:
        content = self.document_generator.generate(doc_type, facts)
        return {
            "doc_type": doc_type,
            "content_text": content,
            "format_compliant": True,
            "provider": self.provider_metadata(),
            "disclaimer": LEGAL_DISCLAIMER,
        }

    def _retrieve_statutes(self, query: str, db: Session, top_k: int) -> list[dict[str, Any]]:
        terms = [term.strip() for term in query.lower().split() if len(term.strip()) > 3][:8]
        if not terms:
            return []
        filters = [LegalStatute.act_name.ilike(f"%{term}%") | LegalStatute.section_text.ilike(f"%{term}%") for term in terms]
        rows = db.scalars(select(LegalStatute).where(or_(*filters)).limit(top_k)).all()
        return [
            {
                "section_id": str(row.section_id),
                "act_name": row.act_name,
                "section_number": row.section_number,
                "summary": row.section_text,
                "state_applicability": row.state_applicability,
            }
            for row in rows
        ]

    def _retrieve_precedents(self, query: str, db: Session, top_k: int) -> list[dict[str, Any]]:
        terms = [term.strip() for term in query.lower().split() if len(term.strip()) > 3][:8]
        if not terms:
            return []
        filters = [Precedent.title.ilike(f"%{term}%") | Precedent.summary.ilike(f"%{term}%") for term in terms]
        rows = db.scalars(select(Precedent).where(or_(*filters)).limit(top_k)).all()
        return [
            {
                "case_ref": str(row.case_ref),
                "title": row.title,
                "court": row.court,
                "jurisdiction": row.jurisdiction,
                "year": row.year,
                "outcome": row.outcome,
                "summary": row.summary,
                "source_url": row.source_url,
            }
            for row in rows
        ]


def get_ai_service() -> AIService:
    return AIService()
