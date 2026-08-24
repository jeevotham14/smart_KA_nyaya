with open('backend/app/api/routes/admin.py', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('from app.models.domain import Complaint, DirectoryService, LegalQuery, LegalStatute, User', 'from app.models.domain import Complaint, DirectoryService, LegalQuery, LegalStatute, User, AdvocateProfile, ConsultationAppointment, ConsultationBroadcast, DlsaApplication')

replacement = """@router.get("/dashboard")
def get_admin_dashboard(db: Session = Depends(get_db)):
    registered_users = db.scalar(select(func.count()).select_from(User)) or 0
    citizens = db.scalar(select(func.count()).select_from(User).where(User.role == 'citizen')) or 0
    advocates = db.scalar(select(func.count()).select_from(User).where(User.role == 'advocate')) or 0
    active_advocates = db.scalar(select(func.count()).select_from(AdvocateProfile).where(AdvocateProfile.verification_status == 'VERIFIED')) or 0
    complaints = db.scalar(select(func.count()).select_from(Complaint)) or 0
    legal_aid_applications = db.scalar(select(func.count()).select_from(DlsaApplication)) or 0
    consultations = db.scalar(select(func.count()).select_from(ConsultationAppointment)) or 0
    open_broadcasts = db.scalar(select(func.count()).select_from(ConsultationBroadcast).where(ConsultationBroadcast.status == 'OPEN')) or 0
    pending_advocate_profiles = db.scalar(select(func.count()).select_from(AdvocateProfile).where(AdvocateProfile.verification_status == 'PENDING')) or 0

    return {
        "registered_users": registered_users,
        "citizens": citizens,
        "advocates": advocates,
        "active_advocates": active_advocates,
        "complaints": complaints,
        "legal_aid_applications": legal_aid_applications,
        "consultations": consultations,
        "open_broadcasts": open_broadcasts,
        "pending_advocate_profiles": pending_advocate_profiles,
        "recent_activity": []
    }
"""
if "@router.get(\"/dashboard\")" not in c:
    c = c + "\n" + replacement

with open('backend/app/api/routes/admin.py', 'w', encoding='utf-8') as f:
    f.write(c)
