from fastapi import APIRouter, Depends, Request
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.domain import User, LegalQuery, Complaint, GeneratedDocument, DlsaApplication, ConsultationAppointment, ConsultationBroadcast, Notification

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/me")
def get_my_dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    uid = user.user_id
    # Counts
    legal_queries = db.scalar(select(func.count()).select_from(LegalQuery).where(LegalQuery.user_id == uid)) or 0
    complaints = db.scalar(select(func.count()).select_from(Complaint).where(Complaint.user_id == uid)) or 0
    
    # Check if GeneratedDocument model exists, if not, use 0
    generated_documents = 0
    if hasattr(GeneratedDocument, 'user_id'):
        generated_documents = db.scalar(select(func.count()).select_from(GeneratedDocument).where(GeneratedDocument.user_id == uid)) or 0
        
    legal_aid_applications = db.scalar(select(func.count()).select_from(DlsaApplication).where(DlsaApplication.user_id == uid)) or 0
    
    if user.role == "citizen":
        consultations = db.scalar(select(func.count()).select_from(ConsultationAppointment).where(ConsultationAppointment.citizen_id == uid)) or 0
        broadcasts = db.scalar(select(func.count()).select_from(ConsultationBroadcast).where(ConsultationBroadcast.citizen_id == uid)) or 0
    elif user.role == "advocate":
        from app.models.domain import AdvocateProfile
        adv_profile_id = db.scalar(select(AdvocateProfile.id).where(AdvocateProfile.user_id == uid))
        if adv_profile_id:
            consultations = db.scalar(select(func.count()).select_from(ConsultationAppointment).where(ConsultationAppointment.advocate_id == adv_profile_id)) or 0
        else:
            consultations = 0
        broadcasts = 0  # advocates don't own broadcasts
    else:
        consultations = 0
        broadcasts = 0

    unread_notifications = db.scalar(select(func.count()).select_from(Notification).where(Notification.user_id == uid, Notification.read_status == False)) or 0

    return {
        "legal_queries": legal_queries,
        "complaints": complaints,
        "generated_documents": generated_documents,
        "legal_aid_applications": legal_aid_applications,
        "consultations": consultations,
        "broadcast_requests": broadcasts,
        "unread_notifications": unread_notifications,
        "recent_activity": []
    }

