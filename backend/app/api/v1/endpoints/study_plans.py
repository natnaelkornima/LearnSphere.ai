import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.study_plan import (
    StudyPlanCreateRequest,
    StudyPlanRead,
    StudyTaskRead,
    StudyTaskUpdate,
)
from app.services.planner_service import planner_service

router = APIRouter()


@router.post("/study-plans", response_model=StudyPlanRead, status_code=status.HTTP_201_CREATED)
async def create_study_plan(
    request: StudyPlanCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StudyPlanRead:
    return await planner_service.create_study_plan(db, current_user, request)


@router.get("/study-plans", response_model=List[StudyPlanRead])
async def list_study_plans(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[StudyPlanRead]:
    return await planner_service.get_user_plans(db, current_user.id)


@router.get("/study-plans/{plan_id}", response_model=StudyPlanRead)
async def get_study_plan(
    plan_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StudyPlanRead:
    return await planner_service.get_plan_by_id(db, current_user.id, plan_id)


@router.patch("/study-plans/{plan_id}/tasks/{task_id}", response_model=StudyTaskRead)
@router.patch("/study-tasks/{task_id}", response_model=StudyTaskRead)
async def update_task(
    task_id: uuid.UUID,
    task_update: StudyTaskUpdate,
    plan_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StudyTaskRead:
    return await planner_service.update_task_status(db, current_user.id, task_id, task_update)
