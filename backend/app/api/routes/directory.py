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
    """
    Search directory services. All filters are optional and AND-combined.
    - q: keyword search on name and address
    - district: exact district name (case-insensitive)
    - taluk: exact taluk name (case-insensitive)
    - service_type: exact backend enum value (court, dlsa, police, ngo, helpline,
                    legal_aid, women_police_station, one_stop_centre)
    """
    statement = select(DirectoryService)

    if q:
        like = f"%{q}%"
        statement = statement.where(
            or_(
                DirectoryService.name.ilike(like),
                DirectoryService.address.ilike(like),
                DirectoryService.taluk.ilike(like),
                DirectoryService.district.ilike(like),
            )
        )
    if district:
        statement = statement.where(DirectoryService.district.ilike(district))
    if taluk:
        statement = statement.where(DirectoryService.taluk.ilike(taluk))
    if service_type:
        # Exact case-insensitive match on the service_type enum value
        statement = statement.where(DirectoryService.service_type.ilike(service_type))

    # Order: statewide entries first, then alphabetically
    statement = statement.order_by(
        DirectoryService.district.asc(),
        DirectoryService.taluk.asc(),
        DirectoryService.name.asc(),
    )

    # Higher limit when district+taluk filters narrow the results
    limit = 100 if (district or taluk) else 60
    return db.scalars(statement.limit(limit)).all()


@router.get("/district/{district}", response_model=list[DirectoryServiceRead])
def by_district(district: str, db: Session = Depends(get_db)):
    return db.scalars(select(DirectoryService).where(DirectoryService.district.ilike(district))).all()


@router.get("/service-type/{service_type}", response_model=list[DirectoryServiceRead])
def by_service_type(service_type: str, db: Session = Depends(get_db)):
    return db.scalars(select(DirectoryService).where(DirectoryService.service_type.ilike(service_type))).all()
