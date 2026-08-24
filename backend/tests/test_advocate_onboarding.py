import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.base import Base
from app.db.session import engine, SessionLocal
import uuid
from app.models.domain import User

Base.metadata.create_all(bind=engine)

@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_advocate_flow():
    # 1. Register as advocate
    register_res = client.post("/api/auth/register", json={
        "name": "Test Advocate",
        "email": f"adv_{uuid.uuid4()}@test.com",
        "password": "password123",
        "role": "advocate",
        "district": "Bengaluru Urban"
    })
    assert register_res.status_code == 201
    user = register_res.json()
    assert user["role"] == "advocate"

    # 2. Login
    login_res = client.post("/api/auth/login", json={
        "email": user["email"],
        "password": "password123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create Profile
    prof_res = client.post("/api/advocates/profile", json={
        "full_name": "Test Advocate",
        "bar_council_number": f"KAR/{uuid.uuid4().hex[:8]}/2024",
        "district": "Bengaluru Urban",
        "specializations": ["Civil Law"],
        "languages": ["English"],
        "years_of_experience": 5,
        "consultation_fee": 1000
    }, headers=headers)
    assert prof_res.status_code == 200
    profile = prof_res.json()
    assert profile["verification_status"] == "PENDING"
    assert profile["is_active"] == False

    adv_id = profile["id"]

    # 4. Check Directory (should be empty)
    dir_res = client.get("/api/advocates")
    assert dir_res.status_code == 200
    assert all(a["id"] != adv_id for a in dir_res.json())

    # 5. Create Admin & Approve
    admin_res = client.post("/api/auth/register", json={
        "name": "Admin",
        "email": f"admin_{uuid.uuid4()}@test.com",
        "password": "password123",
        "role": "admin"
    })
    admin_login = client.post("/api/auth/login", json={
        "email": admin_res.json()["email"],
        "password": "password123"
    })
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Hack to make admin role actually admin since register ignores it unless we test
    db = SessionLocal()
    admin_user = db.query(User).filter(User.email == admin_res.json()["email"]).first()
    admin_user.role = "admin"
    db.commit()

    # Re-login to get admin token
    admin_login = client.post("/api/auth/login", json={
        "email": admin_res.json()["email"],
        "password": "password123"
    })
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    approve_res = client.patch(f"/api/admin/advocates/{adv_id}/status", json={
        "verification_status": "VERIFIED",
        "is_active": True
    }, headers=admin_headers)
    assert approve_res.status_code == 200

    # 6. Check Directory again
    dir_res2 = client.get("/api/advocates")
    assert any(a["id"] == adv_id for a in dir_res2.json())
