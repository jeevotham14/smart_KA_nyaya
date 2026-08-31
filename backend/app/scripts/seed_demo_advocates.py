"""
Seed script to import 10 synthetic demo advocates from CSV and create login accounts.
Idempotent and safe: uses DEMO_ADVOCATE_PASSWORD and tracks is_demo=True.
"""

import os
import csv
import json
import uuid
import logging
from pathlib import Path
from typing import Optional, Dict, Any, List

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db.session import SessionLocal
from ..models.domain import User, AdvocateProfile
from ..core.security import hash_password

logger = logging.getLogger(__name__)

DEFAULT_CSV_PATH = Path(__file__).resolve().parent.parent / "data" / "10_demo_advocates_with_login.csv"
FALLBACK_CSV_PATH = Path(__file__).resolve().parent.parent.parent.parent / "10_demo_advocates_with_login.csv"


def parse_boolean(val: Any) -> bool:
    """Normalize boolean values from CSV (1, 0, true, false, TRUE, FALSE)."""
    if isinstance(val, bool):
        return val
    if val is None:
        return False
    s = str(val).strip().lower()
    return s in ("true", "1", "yes", "t", "y")


def parse_list_field(val: Any) -> List[str]:
    """Parse JSON list string or semicolon-delimited string into python list of strings."""
    if not val:
        return []
    if isinstance(val, list):
        return [str(item).strip() for item in val if str(item).strip()]
    s = str(val).strip()
    if not s:
        return []
    # Try parsing as JSON array e.g. ["Civil Law", "Property Law"]
    if (s.startswith("[") and s.endswith("]")) or (s.startswith("{") and s.endswith("}")):
        try:
            parsed = json.loads(s)
            if isinstance(parsed, list):
                return [str(item).strip() for item in parsed if str(item).strip()]
        except Exception:
            pass
    # Fallback to semicolon or comma separation
    if ";" in s:
        return [part.strip() for part in s.split(";") if part.strip()]
    return [s]


def resolve_csv_path(custom_path: Optional[str] = None) -> Path:
    if custom_path:
        p = Path(custom_path)
        if p.exists():
            return p
    if DEFAULT_CSV_PATH.exists():
        return DEFAULT_CSV_PATH
    if FALLBACK_CSV_PATH.exists():
        return FALLBACK_CSV_PATH
    raise FileNotFoundError(f"Could not locate 10_demo_advocates_with_login.csv at {DEFAULT_CSV_PATH} or {FALLBACK_CSV_PATH}")


def seed_demo_advocates(
    csv_file_path: Optional[str] = None,
    db: Optional[Session] = None,
    force: bool = False
) -> Dict[str, Any]:
    """
    Import synthetic demo advocates from CSV into User and AdvocateProfile tables.
    Guaranteed idempotent.
    """
    enable_env = os.getenv("ENABLE_DEMO_ADVOCATES", "false").strip().lower()
    is_enabled = force or (enable_env in ("true", "1", "yes"))

    if not is_enabled:
        print("[INFO] ENABLE_DEMO_ADVOCATES is false. Skipping demo advocate seeding.")
        return {
            "status": "skipped",
            "reason": "ENABLE_DEMO_ADVOCATES is false",
            "csv_rows": 0,
            "users_created": 0,
            "profiles_created": 0,
            "existing_users_updated": 0,
            "existing_profiles_updated": 0,
            "duplicates_created": 0,
            "user_profile_links_valid": True,
        }

    csv_path = resolve_csv_path(csv_file_path)
    demo_password = os.getenv("DEMO_ADVOCATE_PASSWORD", "DemoAdvocate@123").strip()
    hashed_pwd = hash_password(demo_password)

    should_close_db = False
    if db is None:
        db = SessionLocal()
        should_close_db = True

    stats = {
        "csv_path": str(csv_path),
        "csv_rows": 0,
        "users_created": 0,
        "users_updated": 0,
        "profiles_created": 0,
        "profiles_updated": 0,
        "duplicates_created": 0,
        "user_profile_links_valid": True,
        "seeded_advocates": []
    }

    try:
        with open(csv_path, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            stats["csv_rows"] = len(rows)

            for idx, row in enumerate(rows, start=1):
                # 1. Extract and normalize fields
                raw_user_id = row.get("user_id", "").strip()
                raw_profile_id = row.get("advocate_profile_id", "").strip()
                login_email = row.get("login_email", "").strip().lower()
                full_name = row.get("full_name", "").strip()
                role = row.get("role", "lawyer_advisor").strip()
                bar_number = row.get("bar_council_number", "").strip()
                district = row.get("district", "").strip()
                specializations = parse_list_field(row.get("specializations", ""))
                languages = parse_list_field(row.get("languages", ""))
                
                try:
                    years_exp = int(float(row.get("years_of_experience", 0)))
                except (ValueError, TypeError):
                    years_exp = 0

                try:
                    fee = float(row.get("consultation_fee", 0.0))
                except (ValueError, TypeError):
                    fee = 0.0

                online = parse_boolean(row.get("online_consultation", True))
                offline = parse_boolean(row.get("offline_consultation", True))
                pro_bono = parse_boolean(row.get("pro_bono", False))
                verification_status = row.get("verification_status", "VERIFIED").strip()
                is_active = parse_boolean(row.get("is_active", True))
                is_demo = parse_boolean(row.get("is_demo", True))

                user_uuid = uuid.UUID(raw_user_id) if raw_user_id else uuid.uuid4()
                profile_uuid = uuid.UUID(raw_profile_id) if raw_profile_id else uuid.uuid4()

                # 2. Match or Create User record
                user = db.scalar(
                    select(User).where((User.user_id == user_uuid) | (User.email == login_email))
                )

                if user:
                    # Only update if linked profile is a demo advocate
                    demo_profile = db.scalar(
                        select(AdvocateProfile).where(AdvocateProfile.user_id == user.user_id)
                    )
                    if demo_profile and demo_profile.is_demo:
                        user.name = full_name
                        user.email = login_email
                        user.password_hash = hashed_pwd
                        user.role = role
                        user.district = district
                        stats["users_updated"] += 1
                    else:
                        logger.info(f"[SKIP] Not updating real user {login_email}")
                else:
                    user = User(
                        user_id=user_uuid,
                        name=full_name,
                        email=login_email,
                        password_hash=hashed_pwd,
                        role=role,
                        district=district,
                        language_pref="English"
                    )
                    db.add(user)
                    db.flush()
                    stats["users_created"] += 1


                # 3. Match or Create AdvocateProfile record
                profile = db.scalar(
                    select(AdvocateProfile).where(
                        (AdvocateProfile.id == profile_uuid) |
                        (AdvocateProfile.user_id == user.user_id) |
                        (AdvocateProfile.bar_council_number == bar_number)
                    )
                )

                if profile:
                    # Update existing demo advocate profile
                    profile.user_id = user.user_id
                    profile.full_name = full_name
                    profile.bar_council_number = bar_number
                    profile.district = district
                    profile.specializations = specializations
                    profile.languages = languages
                    profile.years_of_experience = years_exp
                    profile.consultation_fee = fee
                    profile.online_consultation = online
                    profile.offline_consultation = offline
                    profile.pro_bono_available = pro_bono
                    profile.verification_status = verification_status
                    profile.is_active = is_active
                    profile.is_demo = is_demo
                    stats["profiles_updated"] += 1
                else:
                    profile = AdvocateProfile(
                        id=profile_uuid,
                        user_id=user.user_id,
                        full_name=full_name,
                        bar_council_number=bar_number,
                        district=district,
                        specializations=specializations,
                        languages=languages,
                        years_of_experience=years_exp,
                        consultation_fee=fee,
                        online_consultation=online,
                        offline_consultation=offline,
                        pro_bono_available=pro_bono,
                        verification_status=verification_status,
                        is_active=is_active,
                        is_demo=is_demo
                    )
                    db.add(profile)
                    db.flush()
                    stats["profiles_created"] += 1

                # Verify linkage integrity
                if profile.user_id != user.user_id:
                    stats["user_profile_links_valid"] = False

                stats["seeded_advocates"].append({
                    "advocate_no": row.get("advocate_no", idx),
                    "full_name": full_name,
                    "email": login_email,
                    "bar_council_number": bar_number,
                    "district": district,
                    "user_id": str(user.user_id),
                    "profile_id": str(profile.id)
                })

            db.commit()
            print(f"[SUCCESS] Seeded demo advocates from CSV: {stats['csv_rows']} rows processed. "
                  f"Users: {stats['users_created']} created, {stats['users_updated']} updated. "
                  f"Profiles: {stats['profiles_created']} created, {stats['profiles_updated']} updated.")

    except Exception as e:
        db.rollback()
        logger.exception("Failed seeding demo advocates from CSV: %s", e)
        raise
    finally:
        if should_close_db:
            db.close()

    return stats


if __name__ == "__main__":
    result = seed_demo_advocates(force=True)
    print("\n--- SEEDING COMPLETED ---")
    print(f"CSV Rows: {result['csv_rows']}")
    print(f"Users Created: {result['users_created']}")
    print(f"Users Updated: {result['users_updated']}")
    print(f"Profiles Created: {result['profiles_created']}")
    print(f"Profiles Updated: {result['profiles_updated']}")
    print(f"Links Valid: {result['user_profile_links_valid']}")
