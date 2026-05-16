from typing import Literal
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.postgres import get_db
from app.models.domain import UserDB
from app.api.auth import require_owner
from app.core.logger import logger

router = APIRouter()


@router.get("/users")
async def list_users(
    db: AsyncSession = Depends(get_db),
    owner: UserDB = Depends(require_owner)
):
    """Get all registered users. Restricted to owner."""
    result = await db.execute(select(UserDB).order_by(UserDB.created_at.desc()))
    users = result.scalars().all()
    
    return [
        {
            "id": str(u.id),
            "username": u.username,
            "phone_number": u.phone_number,
            "name": u.name,
            "role": u.role,
            "created_at": u.created_at
        } for u in users
    ]


@router.patch("/users/{user_id_or_phone}")
async def update_user_role(
    user_id: str,
    new_role: Literal["owner", "admin", "buyer"],
    db: AsyncSession = Depends(get_db),
    owner: UserDB = Depends(require_owner)
):
    """Update a user's role. Restricted to owner."""
    try:
        uid = uuid.UUID(user_id)
        result = await db.execute(select(UserDB).where(UserDB.id == uid))
    except ValueError:
        return HTTPException(status_code=400, detail="Invalid user ID format. Must be a UUID.")
        
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.role = new_role
    await db.commit()
    
    logger.info(f"Owner {owner.username} updated user {user.username} role to {new_role}")
    return {"status": "success", "user": user.username, "new_role": new_role}
