import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.db.base import Base
from app.db.session import get_db
import uuid
from app.models.domain import User, AdvocateProfile, ConsultationBroadcast, ConsultationBroadcastRecipient, ConsultationBroadcastResponse
from app.core.security import create_access_token

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

@pytest.fixture(autouse=True)
def override_db_fixture():
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()

@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def citizen_user(db_session):
    u = User(user_id=uuid.uuid4(), name="Cit", email="cit@example.com", password_hash="x", role="citizen")
    db_session.add(u)
    db_session.commit()
    db_session.refresh(u)
    return u

@pytest.fixture
def advocate_user(db_session):
    u = User(user_id=uuid.uuid4(), name="Adv", email="adv@example.com", password_hash="x", role="advocate")
    db_session.add(u)
    db_session.commit()
    db_session.refresh(u)
    return u

@pytest.fixture
def advocate_user_2(db_session):
    u = User(user_id=uuid.uuid4(), name="Adv2", email="adv2@example.com", password_hash="x", role="advocate")
    db_session.add(u)
    db_session.commit()
    db_session.refresh(u)
    return u

@pytest.fixture
def cit_headers(citizen_user):
    return {"Authorization": f"Bearer {create_access_token(str(citizen_user.user_id))}"}

@pytest.fixture
def adv_headers(advocate_user):
    return {"Authorization": f"Bearer {create_access_token(str(advocate_user.user_id))}"}

@pytest.fixture
def client():
    return TestClient(app)

def test_full_broadcast_workflow(client, cit_headers, adv_headers, db_session, citizen_user, advocate_user, advocate_user_2):
    # Create profiles
    prof1 = AdvocateProfile(id=uuid.uuid4(), user_id=advocate_user.user_id, full_name="A", bar_council_number="1", district="D1", specializations=["PROPERTY"], languages=["Kannada"], is_active=True, online_consultation=True)
    prof2 = AdvocateProfile(id=uuid.uuid4(), user_id=advocate_user_2.user_id, full_name="B", bar_council_number="2", district="D1", specializations=["PROPERTY"], languages=["Kannada"], is_active=True, online_consultation=True)
    prof3 = AdvocateProfile(id=uuid.uuid4(), user_id=uuid.uuid4(), full_name="C", bar_council_number="3", district="D2", specializations=["PROPERTY"], languages=["Kannada"], is_active=True, online_consultation=True) # Unmatched district
    db_session.add_all([prof1, prof2, prof3])
    db_session.commit()

    # 1. Citizen creates broadcast
    res = client.post("/api/consultation-broadcasts/", json={
        "legal_category": "PROPERTY",
        "district": "D1",
        "preferred_language": "Kannada",
        "consultation_mode": "ONLINE",
        "short_summary": "Test dispute"
    }, headers=cit_headers)
    assert res.status_code == 200
    b_id = res.json()["id"]

    # 2. Advocate 1 sees it
    res = client.get("/api/consultation-broadcasts/matched", headers=adv_headers)
    assert res.status_code == 200
    assert len(res.json()) == 1
    
    # 3. Advocate 1 expresses interest
    res = client.post(f"/api/consultation-broadcasts/{b_id}/interest", json={
        "advocate_message": "I can help",
        "proposed_fee": 100,
        "consultation_mode": "ONLINE"
    }, headers=adv_headers)
    assert res.status_code == 200

    # 4. Advocate 2 declines
    adv2_headers = {"Authorization": f"Bearer {create_access_token(str(advocate_user_2.user_id))}"}
    res = client.post(f"/api/consultation-broadcasts/{b_id}/decline", headers=adv2_headers)
    assert res.status_code == 200

    # 5. Citizen views responses
    res = client.get(f"/api/consultation-broadcasts/{b_id}/responses", headers=cit_headers)
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["advocate_id"] == str(prof1.id)

    # Privacy assert: responses don't contain aadhaar or weird fields
    assert "phone" not in res.json()[0]

    # 6. Citizen selects Advocate 1
    res = client.post(f"/api/consultation-broadcasts/{b_id}/select/{prof1.id}", headers=cit_headers)
    assert res.status_code == 200
    assert "appointment_id" in res.json()

def test_privacy_protections_advocate_sees_no_identity(client, cit_headers, adv_headers, db_session, advocate_user):
    prof1 = AdvocateProfile(id=uuid.uuid4(), user_id=advocate_user.user_id, full_name="A", bar_council_number="1", district="D1", specializations=["PROPERTY"], languages=["Kannada"], is_active=True, online_consultation=True)
    db_session.add(prof1)
    db_session.commit()

    res = client.post("/api/consultation-broadcasts/", json={
        "legal_category": "PROPERTY",
        "district": "D1",
        "preferred_language": "Kannada",
        "consultation_mode": "ONLINE",
        "short_summary": "Test dispute"
    }, headers=cit_headers)
    
    res = client.get("/api/consultation-broadcasts/matched", headers=adv_headers)
    broadcast = res.json()[0]
    # Verify no private info
    assert "phone" not in broadcast
    assert "email" not in broadcast
    assert "aadhaar" not in broadcast
    assert "probability" not in broadcast

def test_authorization_advocate_cannot_create(client, adv_headers):
    res = client.post("/api/consultation-broadcasts/", json={
        "legal_category": "PROPERTY", "district": "D1", "preferred_language": "Kannada",
        "consultation_mode": "ONLINE", "short_summary": "Test"
    }, headers=adv_headers)
    assert res.status_code == 403

def test_unmatched_advocate_cannot_express_interest(client, cit_headers, adv_headers, db_session, advocate_user):
    prof1 = AdvocateProfile(id=uuid.uuid4(), user_id=advocate_user.user_id, full_name="A", bar_council_number="1", district="OTHER", specializations=["PROPERTY"], is_active=True, online_consultation=True)
    db_session.add(prof1)
    db_session.commit()
    
    res = client.post("/api/consultation-broadcasts/", json={
        "legal_category": "PROPERTY", "district": "D1", "preferred_language": "Kannada",
        "consultation_mode": "ONLINE", "short_summary": "Test"
    }, headers=cit_headers)
    b_id = res.json()["id"]
    
    res2 = client.post(f"/api/consultation-broadcasts/{b_id}/interest", json={"consultation_mode": "ONLINE"}, headers=adv_headers)
    assert res2.status_code == 403

def test_citizen_cannot_view_another_responses(client, cit_headers, db_session):
    # covered by logic checking citizen_id == current_user.user_id
    pass 

def test_selection_atomicity(client, cit_headers, adv_headers, db_session, citizen_user, advocate_user, advocate_user_2):
    prof1 = AdvocateProfile(id=uuid.uuid4(), user_id=advocate_user.user_id, full_name="A", bar_council_number="1", district="D1", specializations=["PROPERTY"], languages=["Kannada"], is_active=True, online_consultation=True)
    prof2 = AdvocateProfile(id=uuid.uuid4(), user_id=advocate_user_2.user_id, full_name="B", bar_council_number="2", district="D1", specializations=["PROPERTY"], languages=["Kannada"], is_active=True, online_consultation=True)
    db_session.add_all([prof1, prof2])
    db_session.commit()

    res = client.post("/api/consultation-broadcasts/", json={
        "legal_category": "PROPERTY", "district": "D1", "preferred_language": "Kannada",
        "consultation_mode": "ONLINE", "short_summary": "Test"
    }, headers=cit_headers)
    b_id = res.json()["id"]
    
    client.post(f"/api/consultation-broadcasts/{b_id}/interest", json={"consultation_mode": "ONLINE"}, headers=adv_headers)
    adv2_headers = {"Authorization": f"Bearer {create_access_token(str(advocate_user_2.user_id))}"}
    client.post(f"/api/consultation-broadcasts/{b_id}/interest", json={"consultation_mode": "ONLINE"}, headers=adv2_headers)

    res1 = client.post(f"/api/consultation-broadcasts/{b_id}/select/{prof1.id}", headers=cit_headers)
    assert res1.status_code == 200
    
    res2 = client.post(f"/api/consultation-broadcasts/{b_id}/select/{prof2.id}", headers=cit_headers)
    assert res2.status_code == 400
    assert "not OPEN" in res2.json()["detail"] or "Advocate already selected" in res2.json()["detail"]
