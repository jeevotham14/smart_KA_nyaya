from fastapi import APIRouter, Depends
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.domain import DirectoryService
from app.schemas import DirectoryServiceRead

router = APIRouter(prefix="/directory", tags=["Directory"])


@router.get("/search", response_model=list[DirectoryServiceRead])
def search(
    q: str | None = None,
    district: str | None = None,
    taluk: str | None = None,
    service_type: str | None = None,
    db: Session = Depends(get_db),
):
    statement = select(DirectoryService)
    if q:
        like = f"%{q}%"
        statement = statement.where(or_(DirectoryService.name.ilike(like), DirectoryService.address.ilike(like)))
    if district:
        statement = statement.where(DirectoryService.district.ilike(district))
    if taluk:
        statement = statement.where(DirectoryService.taluk.ilike(taluk))
    if service_type:
        statement = statement.where(DirectoryService.service_type.ilike(service_type))
    return db.scalars(statement.limit(50)).all()


@router.get("/district/{district}", response_model=list[DirectoryServiceRead])
def by_district(district: str, db: Session = Depends(get_db)):
    return db.scalars(select(DirectoryService).where(DirectoryService.district.ilike(district))).all()


@router.get("/service-type/{service_type}", response_model=list[DirectoryServiceRead])
def by_service_type(service_type: str, db: Session = Depends(get_db)):
    return db.scalars(select(DirectoryService).where(DirectoryService.service_type.ilike(service_type))).all()
