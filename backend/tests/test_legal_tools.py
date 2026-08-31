import pytest
from fastapi.testclient import TestClient
from app.main import create_app

app = create_app()
client = TestClient(app)

def test_court_fee_calculator():
    # Test camelCase from frontend
    res1 = client.post("/api/tools/court-fee", json={"caseType": "civil", "claimAmount": 10000})
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["calculated_fee"] > 0
    assert data1["estimatedFee"] > 0

    # Test snake_case
    res2 = client.post("/api/tools/court-fee", json={"case_type": "family", "suit_value": 0})
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["calculated_fee"] == 50

def test_limitation_checker():
    # Test camelCase
    res1 = client.post("/api/tools/limitation-period", json={"caseCategory": "money_recovery", "incidentDate": "2024-01-01"})
    assert res1.status_code == 200
    data1 = res1.json()
    assert "period" in data1
    assert "deadline" in data1
    assert "is_expired" in data1

def test_rights_explainer():
    res = client.post("/api/tools/rights-explainer", json={"category": "Consumer Rights", "language": "English"})
    assert res.status_code == 200
    data = res.json()
    assert len(data["rights"]) > 0
    assert len(data["laws"]) > 0
    assert len(data["documents"]) > 0
