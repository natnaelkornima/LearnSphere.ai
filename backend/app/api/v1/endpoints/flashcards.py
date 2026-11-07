import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.models.flashcard import Flashcard, FlashcardSet
from app.models.user import User
from app.schemas.flashcard import (
    FlashcardGenerateRequest,
    FlashcardRead,
    FlashcardReviewRequest,
    FlashcardSetRead,
)
from app.services.learning_studio_service import learning_studio_service

router = APIRouter()


@router.post("/flashcard-sets/generate", response_model=FlashcardSetRead, status_code=status.HTTP_201_CREATED)
async def generate_flashcards(
    request: FlashcardGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FlashcardSetRead:
    return await learning_studio_service.generate_flashcards(db, current_user, request)


@router.get("/flashcard-sets", response_model=List[FlashcardSetRead])
async def list_flashcard_sets(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[FlashcardSetRead]:
    stmt = (
        select(FlashcardSet)
        .where(FlashcardSet.user_id == current_user.id)
        .order_by(FlashcardSet.created_at.desc())
    )
    sets = list((await db.execute(stmt)).scalars().all())
    for s in sets:
        c_stmt = select(Flashcard).where(Flashcard.set_id == s.id).order_by(Flashcard.order_index)
        s.cards = list((await db.execute(c_stmt)).scalars().all())
    return [FlashcardSetRead.model_validate(s) for s in sets]


@router.get("/flashcard-sets/{set_id}", response_model=FlashcardSetRead)
async def get_flashcard_set(
    set_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FlashcardSetRead:
    stmt = select(FlashcardSet).where(FlashcardSet.id == set_id, FlashcardSet.user_id == current_user.id)
    card_set = (await db.execute(stmt)).scalar_one_or_none()
    if not card_set:
        raise NotFoundException("FlashcardSet", str(set_id))

    c_stmt = select(Flashcard).where(Flashcard.set_id == card_set.id).order_by(Flashcard.order_index)
    card_set.cards = list((await db.execute(c_stmt)).scalars().all())
    return FlashcardSetRead.model_validate(card_set)


@router.post("/flashcards/{flashcard_id}/review", status_code=status.HTTP_200_OK)
async def review_flashcard(
    flashcard_id: uuid.UUID,
    review_req: FlashcardReviewRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    await learning_studio_service.review_flashcard(db, current_user, flashcard_id, review_req.rating)
    return {"status": "success", "rating": review_req.rating}

