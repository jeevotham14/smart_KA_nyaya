from app.db.session import SessionLocal
from app.models.domain import AdvocateProfile
db = SessionLocal()
total = db.query(AdvocateProfile).count()
active = db.query(AdvocateProfile).filter(AdvocateProfile.is_active == True).count()
verified = db.query(AdvocateProfile).filter(AdvocateProfile.verification_status == 'VERIFIED').count()
print(f"TOTAL_ADVOCATES = {total}")
print(f"ACTIVE_ADVOCATES = {active}")
print(f"VISIBLE_ADVOCATES = {verified}")
