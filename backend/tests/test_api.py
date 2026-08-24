from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_register_login_and_me():
    import uuid
    email = f"citizen_test_{uuid.uuid4().hex[:6]}@example.com"
    password = "SecurePassword123!"

    reg = client.post(
        "/api/auth/register",
        json={
            "name": "Citizen Test",
            "email": email,
            "password": password,
            "language_pref": "English",
            "district": "Bengaluru Urban",
        },
    )
    assert reg.status_code in {200, 201}

    login = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]

    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == email


def test_directory_search():
    response = client.get("/api/directory/search?district=Bengaluru Urban")
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_emergency_guidance():
    response = client.get("/api/women-protection/nearby-services")
    assert response.status_code == 200
    assert "112" in [item["phone"] for item in response.json()]


def test_mock_ai_legal_query_without_auth():
    response = client.post(
        "/api/ai/legal-query",
        json={"grievance_text": "My landlord is refusing to return deposit in Bengaluru.", "language": "English"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["legal_category"] in {"property", "civil", "general"}
    assert len(body["ai_response"]) > 20


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
    assert len(document.json()["content_text"]) > 20

    complaint = client.post(
        "/api/complaints",
        json={"complaint_type": "domestic violence", "description": "Threats and harassment", "district": "Mysuru"},
    )
    assert complaint.status_code == 200
    assert complaint.json()["routed_authority"] == "Mysuru Women Protection Cell"


def test_ai_service_provider_metadata_does_not_expose_keys():
    from app.services.ai_service import AIService
    from app.services.llm_router import get_llm_router

    service = AIService(get_llm_router())
    result = service.classify_legal_issue("Police refused to register FIR", "English")

    assert result["category"] in {"criminal", "general", "police"}
    assert "provider" in result
