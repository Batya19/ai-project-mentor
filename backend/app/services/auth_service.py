from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import TokenResponse
from app.services.email_service import create_and_send_otp


def register_user(db: Session, email: str, password: str, full_name: str, level: str) -> User:
    """Register a new user and send a verification OTP."""
    existing = db.query(User).filter(User.email == email).first()
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=email,
        password_hash=hash_password(password),
        full_name=full_name,
        level=level,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    create_and_send_otp(db, email, purpose="register")
    return user


def login_user(db: Session, email: str, password: str) -> TokenResponse:
    """Authenticate user and return access token. User must be verified."""
    user = db.query(User).filter(User.email == email).first()
    if user is None or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not user.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email not verified. Please check your inbox.")

    access_token = create_access_token(subject=user.id)
    return TokenResponse(access_token=access_token)
