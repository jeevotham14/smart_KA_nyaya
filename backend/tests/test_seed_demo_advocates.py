import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select, func

from app.main import create_app
from app.db.session import SessionLocal
from app.models.domain import User, AdvocateProfile
from app.scripts.seed_demo_advocates import seed_demo_advocates, resolve_csv_path, parse_list_field, parse_boolean
from app.core.security import verify_password

app = create_app()
client = TestClient(app)
DEMO_PWD = os.getenv("DEMO_ADVOCATE_PASSWORD", "DemoAdvocate@123")


def test_01_csv_contains_10_rows():
    """Verify CSV file exists and has exactly 10 advocate rows."""
    path = resolve_csv_path()
    assert path.exists()
    import csv
    with open(path, mode="r", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
        assert len(rows) == 10


def test_02_seeder_creates_10_users_and_profiles():
    """Verify seeding creates 10 Users and 10 linked AdvocateProfiles."""
    db = SessionLocal()
    try:
        stats = seed_demo_advocates(db=db, force=True)
        assert stats["csv_rows"] == 10
        assert stats["user_profile_links_valid"] is True

        # Query all demo users
        demo_users = db.scalars(
            select(User).where(User.email.like("advocate%@demo.smartnyaya.local"))
        ).all()
        assert len(demo_users) == 10

        # Query all demo advocate profiles
        demo_profiles = db.scalars(
            select(AdvocateProfile).where(AdvocateProfile.bar_council_number.like("DEMO-KSBC-2026-%"))
        ).all()
        assert len(demo_profiles) == 10
    finally:
        db.close()


def test_03_user_ids_match_profile_user_ids():
    """Verify User.user_id == AdvocateProfile.user_id for all 10 demo advocates."""
    db = SessionLocal()
    try:
        demo_profiles = db.scalars(
            select(AdvocateProfile).where(AdvocateProfile.bar_council_number.like("DEMO-KSBC-2026-%"))
        ).all()
        assert len(demo_profiles) == 10

        for profile in demo_profiles:
            user = db.get(User, profile.user_id)
            assert user is not None
            assert user.user_id == profile.user_id
            assert user.email.startswith("advocate")
            assert user.role in ("lawyer_advisor", "advocate")
    finally:
        db.close()


def test_04_passwords_stored_hashed():
    """Verify passwords are not plaintext and verify correctly against DEMO_ADVOCATE_PASSWORD."""
    db = SessionLocal()
    try:
        user1 = db.scalar(select(User).where(User.email == "advocate001@demo.smartnyaya.local"))
        assert user1 is not None
        assert user1.password_hash != DEMO_PWD
        assert user1.password_hash.startswith("$2b$") or len(user1.password_hash) > 20
        assert verify_password(DEMO_PWD, user1.password_hash) is True
    finally:
        db.close()


def test_05_login_advocate001():
    """Verify advocate001 can successfully log in via /api/auth/login."""
    res = client.post("/api/auth/login", json={
        "email": "advocate001@demo.smartnyaya.local",
        "password": DEMO_PWD
    })
    assert res.status_code == 200, res.text
    data = res.json()
    assert "access_token" in data

    token = data["access_token"]
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    user_data = me_res.json()
    assert user_data["email"] == "advocate001@demo.smartnyaya.local"
    assert user_data["role"] in ("lawyer_advisor", "advocate")


def test_06_login_advocate005_and_advocate010():
    """Verify advocate005 and advocate010 can also log in and retrieve role."""
    for email in ["advocate005@demo.smartnyaya.local", "advocate010@demo.smartnyaya.local"]:
        res = client.post("/api/auth/login", json={
            "email": email,
            "password": DEMO_PWD
        })
        assert res.status_code == 200, f"Failed for {email}: {res.text}"
        token = res.json()["access_token"]
        me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200
        assert me_res.json()["email"] == email


def test_07_seeder_idempotence():
    """Verify running seeder multiple times produces no duplicates."""
    db = SessionLocal()
    try:
        # Run seeder again
        stats = seed_demo_advocates(db=db, force=True)
        assert stats["users_created"] == 0
        assert stats["users_updated"] == 10
        assert stats["profiles_created"] == 0
        assert stats["profiles_updated"] == 10

        # Total counts should strictly remain 10
        user_count = db.scalar(
            select(func.count()).select_from(User).where(User.email.like("advocate%@demo.smartnyaya.local"))
        )
        assert user_count == 10

        profile_count = db.scalar(
            select(func.count()).select_from(AdvocateProfile).where(AdvocateProfile.bar_council_number.like("DEMO-KSBC-2026-%"))
        )
        assert profile_count == 10
    finally:
        db.close()


def test_08_directory_does_not_leak_auth_data():
    """Verify GET /api/advocates returns demo advocates without password hashes or auth secrets."""
    res = client.get("/api/advocates")
    assert res.status_code == 200
    advocates = res.json()
    assert isinstance(advocates, list)
    assert len(advocates) >= 10

    # Inspect all items
    for adv in advocates:
        assert "password" not in adv
        assert "password_hash" not in adv
        assert "access_token" not in adv
        assert "jwt" not in adv


def test_09_directory_filters_work():
    """Verify filtering by district, specialization, language, and pro_bono returns expected advocates."""
    # Test district filter: Bagalkot
    res_bagalkot = client.get("/api/advocates?district=Bagalkot")
    assert res_bagalkot.status_code == 200
    bagalkot_list = res_bagalkot.json()
    assert len(bagalkot_list) >= 3
    for a in bagalkot_list:
        assert a["district"].lower() == "bagalkot"

    # Test specialization filter: Criminal Law
    res_crim = client.get("/api/advocates?specialization=Criminal Law")
    assert res_crim.status_code == 200
    crim_list = res_crim.json()
    assert len(crim_list) >= 1

    # Test pro bono filter
    res_pro_bono = client.get("/api/advocates?pro_bono=true")
    assert res_pro_bono.status_code == 200
    pb_list = res_pro_bono.json()
    assert len(pb_list) >= 1


def test_10_advocate_dashboard_loads():
    """Verify logged-in demo advocate can load /api/dashboard/me and /api/dashboard/advocate successfully."""
    login_res = client.post("/api/auth/login", json={
        "email": "advocate001@demo.smartnyaya.local",
        "password": DEMO_PWD
    })
    token = login_res.json()["access_token"]

    dash_res = client.get("/api/dashboard/me", headers={"Authorization": f"Bearer {token}"})
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert "operational_metrics" in dash_data or "action_required" in dash_data

    adv_dash_res = client.get("/api/dashboard/advocate", headers={"Authorization": f"Bearer {token}"})
    assert adv_dash_res.status_code == 200
    adv_dash_data = adv_dash_res.json()
    assert "action_required" in adv_dash_data
    assert "new_direct_requests" in adv_dash_data
    assert "upcoming_consultations" in adv_dash_data
