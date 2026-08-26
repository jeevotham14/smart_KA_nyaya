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
from app.models.domain import User, AdvocateProfile, AdvocateAvailability, ConsultationAppointment
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
def test_user(db_session: Session):
    user = User(
        user_id=uuid.uuid4(),
        name="Test Advocate",
        email="testadvocate@example.com",
        password_hash="fake",
        role="advocate"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def auth_headers(test_user):
    token = create_access_token(str(test_user.user_id))
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def client():
    return TestClient(app)

def test_create_advocate_profile(client, auth_headers):
    data = {
        "full_name": "John Doe",
        "bar_council_number": "KAR/123/2026",
        "specializations": ["Civil Law"],
        "district": "Bengaluru",
        "years_of_experience": 5,
        "consultation_fee": 500.0,
        "online_consultation": True,
        "pro_bono_available": True
    }
    response = client.post("/api/advocates/profile", json=data, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["full_name"] == "John Doe"

def test_get_advocates_filtering(client: TestClient, db_session: Session, test_user):
    from app.models.domain import User
    import uuid
    new_user = User(
        user_id=uuid.uuid4().hex,
        name="Test",
        email=f"test{uuid.uuid4().hex}@test.com",
        password_hash="hash",
        role="advocate"
    )
    db_session.add(new_user)
    db_session.commit()
    
    adv1 = AdvocateProfile(
        id=uuid.uuid4(),
        user_id=new_user.user_id,
        full_name="Alice",
        bar_council_number=f"KAR/456{uuid.uuid4().hex}",
        district="Mysuru",
        specializations=["Criminal Law"],
        is_active=True,
        verification_status="VERIFIED",
        consultation_fee=100.0
    )
    db_session.add(adv1)
    db_session.commit()
    
    res = client.get("/api/advocates/?district=Mysuru")
    assert res.status_code == 200
    assert len(res.json()) >= 1
    assert res.json()[0]["district"] == "Mysuru"
    
def test_create_availability(client: TestClient, auth_headers, db_session, test_user):
    prof = AdvocateProfile(id=uuid.uuid4(), user_id=test_user.user_id, full_name="X", bar_council_number="X/1", district="X", consultation_fee=0, is_active=True, verification_status="VERIFIED", online_consultation=True, offline_consultation=False, pro_bono_available=False, years_of_experience=5)
    db_session.add(prof)
    db_session.commit()
    
    data = {
        "date": "2026-09-01",
        "start_time": "10:00",
        "end_time": "11:00",
        "consultation_mode": "ONLINE"
    }
    response = client.post("/api/advocates/availability", json=data, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["date"] == "2026-09-01"

def test_appointment_double_booking(client: TestClient, auth_headers, db_session, test_user):
    prof = AdvocateProfile(id=uuid.uuid4(), user_id=test_user.user_id, full_name="X", bar_council_number="X/1", district="X", consultation_fee=0, is_active=True, verification_status="VERIFIED", online_consultation=True, offline_consultation=False, pro_bono_available=False, years_of_experience=5)
    db_session.add(prof)
    avail = AdvocateAvailability(id=uuid.uuid4(), advocate_id=prof.id, date="2026-09-01", start_time="10:00", end_time="11:00", consultation_mode="ONLINE", is_available=True)
    db_session.add(avail)
    db_session.commit()
    
    req_data = {
        "advocate_id": str(prof.id),
        "availability_id": str(avail.id),
        "legal_category": "Civil Law",
        "case_summary": "Test",
        "consultation_mode": "ONLINE",
        "appointment_date": "2026-09-01",
        "start_time": "10:00",
        "end_time": "11:00"
    }
    
    res1 = client.post("/api/consultations/", json=req_data, headers=auth_headers)
    assert res1.status_code == 200
    
    res2 = client.post("/api/consultations/", json=req_data, headers=auth_headers)
    assert res2.status_code == 400
    assert "Time slot is not available" in res2.json()["detail"]

def test_reschedule_flow_accept(client: TestClient, auth_headers, db_session, test_user):
    prof = AdvocateProfile(id=uuid.uuid4(), user_id=test_user.user_id, full_name="X", bar_council_number="X/1", district="X", consultation_fee=0, is_active=True, verification_status="VERIFIED", online_consultation=True, offline_consultation=False, pro_bono_available=False, years_of_experience=5)
    db_session.add(prof)
    avail = AdvocateAvailability(id=uuid.uuid4(), advocate_id=prof.id, date='2026-09-02', start_time='10:00', end_time='11:00', consultation_mode='ONLINE', is_available=True)
    db_session.add(avail)
    db_session.commit()
    
    req_data = {
        'advocate_id': str(prof.id),
        'availability_id': str(avail.id),
        'legal_category': 'Civil Law',
        'case_summary': 'Test',
        'consultation_mode': 'ONLINE',
        'appointment_date': '2026-09-02',
        'start_time': '10:00',
        'end_time': '11:00'
    }
    res1 = client.post('/api/consultations/', json=req_data, headers=auth_headers)
    app_id = res1.json()['id']
    
    client.patch(f'/api/consultations/{app_id}/accept', headers=auth_headers)
    res_adv = client.patch(f'/api/consultations/{app_id}/reschedule', json={'new_date': '2026-10-01', 'new_start_time': '12:00', 'new_end_time': '13:00', 'message': 'Sorry'}, headers=auth_headers)
    assert res_adv.status_code == 200
    
    res_cit = client.patch(f'/api/consultations/{app_id}/reschedule/accept', headers=auth_headers)
    assert res_cit.status_code == 200
    assert res_cit.json()['status'] == 'CONFIRMED'
    assert res_cit.json()['appointment_date'] == '2026-10-01'

def test_reschedule_flow_decline(client: TestClient, auth_headers, db_session, test_user):
    prof = AdvocateProfile(id=uuid.uuid4(), user_id=test_user.user_id, full_name="X", bar_council_number="X/1", district="X", consultation_fee=0, is_active=True, verification_status="VERIFIED", online_consultation=True, offline_consultation=False, pro_bono_available=False, years_of_experience=5)
    db_session.add(prof)
    avail = AdvocateAvailability(id=uuid.uuid4(), advocate_id=prof.id, date='2026-09-03', start_time='10:00', end_time='11:00', consultation_mode='ONLINE', is_available=True)
    db_session.add(avail)
    db_session.commit()
    req_data = {
        'advocate_id': str(prof.id),
        'availability_id': str(avail.id),
        'legal_category': 'Civil Law',
        'case_summary': 'Test',
        'consultation_mode': 'ONLINE',
        'appointment_date': '2026-09-03',
        'start_time': '10:00',
        'end_time': '11:00'
    }
    res1 = client.post('/api/consultations/', json=req_data, headers=auth_headers)
    app_id = res1.json()['id']
    client.patch(f'/api/consultations/{app_id}/accept', headers=auth_headers)
    client.patch(f'/api/consultations/{app_id}/reschedule', json={'new_date': '2026-10-01', 'new_start_time': '12:00', 'new_end_time': '13:00', 'message': 'Sorry'}, headers=auth_headers)
    
    res_cit = client.patch(f'/api/consultations/{app_id}/reschedule/decline', headers=auth_headers)
    assert res_cit.status_code == 200
    assert res_cit.json()['status'] == 'CANCELLED'
