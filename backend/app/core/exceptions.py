from typing import Any, Optional
from fastapi import HTTPException, status


class LearnSphereException(HTTPException):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[Any] = None,
        headers: Optional[dict[str, str]] = None,
    ):
        super().__init__(
            status_code=status_code,
            detail={"code": code, "message": message, "details": details},
            headers=headers,
        )
        self.code = code
        self.message = message
        self.details = details


class NotFoundException(LearnSphereException):
    def __init__(self, resource: str, identifier: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code=f"{resource.upper()}_NOT_FOUND",
            message=f"{resource} '{identifier}' was not found.",
        )


class ForbiddenException(LearnSphereException):
    def __init__(self, message: str = "You do not have permission to access this resource."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="FORBIDDEN",
            message=message,
        )


class UnauthorizedException(LearnSphereException):
    def __init__(self, message: str = "Authentication required or token expired."):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="UNAUTHORIZED",
            message=message,
            headers={"WWW-Authenticate": "Bearer"},
        )


class ValidationException(LearnSphereException):
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="VALIDATION_ERROR",
            message=message,
            details=details,
        )


class ExternalServiceException(LearnSphereException):
    def __init__(self, service_name: str, message: str):
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            code=f"{service_name.upper()}_SERVICE_ERROR",
            message=f"External service '{service_name}' failed: {message}",
        )

