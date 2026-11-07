import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.models.summary import Summary
from app.models.user import User
from app.schemas.summary import SummaryGenerateRequest, SummaryRead
from app.services.learning_studio_service import learning_studio_service

router = APIRouter()


@router.post("", response_model=SummaryRead, status_code=status.HTTP_201_CREATED)
async def generate_summary(
    request: SummaryGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SummaryRead:
    return await learning_studio_service.generate_summary(db, current_user, request)


@router.get("", response_model=List[SummaryRead])
async def list_summaries(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[SummaryRead]:
    stmt = (
        select(Summary)
        .where(Summary.user_id == current_user.id)
        .order_by(Summary.created_at.desc())
    )
    summaries = list((await db.execute(stmt)).scalars().all())
    return [SummaryRead.model_validate(s) for s in summaries]


@router.get("/{summary_id}", response_model=SummaryRead)
async def get_summary(
    summary_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SummaryRead:
    stmt = select(Summary).where(Summary.id == summary_id, Summary.user_id == current_user.id)
    summary = (await db.execute(stmt)).scalar_one_or_none()
    if not summary:
        raise NotFoundException("Summary", str(summary_id))
    return SummaryRead.model_validate(summary)

