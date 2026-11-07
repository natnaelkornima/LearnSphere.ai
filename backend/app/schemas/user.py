import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserPreferenceBase(BaseModel):
    theme: str = Field(default="system", pattern="^(light|dark|system)$")
    language: str = Field(default="en")
    timezone: str = Field(default="UTC")
    daily_study_goal_minutes: int = Field(default=60, ge=5, le=1440)
    notifications_enabled: bool = True


class UserPreferenceUpdate(BaseModel):
    theme: Optional[str] = Field(default=None, pattern="^(light|dark|system)$")
    language: Optional[str] = None
    timezone: Optional[str] = None
    daily_study_goal_minutes: Optional[int] = Field(default=None, ge=5, le=1440)
    notifications_enabled: Optional[bool] = None


class UserPreferenceRead(UserPreferenceBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class UserBase(BaseModel):
    email: EmailStr
    full_name: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    avatar_url: Optional[str] = None


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    preferences: Optional[UserPreferenceRead] = None

