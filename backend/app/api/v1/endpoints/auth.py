from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserPreferenceRead, UserPreferenceUpdate, UserRead, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserRead)
async def get_my_profile(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.patch("/me", response_model=UserRead)
async def update_my_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    if update_data.full_name is not None:
        current_user.full_name = update_data.full_name
    if update_data.avatar_url is not None:
        current_user.avatar_url = update_data.avatar_url
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.get("/preferences", response_model=UserPreferenceRead)
async def get_my_preferences(current_user: User = Depends(get_current_user)) -> UserPreferenceRead:
    return current_user.preferences


@router.patch("/preferences", response_model=UserPreferenceRead)
async def update_my_preferences(
    update_data: UserPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserPreferenceRead:
    pref = current_user.preferences
    if update_data.theme is not None:
        pref.theme = update_data.theme
    if update_data.language is not None:
        pref.language = update_data.language
    if update_data.timezone is not None:
        pref.timezone = update_data.timezone
    if update_data.daily_study_goal_minutes is not None:
        pref.daily_study_goal_minutes = update_data.daily_study_goal_minutes
    if update_data.notifications_enabled is not None:
        pref.notifications_enabled = update_data.notifications_enabled

    await db.commit()
    await db.refresh(pref)
    return pref

