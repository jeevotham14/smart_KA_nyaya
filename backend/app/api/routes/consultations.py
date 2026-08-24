from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.models.domain import User, AdvocateProfile, AdvocateAvailability, ConsultationAppointment, Notification
from app.schemas.advocates import ConsultationAppointmentCreate, ConsultationAppointmentRead, ConsultationAppointmentUpdate
from app.api.deps import get_current_user

router = APIRouter(prefix="/consultations", tags=["consultations"])

class RescheduleRequest(BaseModel):
    new_date: str
    new_start_time: str
    new_end_time: str
    message: Optional[str] = None

def _create_notification(db: Session, user_id: UUID, title: str, message: str):
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        channel="in_app"
    )
    db.add(notification)

def _mask_meeting_details(appointment: ConsultationAppointment):
    if appointment.status not in ["CONFIRMED", "COMPLETED"]:
        appointment.meeting_details = None
    return appointment

@router.post("/", response_model=ConsultationAppointmentRead)
def book_consultation(
    appointment_in: ConsultationAppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Transactional lock to prevent double booking race conditions
    slot = db.query(AdvocateAvailability).with_for_update().filter(
        AdvocateAvailability.id == appointment_in.availability_id,
        AdvocateAvailability.advocate_id == appointment_in.advocate_id,
        AdvocateAvailability.is_available == True
    ).first()
    
    if not slot:
        raise HTTPException(status_code=400, detail="Time slot is not available")
        
    slot.is_available = False
    
    appointment = ConsultationAppointment(
        citizen_id=current_user.user_id,
        **appointment_in.model_dump() if hasattr(appointment_in, 'model_dump') else appointment_in.dict()
    )
    db.add(appointment)
    
    # Notify Advocate
    advocate = db.query(AdvocateProfile).filter(AdvocateProfile.id == appointment_in.advocate_id).first()
    if advocate:
        _create_notification(
            db, advocate.user_id, "New Consultation Request", 
            f"You have a new consultation request on {appointment.appointment_date}."
        )
    
    # Notify Citizen
    _create_notification(
        db, current_user.user_id, "Appointment Requested", 
        f"Your consultation request for {appointment.appointment_date} has been submitted."
    )
    
    db.commit()
    db.refresh(appointment)
    return _mask_meeting_details(appointment)

@router.get("/my", response_model=List[ConsultationAppointmentRead])
def my_consultations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    advocate = db.query(AdvocateProfile).filter(AdvocateProfile.user_id == current_user.user_id).first()
    if advocate:
        appointments = db.query(ConsultationAppointment).filter(ConsultationAppointment.advocate_id == advocate.id).all()
    else:
        appointments = db.query(ConsultationAppointment).filter(ConsultationAppointment.citizen_id == current_user.user_id).all()
        
    return [_mask_meeting_details(app) for app in appointments]

@router.get("/{appointment_id}", response_model=ConsultationAppointmentRead)
def get_appointment(
    appointment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appointment = db.query(ConsultationAppointment).filter(ConsultationAppointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    advocate = db.query(AdvocateProfile).filter(AdvocateProfile.user_id == current_user.user_id).first()
    
    if appointment.citizen_id != current_user.user_id and (not advocate or appointment.advocate_id != advocate.id):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return _mask_meeting_details(appointment)

def _update_status(appointment_id: UUID, new_status: str, db: Session, current_user: User, is_advocate: bool = False, extra_data: dict = None):
    appointment = db.query(ConsultationAppointment).filter(ConsultationAppointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    advocate = db.query(AdvocateProfile).filter(AdvocateProfile.user_id == current_user.user_id).first()
    
    if is_advocate:
        if not advocate or appointment.advocate_id != advocate.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    else:
        if appointment.citizen_id != current_user.user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
            
    # Transition Rules
    valid_transitions = {
        "PENDING": ["CONFIRMED", "REJECTED", "RESCHEDULE_REQUESTED", "CANCELLED"],
        "CONFIRMED": ["RESCHEDULE_REQUESTED", "CANCELLED", "COMPLETED"],
        "RESCHEDULE_REQUESTED": ["CONFIRMED", "CANCELLED"],
        "REJECTED": [],
        "CANCELLED": [],
        "COMPLETED": []
    }
    
    if new_status not in valid_transitions.get(appointment.status, []):
        raise HTTPException(status_code=400, detail=f"Invalid transition from {appointment.status} to {new_status}")
            
    appointment.status = new_status
    
    if extra_data:
        for k, v in extra_data.items():
            setattr(appointment, k, v)
    
    # If cancelled or rejected, free the slot
    if new_status in ["CANCELLED", "REJECTED"]:
        slot = db.query(AdvocateAvailability).filter(AdvocateAvailability.id == appointment.availability_id).first()
        if slot:
            slot.is_available = True

    # Notifications
    target_user_id = appointment.citizen_id if is_advocate else advocate.user_id if advocate else None
    
    # If a citizen is canceling, we notify the advocate (if we can find the advocate's user_id)
    if not is_advocate:
        adv = db.query(AdvocateProfile).filter(AdvocateProfile.id == appointment.advocate_id).first()
        target_user_id = adv.user_id if adv else None
        
    if target_user_id:
        if new_status == "CONFIRMED":
            _create_notification(db, target_user_id, "Appointment Confirmed", f"Your appointment has been confirmed.")
        elif new_status == "REJECTED":
            _create_notification(db, target_user_id, "Appointment Rejected", "Your appointment request was declined.")
        elif new_status == "RESCHEDULE_REQUESTED":
            _create_notification(db, target_user_id, "Reschedule Requested", "A new time has been proposed for your appointment.")
        elif new_status == "CANCELLED":
            _create_notification(db, target_user_id, "Appointment Cancelled", "The appointment has been cancelled.")
        elif new_status == "COMPLETED":
            _create_notification(db, target_user_id, "Appointment Completed", "Your consultation has been marked as completed.")
            
    db.commit()
    db.refresh(appointment)
    return _mask_meeting_details(appointment)

@router.patch("/{appointment_id}/accept", response_model=ConsultationAppointmentRead)
def accept_appointment(
    appointment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _update_status(appointment_id, "CONFIRMED", db, current_user, is_advocate=True)

@router.patch("/{appointment_id}/reject", response_model=ConsultationAppointmentRead)
def reject_appointment(
    appointment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _update_status(appointment_id, "REJECTED", db, current_user, is_advocate=True)

@router.patch("/{appointment_id}/reschedule", response_model=ConsultationAppointmentRead)
def reschedule_appointment(
    appointment_id: UUID,
    req: RescheduleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    extra = {
        "proposed_date": req.new_date,
        "proposed_start_time": req.new_start_time,
        "proposed_end_time": req.new_end_time,
        "advocate_message": req.message
    }
    return _update_status(appointment_id, "RESCHEDULE_REQUESTED", db, current_user, is_advocate=True, extra_data=extra)

@router.patch("/{appointment_id}/reschedule/accept", response_model=ConsultationAppointmentRead)
def accept_reschedule_appointment(
    appointment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appointment = db.query(ConsultationAppointment).filter(ConsultationAppointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    if appointment.citizen_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if appointment.status != "RESCHEDULE_REQUESTED":
        raise HTTPException(status_code=400, detail="Appointment is not in RESCHEDULE_REQUESTED state")
        
    extra = {
        "appointment_date": appointment.proposed_date,
        "start_time": appointment.proposed_start_time,
        "end_time": appointment.proposed_end_time,
        "proposed_date": None,
        "proposed_start_time": None,
        "proposed_end_time": None
    }
    return _update_status(appointment_id, "CONFIRMED", db, current_user, is_advocate=False, extra_data=extra)

@router.patch("/{appointment_id}/reschedule/decline", response_model=ConsultationAppointmentRead)
def decline_reschedule_appointment(
    appointment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appointment = db.query(ConsultationAppointment).filter(ConsultationAppointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    if appointment.citizen_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if appointment.status != "RESCHEDULE_REQUESTED":
        raise HTTPException(status_code=400, detail="Appointment is not in RESCHEDULE_REQUESTED state")
        
    return _update_status(appointment_id, "CANCELLED", db, current_user, is_advocate=False)

@router.patch("/{appointment_id}/complete", response_model=ConsultationAppointmentRead)
def complete_appointment(
    appointment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _update_status(appointment_id, "COMPLETED", db, current_user, is_advocate=True)

@router.patch("/{appointment_id}/cancel", response_model=ConsultationAppointmentRead)
def cancel_appointment(
    appointment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _update_status(appointment_id, "CANCELLED", db, current_user, is_advocate=False)
