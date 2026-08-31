import uuid
import pytest
from datetime import datetime, date
from fastapi.testclient import TestClient

from app.main import app
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.domain import User, AdvocateProfile, AdvocateAvailability, LegalQuery, Complaint, GeneratedDocument, Notification, ConsultationAppointment, ConsultationBroadcast

Base.metadata.create_all(bind=engine)

@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

client = TestClient(app)


def register_user(role="citizen", email=None):
    email = email or f"{role}_{uuid.uuid4().hex[:8]}@test.com"
    res = client.post("/api/auth/register", json={
        "name": f"Test {role.title()}",
        "email": email,
        "password": "password123",
        "role": role,
    })
    assert res.status_code == 201, res.text
    return res.json(), email


def login_user(email):
    res = client.post("/api/auth/login", json={
        "email": email,
        "password": "password123"
    })
    assert res.status_code == 200, res.text
    return res.json()["access_token"]


def make_admin(email):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    user.role = "admin"
    db.commit()
    db.close()


def setup_advocate(email=None):
    user_data, email = register_user("advocate", email)
    token = login_user(email)
    bcn = f"KAR/{uuid.uuid4().hex[:6]}/2025"
    res = client.post("/api/advocates/profile", json={
        "full_name": "Senior Advocate",
        "bar_council_number": bcn,
        "district": "Bengaluru Urban",
        "specializations": ["Civil Law", "Property Law"],
        "languages": ["English", "Kannada"],
        "years_of_experience": 10,
        "consultation_fee": 1500,
        "online_consultation": True,
        "offline_consultation": True,
        "pro_bono_available": True,
    }, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200, res.text
    adv_profile = res.json()
    
    # Activate advocate in DB
    db = SessionLocal()
    prof = db.query(AdvocateProfile).filter(AdvocateProfile.id == uuid.UUID(adv_profile["id"])).first()
    prof.is_active = True
    prof.verification_status = "VERIFIED"
    db.commit()
    db.close()

    # Add availability slot
    slot_res = client.post("/api/advocates/availability", json={
        "date": date.today().isoformat(),
        "start_time": "10:00 AM",
        "end_time": "11:00 AM",
        "consultation_mode": "ONLINE"
    }, headers={"Authorization": f"Bearer {token}"})
    assert slot_res.status_code == 200, slot_res.text
    slot = slot_res.json()

    return user_data, token, adv_profile, slot


# ==============================================================================
# TASK 26 — BACKEND AUTHORIZATION TESTS
# ==============================================================================

def test_public_registration_cannot_produce_admin():
    """Attempting to register as 'admin' must default to 'citizen'."""
    user, _ = register_user("admin")
    assert user["role"] == "citizen"
    assert user["role"] != "admin"


def test_role_based_endpoint_access():
    """
    Test endpoint role enforcement:
    - Citizen endpoint: citizen -> 200, advocate -> 403
    - Advocate endpoint: advocate -> 200, citizen -> 403
    - Admin endpoint: admin -> 200, citizen -> 403, advocate -> 403
    """
    # Create citizen
    cit_data, cit_email = register_user("citizen")
    cit_token = login_user(cit_email)

    # Create advocate
    adv_data, adv_token, adv_prof, _ = setup_advocate()

    # Create admin
    adm_data, adm_email = register_user("citizen")
    make_admin(adm_email)
    adm_token = login_user(adm_email)

    # 1. Citizen Broadcast Creation (/api/consultation-broadcasts/): Citizen -> 200, Advocate -> 403
    cit_bc_res = client.post("/api/consultation-broadcasts/", json={
        "legal_category": "Civil Law",
        "district": "Bengaluru Urban",
        "preferred_language": "English",
        "consultation_mode": "ONLINE",
        "urgency": "NORMAL",
        "short_summary": "Property partition legal guidance request"
    }, headers={"Authorization": f"Bearer {cit_token}"})
    assert cit_bc_res.status_code == 200

    adv_bc_res = client.post("/api/consultation-broadcasts/", json={
        "legal_category": "Civil Law",
        "district": "Bengaluru Urban",
        "preferred_language": "English",
        "consultation_mode": "ONLINE",
        "urgency": "NORMAL",
        "short_summary": "Advocate should not broadcast"
    }, headers={"Authorization": f"Bearer {adv_token}"})
    assert adv_bc_res.status_code == 403

    # 2. Advocate Dashboard endpoint (/api/dashboard/advocate): Advocate -> 200, Citizen -> 403
    adv_dash_res = client.get("/api/dashboard/advocate", headers={"Authorization": f"Bearer {adv_token}"})
    assert adv_dash_res.status_code == 200
    assert adv_dash_res.json()["role"] == "advocate"

    cit_dash_res = client.get("/api/dashboard/advocate", headers={"Authorization": f"Bearer {cit_token}"})
    assert cit_dash_res.status_code == 403

    # 3. Admin Dashboard (/api/admin/dashboard): Admin -> 200, Citizen -> 403, Advocate -> 403
    adm_res = client.get("/api/admin/dashboard", headers={"Authorization": f"Bearer {adm_token}"})
    assert adm_res.status_code == 200

    cit_adm_res = client.get("/api/admin/dashboard", headers={"Authorization": f"Bearer {cit_token}"})
    assert cit_adm_res.status_code == 403

    adv_adm_res = client.get("/api/admin/dashboard", headers={"Authorization": f"Bearer {adv_token}"})
    assert adv_adm_res.status_code == 403


# ==============================================================================
# TASK 27 — NOTIFICATION TESTS
# ==============================================================================

def test_full_notification_lifecycle():
    """
    Verify:
    1. Consultation creation creates advocate notification
    2. Broadcast match creates advocate notification
    3. Advocate can fetch own notifications
    4. Advocate cannot fetch another advocate's notifications
    5. Unread count correct
    6. Marking read decreases unread count
    7. Citizen receives acceptance notification
    8. Document upload creates selected-advocate notification
    9. Unrelated advocate receives nothing
    10. Sensitive document/case text is not in notification
    """
    cit_data, cit_email = register_user("citizen")
    cit_token = login_user(cit_email)

    adv1_data, adv1_token, adv1_prof, adv1_slot = setup_advocate()
    adv2_data, adv2_token, adv2_prof, adv2_slot = setup_advocate()

    # Initial unread count for adv1 should be 0
    count_res = client.get("/api/notifications/unread-count", headers={"Authorization": f"Bearer {adv1_token}"})
    assert count_res.status_code == 200
    assert count_res.json()["unread_count"] == 0

    # 1. Direct consultation creation -> notifies adv1
    book_res = client.post("/api/consultations/", json={
        "advocate_id": adv1_prof["id"],
        "availability_id": adv1_slot["id"],
        "legal_category": "Civil Law",
        "case_summary": "Top secret boundary dispute and bank account details",
        "consultation_mode": "ONLINE",
        "appointment_date": adv1_slot["date"],
        "start_time": adv1_slot["start_time"],
        "end_time": adv1_slot["end_time"],
        "consultation_fee": 1500.0,
    }, headers={"Authorization": f"Bearer {cit_token}"})
    assert book_res.status_code == 200
    appt = book_res.json()

    # Advocate 1 unread count should now be 1
    adv1_notifs = client.get("/api/notifications", headers={"Authorization": f"Bearer {adv1_token}"}).json()
    assert len(adv1_notifs) == 1
    assert adv1_notifs[0]["title"] == "New Consultation Request"
    # 10. Sensitive text check: case_summary must NOT be leaked into notification text
    assert "Top secret" not in adv1_notifs[0]["message"]
    assert "bank account" not in adv1_notifs[0]["message"]

    # 9. Unrelated advocate 2 receives nothing for direct booking
    adv2_notifs = client.get("/api/notifications", headers={"Authorization": f"Bearer {adv2_token}"}).json()
    assert len(adv2_notifs) == 0

    # 5. Unread count correct
    cnt = client.get("/api/notifications/unread-count", headers={"Authorization": f"Bearer {adv1_token}"}).json()
    assert cnt["unread_count"] == 1

    # 6. Marking read decreases unread count
    notif_id = adv1_notifs[0]["notification_id"]
    mark_res = client.patch(f"/api/notifications/{notif_id}/read", headers={"Authorization": f"Bearer {adv1_token}"})
    assert mark_res.status_code == 200
    assert mark_res.json()["read_status"] is True

    cnt_after = client.get("/api/notifications/unread-count", headers={"Authorization": f"Bearer {adv1_token}"}).json()
    assert cnt_after["unread_count"] == 0

    # 4. Advocate 2 cannot mark or access Advocate 1's notification
    cross_mark = client.patch(f"/api/notifications/{notif_id}/read", headers={"Authorization": f"Bearer {adv2_token}"})
    assert cross_mark.status_code == 403

    # 7. Advocate accepts request -> Citizen receives acceptance notification
    accept_res = client.patch(f"/api/consultations/{appt['id']}/accept", headers={"Authorization": f"Bearer {adv1_token}"})
    assert accept_res.status_code == 200

    cit_notifs = client.get("/api/notifications", headers={"Authorization": f"Bearer {cit_token}"}).json()
    # Citizen got: 1) Appointment Requested, 2) Appointment Confirmed
    titles = [n["title"] for n in cit_notifs]
    assert "Appointment Confirmed" in titles

    # 8. Document upload to confirmed appointment -> Selected advocate receives notification
    upload_res = client.post(
        f"/api/consultations/{appt['id']}/documents",
        data={"document_type": "EVIDENCE", "description": "Land survey document"},
        files={"file": ("survey.pdf", b"%PDF-1.4 mock content for survey document", "application/pdf")},
        headers={"Authorization": f"Bearer {cit_token}"}
    )
    assert upload_res.status_code in (200, 201), upload_res.text

    adv1_notifs_after_upload = client.get("/api/notifications", headers={"Authorization": f"Bearer {adv1_token}"}).json()
    new_notif_titles = [n["title"] for n in adv1_notifs_after_upload]
    assert "New Document Uploaded" in new_notif_titles

    # 9. Advocate 2 still received nothing
    adv2_after = client.get("/api/notifications", headers={"Authorization": f"Bearer {adv2_token}"}).json()
    assert len(adv2_after) == 0


def test_broadcast_match_notification():
    """2. Broadcast match creates notifications for matching active advocates."""
    adv_data, adv_token, adv_prof, _ = setup_advocate()
    cit_data, cit_email = register_user("citizen")
    cit_token = login_user(cit_email)

    bc_res = client.post("/api/consultation-broadcasts/", json={
        "legal_category": "Civil Law",
        "district": "Bengaluru Urban",
        "preferred_language": "English",
        "consultation_mode": "ONLINE",
        "urgency": "HIGH",
        "short_summary": "Urgent partition suit guidance"
    }, headers={"Authorization": f"Bearer {cit_token}"})
    assert bc_res.status_code == 200

    adv_notifs = client.get("/api/notifications", headers={"Authorization": f"Bearer {adv_token}"}).json()
    assert len(adv_notifs) >= 1
    assert any("matching your practice" in n["title"].lower() for n in adv_notifs)


# ==============================================================================
# TASK 28 — CITIZEN ACTIVITY TESTS
# ==============================================================================

def test_citizen_activity_persistence_and_isolation():
    """
    Verify:
    - Citizen A: 2 legal queries, 1 consultation, 1 document
    - Citizen B: 5 records
    - GET /api/dashboard/me as A must only include A's records
    - Logout/login does not erase history (persisted in database)
    """
    db = SessionLocal()

    # Setup Citizen A
    citA, emailA = register_user("citizen")
    uidA = uuid.UUID(citA["user_id"])
    tokenA = login_user(emailA)

    # Setup Citizen B
    citB, emailB = register_user("citizen")
    uidB = uuid.UUID(citB["user_id"])
    tokenB = login_user(emailB)

    # Seed Citizen A records
    db.add(LegalQuery(user_id=uidA, grievance_text="Query 1", legal_category="Property Law", ai_response="Advice 1"))
    db.add(LegalQuery(user_id=uidA, grievance_text="Query 2", legal_category="Labour Law", ai_response="Advice 2"))
    db.add(Complaint(user_id=uidA, complaint_type="Consumer", description="Defective product", district="Bengaluru Urban", routed_authority="District Forum", status="submitted"))
    db.commit()

    # Seed Citizen B records
    for i in range(5):
        db.add(LegalQuery(user_id=uidB, grievance_text=f"Query B {i}", legal_category="Criminal Law", ai_response=f"Resp {i}"))
    db.commit()
    db.close()

    # Fetch dashboard as Citizen A
    dashA = client.get("/api/dashboard/me", headers={"Authorization": f"Bearer {tokenA}"}).json()
    assert dashA["role"] == "citizen"
    assert dashA["legal_queries"] == 2
    assert dashA["complaints"] == 1
    
    # Activity list should have 3 items for A and ZERO items belonging to B
    assert len(dashA["recent_activity"]) == 3
    for act in dashA["recent_activity"]:
        assert "Criminal Law" not in act["subject"]  # Citizen B's category

    # Fetch dashboard as Citizen B
    dashB = client.get("/api/dashboard/me", headers={"Authorization": f"Bearer {tokenB}"}).json()
    assert dashB["role"] == "citizen"
    assert dashB["legal_queries"] == 5
    assert dashB["complaints"] == 0

    # Simulate logout and re-login for Citizen A
    new_tokenA = login_user(emailA)
    dashA_relogin = client.get("/api/dashboard/me", headers={"Authorization": f"Bearer {new_tokenA}"}).json()
    assert dashA_relogin["legal_queries"] == 2
    assert dashA_relogin["complaints"] == 1
    assert len(dashA_relogin["recent_activity"]) == 3
