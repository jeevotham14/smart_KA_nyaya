from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from datetime import datetime, timedelta

from app.db.session import get_db
from app.models.domain import User, AdvocateProfile, AdvocateAvailability, ConsultationAppointment, Notification, ConsultationBroadcast, ConsultationBroadcastRecipient, ConsultationBroadcastResponse
from app.schemas.broadcasts import ConsultationBroadcastCreate, ConsultationBroadcastRead, ConsultationBroadcastResponseCreate, ConsultationBroadcastResponseRead
from app.api.deps import get_current_user
from app.api.routes.consultations import _create_notification

router = APIRouter(prefix="/consultation-broadcasts", tags=["broadcasts"])

MAX_BROADCAST_ADVOCATES = 10
BROADCAST_EXPIRY_HOURS = 48

def _lazy_expire(db: Session, broadcast: ConsultationBroadcast):
    if broadcast.status == "OPEN" and broadcast.expires_at.replace(tzinfo=None) < datetime.utcnow():
        broadcast.status = "EXPIRED"
        db.commit()

@router.post("/", response_model=ConsultationBroadcastRead)
def create_broadcast(
    broadcast_in: ConsultationBroadcastCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "citizen":
        raise HTTPException(status_code=403, detail="Only citizens can broadcast")
        
    broadcast = ConsultationBroadcast(
        citizen_id=current_user.user_id,
        **broadcast_in.model_dump() if hasattr(broadcast_in, 'model_dump') else broadcast_in.dict()
    )
    broadcast.expires_at = datetime.utcnow() + timedelta(hours=BROADCAST_EXPIRY_HOURS)
    db.add(broadcast)
    db.flush() # get ID
    
    # Matching algorithm
    query = db.query(AdvocateProfile).filter(
        AdvocateProfile.is_active == True,
        AdvocateProfile.district == broadcast.district,
    )
    
    if broadcast.pro_bono_requested:
        query = query.filter(AdvocateProfile.pro_bono_available == True)
        
    advocates = query.all()
    
    # Python-side filtering for arrays
    matched = []
    for adv in advocates:
        if broadcast.legal_category not in (adv.specializations or []):
            continue
        if broadcast.preferred_language not in (adv.languages or []):
            continue
        if broadcast.consultation_mode == "ONLINE" and not adv.online_consultation:
            continue
        if broadcast.consultation_mode == "OFFLINE" and not adv.offline_consultation:
            continue
        matched.append(adv)
        
    matched = matched[:MAX_BROADCAST_ADVOCATES]
    
    for adv in matched:
        recip = ConsultationBroadcastRecipient(broadcast_id=broadcast.id, advocate_id=adv.id)
        db.add(recip)
        _create_notification(
            db, adv.user_id, "New Consultation Request matching your practice", 
            f"A new {broadcast.legal_category} case in {broadcast.district} is seeking an advocate."
        )
        
    db.commit()
    db.refresh(broadcast)
    return broadcast

@router.get("/matched", response_model=List[ConsultationBroadcastRead])
def get_matched_broadcasts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("advocate", "lawyer_advisor"):
        raise HTTPException(status_code=403, detail="Only advocates")
        
    advocate = db.query(AdvocateProfile).filter(AdvocateProfile.user_id == current_user.user_id).first()
    if not advocate:
        return []
        
    recipients = db.query(ConsultationBroadcastRecipient).filter(
        ConsultationBroadcastRecipient.advocate_id == advocate.id
    ).all()
    
    broadcast_ids = [r.broadcast_id for r in recipients]
    
    broadcasts = db.query(ConsultationBroadcast).filter(
        ConsultationBroadcast.id.in_(broadcast_ids)
    ).all()
    
    valid_broadcasts = []
    for b in broadcasts:
        _lazy_expire(db, b)
        if b.status == "OPEN":
            # Check if this advocate already responded
            resp = db.query(ConsultationBroadcastResponse).filter(
                ConsultationBroadcastResponse.broadcast_id == b.id,
                ConsultationBroadcastResponse.advocate_id == advocate.id
            ).first()
            if not resp:
                valid_broadcasts.append(b)
            
    return valid_broadcasts

@router.post("/{broadcast_id}/interest")
def express_interest(
    broadcast_id: UUID,
    resp_in: ConsultationBroadcastResponseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("advocate", "lawyer_advisor"):
        raise HTTPException(status_code=403, detail="Only advocates")
        
    advocate = db.query(AdvocateProfile).filter(AdvocateProfile.user_id == current_user.user_id).first()
    
    broadcast = db.query(ConsultationBroadcast).filter(ConsultationBroadcast.id == broadcast_id).first()
    if not broadcast:
        raise HTTPException(status_code=404)
        
    _lazy_expire(db, broadcast)
    if broadcast.status != "OPEN":
        raise HTTPException(status_code=400, detail="Broadcast is not OPEN")
        
    # Check if recipient
    recip = db.query(ConsultationBroadcastRecipient).filter(
        ConsultationBroadcastRecipient.broadcast_id == broadcast_id,
        ConsultationBroadcastRecipient.advocate_id == advocate.id
    ).first()
    if not recip:
        raise HTTPException(status_code=403, detail="Not an eligible recipient")
        
    # Check existing response
    existing = db.query(ConsultationBroadcastResponse).filter(
        ConsultationBroadcastResponse.broadcast_id == broadcast_id,
        ConsultationBroadcastResponse.advocate_id == advocate.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already responded")
        
    response = ConsultationBroadcastResponse(
        broadcast_id=broadcast_id,
        advocate_id=advocate.id,
        status="INTERESTED",
        **resp_in.model_dump() if hasattr(resp_in, 'model_dump') else resp_in.dict()
    )
    db.add(response)
    
    _create_notification(
        db, broadcast.citizen_id, "Advocate Interested", 
        "An advocate has responded to your consultation request."
    )
    
    db.commit()
    return {"status": "success"}

@router.post("/{broadcast_id}/decline")
def decline_broadcast(
    broadcast_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    advocate = db.query(AdvocateProfile).filter(AdvocateProfile.user_id == current_user.user_id).first()
    if not advocate:
        raise HTTPException(status_code=403)
        
    response = ConsultationBroadcastResponse(
        broadcast_id=broadcast_id,
        advocate_id=advocate.id,
        status="DECLINED",
        consultation_mode="ONLINE" # dummy value to bypass NOT NULL
    )
    db.add(response)
    db.commit()
    return {"status": "success"}

@router.get("/{broadcast_id}/responses", response_model=List[ConsultationBroadcastResponseRead])
def get_responses(
    broadcast_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    broadcast = db.query(ConsultationBroadcast).filter(ConsultationBroadcast.id == broadcast_id).first()
    if not broadcast or broadcast.citizen_id != current_user.user_id:
        raise HTTPException(status_code=404)
        
    responses = db.query(ConsultationBroadcastResponse).filter(
        ConsultationBroadcastResponse.broadcast_id == broadcast_id,
        ConsultationBroadcastResponse.status == "INTERESTED"
    ).all()
    
    results = []
    for r in responses:
        adv = db.query(AdvocateProfile).filter(AdvocateProfile.id == r.advocate_id).first()
        res_dict = {
            "id": r.id,
            "advocate_id": r.advocate_id,
            "status": r.status,
            "advocate_message": r.advocate_message,
            "proposed_fee": r.proposed_fee,
            "consultation_mode": r.consultation_mode,
            "created_at": r.created_at,
            "advocate_name": adv.full_name if adv else None,
            "specializations": adv.specializations if adv else [],
            "district": adv.district if adv else None,
            "languages": adv.languages if adv else [],
            "verification_status": adv.verification_status if adv else None,
        }
        results.append(res_dict)
    return results

@router.post("/{broadcast_id}/select/{advocate_id}")
def select_advocate(
    broadcast_id: UUID,
    advocate_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Lock broadcast to prevent multiple selections atomically
    broadcast = db.query(ConsultationBroadcast).with_for_update().filter(
        ConsultationBroadcast.id == broadcast_id,
        ConsultationBroadcast.citizen_id == current_user.user_id
    ).first()
    
    if not broadcast:
        raise HTTPException(status_code=404)
        
    _lazy_expire(db, broadcast)
    if broadcast.status != "OPEN":
        raise HTTPException(status_code=400, detail="Broadcast is not OPEN")

    if broadcast.selected_advocate_id is not None:
        raise HTTPException(status_code=400, detail="Advocate already selected")
        
    response = db.query(ConsultationBroadcastResponse).filter(
        ConsultationBroadcastResponse.broadcast_id == broadcast_id,
        ConsultationBroadcastResponse.advocate_id == advocate_id,
        ConsultationBroadcastResponse.status == "INTERESTED"
    ).first()
    
    if not response:
        raise HTTPException(status_code=400, detail="Advocate did not express interest")
        
    # Update state
    broadcast.status = "MATCHED"
    broadcast.selected_advocate_id = advocate_id
    response.status = "SELECTED"
    
    # Others to NOT_SELECTED
    other_responses = db.query(ConsultationBroadcastResponse).filter(
        ConsultationBroadcastResponse.broadcast_id == broadcast_id,
        ConsultationBroadcastResponse.id != response.id,
        ConsultationBroadcastResponse.status == "INTERESTED"
    ).all()
    for o in other_responses:
        o.status = "NOT_SELECTED"
        adv = db.query(AdvocateProfile).filter(AdvocateProfile.id == o.advocate_id).first()
        if adv:
            _create_notification(db, adv.user_id, "Match Update", "The consultation request you expressed interest in was matched with another advocate.")

    avail = AdvocateAvailability(
        advocate_id=advocate_id,
        date=broadcast.preferred_date or "TBD",
        start_time=broadcast.preferred_time or "TBD",
        end_time="TBD",
        consultation_mode=response.consultation_mode,
        is_available=False
    )
    db.add(avail)
    db.flush()
    
    appt = ConsultationAppointment(
        citizen_id=current_user.user_id,
        advocate_id=advocate_id,
        availability_id=avail.id,
        legal_category=broadcast.legal_category,
        case_summary=broadcast.short_summary,
        consultation_mode=response.consultation_mode,
        appointment_date=avail.date,
        start_time=avail.start_time,
        end_time=avail.end_time,
        status="PENDING",
        consultation_fee=response.proposed_fee or 0.0,
        broadcast_id=broadcast.id
    )
    db.add(appt)
    
    adv = db.query(AdvocateProfile).filter(AdvocateProfile.id == advocate_id).first()
    if adv:
        _create_notification(db, adv.user_id, "You were selected", "You have been selected for a consultation request.")
    
    db.commit()
    return {"status": "success", "appointment_id": appt.id}

@router.patch("/{broadcast_id}/cancel")
def cancel_broadcast(
    broadcast_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    broadcast = db.query(ConsultationBroadcast).filter(
        ConsultationBroadcast.id == broadcast_id,
        ConsultationBroadcast.citizen_id == current_user.user_id
    ).first()
    if not broadcast:
        raise HTTPException(status_code=404)
        
    if broadcast.status != "OPEN":
        raise HTTPException(status_code=400, detail="Cannot cancel")
        
    broadcast.status = "CANCELLED"
    db.commit()
    return {"status": "success"}

@router.get("/my", response_model=List[ConsultationBroadcastRead])
def my_broadcasts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    broadcasts = db.query(ConsultationBroadcast).filter(
        ConsultationBroadcast.citizen_id == current_user.user_id
    ).all()
    for b in broadcasts:
        _lazy_expire(db, b)
    return broadcasts
