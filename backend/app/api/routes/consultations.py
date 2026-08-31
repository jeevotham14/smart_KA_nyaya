import os
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from pydantic import BaseModel

from app.db.session import get_db
from app.models.domain import User, AdvocateProfile, AdvocateAvailability, ConsultationAppointment, Notification, ConsultationDocument
from app.models.enums import ConsultationDocumentType
from app.schemas.advocates import ConsultationAppointmentCreate, ConsultationAppointmentRead, ConsultationAppointmentUpdate
from app.schemas.consultation import ConsultationDocumentRead
from app.api.deps import get_current_user, audit
from app.services.document_storage import get_document_storage

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

@router.get("", response_model=List[ConsultationAppointmentRead])
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


class StatusUpdateRequest(BaseModel):
    status: str
    scheduled_date_time: Optional[str] = None
    reschedule_reason: Optional[str] = None
    meeting_link: Optional[str] = None
    contact_details: Optional[str] = None


@router.patch("/{appointment_id}/status", response_model=ConsultationAppointmentRead)
def update_status_generic(
    appointment_id: UUID,
    payload: StatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    advocate = db.query(AdvocateProfile).filter(AdvocateProfile.user_id == current_user.user_id).first()
    is_advocate = advocate is not None
    extra = {}
    if payload.meeting_link or payload.contact_details:
        extra["meeting_details"] = payload.meeting_link or payload.contact_details
    if payload.reschedule_reason:
        extra["advocate_message"] = payload.reschedule_reason
    return _update_status(appointment_id, payload.status.upper(), db, current_user, is_advocate=is_advocate, extra_data=extra)


# ── Secure Document Sharing Endpoints (Tasks 7, 8, 9, 10, 18) ─────────────

@router.post("/{appointment_id}/documents", response_model=ConsultationDocumentRead, status_code=status.HTTP_201_CREATED)
async def upload_document(
    appointment_id: UUID,
    file: UploadFile = File(...),
    document_type: str = Form(ConsultationDocumentType.OTHER.value),
    description: Optional[str] = Form(None),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Secure document upload for CONFIRMED/COMPLETED consultations only.
    Allowed uploader: citizen who owns appointment.
    Sanitizes filename against path traversal.
    """
    appointment = db.query(ConsultationAppointment).filter(ConsultationAppointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Consultation appointment not found")

    is_owner = appointment.citizen_id == current_user.user_id
    if not is_owner:
        raise HTTPException(status_code=403, detail="Only the citizen who owns this appointment can upload documents")

    allowed_statuses = {"CONFIRMED", "COMPLETED"}
    if appointment.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Document upload not permitted for appointment status '{appointment.status}'. "
                "Documents can only be shared once the consultation is CONFIRMED."
            ),
        )

    file_bytes = await file.read()
    raw_filename = file.filename or "document.pdf"
    filename = os.path.basename(raw_filename.replace("\\", "/"))
    if not filename or filename == ".":
        filename = "document.pdf"

    storage_service = get_document_storage()
    is_valid, detected_mime, error_msg = storage_service.validate_file(
        file_bytes=file_bytes,
        original_filename=filename,
        content_type=file.content_type,
    )
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    storage_key = storage_service.save_file(
        file_bytes=file_bytes,
        original_filename=filename,
        appointment_id=str(appointment_id),
    )

    doc_type_clean = document_type.upper() if document_type else ConsultationDocumentType.OTHER.value
    valid_types = [t.value for t in ConsultationDocumentType]
    if doc_type_clean not in valid_types:
        doc_type_clean = ConsultationDocumentType.OTHER.value

    doc = ConsultationDocument(
        appointment_id=appointment_id,
        uploaded_by_user_id=current_user.user_id,
        original_filename=filename,
        storage_key=storage_key,
        mime_type=detected_mime,
        file_size=len(file_bytes),
        document_type=doc_type_clean,
        description=description,
    )
    db.add(doc)

    # Notify assigned advocate that a document has been uploaded (privacy-safe, no sensitive text)
    adv = db.query(AdvocateProfile).filter(AdvocateProfile.id == appointment.advocate_id).first()
    if adv and adv.user_id:
        _create_notification(
            db,
            adv.user_id,
            "New Document Uploaded",
            "A supporting document was uploaded to your confirmed consultation."
        )

    audit(db, request, "consultations.upload_document", current_user.user_id)
    db.commit()
    db.refresh(doc)

    return ConsultationDocumentRead(
        id=doc.id,
        appointment_id=doc.appointment_id,
        filename=doc.original_filename,
        mime_type=doc.mime_type,
        size=doc.file_size,
        document_type=doc.document_type,
        description=doc.description,
        uploaded_at=doc.created_at,
    )


@router.get("/{appointment_id}/documents", response_model=List[ConsultationDocumentRead])
def list_documents(
    appointment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List document metadata for authorized citizen or assigned advocate."""
    appointment = db.query(ConsultationAppointment).filter(ConsultationAppointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Consultation appointment not found")

    advocate = db.query(AdvocateProfile).filter(AdvocateProfile.user_id == current_user.user_id).first()
    is_citizen = appointment.citizen_id == current_user.user_id
    is_assigned_advocate = (advocate is not None and appointment.advocate_id == advocate.id)

    if not (is_citizen or is_assigned_advocate):
        raise HTTPException(status_code=403, detail="Unauthorized to view documents for this appointment")

    if appointment.status not in {"CONFIRMED", "COMPLETED"}:
        raise HTTPException(
            status_code=400,
            detail="Document sharing is inactive until the consultation is CONFIRMED",
        )

    documents = db.query(ConsultationDocument).filter(
        ConsultationDocument.appointment_id == appointment_id,
        ConsultationDocument.deleted_at.is_(None),
    ).order_by(ConsultationDocument.created_at.desc()).all()

    return [
        ConsultationDocumentRead(
            id=d.id,
            appointment_id=d.appointment_id,
            filename=d.original_filename,
            mime_type=d.mime_type,
            size=d.file_size,
            document_type=d.document_type,
            description=d.description,
            uploaded_at=d.created_at,
        )
        for d in documents
    ]


@router.get("/{appointment_id}/documents/{document_id}/download")
def download_document(
    appointment_id: UUID,
    document_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Secure document download."""
    appointment = db.query(ConsultationAppointment).filter(ConsultationAppointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Consultation appointment not found")

    advocate = db.query(AdvocateProfile).filter(AdvocateProfile.user_id == current_user.user_id).first()
    is_citizen = appointment.citizen_id == current_user.user_id
    is_assigned_advocate = (advocate is not None and appointment.advocate_id == advocate.id)

    if not (is_citizen or is_assigned_advocate):
        raise HTTPException(status_code=403, detail="Unauthorized to download this document")

    if appointment.status not in {"CONFIRMED", "COMPLETED"}:
        raise HTTPException(status_code=403, detail="Documents cannot be downloaded until consultation is confirmed")

    doc = db.query(ConsultationDocument).filter(ConsultationDocument.id == document_id).first()
    if not doc or doc.appointment_id != appointment_id:
        raise HTTPException(status_code=404, detail="Document not found for this consultation")

    if doc.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Document has been deleted")

    storage_service = get_document_storage()
    file_bytes = storage_service.get_file(doc.storage_key)
    if not file_bytes:
        raise HTTPException(status_code=404, detail="Document file not found in storage")

    audit(db, request, f"consultations.download_document.{doc.id}", current_user.user_id)

    safe_filename = doc.original_filename.replace('"', '\\"')

    return Response(
        content=file_bytes,
        media_type=doc.mime_type,
        headers={
            "Content-Disposition": f'attachment; filename="{safe_filename}"',
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
    )


@router.delete("/{appointment_id}/documents/{document_id}")
def delete_document(
    appointment_id: UUID,
    document_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Citizen deletes their uploaded document. Soft deletes metadata."""
    appointment = db.query(ConsultationAppointment).filter(ConsultationAppointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Consultation appointment not found")

    doc = db.query(ConsultationDocument).filter(ConsultationDocument.id == document_id).first()
    if not doc or doc.appointment_id != appointment_id:
        raise HTTPException(status_code=404, detail="Document not found for this consultation")

    if doc.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Document has already been deleted")

    if doc.uploaded_by_user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Only the uploader can delete this document")

    doc.deleted_at = func.now()
    audit(db, request, f"consultations.delete_document.{doc.id}", current_user.user_id)
    db.commit()

    return {"detail": "Document deleted successfully", "id": str(document_id)}

