from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.db.session import get_db
from app.models.domain import User, AdvocateProfile, AdvocateAvailability
from app.schemas.advocates import (
    AdvocateProfileCreate,
    AdvocateProfileRead,
    AdvocateProfileUpdate,
    AdvocateAvailabilityCreate,
    AdvocateAvailabilityRead,
    AdvocateAvailabilityUpdate,
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/advocates", tags=["advocates"])

@router.get("", response_model=List[AdvocateProfileRead])
def get_advocates(
    specialization: Optional[str] = None,
    district: Optional[str] = None,
    language: Optional[str] = None,
    mode: Optional[str] = None,
    pro_bono: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    query = db.query(AdvocateProfile).filter(AdvocateProfile.is_active == True)
    
    if district:
        query = query.filter(AdvocateProfile.district.ilike(f"%{district}%"))
    if pro_bono is not None:
        query = query.filter(AdvocateProfile.pro_bono_available == pro_bono)
    if mode == "ONLINE":
        query = query.filter(AdvocateProfile.online_consultation == True)
    elif mode == "OFFLINE":
        query = query.filter(AdvocateProfile.offline_consultation == True)
        
    advocates = query.all()
    
    # Filter JSON arrays manually if needed for SQLite, but SQLAlchemy SQLite JSON doesn't easily support contains.
    # Let's filter in python for these simple arrays to ensure cross-db compatibility in this small project.
    filtered = []
    for adv in advocates:
        match = True
        if specialization and specialization not in (adv.specializations or []):
            match = False
        if language and language not in (adv.languages or []):
            match = False
        if match:
            filtered.append(adv)
            
    return filtered

@router.get("/{advocate_id}", response_model=AdvocateProfileRead)
def get_advocate(advocate_id: UUID, db: Session = Depends(get_db)):
    advocate = db.query(AdvocateProfile).filter(AdvocateProfile.id == advocate_id).first()
    if not advocate:
        raise HTTPException(status_code=404, detail="Advocate not found")
    return advocate

@router.post("/profile", response_model=AdvocateProfileRead)
def create_profile(
    profile_in: AdvocateProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "advocate":
        # allow role change if they create profile? Or enforce it?
        pass # Let's assume they want to become an advocate

    existing = db.query(AdvocateProfile).filter(AdvocateProfile.user_id == current_user.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    advocate = AdvocateProfile(
        user_id=current_user.user_id,
        **profile_in.dict()
    )
    db.add(advocate)
    db.commit()
    db.refresh(advocate)
    
    if current_user.role != "advocate":
        current_user.role = "advocate"
        db.commit()
        
    return advocate

@router.put("/profile", response_model=AdvocateProfileRead)
def update_profile(
    profile_in: AdvocateProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    advocate = db.query(AdvocateProfile).filter(AdvocateProfile.user_id == current_user.user_id).first()
    if not advocate:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    update_data = profile_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(advocate, field, value)
        
    db.commit()
    db.refresh(advocate)
    return advocate

# ---------------- Availability ----------------

@router.get("/{advocate_id}/availability", response_model=List[AdvocateAvailabilityRead])
def get_availability(advocate_id: UUID, db: Session = Depends(get_db)):
    return db.query(AdvocateAvailability).filter(
        AdvocateAvailability.advocate_id == advocate_id,
        AdvocateAvailability.is_available == True
    ).all()

@router.post("/availability", response_model=AdvocateAvailabilityRead)
def create_availability(
    avail_in: AdvocateAvailabilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    advocate = db.query(AdvocateProfile).filter(AdvocateProfile.user_id == current_user.user_id).first()
    if not advocate:
        raise HTTPException(status_code=403, detail="Only advocates can set availability")
        
    availability = AdvocateAvailability(
        advocate_id=advocate.id,
        **avail_in.dict()
    )
    db.add(availability)
    db.commit()
    db.refresh(availability)
    return availability

@router.delete("/availability/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_availability(
    slot_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    advocate = db.query(AdvocateProfile).filter(AdvocateProfile.user_id == current_user.user_id).first()
    if not advocate:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    slot = db.query(AdvocateAvailability).filter(
        AdvocateAvailability.id == slot_id,
        AdvocateAvailability.advocate_id == advocate.id
    ).first()
    
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
        
    db.delete(slot)
    db.commit()
