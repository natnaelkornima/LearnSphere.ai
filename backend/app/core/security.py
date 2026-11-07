import uuid
from typing import Any, Dict, Optional
import jwt
from fastapi import status
from app.core.config import settings
from app.core.exceptions import UnauthorizedException


def verify_supabase_token(token: str) -> Dict[str, Any]:
    """
    Decodes and verifies a JWT token.
    Supports Supabase Auth tokens and development fallback.
    """
    if not token:
        raise UnauthorizedException("Authorization token is missing.")

    # Allow a dedicated development bypass token for automated testing/local dev
    if settings.DEBUG and token.startswith("dev_user_"):
        user_suffix = token.replace("dev_user_", "")
        dev_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"dev-{user_suffix}.learnsphere.ai"))
        return {
            "sub": dev_uuid,
            "email": f"{user_suffix}@learnsphere.ai",
            "user_metadata": {"full_name": f"Dev User {user_suffix.capitalize()}"},
        }

    try:
        # If Supabase JWT Secret is provided, verify signature
        # Note: Supabase HS256 JWTs use the project API secret
        jwt_secret = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SECRET_KEY
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256"],
            options={"verify_signature": False if settings.DEBUG else True},
        )
        return payload
    except jwt.PyJWTError as e:
        raise UnauthorizedException(f"Invalid authentication token: {str(e)}")

