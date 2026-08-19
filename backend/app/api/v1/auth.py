from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_current_user, hash_password
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate administrator or user and issue signed JWT access token."""
    stmt = select(User).where(User.email == req.email.lower().strip())
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    # Automatic seed fallback for initial admin login if DB user not yet created
    if not user and req.email.lower() == "admin@mindcampus.edu" and req.password == "AdminPass123!":
        user = User(
            email="admin@mindcampus.edu",
            password_hash=hash_password("AdminPass123!"),
            full_name="Platform Administrator",
            role="admin",
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    elif not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
        },
    }


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    """Return currently authenticated user identity."""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
    }
