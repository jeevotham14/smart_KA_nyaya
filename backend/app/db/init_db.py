from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.domain import DirectoryService, LegalStatute, Notification, User
from app.models.enums import UserRole


def seed_database(db: Session) -> None:
    if not db.scalar(select(User).where(User.email == "admin@smartnyaya.local")):
        db.add(
            User(
                name="Smart Nyaya Admin",
                email="admin@smartnyaya.local",
                phone="08000000000",
                password_hash=hash_password("Admin@12345"),
                role=UserRole.admin.value,
                district="Bengaluru Urban",
                language_pref="English",
            )
        )

    if not db.scalar(select(DirectoryService).limit(1)):
        db.add_all(
            [
                DirectoryService(
                    name="Karnataka State Legal Services Authority",
                    service_type="legal_aid",
                    district="Bengaluru Urban",
                    taluk="Bengaluru",
                    address="Nyaya Degula, Bengaluru",
                    phone="080-22111730",
                    latitude=12.9716,
                    longitude=77.5946,
                ),
                DirectoryService(
                    name="Bengaluru Urban DLSA",
                    service_type="dlsa",
                    district="Bengaluru Urban",
                    taluk="Bengaluru",
                    address="City Civil Court Complex, Bengaluru",
                    phone="080-22211101",
                    latitude=12.9756,
                    longitude=77.5873,
                ),
                DirectoryService(
                    name="Mysuru DLSA",
                    service_type="dlsa",
                    district="Mysuru",
                    taluk="Mysuru",
                    address="District Court Complex, Mysuru",
                    phone="0821-2421000",
                    latitude=12.2958,
                    longitude=76.6394,
                ),
                DirectoryService(
                    name="Emergency Response Support System",
                    service_type="helpline",
                    district="Statewide",
                    taluk=None,
                    address="Karnataka statewide emergency helpline",
                    phone="112",
                ),
                DirectoryService(
                    name="Women Helpline",
                    service_type="helpline",
                    district="Statewide",
                    taluk=None,
                    address="Karnataka women support helpline",
                    phone="181",
                ),
            ]
        )

    if not db.scalar(select(LegalStatute).limit(1)):
        db.add_all(
            [
                LegalStatute(
                    act_name="Legal Services Authorities Act",
                    section_number="12",
                    section_text="Categories of persons entitled to free legal services.",
                    keywords=["legal aid", "dlsa", "free legal services"],
                    applicable_courts=["DLSA", "TLSC", "Lok Adalat"],
                    state_applicability="India/Karnataka",
                ),
                LegalStatute(
                    act_name="Protection of Women from Domestic Violence Act",
                    section_number="18-23",
                    section_text="Protection, residence, monetary relief, custody, and compensation orders.",
                    keywords=["domestic violence", "women protection", "residence order"],
                    applicable_courts=["Magistrate Court"],
                    state_applicability="India/Karnataka",
                ),
            ]
        )

    admin = db.scalar(select(User).where(User.email == "admin@smartnyaya.local"))
    if admin and not db.scalar(select(Notification).where(Notification.user_id == admin.user_id)):
        db.add(Notification(user_id=admin.user_id, title="Backend ready", message="Smart Karnataka Nyaya API seed data loaded."))

    db.commit()
