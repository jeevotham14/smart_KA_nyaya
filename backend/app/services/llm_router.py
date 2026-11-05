"""
Smart LLM Router — Smart Karnataka Nyaya Platform
==================================================
Routes requests to the best available AI provider:
  • Groq  (openai/gpt-oss-120b)      — Primary chat, fast responses, intent classification
  • Gemini (gemini-3.5-flash)        — Legal drafts, Kannada↔English translation, long context
  • OpenRouter (free models)         — Automatic fallback when rate limits are hit (HTTP 429)
"""
from __future__ import annotations

import logging
from enum import StrEnum
from typing import Any

import httpx

logger = logging.getLogger(__name__)

# Disclaimer removed per user request
LEGAL_DISCLAIMER = ""

KARNATAKA_LEGAL_SYSTEM_PROMPT = """You are "Karnataka Nyaya Mitra", a friendly, simple legal awareness assistant for citizens in Karnataka.

CRITICAL INSTRUCTIONS:
1. KEEP IT VERY SHORT: Your entire reply MUST be strictly 4 to 5 bullet points or short sentences. Never write long essays, complex tables, or large walls of text.
2. USE VERY SIMPLE ENGLISH: Use simple, plain, everyday words so that even a beginner in English can easily understand. Absolutely avoid difficult legal jargon (e.g., use 'complaint' instead of 'cognizable offence', use 'proof' instead of 'evidentiary materials', use 'forceful eviction' instead of 'dispossessed', use 'free government lawyer' instead of 'indigent legal aid').
3. COVER EXACTLY THESE 4-5 SIMPLE POINTS:
   • Point 1 (Your Right): Tell the person what they have the right to do or get in simple words.
   • Point 2 (The Law): Mention the simple name of the law or section (e.g. Karnataka Rent Act, 1999 or BNS 2023).
   • Point 3 (Proof to Keep): List 2-3 simple items they should keep as proof (e.g. receipts, messages, agreement, photos).
   • Point 4 (Next Step): Tell them the immediate practical action (e.g. send a 15-day notice or file a police complaint).
   • Point 5 (Where to Get Free Help): Tell them where to get free help (e.g. call 112/181 or visit the local court DLSA office for a free lawyer).
4. NO DISCLAIMERS OR EXTRA SECTIONS: Do not add disclaimers, apologies, markdown tables, or repeated headings. Keep the entire response strictly to the 4-5 points.
5. If the user writes in Kannada, reply in simple, everyday Kannada with the same 4-5 short points."""

DOCUMENT_DRAFT_SYSTEM_PROMPT = """You are a legal document drafting assistant for the Karnataka State Legal Services Authority.

Draft clear, properly structured legal documents for Karnataka citizens. Follow these rules:
1. Use simple and clear legal language.
2. Structure documents with: Addressee, Subject, Date, Body, Relief Requested, Signature Block.
3. Insert [TO BE FILLED] placeholders where the citizen must add specific details.
4. Reply in the same language as the user's input (Kannada or English)."""

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
        """Generate a short, simple 4-5 sentence legal brief in everyday English/Kannada."""
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
                    '• ನೀವು ಮನೆ ಖಾಲಿ ಮಾಡಿದಾಗ ನಿಮ್ಮ ಮುಂಗಡ ಹಣ (ಡೆಪಾಸಿಟ್) ವಾಪಸ್ ಪಡೆಯುವುದು ನಿಮ್ಮ ಹಕ್ಕು.\n'
                    '• ಕರ್ನಾಟಕ ಬಾಡಿಗೆ ಕಾಯ್ದೆಯಂತೆ, ಮಾಲೀಕರು 30 ದಿನಗಳೊಳಗೆ ನಿಮ್ಮ ಹಣವನ್ನು ಮರುಪಾವತಿಸಬೇಕು.\n'
                    '• ಬಾಡಿಗೆ ಒಪ್ಪಂದ ಪತ್ರ, ರಸೀದಿಗಳು ಮತ್ತು ಬ್ಯಾಂಕ್ ದಾಖಲೆಗಳನ್ನು ಪುರಾವೆಯಾಗಿ ಇಟ್ಟುಕೊಳ್ಳಿ.\n'
                    '• ಹಣ ವಾಪಸ್ ನೀಡಲು 15 ದಿನಗಳ ಕಾಲಾವಕಾಶ ನೀಡಿ ಮಾಲೀಕರಿಗೆ ಲಿಖಿತ ನೋಟಿಸ್ ಕಳುಹಿಸಿ.\n'
                    '• ಅವರು ಹಣ ನೀಡದಿದ್ದರೆ, ಉಚಿತ ವಕೀಲರ ನೆರವಿಗಾಗಿ ನಿಮ್ಮ ಸ್ಥಳೀಯ ಕೋರ್ಟ್‌ನ DLSA ಕಚೇರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.'
                )
            return (
                '• You have the full legal right to get your deposit back when you vacate the house.\n'
                '• Under the Karnataka Rent Act, 1999, the owner must return your money within 30 days.\n'
                '• Keep your rental agreement, rent payment receipts, and bank statements as proof.\n'
                '• Send a written notice to the landlord giving 15 days time to refund the money.\n'
                '• If they refuse to pay, you can approach the Rent Court or get a free lawyer at your local DLSA court office.'
            )

        # 2. Cyber Crime / Financial Fraud / UPI Scam
        if any(k in lowered for k in ['cyber', 'fraud', 'scam', 'otp', 'phishing', 'online', 'hacked', 'bank', 'upi', 'ವಂಚನೆ', 'ಖಾತೆ']):
            if is_kn:
                return (
                    '• ಆನ್‌ಲೈನ್ ವಂಚನೆಯ ವಿರುದ್ಧ ದೂರು ನೀಡಿ ನಿಮ್ಮ ಹಣ ವಾಪಸ್ ಪಡೆಯುವ ಹಕ್ಕು ನಿಮಗಿದೆ.\n'
                    '• ಹೊಸ BNS 2023 ಕಾನೂನಿನ ಪ್ರಕಾರ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಜನರಿಗೆ ಮೋಸ ಮಾಡುವುದು ಗಂಭೀರ ಅಪರಾಧ.\n'
                    '• ಹಣ ಬೇರೆ ಖಾತೆಗೆ ಹೋಗುವುದನ್ನು ತಡೆಯಲು ತಕ್ಷಣವೇ 1930 ಸೈಬರ್ ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿ.\n'
                    '• ಹಣ ಕಳುಹಿಸಿದ ಯುಪಿಐ ಸಂಖ್ಯೆ, ಬ್ಯಾಂಕ್ ಮೆಸೇಜ್ ಮತ್ತು ಸ್ಕ್ರೀನ್‌ಶಾಟ್‌ಗಳನ್ನು ಜೋಪಾನವಾಗಿಡಿ.\n'
                    '• cybercrime.gov.in ನಲ್ಲಿ ದೂರು ದಾಖಲಿಸಿ ಅಥವಾ ಹತ್ತಿರದ ಸೈಬರ್ ಪೊಲೀಸ್ ಠಾಣೆಗೆ ಭೇಟಿ ನೀಡಿ.'
                )
            return (
                '• You have the right to report online fraud and get the fraudulent bank account blocked.\n'
                '• Digital financial cheating is a crime under the BNS 2023 law (Section 318) and the IT Act.\n'
                '• Call the cyber helpline 1930 immediately to freeze your money before the scammer withdraws it.\n'
                '• Save all screenshots of payment messages, transaction IDs, and phone numbers as proof.\n'
                '• File an online complaint on cybercrime.gov.in or visit your nearest CEN police station for help.'
            )

        # 3. Women Protection / Domestic Violence / Harassment
        if any(k in lowered for k in ['domestic', 'harassment', 'dowry', 'stalking', 'cruelty', 'wife', 'husband', 'abuse', 'violence', 'ಮಹಿಳೆ', 'ಕಿರುಕುಳ', 'ಗಂಡ', 'ವರದಕ್ಷಿಣೆ']):
            if is_kn:
                return (
                    '• ಪ್ರತಿಯೊಬ್ಬ ಮಹಿಳೆಗೂ ಯಾವುದೇ ಕಿರುಕುಳವಿಲ್ಲದೆ ಗೌರವದಿಂದ ಬದುಕುವ ಸಂಪೂರ್ಣ ಹಕ್ಕಿದೆ.\n'
                    '• ಗೃಹಹಿಂಸೆ ತಡೆ ಕಾಯ್ದೆಯಡಿ ನಿಮ್ಮನ್ನು ಮನೆಯಿಂದ ಹೊರಹಾಕುವಂತಿಲ್ಲ ಮತ್ತು ಖರ್ಚಿಗೆ ಹಣ ಪಡೆಯುವ ಹಕ್ಕಿದೆ.\n'
                    '• ಕಿರುಕುಳಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಆಸ್ಪತ್ರೆ ದಾಖಲೆಗಳು, ಮೆಸೇಜ್‌ಗಳು ಅಥವಾ ಫೋಟೋಗಳನ್ನು ಇಟ್ಟುಕೊಳ್ಳಿ.\n'
                    '• ತುರ್ತು ರಕ್ಷಣೆಗಾಗಿ ಯಾವುದೇ ಸಮಯದಲ್ಲಿ 112 (ಪೊಲೀಸ್) ಅಥವಾ 181 (ಮಹಿಳಾ ಸಹಾಯವಾಣಿ) ಗೆ ಕರೆ ಮಾಡಿ.\n'
                    '• ಉಚಿತ ವಕೀಲರು ಮತ್ತು ಆಶ್ರಯಕ್ಕಾಗಿ ನಿಮ್ಮ ಜಿಲ್ಲೆಯ ಸಖಿ ಕೇಂದ್ರ ಅಥವಾ DLSA ಕಚೇರಿಗೆ ಭೇಟಿ ನೀಡಿ.'
                )
            return (
                '• Every woman has the legal right to live safely with respect, free from any physical or mental harm.\n'
                '• Under the Domestic Violence Act, you cannot be thrown out of the house and can ask for monthly expenses.\n'
                '• Keep any medical bills, photos, phone records, or messages that show the harassment.\n'
                '• For immediate help and safety, call 112 (Police) or 181 (Women Helpline) anytime day or night.\n'
                '• You can get free help, safe shelter, and a free government lawyer at your district Sakhi Centre or DLSA office.'
            )

        # 4. Land / Property / RTC / Pahani / Mutation
        if any(k in lowered for k in ['land', 'property', 'rtc', 'pahani', 'mutation', 'survey', 'boundary', 'khata', 'bhoomi', 'ಜಮೀನು', 'ಆಸ್ತಿ', 'ಪಹಣಿ']):
            if is_kn:
                return (
                    '• ನಿಮ್ಮ ಜಮೀನನ್ನು ರಕ್ಷಿಸಿಕೊಳ್ಳುವ ಮತ್ತು ಪಹಣಿಯಲ್ಲಿ ಸರಿಯಾದ ಹೆಸರು ಹೊಂದುವ ಹಕ್ಕು ನಿಮಗಿದೆ.\n'
                    '• ಕರ್ನಾಟಕ ಭೂ ಕಂದಾಯ ಕಾಯ್ದೆಯು ಅಕ್ರಮ ಒತ್ತುವರಿ ಮತ್ತು ತಪ್ಪು ಖಾತೆಗಳ ವಿರುದ್ಧ ರಕ್ಷಣೆ ನೀಡುತ್ತದೆ.\n'
                    '• ಭೂಮಿ ವೆಬ್‌ಸೈಟ್‌ನಿಂದ ನಿಮ್ಮ ಪಹಣಿ (RTC) ಹಾಗೂ ಕ್ರಯಪತ್ರದ ಪ್ರತಿಗಳನ್ನು ಜೋಪಾನವಾಗಿಡಿ.\n'
                    '• ಗಡಿ ವಿವಾದ ಅಥವಾ ತಪ್ಪು ಖಾತೆ ಇದ್ದರೆ ತಹಸೀಲ್ದಾರ್ ಅಥವಾ ಉಪವಿಭಾಗಾಧಿಕಾರಿಗಳಿಗೆ (AC) ಲಿಖಿತ ಅರ್ಜಿ ನೀಡಿ.\n'
                    '• ಉಚಿತ ವಕೀಲರ ನೆರವಿಗಾಗಿ ನಿಮ್ಮ ತಾಲೂಕು ಕಾನೂನು ಸೇವೆಗಳ ಸಮಿತಿ (TLSC) ಕಚೇರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.'
                )
            return (
                '• You have the legal right to protect your land and keep your name correct in government records.\n'
                '• The Karnataka Land Revenue Act protects your land from illegal takeover or wrong entries.\n'
                '• Download your RTC (Pahani) and mutation copy from the Bhoomi website and keep your sale deed safe.\n'
                '• If someone makes a wrong entry or causes a boundary issue, give a written petition to the Tahsildar or AC.\n'
                '• Small farmers and citizens with low income can get a free lawyer at the local Taluk Legal Services office.'
            )

        # 5. Criminal / Police / FIR / Theft / Assault
        if any(k in lowered for k in ['police', 'fir', 'theft', 'stolen', 'crime', 'assault', 'threat', 'attack', 'arrest', 'ದೂರು', 'ಪೊಲೀಸ್', 'ಕಳ್ಳತನ']):
            if is_kn:
                return (
                    '• ಯಾವುದೇ ಅಪರಾಧ ನಡೆದಾಗ ಪೊಲೀಸರಿಗೆ ದೂರು ನೀಡಿ ಎಫ್‌ಐಆರ್ ದಾಖಲಿಸುವ ಹಕ್ಕು ನಿಮಗಿದೆ.\n'
                    '• ಹೊಸ BNSS ಕಾನೂನಿನ ಪ್ರಕಾರ ಪೊಲೀಸರು ದೂರು ದಾಖಲಿಸಿಕೊಂಡು ಉಚಿತವಾಗಿ ಎಫ್‌ಐಆರ್ ಪ್ರತಿ ನೀಡಬೇಕು.\n'
                    '• ಘಟನೆಯ ಫೋಟೋಗಳು, ವಿಡಿಯೋಗಳು, ವೈದ್ಯಕೀಯ ಚೀಟಿ ಮತ್ತು ಪ್ರತ್ಯಕ್ಷ ಸಾಕ್ಷಿಗಳನ್ನು ಇಟ್ಟುಕೊಳ್ಳಿ.\n'
                    '• ನಡೆದ ಘಟನೆಯನ್ನು ಸರಳವಾಗಿ ಬರೆದು ಹತ್ತಿರದ ಪೊಲೀಸ್ ಠಾಣೆಗೆ ನೀಡಿ ಸ್ವೀಕೃತಿ ರಸೀದಿ ಪಡೆಯಿರಿ.\n'
                    '• ಪೊಲೀಸರು ದೂರು ತೆಗೆದುಕೊಳ್ಳದಿದ್ದರೆ 112 ಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ ಉಚಿತ ನೆರವಿಗಾಗಿ DLSA ಕಚೇರಿಗೆ ಭೇಟಿ ನೀಡಿ.'
                )
            return (
                '• You have the right to file a police complaint (FIR) whenever a crime happens against you.\n'
                '• Under the BNSS 2023 law (Section 173), police must take your complaint and give you one free copy of the FIR.\n'
                '• Collect and keep all proofs like photos, CCTV clips, medical slips, and names of people who saw it.\n'
                '• Write down what happened in simple words, sign it, and give it to the nearest police station.\n'
                '• If the police do not take your complaint, call 112 or visit the District Legal Services office (DLSA) for free help.'
            )

        # 6. Consumer / Defective Goods / Refund
        if any(k in lowered for k in ['consumer', 'refund', 'defective', 'warranty', 'order', 'product', 'company', 'ಖರೀದಿ', 'ಗ್ರಾಹಕ']):
            if is_kn:
                return (
                    '• ನೀವು ಕೊಂಡುಕೊಂಡ ವಸ್ತು ಹಾಳಾಗಿದ್ದರೆ ಪೂರ್ಣ ಹಣ ವಾಪಸ್ ಅಥವಾ ಬದಲಿ ವಸ್ತು ಪಡೆಯುವುದು ನಿಮ್ಮ ಹಕ್ಕು.\n'
                    '• ಗ್ರಾಹಕ ಸಂರಕ್ಷಣಾ ಕಾಯ್ದೆಯಡಿ ದೋಷಪೂರಿತ ವಸ್ತುಗಳಿಗೆ ಹಣ ವಾಪಸ್ ನೀಡಲು ವ್ಯಾಪಾರಿಗಳು ನಿರಾಕರಿಸುವಂತಿಲ್ಲ.\n'
                    '• ಖರೀದಿ ರಸೀದಿ (Bill), ವಾರಂಟಿ ಕಾರ್ಡ್ ಮತ್ತು ವಸ್ತುವಿನ ಫೋಟೋಗಳನ್ನು ಪುರಾವೆಯಾಗಿ ಇಟ್ಟುಕೊಳ್ಳಿ.\n'
                    '• 1915 ಗ್ರಾಹಕ ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ consumerhelpline.gov.in ನಲ್ಲಿ ದೂರು ದಾಖಲಿಸಿ.\n'
                    '• ವ್ಯಾಪಾರಿಯು ಹಣ ನೀಡದಿದ್ದರೆ ಇ-ದಾಖಿಲ್ (edaakhil.nic.in) ಮೂಲಕ ಸುಲಭವಾಗಿ ಆನ್‌ಲೈನ್ ದೂರು ಸಲ್ಲಿಸಬಹುದು.'
                )
            return (
                '• You have the right to get defect-free products or receive your full money back if an item is damaged or faulty.\n'
                '• Under the Consumer Protection Act, sellers cannot refuse refunds for broken or wrong goods.\n'
                '• Keep your purchase bill, payment receipt, and pictures or unboxing video of the defect.\n'
                '• Call the National Consumer Helpline at 1915 or file a simple complaint on consumerhelpline.gov.in.\n'
                '• If the seller does not refund your money, you can easily file a case on edaakhil.nic.in without heavy fees.'
            )

        # 7. Labour / Salary / Termination
        if any(k in lowered for k in ['wage', 'salary', 'job', 'worker', 'employment', 'labour', 'terminated', 'fire', 'ವೇತನ', 'ಕೆಲಸ']):
            if is_kn:
                return (
                    '• ನೀವು ಮಾಡಿದ ಕೆಲಸಕ್ಕೆ ಪೂರ್ಣ ಸಂಬಳ ಪಡೆಯುವುದು ಮತ್ತು ಸೂಕ್ತ ನೋಟಿಸ್ ಇಲ್ಲದೆ ಕೆಲಸದಿಂದ ತೆಗೆಯದಂತೆ ನೋಡಿಕೊಳ್ಳುವುದು ನಿಮ್ಮ ಹಕ್ಕು.\n'
                    '• ವೇತನ ಪಾವತಿ ಕಾಯ್ದೆಯ ಪ್ರಕಾರ ಕಂಪನಿಯು ನಿಮ್ಮ ದುಡಿಮೆಯ ಹಣವನ್ನು ಅನ್ಯಾಯವಾಗಿ ತಡೆಹಿಡಿಯುವಂತಿಲ್ಲ.\n'
                    '• ನೇಮಕಾತಿ ಪತ್ರ, ಸಂಬಳದ ಚೀಟಿ (Salary Slip) ಮತ್ತು ಇಮೇಲ್ ದಾಖಲೆಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿಡಿ.\n'
                    '• ಬಾಕಿ ಸಂಬಳ ನೀಡುವಂತೆ ಕಂಪನಿಯ ಆಡಳಿತಕ್ಕೆ 15 ದಿನಗಳ ಕಾಲಾವಕಾಶ ನೀಡಿ ಲಿಖಿತ ಇಮೇಲ್ ಕಳುಹಿಸಿ.\n'
                    '• ಅವರು ಹಣ ನೀಡದಿದ್ದರೆ ಕಾರ್ಮಿಕ ಇಲಾಖೆಗೆ ದೂರು ಸಲ್ಲಿಸಬಹುದು ಅಥವಾ ಉಚಿತ ವಕೀಲರಿಗಾಗಿ DLSA ಸಂಪರ್ಕಿಸಬಹುದು.'
                )
            return (
                '• You have the right to receive your full earned salary and proper written notice before job removal.\n'
                '• Under the Payment of Wages Act, companies cannot hold back your salary or gratuity unfairly.\n'
                '• Save your appointment letter, monthly salary slips, and company emails on your personal phone or drive.\n'
                '• Send a polite written email or letter to HR asking for your pending salary within 15 days.\n'
                '• If they refuse to pay, you can complain to the Karnataka Labour Office or visit DLSA for a free lawyer.'
            )

        # 8. General Civil / Legal Awareness
        if is_kn:
            return (
                '• ಕಾನೂನಿನ ಮುಂದೆ ಪ್ರತಿಯೊಬ್ಬರಿಗೂ ಸಮಾನ ರಕ್ಷಣೆ ಮತ್ತು ನ್ಯಾಯ ಪಡೆಯುವ ಹಕ್ಕಿದೆ.\n'
                '• ಯಾವುದೇ ವ್ಯವಹಾರವಿರಲಿ ಕೇವಲ ಬಾಯಿಮಾತಿಗೆ ಸೀಮಿತವಾಗದೆ ಎಲ್ಲವನ್ನೂ ಲಿಖಿತ ರೂಪದಲ್ಲೇ ಇಟ್ಟುಕೊಳ್ಳಿ.\n'
                '• ಗುರುತಿನ ಚೀಟಿ, ರಸೀದಿಗಳು ಮತ್ತು ದಿನಾಂಕಗಳ ವಿವರಗಳನ್ನು ಜೋಪಾನವಾಗಿ ಸಂಗ್ರಹಿಸಿಡಿ.\n'
                '• ನ್ಯಾಯಾಲಯಕ್ಕೆ ಹೋಗುವ ಮುನ್ನ ಎದುರು ಪಕ್ಷಕ್ಕೆ 15 ದಿನಗಳ ಲಿಖಿತ ಪತ್ರ ನೀಡುವುದು ಉತ್ತಮ.\n'
                '• ಉಚಿತ ಕಾನೂನು ಸಲಹೆ ಮತ್ತು ಉಚಿತ ವಕೀಲರ ಸೇವೆಗಾಗಿ ನಿಮ್ಮ ಸ್ಥಳೀಯ ನ್ಯಾಯಾಲಯದ DLSA ಕಚೇರಿಗೆ ಭೇಟಿ ನೀಡಿ.'
            )
        return (
            '• You have the right to fair treatment, clear legal information, and justice under the law.\n'
            '• Always keep all agreements, payments, and conversations in written form instead of just spoken words.\n'
            '• Keep your identity proof, receipts, letters, and simple notes of dates and events together.\n'
            '• Try to send a simple 15-day written letter explaining the issue before going to court.\n'
            '• If you need free advice or a free government lawyer, visit the DLSA legal aid office at your local court.'
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

        # All providers failed — return short, simple 5-sentence legal brief
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
            "max_tokens": 1024,
            "temperature": 0.2,
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
        contents = []
        if system_prompt:
            contents.append({"role": "user", "parts": [{"text": system_prompt}]})
            contents.append({"role": "model", "parts": [{"text": "Understood. I will keep responses strictly short (4-5 points), use very simple English with no jargon, and omit all disclaimers."}]})
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg["content"]}]})

        url = self.GEMINI_URL.format(model=self.GEMINI_MODEL)
        response = self._client.post(
            f"{url}?key={self.gemini_key}",
            json={
                "contents": contents,
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1024},
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
        # Disclaimer removed per user request
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
        import json, re
        try:
            json_match = re.search(r'\{.*\}', result["text"], re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group())
                result["classification"] = parsed
        except Exception:
            result["classification"] = {"category": "general", "urgency": "normal", "summary": text[:100]}
        return result


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
