from functools import lru_cache
from typing import Any

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Smart Karnataka Nyaya API"
    api_prefix: str = "/api"
    database_url: str = "sqlite:///./smart_nyaya.db"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # AI Providers
    ai_provider: str = "mock"
    ai_model: str = "mock-legal-assistant"
    embedding_model: str = "mock-embedding"
    gemini_api_key: str | None = None
    groq_api_key: str | None = None
    openrouter_api_key: str | None = None

    # Legacy / other integrations
    openai_api_key: str | None = None
    indian_kanoon_api_key: str | None = None
    maps_api_key: str | None = None
    sms_api_key: str | None = None
    sarvam_api_key: str | None = "sk_dn271vgk_7oau1Ae1w3KFQ33Zt1HzQnpY"

    # Legal Aid
    legal_aid_income_limit: int = 300000  # Karnataka DLSA threshold — update periodically
    email_api_key: str | None = None

    # SMTP Mail
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_from: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Any) -> list[str]:
        if isinstance(value, str):
            # Handle JSON array format: ["a","b"]
            if value.strip().startswith("["):
                import json
                return json.loads(value)
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
