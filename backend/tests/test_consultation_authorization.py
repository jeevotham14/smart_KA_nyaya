import io
import uuid
import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.models.domain import (
    User, AdvocateProfile, AdvocateAvailability,
    ConsultationAppointment, ConsultationBroadcast,
    ConsultationBroadcastRecipient, ConsultationDocument
)
from app.models.enums import UserRole
from app.core.security import create_access_token, hash_password

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
def test_setup():
    db = TestingSessionLocal()

    # 1. Citizen 1
    c1_id = uuid.uuid4()
    c1 = User(
        user_id=c1_id,
        name="Citizen One",
        email=f"c1_{c1_id.hex[:6]}@example.com",
        password_hash=hash_password("Pass@123"),
        role="citizen",
        district="Bengaluru",
        language_pref="English",
    )
    db.add(c1)

    # 2. Citizen 2
    c2_id = uuid.uuid4()
    c2 = User(
        user_id=c2_id,
        name="Citizen Two",
        email=f"c2_{c2_id.hex[:6]}@example.com",
        password_hash=hash_password("Pass@123"),
        role="citizen",
        district="Mysuru",
        language_pref="English",
    )
    db.add(c2)

    # 3. Assigned Advocate User & Profile
    adv_user1_id = uuid.uuid4()
    adv_user1 = User(
        user_id=adv_user1_id,
        name="Advocate Assigned",
        email=f"adv1_{adv_user1_id.hex[:6]}@example.com",
        password_hash=hash_password("Pass@123"),
        role="advocate",
        district="Bengaluru",
        language_pref="English",
    )
    db.add(adv_user1)

    adv_profile1_id = uuid.uuid4()
    adv_profile1 = AdvocateProfile(
        id=adv_profile1_id,
        user_id=adv_user1_id,
        full_name="Advocate Assigned",
        bar_council_number="KAR/111/2026",
        specializations=["Property", "Civil"],
        district="Bengaluru",
        verification_status="APPROVED",
        is_active=True,
    )
    db.add(adv_profile1)

    # 4. Unmatched Advocate User & Profile
    adv_user2_id = uuid.uuid4()
    adv_user2 = User(
        user_id=adv_user2_id,
        name="Advocate Unmatched",
        email=f"adv2_{adv_user2_id.hex[:6]}@example.com",
        password_hash=hash_password("Pass@123"),
        role="advocate",
        district="Dharwad",
        language_pref="English",
    )
    db.add(adv_user2)

    adv_profile2_id = uuid.uuid4()
    adv_profile2 = AdvocateProfile(
        id=adv_profile2_id,
        user_id=adv_user2_id,
        full_name="Advocate Unmatched",
        bar_council_number="KAR/222/2026",
        specializations=["Criminal"],
        district="Dharwad",
        verification_status="APPROVED",
        is_active=True,
    )
    db.add(adv_profile2)

    # Availabilities
    avail1 = AdvocateAvailability(
        id=uuid.uuid4(),
        advocate_id=adv_profile1_id,
        date="2026-09-01",
        start_time="10:00",
        end_time="11:00",
        consultation_mode="ONLINE",
        is_available=False,
    )
    db.add(avail1)

    avail2 = AdvocateAvailability(
        id=uuid.uuid4(),
        advocate_id=adv_profile1_id,
        date="2026-09-02",
        start_time="11:00",
        end_time="12:00",
        consultation_mode="ONLINE",
        is_available=False,
    )
    db.add(avail2)

    avail3 = AdvocateAvailability(
        id=uuid.uuid4(),
        advocate_id=adv_profile1_id,
        date="2026-09-03",
        start_time="12:00",
        end_time="13:00",
        consultation_mode="ONLINE",
        is_available=False,
    )
    db.add(avail3)

    avail4 = AdvocateAvailability(
        id=uuid.uuid4(),
        advocate_id=adv_profile1_id,
        date="2026-09-04",
        start_time="14:00",
        end_time="15:00",
        consultation_mode="ONLINE",
        is_available=False,
    )
    db.add(avail4)

    # Appointments
    confirmed_app_id = uuid.uuid4()
    confirmed_app = ConsultationAppointment(
        id=confirmed_app_id,
        citizen_id=c1_id,
        advocate_id=adv_profile1_id,
        availability_id=avail1.id,
        legal_category="Property",
        case_summary="Property boundary dispute in Bengaluru",
        consultation_mode="ONLINE",
        appointment_date="2026-09-01",
        start_time="10:00",
        end_time="11:00",
        status="CONFIRMED",
    )
    db.add(confirmed_app)

    pending_app_id = uuid.uuid4()
    pending_app = ConsultationAppointment(
        id=pending_app_id,
        citizen_id=c1_id,
        advocate_id=adv_profile1_id,
        availability_id=avail2.id,
        legal_category="Civil",
        case_summary="Pending civil query",
        consultation_mode="ONLINE",
        appointment_date="2026-09-02",
        start_time="11:00",
        end_time="12:00",
        status="PENDING",
    )
    db.add(pending_app)

    rejected_app_id = uuid.uuid4()
    rejected_app = ConsultationAppointment(
        id=rejected_app_id,
        citizen_id=c1_id,
        advocate_id=adv_profile1_id,
        availability_id=avail3.id,
        legal_category="Civil",
        case_summary="Rejected civil query",
        consultation_mode="ONLINE",
        appointment_date="2026-09-03",
        start_time="12:00",
        end_time="13:00",
        status="REJECTED",
    )
    db.add(rejected_app)

    cancelled_app_id = uuid.uuid4()
    cancelled_app = ConsultationAppointment(
        id=cancelled_app_id,
        citizen_id=c1_id,
        advocate_id=adv_profile1_id,
        availability_id=avail4.id,
        legal_category="Civil",
        case_summary="Cancelled civil query",
        consultation_mode="ONLINE",
        appointment_date="2026-09-04",
        start_time="14:00",
        end_time="15:00",
        status="CANCELLED",
    )
    db.add(cancelled_app)

    # Broadcast
    broadcast_id = uuid.uuid4()
    broadcast = ConsultationBroadcast(
        id=broadcast_id,
        citizen_id=c1_id,
        legal_category="Labour",
        district="Bengaluru",
        preferred_language="English",
        consultation_mode="ONLINE",
        short_summary="Wages inquiry",
        status="OPEN",
        expires_at=datetime.now(timezone.utc) + timedelta(hours=48),
    )
    db.add(broadcast)

    db.commit()

    tokens = {
        "c1": create_access_token(str(c1_id), {"role": "citizen"}),
        "c2": create_access_token(str(c2_id), {"role": "citizen"}),
        "adv_assigned": create_access_token(str(adv_user1_id), {"role": "advocate"}),
        "adv_unmatched": create_access_token(str(adv_user2_id), {"role": "advocate"}),
    }

    data_ids = {
        "c1_id": c1_id,
        "c2_id": c2_id,
        "adv_user1_id": adv_user1_id,
        "adv_user2_id": adv_user2_id,
        "confirmed_app_id": confirmed_app_id,
        "pending_app_id": pending_app_id,
        "rejected_app_id": rejected_app_id,
        "cancelled_app_id": cancelled_app_id,
        "broadcast_id": broadcast_id,
    }

    db.close()
    return tokens, data_ids


# ── TEST 1: Citizen can upload to own CONFIRMED appointment ─────────────────
def test_citizen_can_upload_to_own_confirmed_appointment(test_setup):
    tokens, data = test_setup
    with TestClient(app) as client:
        pdf_bytes = b"%PDF-1.4 sample notice content"
        files = {"file": ("sample_notice.pdf", pdf_bytes, "application/pdf")}
        data_form = {"document_type": "LEGAL_NOTICE", "description": "Notice served"}

        res = client.post(
            f"/api/consultations/{data['confirmed_app_id']}/documents",
            headers={"Authorization": f"Bearer {tokens['c1']}"},
            files=files,
            data=data_form,
        )
        assert res.status_code == 201
        body = res.json()
        assert body["filename"] == "sample_notice.pdf"
        assert body["document_type"] == "LEGAL_NOTICE"
        assert body["mime_type"] == "application/pdf"
        assert "storage_key" not in body


# ── TEST 2: Citizen cannot upload to another citizen's appointment ──────────
def test_citizen_cannot_upload_to_another_citizen_appointment(test_setup):
    tokens, data = test_setup
    with TestClient(app) as client:
        pdf_bytes = b"%PDF-1.4 intruder document"
        files = {"file": ("intruder.pdf", pdf_bytes, "application/pdf")}
        res = client.post(
            f"/api/consultations/{data['confirmed_app_id']}/documents",
            headers={"Authorization": f"Bearer {tokens['c2']}"},
            files=files,
            data={"document_type": "EVIDENCE"},
        )
        assert res.status_code == 403


# ── TEST 3: Advocate cannot access unrelated appointment document ───────────
def test_advocate_cannot_access_unrelated_appointment_document(test_setup):
    tokens, data = test_setup
    with TestClient(app) as client:
        res = client.get(
            f"/api/consultations/{data['confirmed_app_id']}/documents",
            headers={"Authorization": f"Bearer {tokens['adv_unmatched']}"},
        )
        assert res.status_code == 403


# ── TEST 4: Assigned advocate can list documents ────────────────────────────
def test_assigned_advocate_can_list_documents(test_setup):
    tokens, data = test_setup
    with TestClient(app) as client:
        # First upload as citizen
        pdf_bytes = b"%PDF-1.4 sample notice content"
        files = {"file": ("sample_notice.pdf", pdf_bytes, "application/pdf")}
        client.post(
            f"/api/consultations/{data['confirmed_app_id']}/documents",
            headers={"Authorization": f"Bearer {tokens['c1']}"},
            files=files,
            data={"document_type": "LEGAL_NOTICE"},
        )

        res = client.get(
            f"/api/consultations/{data['confirmed_app_id']}/documents",
            headers={"Authorization": f"Bearer {tokens['adv_assigned']}"},
        )
        assert res.status_code == 200
        docs = res.json()
        assert len(docs) >= 1
        assert docs[0]["filename"] == "sample_notice.pdf"
        assert "storage_key" not in docs[0]


# ── TEST 5: Assigned advocate can download document ─────────────────────────
def test_assigned_advocate_can_download_document(test_setup):
    tokens, data = test_setup
    with TestClient(app) as client:
        # Upload
        pdf_bytes = b"%PDF-1.4 sample notice download test"
        files = {"file": ("sample_notice.pdf", pdf_bytes, "application/pdf")}
        upload_res = client.post(
            f"/api/consultations/{data['confirmed_app_id']}/documents",
            headers={"Authorization": f"Bearer {tokens['c1']}"},
            files=files,
            data={"document_type": "LEGAL_NOTICE"},
        )
        doc_id = upload_res.json()["id"]

        # Download
        dl_res = client.get(
            f"/api/consultations/{data['confirmed_app_id']}/documents/{doc_id}/download",
            headers={"Authorization": f"Bearer {tokens['adv_assigned']}"},
        )
        assert dl_res.status_code == 200
        assert dl_res.content.startswith(b"%PDF-1.4")
        assert "attachment" in dl_res.headers.get("content-disposition", "")


# ── TEST 6: Unmatched advocate cannot download document ─────────────────────
def test_unmatched_advocate_cannot_download_document(test_setup):
    tokens, data = test_setup
    with TestClient(app) as client:
        pdf_bytes = b"%PDF-1.4 protected file"
        files = {"file": ("protected.pdf", pdf_bytes, "application/pdf")}
        upload_res = client.post(
            f"/api/consultations/{data['confirmed_app_id']}/documents",
            headers={"Authorization": f"Bearer {tokens['c1']}"},
            files=files,
            data={"document_type": "OTHER"},
        )
        doc_id = upload_res.json()["id"]

        dl_res = client.get(
            f"/api/consultations/{data['confirmed_app_id']}/documents/{doc_id}/download",
            headers={"Authorization": f"Bearer {tokens['adv_unmatched']}"},
        )
        assert dl_res.status_code == 403


# ── TEST 7: Pending consultation upload rejected ────────────────────────────
def test_pending_consultation_upload_rejected(test_setup):
    tokens, data = test_setup
    with TestClient(app) as client:
        pdf_bytes = b"%PDF-1.4 pending test"
        files = {"file": ("pending.pdf", pdf_bytes, "application/pdf")}
        res = client.post(
            f"/api/consultations/{data['pending_app_id']}/documents",
            headers={"Authorization": f"Bearer {tokens['c1']}"},
            files=files,
            data={"document_type": "OTHER"},
        )
        assert res.status_code in (400, 403)


# ── TEST 8: Rejected consultation upload rejected ───────────────────────────
def test_rejected_consultation_upload_rejected(test_setup):
    tokens, data = test_setup
    with TestClient(app) as client:
        pdf_bytes = b"%PDF-1.4 rejected test"
        files = {"file": ("rejected.pdf", pdf_bytes, "application/pdf")}
        res = client.post(
            f"/api/consultations/{data['rejected_app_id']}/documents",
            headers={"Authorization": f"Bearer {tokens['c1']}"},
            files=files,
            data={"document_type": "OTHER"},
        )
        assert res.status_code in (400, 403)


# ── TEST 9: Cancelled consultation upload rejected ──────────────────────────
def test_cancelled_consultation_upload_rejected(test_setup):
    tokens, data = test_setup
    with TestClient(app) as client:
        pdf_bytes = b"%PDF-1.4 cancelled test"
        files = {"file": ("cancelled.pdf", pdf_bytes, "application/pdf")}
        res = client.post(
            f"/api/consultations/{data['cancelled_app_id']}/documents",
            headers={"Authorization": f"Bearer {tokens['c1']}"},
            files=files,
            data={"document_type": "OTHER"},
        )
        assert res.status_code in (400, 403)


# ── TEST 10: Unsupported file type rejected ─────────────────────────────────
def test_unsupported_file_type_rejected(test_setup):
    tokens, data = test_setup
    with TestClient(app) as client:
        exe_bytes = b"MZ\x90\x00\x03\x00\x00\x00"
        files = {"file": ("malicious.exe", exe_bytes, "application/x-msdownload")}
        res = client.post(
            f"/api/consultations/{data['confirmed_app_id']}/documents",
            headers={"Authorization": f"Bearer {tokens['c1']}"},
            files=files,
            data={"document_type": "OTHER"},
        )
        assert res.status_code == 400


# ── TEST 11: Oversized file rejected (>10MB) ────────────────────────────────
def test_oversized_file_rejected(test_setup):
    tokens, data = test_setup
    with TestClient(app) as client:
        oversized = b"%PDF-1.4" + (b"0" * (11 * 1024 * 1024))
        files = {"file": ("huge.pdf", oversized, "application/pdf")}
        res = client.post(
            f"/api/consultations/{data['confirmed_app_id']}/documents",
            headers={"Authorization": f"Bearer {tokens['c1']}"},
            files=files,
            data={"document_type": "OTHER"},
        )
        assert res.status_code == 400


# ── TEST 12: Path traversal filename handled safely ─────────────────────────
def test_path_traversal_filename_handled_safely(test_setup):
    tokens, data = test_setup
    with TestClient(app) as client:
        pdf_bytes = b"%PDF-1.4 safe traversal check"
        files = {"file": ("../../../../etc/passwd.pdf", pdf_bytes, "application/pdf")}
        res = client.post(
            f"/api/consultations/{data['confirmed_app_id']}/documents",
            headers={"Authorization": f"Bearer {tokens['c1']}"},
            files=files,
            data={"document_type": "LEGAL_NOTICE"},
        )
        assert res.status_code == 201
        doc_id = res.json()["id"]

        db = TestingSessionLocal()
        doc = db.get(ConsultationDocument, uuid.UUID(doc_id))
        db.close()

        assert ".." not in doc.storage_key
        assert ".." not in doc.original_filename


# ── TEST 13: Document cannot be requested using wrong appointment_id ────────
def test_document_cannot_be_requested_using_wrong_appointment_id(test_setup):
    tokens, data = test_setup
    with TestClient(app) as client:
        pdf_bytes = b"%PDF-1.4 file for wrong appointment test"
        files = {"file": ("test.pdf", pdf_bytes, "application/pdf")}
        upload_res = client.post(
            f"/api/consultations/{data['confirmed_app_id']}/documents",
            headers={"Authorization": f"Bearer {tokens['c1']}"},
            files=files,
            data={"document_type": "OTHER"},
        )
        doc_id = upload_res.json()["id"]

        wrong_appointment_id = uuid.uuid4()
        res = client.get(
            f"/api/consultations/{wrong_appointment_id}/documents/{doc_id}/download",
            headers={"Authorization": f"Bearer {tokens['c1']}"},
        )
        assert res.status_code in (403, 404)


# ── TEST 14: Deleted document cannot be downloaded ──────────────────────────
def test_deleted_document_cannot_be_downloaded(test_setup):
    tokens, data = test_setup
    with TestClient(app) as client:
        pdf_bytes = b"%PDF-1.4 document to be deleted"
        files = {"file": ("delete_me.pdf", pdf_bytes, "application/pdf")}
        upload_res = client.post(
            f"/api/consultations/{data['confirmed_app_id']}/documents",
            headers={"Authorization": f"Bearer {tokens['c1']}"},
            files=files,
            data={"document_type": "OTHER"},
        )
        doc_id = upload_res.json()["id"]

        del_res = client.delete(
            f"/api/consultations/{data['confirmed_app_id']}/documents/{doc_id}",
            headers={"Authorization": f"Bearer {tokens['c1']}"},
        )
        assert del_res.status_code == 200

        dl_res = client.get(
            f"/api/consultations/{data['confirmed_app_id']}/documents/{doc_id}/download",
            headers={"Authorization": f"Bearer {tokens['c1']}"},
        )
        assert dl_res.status_code == 404


# ── TASK 21: PRIVACY TESTS ──────────────────────────────────────────────────
def test_advocate_broadcast_apis_contain_zero_document_fields(test_setup):
    tokens, data = test_setup
    with TestClient(app) as client:
        res = client.get(
            "/api/consultation-broadcasts/matched",
            headers={"Authorization": f"Bearer {tokens['adv_assigned']}"},
        )
        assert res.status_code == 200
        broadcasts = res.json()

        forbidden_fields = [
            "filename", "storage_key", "document_id", "document_url",
            "uploaded_file", "file_content", "documents"
        ]

        for b in broadcasts:
            for field in forbidden_fields:
                assert field not in b, f"Forbidden privacy field '{field}' found in broadcast response!"


def test_public_advocate_directory_contains_no_citizen_files():
    with TestClient(app) as client:
        res = client.get("/api/advocates")
        assert res.status_code == 200
        profiles = res.json()

        forbidden_fields = [
            "filename", "storage_key", "document_id", "document_url",
            "uploaded_file", "file_content", "documents"
        ]
        for p in profiles:
            for field in forbidden_fields:
                assert field not in p, f"Forbidden file field '{field}' found in advocate directory profile!"
