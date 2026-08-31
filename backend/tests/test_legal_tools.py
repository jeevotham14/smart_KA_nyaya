from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_court_fee_valid_civil():
    response = client.post("/api/tools/court-fee", json={
        "category": "civil",
        "proceeding": "money_recovery",
        "relief": "any",
        "valuation": 100000
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "CALCULATED"
    assert data["estimated_fee"] == 5100.0  # 100 + (100000 * 0.05)

def test_court_fee_missing_valuation():
    response = client.post("/api/tools/court-fee", json={
        "category": "civil",
        "proceeding": "money_recovery",
        "relief": "any"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "MORE_INFORMATION_REQUIRED"
    assert data["estimated_fee"] is None

def test_court_fee_family_no_valuation():
    response = client.post("/api/tools/court-fee", json={
        "category": "family",
        "proceeding": "divorce_maintenance",
        "relief": "any"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "CALCULATED"
    assert data["estimated_fee"] == 50.0

def test_court_fee_unknown_rule():
    response = client.post("/api/tools/court-fee", json={
        "category": "unknown",
        "proceeding": "unknown",
        "relief": "unknown"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "RULE_NOT_CONFIGURED"

def test_limitation_valid():
    response = client.post("/api/tools/limitation-period", json={
        "category": "civil",
        "proceeding": "money_recovery",
        "relief": "recovery_of_debt",
        "trigger_date": "2020-01-01",
        "has_exceptions": False
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "POSSIBLY_EXPIRED"
    assert "3 years" in data["period"]

def test_limitation_within():
    response = client.post("/api/tools/limitation-period", json={
        "category": "property",
        "proceeding": "recovery_of_possession",
        "relief": "based_on_title",
        "trigger_date": "2024-01-01",
        "has_exceptions": False
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "WITHIN_LIMITATION"
    assert "12 years" in data["period"]

def test_limitation_exception():
    response = client.post("/api/tools/limitation-period", json={
        "category": "civil",
        "proceeding": "money_recovery",
        "relief": "recovery_of_debt",
        "trigger_date": "2024-01-01",
        "has_exceptions": True
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UNCERTAIN"
