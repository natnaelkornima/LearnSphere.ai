import uuid
from typing import Optional
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.exceptions import UnauthorizedException
from app.core.security import verify_supabase_token
from app.models.user import User, UserPreference

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    auth_credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Validates the bearer token, retrieves or initializes the corresponding User record,
    and returns the authenticated User entity.
    """
    if not auth_credentials or not auth_credentials.credentials:
        raise UnauthorizedException("Authentication token required.")

    token = auth_credentials.credentials
    payload = verify_supabase_token(token)

    sub = payload.get("sub")
    if not sub:
        raise UnauthorizedException("Invalid token payload: missing subject identifier.")

    try:
        user_uuid = uuid.UUID(sub)
    except ValueError:
        raise UnauthorizedException("Invalid user identifier in token.")

    # Retrieve existing user
    stmt = select(User).where(User.id == user_uuid)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        # Auto-provision user record upon first valid authenticated API call
        email = payload.get("email", f"user_{str(user_uuid)[:8]}@learnsphere.ai")
        metadata = payload.get("user_metadata", {}) or {}
        full_name = metadata.get("full_name") or metadata.get("name") or email.split("@")[0]

        user = User(
            id=user_uuid,
            email=email,
            full_name=full_name,
            is_active=True,
        )
        db.add(user)
        # Also create default preferences
        pref = UserPreference(user_id=user_uuid)
        db.add(pref)
        await db.commit()
        await db.refresh(user)

    if not user.is_active:
        raise UnauthorizedException("User account is inactive.")

    return user

