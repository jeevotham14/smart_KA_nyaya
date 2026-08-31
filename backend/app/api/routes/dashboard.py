from datetime import date, datetime
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.domain import (
    User,
    LegalQuery,
    Complaint,
    GeneratedDocument,
    DlsaApplication,
    ConsultationAppointment,
    ConsultationBroadcast,
    ConsultationBroadcastRecipient,
    AdvocateProfile,
    Notification,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _format_date(dt: Any) -> str:
    if not dt:
        return ""
    if isinstance(dt, (datetime, date)):
        return dt.strftime("%d %b %Y, %I:%M %p") if isinstance(dt, datetime) else dt.strftime("%d %b %Y")
    return str(dt)


@router.get("/me")
def get_my_dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns real database-backed activity metrics and history.
    Strictly isolated to authenticated user.
    """
    uid = user.user_id

    # If the user is an advocate, return advocate dashboard metrics
    if user.role == "advocate":
        return get_advocate_dashboard(user=user, db=db)

    # Citizen dashboard metrics
    legal_queries = db.scalar(
        select(func.count()).select_from(LegalQuery).where(LegalQuery.user_id == uid)
    ) or 0
    complaints = db.scalar(
        select(func.count()).select_from(Complaint).where(Complaint.user_id == uid)
    ) or 0
    
    generated_documents = 0
    if hasattr(GeneratedDocument, 'user_id'):
        generated_documents = db.scalar(
            select(func.count()).select_from(GeneratedDocument).where(GeneratedDocument.user_id == uid)
        ) or 0
        
    legal_aid_applications = db.scalar(
        select(func.count()).select_from(DlsaApplication).where(DlsaApplication.user_id == uid)
    ) or 0
    consultations = db.scalar(
        select(func.count()).select_from(ConsultationAppointment).where(ConsultationAppointment.citizen_id == uid)
    ) or 0
    broadcasts = db.scalar(
        select(func.count()).select_from(ConsultationBroadcast).where(ConsultationBroadcast.citizen_id == uid)
    ) or 0
    unread_notifications = db.scalar(
        select(func.count()).select_from(Notification).where(
            Notification.user_id == uid,
            Notification.read_status == False,
        )
    ) or 0

    # Build real chronological recent activity
    activity_items = []

    # 1. Legal queries
    queries = db.scalars(
        select(LegalQuery).where(LegalQuery.user_id == uid).order_by(LegalQuery.created_at.desc()).limit(10)
    ).all()
    for q in queries:
        activity_items.append({
            "type": "Legal Query",
            "subject": f"Legal Query: {q.legal_category}",
            "date": _format_date(q.created_at),
            "raw_date": q.created_at or datetime.min,
        })

    # 2. Complaints
    user_complaints = db.scalars(
        select(Complaint).where(Complaint.user_id == uid).order_by(Complaint.created_at.desc()).limit(10)
    ).all()
    for c in user_complaints:
        activity_items.append({
            "type": "Complaint",
            "subject": f"Complaint ({c.complaint_type}) - {c.status}",
            "date": _format_date(c.created_at),
            "raw_date": c.created_at or datetime.min,
        })

    # 3. Generated documents
    if hasattr(GeneratedDocument, 'user_id'):
        user_docs = db.scalars(
            select(GeneratedDocument).where(GeneratedDocument.user_id == uid).order_by(GeneratedDocument.created_at.desc()).limit(10)
        ).all()
        for d in user_docs:
            activity_items.append({
                "type": "Document",
                "subject": f"Generated: {d.doc_type}",
                "date": _format_date(d.created_at),
                "raw_date": d.created_at or datetime.min,
            })

    # 4. DLSA Applications
    dlsa_apps = db.scalars(
        select(DlsaApplication).where(DlsaApplication.user_id == uid).order_by(DlsaApplication.created_at.desc()).limit(10)
    ).all()
    for a in dlsa_apps:
        activity_items.append({
            "type": "Legal Aid",
            "subject": f"DLSA Legal Aid: {a.category} ({a.status})",
            "date": _format_date(a.created_at),
            "raw_date": a.created_at or datetime.min,
        })

    # 5. Consultations
    user_appts = db.scalars(
        select(ConsultationAppointment).where(ConsultationAppointment.citizen_id == uid).order_by(ConsultationAppointment.created_at.desc()).limit(10)
    ).all()
    for ca in user_appts:
        activity_items.append({
            "type": "Consultation",
            "subject": f"Consultation on {ca.appointment_date} ({ca.status})",
            "date": _format_date(ca.created_at),
            "raw_date": ca.created_at or datetime.min,
        })

    # 6. Broadcasts
    user_broadcasts = db.scalars(
        select(ConsultationBroadcast).where(ConsultationBroadcast.citizen_id == uid).order_by(ConsultationBroadcast.created_at.desc()).limit(10)
    ).all()
    for b in user_broadcasts:
        activity_items.append({
            "type": "Broadcast",
            "subject": f"Broadcast Request: {b.legal_category} ({b.status})",
            "date": _format_date(b.created_at),
            "raw_date": b.created_at or datetime.min,
        })

    # Sort all activity newest first and pick top 15
    activity_items.sort(key=lambda x: x["raw_date"], reverse=True)
    recent_activity = [
        {"type": item["type"], "subject": item["subject"], "date": item["date"]}
        for item in activity_items[:15]
    ]

    return {
        "role": "citizen",
        "legal_queries": legal_queries,
        "complaints": complaints,
        "generated_documents": generated_documents,
        "legal_aid_applications": legal_aid_applications,
        "consultations": consultations,
        "broadcast_requests": broadcasts,
        "unread_notifications": unread_notifications,
        "recent_activity": recent_activity,
    }


@router.get("/advocate")
def get_advocate_dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns real operational metrics and consultation pipelines for authenticated advocate.
    """
    if user.role != "advocate":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to registered advocates"
        )

    uid = user.user_id
    adv_profile = db.scalar(select(AdvocateProfile).where(AdvocateProfile.user_id == uid))

    unread_notifications = db.scalar(
        select(func.count()).select_from(Notification).where(
            Notification.user_id == uid,
            Notification.read_status == False,
        )
    ) or 0

    if not adv_profile:
        return {
            "role": "advocate",
            "has_profile": False,
            "profile_status": "NO_PROFILE",
            "is_active": False,
            "name": user.name,
            "new_direct_requests": 0,
            "confirmed_consultations": 0,
            "broadcast_matches": 0,
            "reschedule_requests": 0,
            "todays_appointments": 0,
            "unread_notifications": unread_notifications,
            "action_required": {"direct_requests": [], "broadcast_matches": [], "reschedule_requests": []},
            "todays_consultations": [],
            "upcoming_consultations": [],
            "recent_activity": [],
        }

    adv_id = adv_profile.id
    today_str = date.today().isoformat()

    # 1. New direct requests (PENDING)
    pending_appts = db.scalars(
        select(ConsultationAppointment)
        .where(ConsultationAppointment.advocate_id == adv_id, ConsultationAppointment.status == "PENDING")
        .order_by(ConsultationAppointment.created_at.desc())
    ).all()
    new_direct_requests = len(pending_appts)

    # 2. Confirmed consultations
    confirmed_appts = db.scalars(
        select(ConsultationAppointment)
        .where(ConsultationAppointment.advocate_id == adv_id, ConsultationAppointment.status == "CONFIRMED")
        .order_by(ConsultationAppointment.appointment_date.asc())
    ).all()
    confirmed_count = len(confirmed_appts)

    # 3. Broadcast matches (OPEN broadcasts matched to advocate)
    recipients = db.scalars(
        select(ConsultationBroadcastRecipient)
        .where(ConsultationBroadcastRecipient.advocate_id == adv_id)
        .order_by(ConsultationBroadcastRecipient.created_at.desc())
    ).all()
    
    active_broadcasts = []
    for r in recipients:
        b = db.get(ConsultationBroadcast, r.broadcast_id)
        if b and b.status == "OPEN":
            active_broadcasts.append({
                "id": str(b.id),
                "legal_category": b.legal_category,
                "district": b.district,
                "preferred_date": b.preferred_date or "Flexible",
                "consultation_mode": b.consultation_mode,
                "short_summary": b.short_summary,
                "created_at": _format_date(b.created_at),
            })
    broadcast_matches = len(active_broadcasts)

    # 4. Reschedule requests
    reschedule_appts = db.scalars(
        select(ConsultationAppointment)
        .where(ConsultationAppointment.advocate_id == adv_id, ConsultationAppointment.status == "RESCHEDULE_REQUESTED")
        .order_by(ConsultationAppointment.created_at.desc())
    ).all()
    reschedule_count = len(reschedule_appts)

    # 5. Today's appointments
    todays_list = [
        {
            "id": str(a.id),
            "citizen_name": a.citizen.name if a.citizen else "Citizen Client",
            "legal_category": a.legal_category,
            "appointment_date": a.appointment_date,
            "start_time": a.start_time,
            "end_time": a.end_time,
            "consultation_mode": a.consultation_mode,
            "status": a.status,
            "fee": a.consultation_fee,
        }
        for a in (pending_appts + confirmed_appts)
        if a.appointment_date == today_str
    ]
    todays_count = len(todays_list)

    # Upcoming list (next confirmed appointments)
    upcoming_list = [
        {
            "id": str(a.id),
            "citizen_name": a.citizen.name if a.citizen else "Citizen Client",
            "legal_category": a.legal_category,
            "appointment_date": a.appointment_date,
            "start_time": a.start_time,
            "end_time": a.end_time,
            "consultation_mode": a.consultation_mode,
            "status": a.status,
            "fee": a.consultation_fee,
        }
        for a in confirmed_appts
        if a.appointment_date >= today_str
    ][:10]

    # Action required payload
    direct_requests_payload = [
        {
            "id": str(a.id),
            "citizen_name": a.citizen.name if a.citizen else "Citizen Client",
            "legal_category": a.legal_category,
            "appointment_date": a.appointment_date,
            "start_time": a.start_time,
            "consultation_mode": a.consultation_mode,
            "case_summary": a.case_summary,
            "fee": a.consultation_fee,
        }
        for a in pending_appts
    ]

    reschedule_payload = [
        {
            "id": str(a.id),
            "citizen_name": a.citizen.name if a.citizen else "Citizen Client",
            "legal_category": a.legal_category,
            "current_date": a.appointment_date,
            "proposed_date": a.proposed_date,
            "proposed_start_time": a.proposed_start_time,
            "message": a.advocate_message,
        }
        for a in reschedule_appts
    ]

    recent_notifications = db.scalars(
        select(Notification)
        .where(Notification.user_id == uid)
        .order_by(Notification.created_at.desc())
        .limit(10)
    ).all()
    recent_activity = [
        {
            "type": "Notification",
            "subject": n.title,
            "message": n.message,
            "date": _format_date(n.created_at),
            "read_status": n.read_status,
        }
        for n in recent_notifications
    ]

    return {
        "role": "advocate",
        "has_profile": True,
        "profile_status": adv_profile.verification_status,
        "is_active": adv_profile.is_active,
        "name": adv_profile.full_name or user.name,
        "bar_council_number": adv_profile.bar_council_number,
        "district": adv_profile.district,
        "new_direct_requests": new_direct_requests,
        "confirmed_consultations": confirmed_count,
        "broadcast_matches": broadcast_matches,
        "reschedule_requests": reschedule_count,
        "todays_appointments": todays_count,
        "unread_notifications": unread_notifications,
        "action_required": {
            "direct_requests": direct_requests_payload,
            "broadcast_matches": active_broadcasts,
            "reschedule_requests": reschedule_payload,
        },
        "todays_consultations": todays_list,
        "upcoming_consultations": upcoming_list,
        "recent_activity": recent_activity,
    }
