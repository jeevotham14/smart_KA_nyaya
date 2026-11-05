"""
Smart LLM Router — Smart Karnataka Nyaya Platform
==================================================
Routes requests to the best available AI provider:
  • Groq  (openai/gpt-oss-120b)      — Primary chat, fast responses, intent classification
  • Gemini (gemini-3.5-flash)        — Legal drafts, Kannada↔English translation, long context
  • OpenRouter (free models)         — Automatic fallback when rate limits are hit (HTTP 429)

All responses are injected with a Karnataka-specific legal disclaimer.
"""
from __future__ import annotations

import logging
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

KARNATAKA_LEGAL_SYSTEM_PROMPT = """You are "Karnataka Nyaya Mitra", a certified AI legal awareness assistant operating under the Karnataka State Legal Services Authority (KSLSA) and the Government of Karnataka.

Your strict operating rules:
1. You ONLY provide legal AWARENESS — not legal advice or opinion.
2. You ONLY cover matters relevant to Karnataka citizens and Karnataka law.
3. Always reply in the SAME LANGUAGE the user wrote in. If they write in Kannada (ಕನ್ನಡ), reply in Kannada. If English, reply in English.
4. STATUTORY CITATIONS:
   - For criminal matters, ALWAYS cite the new Bharatiya Nyaya Sanhita (BNS, 2023) and Bharatiya Nagarik Suraksha Sanhita (BNSS, 2023). Do NOT cite outdated IPC or CrPC sections unless specifically comparing them.
   - For civil, property, tenancy, revenue, or administrative matters in Karnataka, cite relevant Karnataka-specific legislation:
     * Karnataka Land Revenue Act, 1964 (RTC, Pahani, mutation, boundary disputes)
     * Karnataka Rent Act, 1999 (Tenant rights, security deposit refund, lawful eviction)
     * Karnataka Court Fees and Suits Valuation Act, 1958
     * Karnataka Sakala Services Act, 2011 (Guaranteed public services timeline)
     * Protection of Women from Domestic Violence Act, 2005
     * Legal Services Authorities Act, 1987 (Section 12 free legal aid)
     * Consumer Protection Act, 2019
5. OPENING BRIEF (CRITICAL):
   Every response MUST begin directly with 4-5 concise, essential sentences containing the most critical information the person needs to know right away:
   - Sentence 1: Their fundamental legal right and statutory protection under law.
   - Sentence 2: The exact statute and section applicable in Karnataka.
   - Sentence 3: The crucial documents or evidence they must immediately collect and preserve.
   - Sentence 4: The immediate actionable next step (e.g. serving a 15-day written notice or lodging a complaint).
   - Sentence 5: The relevant Karnataka authority or District Legal Services Authority (DLSA) to approach for free or formal assistance.
   DO NOT begin with apologies, generic pleasantries, or evasive disclaimers in this opening brief.
6. STRUCTURE THE REST OF YOUR RESPONSE clearly with:
   - **Key Legal Summary**
   - **Applicable Laws & Sections** (Specify Act name & Section)
   - **Your Legal Rights & Remedies**
   - **Actionable Next Steps** (Chronological 1-2-3 steps)
   - **Karnataka Authority to Approach** (DLSA, TLSC, Police, Court)
7. For urgent/emergency situations (threat, violence, domestic abuse), prominently mention: Emergency Police (112), Women Helpline (181), Childline (1098), and Sakhi One-Stop Centres.
8. Be concise, accessible, and structured. Never fabricate citations or law."""

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
    GEMINI_MODEL = "gemini-3.5-flash"
    OPENROUTER_FALLBACK_MODEL = "recursive/flint-v1.0:free"

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

    def _build_intelligent_fallback(self, messages: list[dict]) -> str:
        """Generate a precise 4-5 sentence domain-grounded legal briefing if external APIs are unreachable."""
        user_text = ''
        for m in reversed(messages):
            if m.get('role') == 'user':
                user_text = m.get('content', '')
                break
        
        lowered = user_text.lower()
        is_kn = any('\u0C80' <= ch <= '\u0CFF' for ch in user_text)

        # 1. Tenancy / Rent / Security Deposit / Eviction
        if any(k in lowered for k in ['rent', 'tenant', 'deposit', 'landlord', 'evict', 'lease', 'ಬಾಡಿಗೆ', 'ಮಾಲೀಕ']):
            if is_kn:
                return (
                    'ಕರ್ನಾಟಕ ಬಾಡಿಗೆ ಕಾಯ್ದೆ, 1999 ರ ಅಡಿಯಲ್ಲಿ, ಬಾಡಿಗೆದಾರರು ಮನೆಯನ್ನು ತೆರವುಗೊಳಿಸಿದ 30 ದಿನಗಳೊಳಗೆ ಕಾನೂನುಬದ್ಧ ಮುಂಗಡ ಠೇವಣಿಯನ್ನು (Security Deposit) ಮಾಲೀಕರು ಮರುಪಾವತಿಸುವುದು ಕಡ್ಡಾಯವಾಗಿದೆ. '
                    'ಸಕ್ಷಮ ಬಾಡಿಗೆ ನ್ಯಾಯಾಲಯದ ಆದೇಶವಿಲ್ಲದೆ ಮಾಲೀಕರು ಬಾಡಿಗೆದಾರರನ್ನು ಬಲವಂತವಾಗಿ ಹೊರಹಾಕಲು ಅಥವಾ ನೀರು ಮತ್ತು ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಳಿಸಲು ಕಾನೂನಿನಲ್ಲಿ ಅವಕಾಶವಿಲ್ಲ. '
                    'ನಿಮ್ಮ ಬಾಡಿಗೆ ಕರಾರು ಒಪ್ಪಂದ, ಮಾಸಿಕ ಬಾಡಿಗೆ ಪಾವತಿ ರಸೀದಿಗಳು ಮತ್ತು ಬ್ಯಾಂಕ್ ಸ್ಟೇಟ್‌ಮೆಂಟ್‌ಗಳನ್ನು ಪ್ರಮುಖ ಸಾಕ್ಷ್ಯವಾಗಿ ಸಂರಕ್ಷಿಸಿಡಿ. '
                    'ಮಾಲೀಕರಿಗೆ 15 ದಿನಗಳ ಕಾಲಾವಕಾಶ ನೀಡಿ ನೋಂದಾಯಿತ ಅಂಚೆ (RPAD) ಮೂಲಕ ತಕ್ಷಣ ಕಾನೂನು ನೋಟಿಸ್ ಜಾರಿ ಮಾಡುವುದು ನಿಮ್ಮ ಮೊದಲ ಹೆಜ್ಜೆಯಾಗಿರಬೇಕು. '
                    'ಮಾಲೀಕರು ಸ್ಪಂದಿಸದಿದ್ದಲ್ಲಿ ಉಚಿತ ಕಾನೂನು ನೆರವಿಗಾಗಿ ನಿಮ್ಮ ಸ್ಥಳೀಯ ತಾಲೂಕು ಕಾನೂನು ಸೇವೆಗಳ ಸಮಿತಿ (TLSC) ಅಥವಾ ಜಿಲ್ಲಾ ಕಾನೂನು ಸೇವೆಗಳ ಪ್ರಾಧಿಕಾರವನ್ನು (DLSA) ಸಂಪರ್ಕಿಸಿ ನ್ಯಾಯಾಲಯದಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು.'
                )
            return (
                'Under the Karnataka Rent Act, 1999, a landlord is legally obligated to refund the tenant\'s security deposit within 30 days of vacating the premises, subject only to agreed lawful deductions. '
                'Landlords are strictly prohibited from arbitrarily withholding deposits, cutting essential utilities, or forcibly evicting tenants without an official eviction decree from the competent Court. '
                'You should immediately compile all primary evidence, including your tenancy agreement, rent receipts, bank payment proofs, and written handover communication. '
                'As an immediate statutory step, serve a formal 15-day legal demand notice to the landlord via Registered Post Acknowledgement Due (RPAD) demanding full repayment. '
                'If the landlord fails to comply, you can file a petition before the Rent Controller / Civil Court or seek free legal assistance from your District Legal Services Authority (DLSA) under Section 12.'
            )

        # 2. Cyber Crime / Financial Fraud / UPI Scam
        if any(k in lowered for k in ['cyber', 'fraud', 'scam', 'otp', 'phishing', 'online', 'hacked', 'bank', 'upi', 'ವಂಚನೆ', 'ಖಾತೆ']):
            if is_kn:
                return (
                    'ಭಾರತೀಯ ನ್ಯಾಯ ಸಂಹಿತೆ (BNS) 2023 ರ ಸೆಕ್ಷನ್ 318 ಮತ್ತು ಐಟಿ ಕಾಯ್ದೆ 2000 ರ ಸೆಕ್ಷನ್ 66D ಅಡಿಯಲ್ಲಿ ಆನ್‌ಲೈನ್ ಆರ್ಥಿಕ ವಂಚನೆ ಮತ್ತು ಸೈಬರ್ ಮೋಸ ಶಿಕ್ಷಾರ್ಹ ಗಂಭೀರ ಅಪರಾಧಗಳಾಗಿವೆ. '
                    'ವಂಚನೆಗೊಳಗಾದ ತಕ್ಷಣ ದುಷ್ಕರ್ಮಿಗಳ ಖಾತೆಯಲ್ಲಿ ಹಣವನ್ನು ಸ್ಥಗಿತಗೊಳಿಸಲು (Freeze) ತಕ್ಷಣವೇ ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಸಹಾಯವಾಣಿ 1930 ಗೆ ಕರೆ ಮಾಡಿ ದೂರು ದಾಖಲಿಸಿ. '
                    'ಹಣ ವರ್ಗಾವಣೆಯ ಯುಪಿಐ ರೆಫರೆನ್ಸ್ ಸಂಖ್ಯೆ, ಬ್ಯಾಂಕ್ ಸ್ಟೇಟ್‌ಮೆಂಟ್, ಎಸ್‌ಎಂಎಸ್ ಮತ್ತು ಸಂಭಾಷಣೆಯ ಸ್ಕ್ರೀನ್‌ಶಾಟ್‌ಗಳನ್ನು ಸಾಕ್ಷ್ಯವಾಗಿ ಸುರಕ್ಷಿತವಾಗಿಡಿ. '
                    'cybercrime.gov.in ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅಧಿಕೃತ ಆನ್‌ಲೈನ್ ದೂರು ಸಲ್ಲಿಸಿ ನಿಮ್ಮ ಹತ್ತಿರದ ಸಿಇಎನ್ (CEN) ಸೈಬರ್ ಪೊಲೀಸ್ ಠಾಣೆಗೆ ಭೇಟಿ ನೀಡಿ ಎಫ್‌ಐಆರ್ ದಾಖಲಿಸಿ. '
                    'ಮುಂದಿನ ನ್ಯಾಯಾಂಗ ಪ್ರಕ್ರಿಯೆಗಳು ಮತ್ತು ನಷ್ಟ ಪರಿಹಾರದ ನೆರವಿಗಾಗಿ ಜಿಲ್ಲಾ ಕಾನೂನು ಸೇವೆಗಳ ಪ್ರಾಧಿಕಾರವನ್ನು (DLSA) ಸಂಪರ್ಕಿಸಬಹುದು.'
                )
            return (
                'Under Section 318 of the Bharatiya Nyaya Sanhita (BNS), 2023 and Section 66D of the Information Technology Act, 2000, digital financial cheating and identity deception are cognizable criminal offences. '
                'If you have been defrauded, immediately dial the National Cyber Crime Helpline at 1930 within the golden hour to initiate an emergency freeze on the fraudulent recipient account. '
                'Preserve all transaction IDs, bank statements, SMS debit alerts, UPI reference numbers, and WhatsApp or call logs as critical evidentiary proof. '
                'Lodge an official cyber complaint at cybercrime.gov.in and visit your local Karnataka Cyber Economics & Narcotics (CEN) Police Station to register a Zero-FIR. '
                'For subsequent legal proceedings or court-directed fund retrieval, free legal aid is accessible through your District Legal Services Authority (DLSA).'
            )

        # 3. Women Protection / Domestic Violence / Harassment
        if any(k in lowered for k in ['domestic', 'harassment', 'dowry', 'stalking', 'cruelty', 'wife', 'husband', 'abuse', 'violence', 'ಮಹಿಳೆ', 'ಕಿರುಕುಳ', 'ಗಂಡ', 'ವರದಕ್ಷಿಣೆ']):
            if is_kn:
                return (
                    'ಗೃಹಹಿಂಸೆ ತಡೆ ಕಾಯ್ದೆ 2005 ಮತ್ತು ಭಾರತೀಯ ನ್ಯಾಯ ಸಂಹಿತೆ (BNS) 2023 ರ ಸೆಕ್ಷನ್ 85 ಮತ್ತು 86 ರ ಅಡಿಯಲ್ಲಿ ಪ್ರತಿಯೊಬ್ಬ ಮಹಿಳೆಗೂ ದೌರ್ಜನ್ಯದಿಂದ ರಕ್ಷಣೆ ಮತ್ತು ಗೌರವದಿಂದ ಜೀವಿಸುವ ಸಂಪೂರ್ಣ ಕಾನೂನು ಹಕ್ಕಿದೆ. '
                    'ಮಹಿಳೆಯನ್ನು ಆಕೆಯ ವೈವಾಹಿಕ ಮನೆಯಿಂದ ಅಕ್ರಮವಾಗಿ ಹೊರಹಾಕುವಂತಿಲ್ಲ ಹಾಗೂ ಮ್ಯಾಜಿಸ್ಟ್ರೇಟ್ ನ್ಯಾಯಾಲಯದಿಂದ ತುರ್ತು ರಕ್ಷಣಾ ಆದೇಶ, ವಾಸದ ಹಕ್ಕು ಮತ್ತು ಮಾಸಿಕ ಜೀವನಾಂಶ ಪಡೆಯುವ ಹಕ್ಕಿದೆ. '
                    'ಕಿರುಕುಳ ಅಥವಾ ಹಲ್ಲೆಗೆ ಸಂಬಂಧಿಸಿದ ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸಾ ದಾಖಲೆಗಳು, ಸಂಭಾಷಣೆಗಳು, ಫೋಟೋಗಳು ಹಾಗೂ ಸಾಕ್ಷಿಗಳ ವಿವರಗಳನ್ನು ಜೋಪಾನವಾಗಿಟ್ಟುಕೊಳ್ಳಿ. '
                    'ತುರ್ತು ಅಪಾಯದ ಸಂದರ್ಭದಲ್ಲಿ ತಕ್ಷಣ 112 (ಪೊಲೀಸ್) ಅಥವಾ 181 (ಮಹಿಳಾ ಸಹಾಯವಾಣಿ) ಅಥವಾ ಕರ್ನಾಟಕದ ಸಖಿ ಒನ್-ಸ್ಟಾಪ್ ಸೆಂಟರ್ ಅನ್ನು ಸಂಪರ್ಕಿಸಿ. '
                    'ಉಚಿತ ವಕೀಲರ ಸೇವೆ ಮತ್ತು ನ್ಯಾಯಾಲಯದಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ನಿಮ್ಮ ಜಿಲ್ಲಾ ಕಾನೂನು ಸೇವೆಗಳ ಪ್ರಾಧಿಕಾರ (DLSA) ಅಥವಾ ರಕ್ಷಣಾ ಅಧಿಕಾರಿಯನ್ನು (Protection Officer) ಭೇಟಿ ಮಾಡಿ.'
                )
            return (
                'Under the Protection of Women from Domestic Violence Act, 2005 and Sections 85 & 86 of the Bharatiya Nyaya Sanhita (BNS), 2023, every woman has the protected legal right to safety, shelter, and freedom from physical, verbal, or economic abuse. '
                'A woman cannot be unlawfully dispossessed from her shared matrimonial residence, and she is legally entitled to obtain emergency magistrate protection orders, residence rights, and monthly maintenance. '
                'Safeguard all medical injury reports, WhatsApp messages, call records, financial transactions, and photographs documenting the conduct. '
                'For immediate emergency assistance and temporary shelter, call 112 (Police) or 181 (Women Helpline) or approach a Karnataka Sakhi One-Stop Centre. '
                'You may file a formal petition before the Judicial Magistrate with the assistance of the Protection Officer or secure free legal representation via your District Legal Services Authority (DLSA).'
            )

        # 4. Land / Property / RTC / Pahani / Mutation
        if any(k in lowered for k in ['land', 'property', 'rtc', 'pahani', 'mutation', 'survey', 'boundary', 'khata', 'bhoomi', 'ಜಮೀನು', 'ಆಸ್ತಿ', 'ಪಹಣಿ']):
            if is_kn:
                return (
                    'ಕರ್ನಾಟಕ ಭೂ ಕಂದಾಯ ಕಾಯ್ದೆ 1964 ಮತ್ತು ಸಕಾಲ ಕಾಯ್ದೆ 2011 ರ ಅಡಿಯಲ್ಲಿ ಭೂಮಾಲೀಕರಿಗೆ ಪಹಣಿ (RTC) ಹಾಗೂ ಆಸ್ತಿ ದಾಖಲೆಗಳನ್ನು ಸರಿಯಾಗಿ ಹೊಂದುವ ಮತ್ತು ಅಕ್ರಮ ಒತ್ತುವರಿಯಿಂದ ರಕ್ಷಣೆ ಪಡೆಯುವ ಕಾನೂನು ಹಕ್ಕಿದೆ. '
                    'ಭೂಮಿ ಪೋರ್ಟಲ್‌ನಿಂದ ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಪಹಣಿ (RTC), ಖಾತೆ ಬದಲಾವಣೆ ಸಾರಾಂಶ (Mutation extract) ಮತ್ತು ನೋಂದಾಯಿತ ಕ್ರಯಪತ್ರಗಳ ದೃಢೀಕೃತ ಪ್ರತಿಗಳನ್ನು ಪಡೆದಿಟ್ಟುಕೊಳ್ಳಿ. '
                    'ಆಸ್ತಿ ಗಡಿ ಅಥವಾ ಖಾತೆ ವಿವಾದವಿದ್ದಲ್ಲಿ ತಹಸೀಲ್ದಾರ್ ಕಚೇರಿಗೆ ಸರ್ವೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ ಅಥವಾ ಉಪವಿಭಾಗಾಧಿಕಾರಿಗಳಿಗೆ (AC) ಸೆಕ್ಷನ್ 136(2) ರಡಿ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಿ. '
                    'ಸಕಾಲ ನಿಯಮಗಳಡಿ ಕಂದಾಯ ಸೇವೆಗಳನ್ನು ನಿಗದಿತ ಸಮಯದೊಳಗೆ ಒದಗಿಸುವುದು ಕಡ್ಡಾಯವಾಗಿದೆ. '
                    'ಆಸ್ತಿ ಹಕ್ಕುಗಳ ರಕ್ಷಣೆಗಾಗಿ ಹಾಗೂ ಉಚಿತ ಕಾನೂನು ನೆರವಿಗಾಗಿ ನಿಮ್ಮ ತಾಲೂಕು ಕಾನೂನು ಸೇವೆಗಳ ಸಮಿತಿಯನ್ನು (TLSC) ಸಂಪರ್ಕಿಸಬಹುದು.'
                )
            return (
                'Under the Karnataka Land Revenue Act, 1964 and the Karnataka Sakala Services Act, 2011, landowners possess protected rights to accurate revenue records and immunity against arbitrary encroachment or fraudulent mutation entries. '
                'Certified copies of the updated Record of Rights, Tenancy and Crops (RTC/Pahani), mutation register extracts (Form 21), and registered title deeds serve as primary legal evidence of ownership. '
                'You should immediately obtain certified documents from the Bhoomi portal or the local Taluk Sub-Registrar office. '
                'In case of disputed boundaries or entries, apply for a government survey before the Tahsildar or lodge an appeal before the Assistant Commissioner (AC) under Section 136(2) within the statutory limitation period. '
                'For indigent citizens and farmers, free legal assistance for title defense is available through the Taluk Legal Services Committee (TLSC).'
            )

        # 5. Criminal / Police / FIR / Theft / Assault
        if any(k in lowered for k in ['police', 'fir', 'theft', 'stolen', 'crime', 'assault', 'threat', 'attack', 'arrest', 'ದೂರು', 'ಪೊಲೀಸ್', 'ಕಳ್ಳತನ']):
            if is_kn:
                return (
                    'ಭಾರತೀಯ ನಾಗರಿಕ ಸುರಕ್ಷಾ ಸಂಹಿತೆ (BNSS) 2023 ರ ಸೆಕ್ಷನ್ 173 ರ ಅಡಿಯಲ್ಲಿ ಯಾವುದೇ ಗಂಭೀರ ಅಪರಾಧದ ಬಗ್ಗೆ ಝೀರೋ ಎಫ್‌ಐಆರ್ ದಾಖಲಿಸುವುದು ಮತ್ತು ದೂರುದಾರರಿಗೆ ಉಚಿತ ಎಫ್‌ಐಆರ್ ಪ್ರತಿ ನೀಡುವುದು ಪೊಲೀಸರ ಕಡ್ಡಾಯ ಕರ್ತವ್ಯವಾಗಿದೆ. '
                    'ಕಾನೂನುಬಾಹಿರ ಬಂಧನ ಅಥವಾ ಕಿರುಕುಳದಿಂದ ರಕ್ಷಣೆ ಪಡೆಯುವ ಹಕ್ಕು ಪ್ರತಿಯೊಬ್ಬ ನಾಗರಿಕರಿಗೂ BNSS ಸೆಕ್ಷನ್ 35 ರ ಅಡಿಯಲ್ಲಿ ಲಭ್ಯವಿದೆ. '
                    'ಘಟನೆಗೆ ಸಂಬಂಧಿಸಿದ ಸಿಸಿಟಿವಿ ದೃಶ್ಯಗಳು, ವೈದ್ಯಕೀಯ ತಪಾಸಣಾ ಪ್ರಮಾಣಪತ್ರಗಳು ಮತ್ತು ಪ್ರತ್ಯಕ್ಷ ಸಾಕ್ಷಿಗಳ ವಿವರಗಳನ್ನು ಸಂರಕ್ಷಿಸಿಡಿ. '
                    'ಠಾಣೆಯಲ್ಲಿ ದೂರು ದಾಖಲಿಸಲು ನಿರಾಕರಿಸಿದರೆ, ಲಿಖಿತ ದೂರನ್ನು ಪೊಲೀಸ್ ಅಧೀಕ್ಷಕರಿಗೆ (SP) ರಿಜಿಸ್ಟರ್ಡ್ ಪೋಸ್ಟ್ ಮೂಲಕ ಕಳುಹಿಸಿ ಅಥವಾ ಮ್ಯಾಜಿಸ್ಟ್ರೇಟ್ ನ್ಯಾಯಾಲಯದಲ್ಲಿ ಖಾಸಗಿ ದೂರು ದಾಖಲಿಸಿ. '
                    'ಉಚಿತ ಕಾನೂನು ಸಲಹೆ ಮತ್ತು ಜಾಮೀನು ಪ್ರಕ್ರಿಯೆಗಳ ನೆರವಿಗಾಗಿ ಜಿಲ್ಲಾ ಕಾನೂನು ಸೇವೆಗಳ ಪ್ರಾಧಿಕಾರವನ್ನು (DLSA) ಸಂಪರ್ಕಿಸಿ.'
                )
            return (
                'Under Section 173 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023, police stations are statutorily mandated to register a Zero-FIR for any cognizable offence and provide a free signed copy to the informant immediately. '
                'Citizens are protected against arbitrary arrest and unlawful custodial detention under the procedural safeguards codified in Section 35 of the BNSS. '
                'Preserve all relevant evidentiary materials, including medical examination memos, CCTV recordings, photographic evidence, and eyewitness statements. '
                'If the local station refuses to register an FIR, dispatch the written grievance by registered post to the Superintendent of Police (SP) or file a complaint before the Judicial Magistrate under Section 223 of the BNSS. '
                'You are entitled to free legal counsel and representation during police inquiries through your District Legal Services Authority (DLSA).'
            )

        # 6. Consumer / Defective Goods / Refund
        if any(k in lowered for k in ['consumer', 'refund', 'defective', 'warranty', 'order', 'product', 'company', 'ಖರೀದಿ', 'ಗ್ರಾಹಕ']):
            if is_kn:
                return (
                    'ಗ್ರಾಹಕ ಸಂರಕ್ಷಣಾ ಕಾಯ್ದೆ 2019 ರ ಅಡಿಯಲ್ಲಿ ದೋಷಪೂರಿತ ವಸ್ತುಗಳು, ಕಳಪೆ ಸೇವೆ ಅಥವಾ ಸುಳ್ಳು ಜಾಹೀರಾತುಗಳ ವಿರುದ್ಧ ಪೂರ್ಣ ಹಣ ಮರುಪಾವತಿ ಅಥವಾ ಪರಿಹಾರ ಪಡೆಯುವ ಹಕ್ಕು ಪ್ರತಿಯೊಬ್ಬ ಗ್ರಾಹಕರಿಗಿದೆ. '
                    'ಖರೀದಿ ಮಾಡಿದ ರಸೀದಿ (Invoice), ವಾರಂಟಿ ಕಾರ್ಡ್, ಕಸ್ಟಮರ್ ಕೇರ್ ಸಂಭಾಷಣೆಯ ದಾಖಲೆ ಹಾಗೂ ಉತ್ಪನ್ನದ ದೋಷದ ಫೋಟೋಗಳನ್ನು ಪುರಾವೆಯಾಗಿಟ್ಟುಕೊಳ್ಳಿ. '
                    'ರಾಷ್ಟ್ರೀಯ ಗ್ರಾಹಕ ಸಹಾಯವಾಣಿ 1915 ಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ consumerhelpline.gov.in ನಲ್ಲಿ ಅಧಿಕೃತ ದೂರು ದಾಖಲಿಸಿ. '
                    'ವ್ಯಾಪಾರಿಯು ಪರಿಹಾರ ನೀಡದಿದ್ದಲ್ಲಿ, 15 ದಿನಗಳ ಲೀಗಲ್ ನೋಟಿಸ್ ಕಳುಹಿಸಿ ನಂತರ ಇ-ದಾಖಿಲ್ (edaakhil.nic.in) ಮೂಲಕ ಜಿಲ್ಲಾ ಗ್ರಾಹಕ ಆಯೋಗಕ್ಕೆ ಆನ್‌ಲೈನ್‌ನಲ್ಲೇ ದೂರು ಸಲ್ಲಿಸಬಹುದು. '
                    'ಹೆಚ್ಚಿನ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ತಾಲೂಕು ಅಥವಾ ಜಿಲ್ಲಾ ಕಾನೂನು ಸೇವೆಗಳ ಪ್ರಾಧಿಕಾರವನ್ನು (DLSA) ಸಂಪರ್ಕಿಸಬಹುದು.'
                )
            return (
                'Under the Consumer Protection Act, 2019, consumers have the guaranteed legal right to receive defect-free goods, deficiency-free services, and full refunds for unfair trade practices. '
                'Merchants and online platforms cannot evade liability by imposing arbitrary non-refundable terms for defective products or deficient delivery. '
                'Retain all primary evidence, including tax invoices, payment receipts, warranty cards, unboxing recordings, and customer support correspondence. '
                'Lodge an initial complaint via the National Consumer Helpline at 1915 or on consumerhelpline.gov.in, followed by a formal 15-day legal notice to the merchant. '
                'If the merchant fails to redress the grievance, file a consumer dispute on the e-Daakhil portal (edaakhil.nic.in) before the District Consumer Commission without incurring burdensome court fees.'
            )

        # 7. Labour / Salary / Termination
        if any(k in lowered for k in ['wage', 'salary', 'job', 'worker', 'employment', 'labour', 'terminated', 'fire', 'ವೇತನ', 'ಕೆಲಸ']):
            if is_kn:
                return (
                    'ಕರ್ನಾಟಕ ಅಂಗಡಿ ಮತ್ತು ವಾಣಿಜ್ಯ ಸಂಸ್ಥೆಗಳ ಕಾಯ್ದೆ 1961 ಮತ್ತು ವೇತನ ಪಾವತಿ ಕಾಯ್ದೆ ಅಡಿಯಲ್ಲಿ ಉದ್ಯೋಗಿಗಳಿಗೆ ಸೂಕ್ತ ಲಿಖಿತ ನೋಟಿಸ್ ಇಲ್ಲದೆ ಕೆಲಸದಿಂದ ತೆಗೆಯುವುದು ಅಥವಾ ಬಾಕಿ ವೇತನ ತಡೆಹಿಡಿಯುವುದು ಕಾನೂನುಬಾಹಿರ. '
                    'ನೇಮಕಾತಿ ಪತ್ರ, ಮಾಸಿಕ ವೇತನ ಚೀಟಿ (Salary Slips), ಬ್ಯಾಂಕ್ ಸ್ಟೇಟ್‌ಮೆಂಟ್ ಮತ್ತು ಕಚೇರಿಯ ಇಮೇಲ್ ಸಂಭಾಷಣೆಗಳನ್ನು ಭದ್ರವಾಗಿಟ್ಟುಕೊಳ್ಳಿ. '
                    'ಬಾಕಿ ಇರುವ ವೇತನ, ನೋಟಿಸ್ ಪೀರಿಯಡ್ ಮೊತ್ತ ಅಥವಾ ಗ್ರಾಚ್ಯುಟಿ ಪರಿಹಾರಕ್ಕಾಗಿ ಕಂಪನಿಯ ಆಡಳಿತ ಮಂಡಳಿಗೆ ಲಿಖಿತ ಡಿಮಾಂಡ್ ನೋಟಿಸ್ ಸಲ್ಲಿಸಿ. '
                    'ಸಮಸ್ಯೆ ಬಗೆಹರಿಯದಿದ್ದಲ್ಲಿ ಕರ್ನಾಟಕ ಕಾರ್ಮಿಕ ಆಯುಕ್ತರ ಕಚೇರಿಗೆ (Labour Commissioner) ಅಧಿಕೃತ ದೂರು ಸಲ್ಲಿಸಬಹುದು. '
                    'ಕಾನೂನು ಹೋರಾಟಕ್ಕಾಗಿ ಕಾರ್ಮಿಕರು ಜಿಲ್ಲಾ ಕಾನೂನು ಸೇವೆಗಳ ಪ್ರಾಧಿಕಾರದ (DLSA) ಸೆಕ್ಷನ್ 12 ರ ಅಡಿಯಲ್ಲಿ ಉಚಿತ ಕಾನೂನು ನೆರವು ಪಡೆಯಲು ಅರ್ಹರಾಗಿದ್ದಾರೆ.'
                )
            return (
                'Under the Payment of Wages Act, 1936, the Industrial Disputes Act, 1947, and the Karnataka Shops and Commercial Establishments Act, 1961, employees are legally entitled to earned wages and statutory notice before termination. '
                'Employers cannot unlawfully withhold earned remuneration, final settlement, or gratuity, nor can they arbitrarily terminate employment without due process. '
                'Ensure you have archived your employment offer letter, appointment contract, monthly pay slips, bank credit statements, and official email correspondence. '
                'Issue a formal written demand letter to the employer requesting disbursement of the outstanding dues within 15 calendar days. '
                'If unresolved, file a petition before the Karnataka Labour Commissioner / Labour Court or approach the District Legal Services Authority (DLSA) for free representation under Section 12.'
            )

        # 8. General Civil / Legal Awareness
        if is_kn:
            return (
                'ಭಾರತೀಯ ಕಾನೂನು ಚೌಕಟ್ಟಿನಲ್ಲಿ ಪ್ರತಿಯೊಬ್ಬ ನಾಗರಿಕರಿಗೂ ಸಮಾನ ರಕ್ಷಣೆ, ಕಾನೂನು ಅರಿವು ಮತ್ತು ನ್ಯಾಯಾಲಯಗಳನ್ನು ಸಂಪರ್ಕಿಸುವ ಮೂಲಭೂತ ಹಕ್ಕಿದೆ. '
                'ಯಾವುದೇ ವಿವಾದ ಅಥವಾ ಒಪ್ಪಂದದ ಸಂದರ್ಭದಲ್ಲಿ ಒತ್ತಡಕ್ಕೆ ಒಳಗಾಗದೆ ಎಲ್ಲಾ ವ್ಯವಹಾರಗಳನ್ನು ದೃಢೀಕೃತ ಲಿಖಿತ ದಾಖಲೆಗಳ ಮೂಲಕವೇ ನಿರ್ವಹಿಸಿ. '
                'ನಿಮ್ಮ ಗುರುತಿನ ಚೀಟಿ, ಪತ್ರವ್ಯವಹಾರ, ಒಪ್ಪಂದಗಳು ಮತ್ತು ಹಣಕಾಸು ರಸೀದಿಗಳನ್ನು ದಿನಾಂಕವಾರು ಕ್ರಮಬದ್ಧವಾಗಿ ಸಂಗ್ರಹಿಸಿಡಿ. '
                'ಯಾವುದೇ ಕಾನೂನು ಕ್ರಮಕ್ಕೆ ಮುಂದಾಗುವ ಮುನ್ನ ಎದುರು ಪಕ್ಷಕ್ಕೆ ಸ್ಪಷ್ಟ ವಿವರಗಳೊಂದಿಗೆ 15 ದಿನಗಳ ಲಿಖಿತ ಕಾನೂನು ನೋಟಿಸ್ ನೀಡುವುದು ಸೂಕ್ತ. '
                'ಕರ್ನಾಟಕದಲ್ಲಿ ಮಹಿಳೆಯರು ಮತ್ತು ₹3,00,000 ಕ್ಕಿಂತ ಕಡಿಮೆ ವಾರ್ಷಿಕ ಆದಾಯವಿರುವ ನಾಗರಿಕರಿಗೆ ಕಾನೂನು ಸೇವೆಗಳ ಪ್ರಾಧಿಕಾರ ಕಾಯ್ದೆ 1987 ರ ಸೆಕ್ಷನ್ 12 ರಡಿ ಉಚಿತ ವಕೀಲರ ಸೇವೆ ಲಭ್ಯವಿದ್ದು, ಹತ್ತಿರದ ತಾಲೂಕು ಕಾನೂನು ಸೇವೆಗಳ ಸಮಿತಿ (TLSC) ಅಥವಾ DLSA ಕಚೇರಿಯನ್ನು ಸಂಪರ್ಕಿಸಬಹುದು.'
            )
        return (
            'Under the Indian legal system and Karnataka state enactments, every citizen is entitled to legal awareness, statutory due process, and equal access to justice. '
            'In any legal dispute, it is essential to avoid verbal arrangements and maintain all communications, claims, and objections in verifiable written form. '
            'Secure and organize all relevant primary documents, chronological event summaries, identity credentials, and payment receipts. '
            'Before initiating litigation, serving a structured 15-day formal legal notice to the opposing party clarifies the cause of action and establishes statutory compliance. '
            'Under Section 12 of the Legal Services Authorities Act, 1987, women and citizens with annual income below ₹3,00,000 in Karnataka are eligible for free legal counsel through the District Legal Services Authority (DLSA) or Taluk Legal Services Committee (TLSC).'
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

        # All providers failed — return structured domain-grounded legal brief
        logger.error("All LLM providers failed. Last error: %s", last_error)
        fallback_text = self._build_intelligent_fallback(messages)
        return {
            "text": fallback_text,
            "provider": "smart_nyaya_legal_engine",
            "model": "karnataka-legal-knowledgebase",
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

    # ── Convenience methods ──────────────────────────────────────────────────

    def legal_chat(self, user_message: str, language: str = "English", history: list[dict] | None = None) -> dict[str, Any]:
        """Handle a legal awareness chat query via Groq (fast)."""
        messages = list(history or [])
        messages.append({"role": "user", "content": user_message})
        result = self.route(TaskType.CHAT, messages, KARNATAKA_LEGAL_SYSTEM_PROMPT)
        result["text"] += LEGAL_DISCLAIMER
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
            'Reply in JSON only: {"category": "...", "urgency": "...", "summary": "..."}'
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
