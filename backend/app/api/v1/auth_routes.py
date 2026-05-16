from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from app.db.postgres import get_db
from app.models.schemas import Token, UserRegister
from app.models.domain import UserDB
from app.api.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.core.logger import logger
from sqlalchemy import func

router = APIRouter()


@router.post("/register", response_model=Token)
async def register(req: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user. Both phone_number and username must be unique."""
    # Check phone_number uniqueness
    result = await db.execute(select(UserDB).where(UserDB.phone_number == req.phone_number))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered",
        )

    # Check username uniqueness
    result = await db.execute(select(UserDB).where(UserDB.username == req.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )

    user_count_result = await db.execute(
        select(func.count(UserDB.id)).where(UserDB.role != "agent")
    )
    user_count = user_count_result.scalar()
    
    role = "owner" if user_count == 0 else "buyer"

    hashed_password = get_password_hash(req.password)
    new_user = UserDB(
        phone_number=req.phone_number,
        username=req.username,
        name=req.name,
        role=role,
        hashed_password=hashed_password,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    logger.info(f"Registered new user: {req.username} ({req.phone_number}) as {role}")

    access_token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": new_user.role}


@router.post("/login", response_model=Token)
async def login(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Login using either phone_number or username as the identifier.
    Supports both JSON and Form Data (application/x-www-form-urlencoded).
    """
    id_val = None
    pass_val = None

    # 1. Try parsing as JSON first
    try:
        body = await request.json()
        id_val = body.get("identifier") or body.get("username") or body.get("phone_number")
        pass_val = body.get("password")
    except Exception:
        # 2. If JSON fails, try Form Data (used by Swagger UI and some clients)
        try:
            form = await request.form()
            id_val = form.get("identifier") or form.get("username") or form.get("phone_number")
            pass_val = form.get("password")
        except Exception:
            pass

    if not id_val or not pass_val:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Missing identifier (username/phone) or password",
        )

    # Try matching by phone_number first, then by username
    result = await db.execute(
        select(UserDB).where(
            or_(UserDB.phone_number == id_val, UserDB.username == id_val)
        )
    )
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password or not verify_password(pass_val, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect identifier or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}


@router.get("/me")
async def get_me(current_user: UserDB = Depends(get_current_user)):
    """Fetch the currently authenticated user's profile."""
    name = current_user.name or "User"
    avatar_url = f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}&background=random"

    return {
        "user_id": str(current_user.id),
        "name": current_user.name,
        "username": current_user.username,
        "phone_number": current_user.phone_number,
        "role": current_user.role,
        "avatar_url": avatar_url,
    }
