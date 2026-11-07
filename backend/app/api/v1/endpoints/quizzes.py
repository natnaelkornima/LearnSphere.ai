import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.quiz import Quiz, QuizQuestion
from app.models.user import User
from app.schemas.quiz import (
    QuizAttemptRead,
    QuizGenerateRequest,
    QuizStudentRead,
    QuizSubmitRequest,
)
from app.services.learning_studio_service import learning_studio_service

router = APIRouter()


@router.post("/generate", response_model=QuizStudentRead, status_code=status.HTTP_201_CREATED)
async def generate_quiz(
    request: QuizGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> QuizStudentRead:
    return await learning_studio_service.generate_quiz(db, current_user, request)


@router.get("", response_model=List[QuizStudentRead])
async def list_quizzes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[QuizStudentRead]:
    stmt = (
        select(Quiz)
        .where(Quiz.user_id == current_user.id)
        .order_by(Quiz.created_at.desc())
    )
    quizzes = list((await db.execute(stmt)).scalars().all())
    for q in quizzes:
        q_stmt = select(QuizQuestion).where(QuizQuestion.quiz_id == q.id).order_by(QuizQuestion.order_index)
        q.questions = list((await db.execute(q_stmt)).scalars().all())
    return [QuizStudentRead.model_validate(q) for q in quizzes]


@router.get("/{quiz_id}", response_model=QuizStudentRead)
async def get_quiz(
    quiz_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> QuizStudentRead:
    return await learning_studio_service.get_quiz_for_student(db, current_user.id, quiz_id)


@router.post("/{quiz_id}/submit", response_model=QuizAttemptRead)
async def submit_quiz_attempt(
    quiz_id: uuid.UUID,
    submission: QuizSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> QuizAttemptRead:
    return await learning_studio_service.submit_quiz(db, current_user, quiz_id, submission)
