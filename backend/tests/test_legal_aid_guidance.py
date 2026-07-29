from fastapi.testclient import TestClient
from app.main import app

def test_emergency_override_dv():
    with TestClient(app) as client:
        response = client.post("/api/legal-aid/check-eligibility", json={
            "urgent_safety_concern": True,
            "case_type": "domestic_violence"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["eligible"] is True
        guidance = data["tailored_guidance"]
        assert guidance is not None
        assert guidance["priority"] == "emergency"
        actions = [a["action"] for a in guidance["actions"]]
        assert "call" in actions
        labels = [a["label"] for a in guidance["actions"]]
        assert "Call 181" in labels
        assert "Call 112" in labels
        assert "181" in guidance["emergency_numbers"]
        assert "112" in guidance["emergency_numbers"]
        assert "Domestic Violence Application" in guidance["recommended_documents"]


def test_eligible_consumer():
    with TestClient(app) as client:
        response = client.post("/api/legal-aid/check-eligibility", json={
            "urgent_safety_concern": False,
            "case_type": "consumer",
            "annual_income": 100000,
            "district": "Bengaluru Urban"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["eligible"] is True
        guidance = data["tailored_guidance"]
        assert guidance is not None
        assert guidance["priority"] == "normal"
        labels = [a["label"] for a in guidance["actions"]]
        assert "Apply for Free Legal Aid" in labels
        assert "consumer_complaint" in guidance["recommended_documents"]
        assert "consumer-rights-guide" in guidance["recommended_resources"]
        assert guidance["directory_filter"] == "Bengaluru Urban"


def test_ineligible_property():
    with TestClient(app) as client:
        response = client.post("/api/legal-aid/check-eligibility", json={
            "urgent_safety_concern": False,
            "case_type": "property",
            "annual_income": 10000000, # Not eligible
            "district": "Mysuru"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["eligible"] is False
        guidance = data["tailored_guidance"]
        assert guidance is not None
        assert guidance["priority"] == "normal"
        labels = [a["label"] for a in guidance["actions"]]
        assert "Find DLSA Office" in labels
        assert "Explore Lok Adalat" in labels
        assert "property_notice" in guidance["recommended_documents"]
        assert "property-dispute-guide" in guidance["recommended_resources"]
        assert guidance["directory_filter"] == "Mysuru"
