from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import audit, get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.domain import User
from app.schemas import Token, UserCreate, UserLogin, UserRead
from app.utils.excel_store import save_user_to_excel

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, request: Request, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        language_pref=payload.language_pref,
        district=payload.district,
        taluk=payload.taluk,
    )
    db.add(user)
    db.flush()
    audit(db, request, "auth.register", user.user_id)
    db.commit()
    db.refresh(user)

    # Save user details to Excel sheet
    save_user_to_excel(user)

    return user


@router.post("/login", response_model=Token)
def login(payload: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(str(user.user_id), {"role": user.role})
    audit(db, request, "auth.login", user.user_id)
    db.commit()
    return Token(access_token=token)


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user
