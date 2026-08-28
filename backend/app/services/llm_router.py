"""
Smart LLM Router — Smart Karnataka Nyaya Platform
==================================================
Routes requests to the best available AI provider:
  • Groq  (llama-3.3-70b-versatile) — Primary chat, fast responses, intent classification
  • Gemini (gemini-2.0-flash-lite)   — Legal drafts, Kannada↔English translation, long context
  • OpenRouter (free models)         — Automatic fallback when rate limits are hit (HTTP 429)

All responses are injected with a Karnataka-specific legal disclaimer.
"""
from __future__ import annotations

import logging
import re
from enum import StrEnum
from typing import Any

import httpx

logger = logging.getLogger(__name__)

LEGAL_DISCLAIMER = (
    "\n\n---\n⚠️ **Legal Disclaimer:** This is legal awareness information only and does NOT "
    "constitute legal advice. For official legal action, please consult a qualified advocate, "
    "your District Legal Services Authority (DLSA), or Taluk Legal Services Committee (TLSC). "
    "For emergencies: call 112 (Police) or 181 (Women Helpline)."
)

KARNATAKA_LEGAL_SYSTEM_PROMPT = """You are a certified legal awareness assistant operating under the Karnataka State Legal Services Authority (KSLSA) and the Government of Karnataka.

Your strict operating rules:
1. You ONLY provide legal AWARENESS — not legal advice or opinion.
2. You ONLY cover matters relevant to Karnataka citizens and Karnataka law.
3. Always reply in the SAME LANGUAGE the user wrote in. If they write in Kannada (ಕನ್ನಡ), reply in Kannada. If English, reply in English.
4. Cite relevant Acts, Sections, and Karnataka-specific authorities where applicable.
5. Always recommend consulting a qualified advocate, DLSA, or TLSC for official action.
6. For urgent/emergency situations, always mention: Police (112) and Women Helpline (181).
7. Be concise, clear, and accessible to citizens with limited legal literacy.
8. Never generate false case citations or fabricate law.

Relevant authorities you may reference:
- Karnataka State Legal Services Authority (KSLSA)
- District Legal Services Authority (DLSA) 
- Taluk Legal Services Committee (TLSC)
- Karnataka High Court
- National Legal Services Authority (NALSA)
- Karnataka Police (112)
- Women Helpline (181), Childline (1098)

Formatting rules:
- Format your response with clean paragraphs, numbered steps, and bullet points.
- Do NOT output HTML tags (never use <br>, <b>, <div>, etc.).
- Do NOT output markdown pipe tables (do NOT use | column |). Use clean bullet lists instead.
- Leave empty lines between numbered sections for easy reading."""

DOCUMENT_DRAFT_SYSTEM_PROMPT = """You are a legal document drafting assistant for the Karnataka State Legal Services Authority.

Draft clear, properly structured legal documents for Karnataka citizens. Follow these rules:
1. Use formal legal language appropriate for the document type.
2. Structure documents with: Addressee, Subject, Date, Body, Relief Requested, Signature Block.
3. Insert [TO BE FILLED] placeholders where the citizen must add specific details.
4. Include relevant Acts/Sections at the bottom as references.
5. Add a disclaimer that the document must be reviewed by a qualified advocate before submission.
6. Reply in the same language as the user's input (Kannada or English)."""

TRANSLATION_SYSTEM_PROMPT = """You are a professional Kannada-English legal translator working for the Karnataka Government.
Translate accurately, preserving legal meaning and terminology.
For legal terms without direct translation, provide the term in the original language followed by a brief explanation in parentheses."""


class TaskType(StrEnum):
    CHAT = "chat"                    # → Groq (fast)
    DOCUMENT_DRAFT = "document"      # → Gemini (quality)
    TRANSLATION = "translation"      # → Gemini (multilingual)
    SUMMARIZATION = "summarization"  # → Gemini (long context)
    CLASSIFICATION = "classification" # → Groq (fast)


class LLMRouter:
    """Routes tasks to the optimal LLM provider with automatic fallback."""

    GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
    GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

    GROQ_MODEL = "openai/gpt-oss-120b"
    GEMINI_MODEL = "gemini-3.6-flash"
    OPENROUTER_FALLBACK_MODEL = "meta-llama/llama-3.1-8b-instruct:free"

    def __init__(
        self,
        gemini_api_key: str | None = None,
        groq_api_key: str | None = None,
        openrouter_api_key: str | None = None,
    ):
        self.gemini_key = gemini_api_key
        self.groq_key = groq_api_key
        self.openrouter_key = openrouter_api_key
        self._client = httpx.Client(timeout=30.0)

    def route(self, task_type: TaskType, messages: list[dict], system_prompt: str | None = None) -> dict[str, Any]:
        """Route request to best provider, with automatic fallback chain."""
        if task_type in (TaskType.DOCUMENT_DRAFT, TaskType.TRANSLATION, TaskType.SUMMARIZATION):
            # Primary: Gemini → Fallback: Groq → Fallback: OpenRouter
            return self._try_providers(
                [self._call_gemini, self._call_groq, self._call_openrouter],
                messages, system_prompt
            )
        else:
            # Primary: Groq → Fallback: Gemini → Fallback: OpenRouter
            return self._try_providers(
                [self._call_groq, self._call_gemini, self._call_openrouter],
                messages, system_prompt
            )

    def _try_providers(self, providers: list, messages: list[dict], system_prompt: str | None) -> dict[str, Any]:
        last_error = None
        for provider_fn in providers:
            try:
                result = provider_fn(messages, system_prompt)
                if result:
                    return result
            except Exception as exc:
                last_error = exc
                logger.warning("Provider %s failed: %s", provider_fn.__name__, exc)
                continue

        # All providers failed — return mock fallback
        logger.error("All LLM providers failed. Last error: %s", last_error)
        return {
            "text": (
                "I apologize — our AI service is temporarily unavailable. "
                "Please try again in a few minutes, or call 181 (Women Helpline) "
                "or 112 (Emergency) for immediate assistance."
            ),
            "provider": "fallback",
            "model": "none",
        }

    def _call_groq(self, messages: list[dict], system_prompt: str | None) -> dict[str, Any] | None:
        if not self.groq_key:
            return None
        payload = {
            "model": self.GROQ_MODEL,
            "messages": self._build_openai_messages(messages, system_prompt),
            "max_tokens": 2048,
            "temperature": 0.3,
        }
        response = self._client.post(
            self.GROQ_URL,
            json=payload,
            headers={"Authorization": f"Bearer {self.groq_key}", "Content-Type": "application/json"},
        )
        if response.status_code == 429:
            raise Exception("Groq rate limit hit")
        response.raise_for_status()
        data = response.json()
        return {
            "text": data["choices"][0]["message"]["content"],
            "provider": "groq",
            "model": self.GROQ_MODEL,
        }

    def _call_gemini(self, messages: list[dict], system_prompt: str | None) -> dict[str, Any] | None:
        if not self.gemini_key:
            return None
        # Build Gemini-format contents
        contents = []
        if system_prompt:
            contents.append({"role": "user", "parts": [{"text": system_prompt}]})
            contents.append({"role": "model", "parts": [{"text": "Understood. I will follow these instructions precisely."}]})
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg["content"]}]})

        url = self.GEMINI_URL.format(model=self.GEMINI_MODEL)
        response = self._client.post(
            f"{url}?key={self.gemini_key}",
            json={
                "contents": contents,
                "generationConfig": {"temperature": 0.3, "maxOutputTokens": 2048},
            },
        )
        if response.status_code == 429:
            raise Exception("Gemini rate limit hit")
        response.raise_for_status()
        data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        return {"text": text, "provider": "gemini", "model": self.GEMINI_MODEL}

    def _call_openrouter(self, messages: list[dict], system_prompt: str | None) -> dict[str, Any] | None:
        if not self.openrouter_key:
            return None
        response = self._client.post(
            self.OPENROUTER_URL,
            json={
                "model": self.OPENROUTER_FALLBACK_MODEL,
                "messages": self._build_openai_messages(messages, system_prompt),
                "max_tokens": 1024,
            },
            headers={
                "Authorization": f"Bearer {self.openrouter_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://smart-ka-nyaya.onrender.com",
                "X-Title": "Smart Karnataka Nyaya",
            },
        )
        if response.status_code == 429:
            raise Exception("OpenRouter rate limit hit")
        response.raise_for_status()
        data = response.json()
        return {
            "text": data["choices"][0]["message"]["content"],
            "provider": "openrouter",
            "model": self.OPENROUTER_FALLBACK_MODEL,
        }

    @staticmethod
    def _build_openai_messages(messages: list[dict], system_prompt: str | None) -> list[dict]:
        result = []
        if system_prompt:
            result.append({"role": "system", "content": system_prompt})
        result.extend(messages)
        return result

    @staticmethod
    def _clean_response_text(text: str) -> str:
        if not text:
            return ""
        # Convert HTML line breaks to real newlines
        text = re.sub(r"<br\s*/?>", "\n", text, flags=re.IGNORECASE)
        # Remove leftover HTML tags
        text = re.sub(r"</?(?:b|strong|i|em|p|div|span|ul|ol|li|small)>", "", text, flags=re.IGNORECASE)
        # Clean up stray table pipes into clean bullet lists
        cleaned_lines = []
        for line in text.split("\n"):
            stripped = line.strip()
            # If line is markdown table divider |---|---|
            if re.match(r"^\|?[\s\-:|]+\|?$", stripped) and "-" in stripped:
                continue
            # If line is a markdown table row | col1 | col2 |
            if stripped.startswith("|") and stripped.endswith("|") and stripped.count("|") >= 2:
                cells = [c.strip() for c in stripped.strip("|").split("|") if c.strip()]
                if len(cells) == 1:
                    cleaned_lines.append(f"• {cells[0]}")
                elif len(cells) >= 2:
                    cleaned_lines.append(f"• **{cells[0]}:** {' — '.join(cells[1:])}")
                continue
            cleaned_lines.append(line)
        return "\n".join(cleaned_lines).strip()

    # ── Convenience methods ──────────────────────────────────────────────────

    def legal_chat(self, user_message: str, language: str = "English", history: list[dict] | None = None) -> dict[str, Any]:
        """Handle a legal awareness chat query via Groq (fast)."""
        messages = list(history or [])
        messages.append({"role": "user", "content": user_message})
        result = self.route(TaskType.CHAT, messages, KARNATAKA_LEGAL_SYSTEM_PROMPT)
        result["text"] = self._clean_response_text(result.get("text", "")) + LEGAL_DISCLAIMER
        return result

    def generate_document(self, doc_type: str, facts: dict, language: str = "English") -> dict[str, Any]:
        """Generate a legal document draft via Gemini (quality)."""
        facts_str = "\n".join(f"- {k}: {v}" for k, v in facts.items() if v)
        prompt = (
            f"Generate a formal {doc_type} document for a Karnataka citizen.\n\n"
            f"Citizen details provided:\n{facts_str}\n\n"
            f"Language: {language}\n\n"
            "Generate the complete document now."
        )
        result = self.route(TaskType.DOCUMENT_DRAFT, [{"role": "user", "content": prompt}], DOCUMENT_DRAFT_SYSTEM_PROMPT)
        result["text"] += f"\n\n---\n*This document was generated by Smart Karnataka Nyaya. It must be reviewed by a qualified advocate before official submission.*"
        return result

    def translate(self, text: str, source_lang: str, target_lang: str) -> dict[str, Any]:
        """Translate legal text between Kannada and English via Gemini."""
        prompt = f"Translate the following legal text from {source_lang} to {target_lang}:\n\n{text}"
        return self.route(TaskType.TRANSLATION, [{"role": "user", "content": prompt}], TRANSLATION_SYSTEM_PROMPT)

    def classify_issue(self, text: str) -> dict[str, Any]:
        """Classify a legal issue into a category quickly via Groq."""
        prompt = (
            f"Classify this legal issue into exactly one category and urgency level.\n\n"
            f"Issue: {text}\n\n"
            "Categories: women_protection, criminal, property, family, labour, consumer, civil, general\n"
            "Urgency: emergency, high, normal, low\n\n"
            "Reply in JSON only: {\"category\": \"...\", \"urgency\": \"...\", \"summary\": \"one line summary\"}"
        )
        result = self.route(TaskType.CLASSIFICATION, [{"role": "user", "content": prompt}])
        # Try to parse JSON from response
        import json, re
        try:
            json_match = re.search(r'\{.*\}', result["text"], re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group())
                result["classification"] = parsed
        except Exception:
            result["classification"] = {"category": "general", "urgency": "normal", "summary": text[:100]}
        return result


# Singleton — instantiated once per process
_router_instance: LLMRouter | None = None


def get_llm_router() -> LLMRouter:
    global _router_instance
    if _router_instance is None:
        from app.core.config import get_settings
        s = get_settings()
        _router_instance = LLMRouter(
            gemini_api_key=s.gemini_api_key,
            groq_api_key=s.groq_api_key,
            openrouter_api_key=s.openrouter_api_key,
        )
    return _router_instance
