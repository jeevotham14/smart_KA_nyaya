import sys, os
sys.path.append(os.path.abspath('backend'))
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models.domain import User
from app.core.security import create_access_token

client = TestClient(app)
db = SessionLocal()
citizen = db.query(User).filter_by(role="citizen").first()
if not citizen:
    import uuid
    from app.core.security import get_password_hash
    citizen = User(user_id=uuid.uuid4(), email="cit2@test.com", password_hash=get_password_hash("password"), role="citizen", full_name="Test Cit")
    db.add(citizen)
    db.commit()

token = create_access_token({"sub": str(citizen.user_id), "role": citizen.role})
headers = {"Authorization": f"Bearer {token}"}

payload = {
    "legal_category": "Civil Law",
    "district": "Bengaluru",
    "preferred_language": "Kannada",
    "consultation_mode": "ONLINE",
    "short_summary": "Test issue",
    "preferred_date": "",
    "preferred_time": "",
    "pro_bono_requested": False
}
resp = client.post("/api/consultation-broadcasts/", json=payload, headers=headers)
print("CREATE:", resp.status_code, resp.text)

resp = client.get("/api/consultation-broadcasts/my", headers=headers)
print("MY:", resp.status_code, resp.text)
