"""
AI Service — delegates to real LLM providers via LLMRouter.
Keeps backward compatibility with existing route contracts.
"""
from __future__ import annotations

import json
import re
from typing import Any

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.domain import LegalStatute, Precedent
from app.services.llm_router import LEGAL_DISCLAIMER, LLMRouter, TaskType, get_llm_router


class AIService:
    def __init__(self, router: LLMRouter | None = None):
        self.router = router or get_llm_router()

    @property
    def provider_ready(self) -> bool:
        return bool(self.router.gemini_key or self.router.groq_key)

    def provider_metadata(self) -> dict[str, Any]:
        providers = []
        if self.router.groq_key:
            providers.append("groq/llama-3.3-70b-versatile")
        if self.router.gemini_key:
            providers.append("gemini/gemini-2.0-flash-lite")
        if self.router.openrouter_key:
            providers.append("openrouter/fallback")
        return {
            "providers": providers,
            "provider_ready": self.provider_ready,
            "mode": "production" if self.provider_ready else "mock_fallback",
        }

    def classify_legal_issue(self, text: str, language: str = "English") -> dict[str, Any]:
        result = self.router.classify_issue(text)
        classification = result.get("classification", {})
        return {
            "language": language,
            "category": classification.get("category", "general"),
            "urgency_level": classification.get("urgency", "normal"),
            "sections": self._relevant_sections(classification.get("category", "general")),
            "facts": [s.strip() for s in text.replace("\n", " ").split(".") if s.strip()][:5],
            "provider": self.provider_metadata(),
        }

    def legal_guidance_response(self, text: str, language: str = "English", db: Session | None = None) -> dict[str, Any]:
        # 1. Classify issue
        classification_result = self.classify_legal_issue(text, language)

        # 2. Get real AI guidance
        chat_result = self.router.legal_chat(text, language)

        # 3. Supplement with DB statutes if available
        statutes = []
        if db:
            statutes = self._retrieve_statutes(text, db, 3)

        return {
            "answer": chat_result["text"],
            "steps": self._extract_steps(chat_result["text"]),
            "classification": {
                "category": classification_result["category"],
                "urgency_level": classification_result["urgency_level"],
                "language": language,
                "sections": classification_result["sections"],
                "facts": classification_result["facts"],
            },
            "retrieval": {
                "statutes": statutes or self._fallback_statutes(classification_result["category"]),
                "retrieval_mode": "db_keyword" if statutes else "fallback",
            },
            "provider": {"name": chat_result["provider"], "model": chat_result["model"]},
            "disclaimer": LEGAL_DISCLAIMER,
        }

    def document_generation_response(self, doc_type: str, facts: dict[str, Any], language: str = "English") -> dict[str, Any]:
        result = self.router.generate_document(doc_type, facts, language)
        return {
            "doc_type": doc_type,
            "content_text": result["text"],
            "format_compliant": True,
            "provider": {"name": result["provider"], "model": result["model"]},
            "disclaimer": LEGAL_DISCLAIMER,
        }

    def rag_retrieval_placeholder(self, query: str, db: Session | None = None, top_k: int = 3) -> dict[str, Any]:
        statutes = []
        precedents = []
        if db:
            statutes = self._retrieve_statutes(query, db, top_k)
            precedents = self._retrieve_precedents(query, db, top_k)
        return {
            "statutes": statutes,
            "precedents": precedents,
            "retrieval_mode": "db_keyword",
            "provider": self.provider_metadata(),
        }

    # ── Internal helpers ────────────────────────────────────────────────────

    @staticmethod
    def _extract_steps(ai_text: str) -> list[str]:
        """Extract numbered steps from AI response text."""
        lines = ai_text.split("\n")
        steps = []
        for line in lines:
            line = line.strip()
            if re.match(r'^(\d+[\.\)]\s|[-•]\s)', line) and len(line) > 10:
                steps.append(re.sub(r'^(\d+[\.\)]\s|[-•]\s)', '', line).strip())
        return steps[:6] if steps else [
            "Document all facts, dates, and people involved.",
            "Preserve all evidence including messages, documents, and photographs.",
            "Contact your local DLSA or TLSC for free legal guidance.",
        ]

    @staticmethod
    def _relevant_sections(category: str) -> list[str]:
        mapping = {
            "women_protection": ["Protection of Women from Domestic Violence Act, 2005", "BNS Sections on assault/criminal intimidation", "Dowry Prohibition Act"],
            "criminal": ["Bharatiya Nagarik Suraksha Sanhita (BNSS)", "Bharatiya Nyaya Sanhita (BNS)", "Karnataka Police Act"],
            "property": ["Transfer of Property Act", "Karnataka Land Revenue Act", "Registration Act"],
            "labour": ["Industrial Disputes Act", "Code on Wages", "Karnataka Shops and Commercial Establishments Act"],
            "family": ["Hindu Marriage Act", "Special Marriage Act", "Guardians and Wards Act"],
            "consumer": ["Consumer Protection Act, 2019", "Karnataka Consumer Disputes Redressal Commission"],
        }
        return mapping.get(category, ["Constitution of India Article 39A (Free Legal Aid)", "Legal Services Authorities Act"])

    @staticmethod
    def _fallback_statutes(category: str) -> list[dict]:
        return [{"act_name": s, "section_number": "—", "summary": "Relevant to your issue."} for s in AIService._relevant_sections(category)]

    def _retrieve_statutes(self, query: str, db: Session, top_k: int) -> list[dict]:
        terms = [t.strip() for t in query.lower().split() if len(t.strip()) > 3][:8]
        if not terms:
            return []
        filters = [LegalStatute.act_name.ilike(f"%{t}%") | LegalStatute.section_text.ilike(f"%{t}%") for t in terms]
        rows = db.scalars(select(LegalStatute).where(or_(*filters)).limit(top_k)).all()
        return [{"act_name": r.act_name, "section_number": r.section_number, "summary": r.section_text} for r in rows]

    def _retrieve_precedents(self, query: str, db: Session, top_k: int) -> list[dict]:
        terms = [t.strip() for t in query.lower().split() if len(t.strip()) > 3][:8]
        if not terms:
            return []
        filters = [Precedent.title.ilike(f"%{t}%") | Precedent.summary.ilike(f"%{t}%") for t in terms]
        rows = db.scalars(select(Precedent).where(or_(*filters)).limit(top_k)).all()
        return [{"title": r.title, "court": r.court, "year": r.year, "summary": r.summary} for r in rows]


def get_ai_service() -> AIService:
    return AIService()
