import uuid
from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class StudyPlanCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    subject_id: Optional[uuid.UUID] = None
    document_ids: List[uuid.UUID] = Field(default_factory=list)
    start_date: Optional[date] = None
    target_date: Optional[date] = None
    daily_goal_minutes: int = Field(default=60, ge=10, le=720)


class StudyTaskUpdate(BaseModel):
    status: Optional[str] = Field(default=None, pattern="^(pending|in_progress|completed|skipped)$")
    scheduled_date: Optional[date] = None
    title: Optional[str] = None
    estimated_minutes: Optional[int] = None


class StudyTaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    plan_id: uuid.UUID
    document_id: Optional[uuid.UUID]
    title: str
    description: Optional[str]
    scheduled_date: Optional[date]
    estimated_minutes: Optional[int]
    status: str
    priority: str
    completed_at: Optional[datetime]
    created_at: datetime


class StudyPlanRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    subject_id: Optional[uuid.UUID]
    title: str
    description: Optional[str]
    start_date: Optional[date]
    target_date: Optional[date]
    daily_goal_minutes: Optional[int]
    status: str
    created_at: datetime
    updated_at: datetime
    tasks: List[StudyTaskRead] = []

