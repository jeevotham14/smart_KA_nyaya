from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.domain import CaseNote, CaseTask

router = APIRouter(prefix="/workspace", tags=["Workspace"])


# ── Schemas ──
class NoteCreate(BaseModel):
    content: str
    user_id: Optional[UUID] = None

class NoteRead(BaseModel):
    note_id: UUID
    case_id: UUID
    user_id: Optional[UUID]
    content: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    title: str
    due_date: Optional[str] = None
    user_id: Optional[UUID] = None

class TaskPatch(BaseModel):
    completed: Optional[bool] = None
    title: Optional[str] = None

class TaskRead(BaseModel):
    task_id: UUID
    case_id: UUID
    user_id: Optional[UUID]
    title: str
    completed: bool
    due_date: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Notes ──
@router.get("/{case_id}/notes", response_model=list[NoteRead])
def get_notes(case_id: UUID, db: Session = Depends(get_db)):
    return db.scalars(
        select(CaseNote).where(CaseNote.case_id == case_id).order_by(CaseNote.updated_at.desc())
    ).all()


@router.post("/{case_id}/notes", response_model=NoteRead, status_code=201)
def create_or_update_note(case_id: UUID, payload: NoteCreate, db: Session = Depends(get_db)):
    # Check if a note already exists for this case (single note per case for simplicity)
    existing = db.scalar(
        select(CaseNote).where(CaseNote.case_id == case_id)
    )
    if existing:
        existing.content = payload.content
        existing.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(existing)
        return existing

    note = CaseNote(
        note_id=uuid4(),
        case_id=case_id,
        user_id=payload.user_id,
        content=payload.content,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


# ── Tasks ──
@router.get("/{case_id}/tasks", response_model=list[TaskRead])
def get_tasks(case_id: UUID, db: Session = Depends(get_db)):
    return db.scalars(
        select(CaseTask).where(CaseTask.case_id == case_id).order_by(CaseTask.created_at.desc())
    ).all()


@router.post("/{case_id}/tasks", response_model=TaskRead, status_code=201)
def create_task(case_id: UUID, payload: TaskCreate, db: Session = Depends(get_db)):
    task = CaseTask(
        task_id=uuid4(),
        case_id=case_id,
        user_id=payload.user_id,
        title=payload.title,
        completed=False,
        due_date=payload.due_date,
        created_at=datetime.now(timezone.utc),
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{case_id}/tasks/{task_id}", response_model=TaskRead)
def update_task(case_id: UUID, task_id: UUID, payload: TaskPatch, db: Session = Depends(get_db)):
    task = db.scalar(
        select(CaseTask).where(CaseTask.task_id == task_id, CaseTask.case_id == case_id)
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if payload.completed is not None:
        task.completed = payload.completed
    if payload.title is not None:
        task.title = payload.title
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{case_id}/tasks/{task_id}", status_code=204)
def delete_task(case_id: UUID, task_id: UUID, db: Session = Depends(get_db)):
    task = db.scalar(
        select(CaseTask).where(CaseTask.task_id == task_id, CaseTask.case_id == case_id)
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
