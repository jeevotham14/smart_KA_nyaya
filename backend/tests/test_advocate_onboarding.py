import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.base import Base
from app.db.session import engine, SessionLocal
import uuid
from app.models.domain import User, AdvocateProfile

Base.metadata.create_all(bind=engine)

@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

client = TestClient(app)

def create_user(role="citizen"):
    email = f"{role}_{uuid.uuid4()}@test.com"
    res = client.post("/api/auth/register", json={
        "name": f"Test {role}",
        "email": email,
        "password": "password123",
        "role": role,
    })
    return res.json()

def login_user(email):
    res = client.post("/api/auth/login", json={
        "email": email,
        "password": "password123"
    })
    return res.json()["access_token"]

def make_admin(email):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    user.role = "admin"
    db.commit()
    db.close()

def create_profile(token, bcn=None):
    if not bcn:
        bcn = f"KAR/{uuid.uuid4().hex[:8]}/2024"
    return client.post("/api/advocates/profile", json={
        "full_name": "Test Advocate",
        "bar_council_number": bcn,
        "district": "Bengaluru Urban",
        "specializations": ["Civil Law"],
        "languages": ["English"],
        "years_of_experience": 5,
        "consultation_fee": 1000
    }, headers={"Authorization": f"Bearer {token}"})

def test_roles_registration():
    # 1. advocate can register
    adv = create_user("advocate")
    assert adv["role"] == "advocate"
    
    # 2. citizen can register
    cit = create_user("citizen")
    assert cit["role"] == "citizen"

    # 3. user cannot self-register as admin
    adm = create_user("admin")
    assert adm["role"] == "citizen"  # Safely converted to citizen

def test_profile_creation_and_duplicates():
    adv = create_user("advocate")
    token = login_user(adv["email"])
    
    # 4. advocate can create own profile
    # 8. new profile status = PENDING
    # 9. new profile is_active = FALSE
    prof_res = create_profile(token)
    assert prof_res.status_code == 200
    profile = prof_res.json()
    assert profile["verification_status"] == "PENDING"
    assert profile["is_active"] == False
    
    # 6. duplicate advocate profile rejected
    dup_res = create_profile(token)
    assert dup_res.status_code == 400
    
    # 7. duplicate Bar Council number rejected
    adv2 = create_user("advocate")
    token2 = login_user(adv2["email"])
    bcn_res = create_profile(token2, bcn=profile["bar_council_number"])
    assert bcn_res.status_code == 400
    
    # 5. citizen cannot create advocate profile
    cit = create_user("citizen")
    cit_token = login_user(cit["email"])
    cit_prof = create_profile(cit_token)
    assert cit_prof.status_code == 403

def test_visibility_and_admin_controls():
    adv = create_user("advocate")
    token = login_user(adv["email"])
    prof = create_profile(token).json()
    adv_id = prof["id"]
    
    # 10. pending profile not visible publicly
    dir_res = client.get("/api/advocates")
    assert all(a["id"] != adv_id for a in dir_res.json())
    
    admin_user = create_user("admin") # becomes citizen
    make_admin(admin_user["email"])
    admin_token = login_user(admin_user["email"])
    
    # 12. citizen cannot approve
    cit = create_user("citizen")
    cit_token = login_user(cit["email"])
    cit_appr = client.patch(f"/api/admin/advocates/{adv_id}/status", json={"verification_status": "VERIFIED", "is_active": True}, headers={"Authorization": f"Bearer {cit_token}"})
    assert cit_appr.status_code == 403
    
    # 13. advocate cannot self-approve
    adv_appr = client.patch(f"/api/admin/advocates/{adv_id}/status", json={"verification_status": "VERIFIED", "is_active": True}, headers={"Authorization": f"Bearer {token}"})
    assert adv_appr.status_code == 403
    
    # 11. admin can approve
    appr_res = client.patch(f"/api/admin/advocates/{adv_id}/status", json={"verification_status": "VERIFIED", "is_active": True}, headers={"Authorization": f"Bearer {admin_token}"})
    assert appr_res.status_code == 200
    
    # 14. verified active advocate visible publicly
    dir_res = client.get("/api/advocates")
    assert any(a["id"] == adv_id for a in dir_res.json())
    
    # 15. rejected advocate not visible
    client.patch(f"/api/admin/advocates/{adv_id}/status", json={"verification_status": "REJECTED", "is_active": False}, headers={"Authorization": f"Bearer {admin_token}"})
    dir_res = client.get("/api/advocates")
    assert all(a["id"] != adv_id for a in dir_res.json())
    
    # 16. suspended advocate not visible
    client.patch(f"/api/admin/advocates/{adv_id}/status", json={"verification_status": "SUSPENDED", "is_active": False}, headers={"Authorization": f"Bearer {admin_token}"})
    dir_res = client.get("/api/advocates")
    assert all(a["id"] != adv_id for a in dir_res.json())

def test_profile_updates():
    adv = create_user("advocate")
    token = login_user(adv["email"])
    prof = create_profile(token).json()
    
    # 17. advocate profile update works
    upd_res = client.put("/api/advocates/profile", json={"consultation_fee": 1500}, headers={"Authorization": f"Bearer {token}"})
    assert upd_res.status_code == 200
    assert upd_res.json()["consultation_fee"] == 1500
    
    # 18. advocate cannot change verification_status
    # 19. advocate cannot change is_active
    upd_res2 = client.put("/api/advocates/profile", json={"verification_status": "VERIFIED", "is_active": True}, headers={"Authorization": f"Bearer {token}"})
    assert upd_res2.status_code == 200
    assert upd_res2.json()["verification_status"] == "PENDING"
    assert upd_res2.json()["is_active"] == False
    
    # 20. another advocate cannot edit someone else's profile
    # The route is `PUT /profile`, it always operates on current_user's profile.
    # Therefore, it is impossible for them to edit another's by design since there is no ID in the URL.
    # We can test that calling PUT /profile only edits the calling user's profile.
    adv2 = create_user("advocate")
    token2 = login_user(adv2["email"])
    prof2 = create_profile(token2).json()
    
    upd_res3 = client.put("/api/advocates/profile", json={"consultation_fee": 2000}, headers={"Authorization": f"Bearer {token2}"})
    assert upd_res3.json()["consultation_fee"] == 2000
    
    # Check adv1 profile wasn't affected
    db = SessionLocal()
    adv1_db = db.query(AdvocateProfile).filter(AdvocateProfile.id == uuid.UUID(prof["id"])).first()
    assert adv1_db.consultation_fee == 1500
    db.close()
