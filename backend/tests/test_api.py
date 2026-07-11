import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.main import create_app
from app.models import *  # noqa: F401,F403


engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app = create_app()
app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_register_login_and_me():
    register = client.post(
        "/api/auth/register",
        json={
            "name": "Citizen User",
            "email": "citizen@example.com",
            "phone": "9999999999",
            "password": "StrongPass123",
            "district": "Mysuru",
        },
    )
    assert register.status_code == 201

    login = client.post("/api/auth/login", json={"email": "citizen@example.com", "password": "StrongPass123"})
    assert login.status_code == 200
    token = login.json()["access_token"]

    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "citizen@example.com"


def test_mock_ai_legal_query_without_auth():
    response = client.post(
        "/api/ai/legal-query",
        json={"grievance_text": "My landlord is refusing to return deposit in Bengaluru.", "language": "English"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["legal_category"] == "property"
    assert "legal information only" in body["ai_response"]


def test_legal_aid_eligibility():
    response = client.post("/api/legal-aid/check-eligibility", json={"gender": "Female", "annual_income": 120000})
    assert response.status_code == 200
    assert response.json()["eligible"] is True


def test_document_generation_and_complaint():
    document = client.post(
        "/api/documents/generate",
        json={"doc_type": "Legal aid application", "facts": {"name": "Asha", "issue": "salary unpaid", "district": "Mysuru"}},
    )
    assert document.status_code == 200
    assert "[TO BE FILLED]" in document.json()["content_text"]

    complaint = client.post(
        "/api/complaints",
        json={"complaint_type": "domestic violence", "description": "Threats and harassment", "district": "Mysuru"},
    )
    assert complaint.status_code == 200
    assert complaint.json()["routed_authority"] == "Mysuru Women Protection Cell"



def test_ai_service_provider_metadata_does_not_expose_keys():
    from app.core.config import Settings
    from app.services.ai_service import AIService

    service = AIService(Settings(ai_provider="openai", ai_model="configured-model", openai_api_key="secret-test-key"))
    result = service.classify_legal_issue("Police refused to register FIR", "English")

    assert result["category"] == "criminal"
    assert result["provider"]["provider"] == "openai"
    assert result["provider"]["provider_ready"] is True
    assert "secret-test-key" not in str(result)
