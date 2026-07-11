from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.domain import AuditLog, User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = decode_access_token(token)
        user_id = UUID(payload["sub"])
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token") from exc
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def get_optional_user(token: str | None = Depends(optional_oauth2_scheme), db: Session = Depends(get_db)) -> User | None:
    if not token:
        return None
    return get_current_user(token, db)


def require_roles(*roles: str):
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")
        return current_user

    return dependency


def audit(db: Session, request: Request, action: str, user_id=None) -> None:
    ip_address = request.client.host if request.client else None
    db.add(AuditLog(user_id=user_id, action=action, ip_address=ip_address))
