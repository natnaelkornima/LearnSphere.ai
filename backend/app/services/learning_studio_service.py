import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.providers.gemini import GeminiAIProvider
from app.core.config import settings
from app.core.exceptions import NotFoundException, ValidationException
from app.models.chunk import DocumentChunk
from app.models.document import Document, DocumentStatus
from app.models.flashcard import Flashcard, FlashcardReview, FlashcardSet
from app.models.learning_activity import LearningActivity
from app.models.quiz import Quiz, QuizAttempt, QuizAttemptAnswer, QuizQuestion
from app.models.summary import Summary, SummarySource
from app.models.user import User
from app.schemas.flashcard import FlashcardGenerateRequest, FlashcardSetRead
from app.schemas.quiz import (
    QuestionResultRead,
    QuizAttemptRead,
    QuizGenerateRequest,
    QuizOption,
    QuizQuestionStudentRead,
    QuizStudentRead,
    QuizSubmitRequest,
)
from app.schemas.summary import SummaryGenerateRequest, SummaryRead

logger = logging.getLogger(__name__)
ai_provider = GeminiAIProvider()


# Pydantic schemas for AI structured outputs
class GeneratedQuizOption(BaseModel):
    id: str  # "A", "B", "C", "D"
    text: str


class GeneratedQuestion(BaseModel):
    question_text: str
    options: List[GeneratedQuizOption]
    correct_answer: str  # "A", "B", "C", or "D"
    explanation: str
    topic: str


class GeneratedQuizSchema(BaseModel):
    title: str
    questions: List[GeneratedQuestion]


class GeneratedCard(BaseModel):
    front: str
    back: str


class GeneratedFlashcardSetSchema(BaseModel):
    title: str
    cards: List[GeneratedCard]


class GeneratedSummarySchema(BaseModel):
    title: str
    content: str
    key_takeaways: List[str] = Field(default_factory=list)


class LearningStudioService:
    async def _get_document_context(
        self, db: AsyncSession, user_id: uuid.UUID, document_id: uuid.UUID, max_chars: int = 15000
    ) -> Tuple[Document, List[DocumentChunk], str]:
        stmt = (
            select(Document)
            .where(Document.id == document_id, Document.user_id == user_id)
        )
        doc = (await db.execute(stmt)).scalar_one_or_none()
        if not doc:
            raise NotFoundException("Document", str(document_id))
        if doc.status != DocumentStatus.READY.value:
            raise ValidationException("Document must be processed and in 'ready' status.")

        chunk_stmt = (
            select(DocumentChunk)
            .where(DocumentChunk.document_id == document_id)
            .order_by(DocumentChunk.chunk_index)
        )
        chunks = list((await db.execute(chunk_stmt)).scalars().all())
        if not chunks:
            raise ValidationException("Document contains no indexed content.")

        # Aggregate context up to budget
        collected = []
        total_len = 0
        used_chunks = []
        for c in chunks:
            if total_len + len(c.content) <= max_chars:
                collected.append(f"[Page {c.page_start}]: {c.content}")
                total_len += len(c.content)
                used_chunks.append(c)
            else:
                break

        return doc, used_chunks, "\n\n".join(collected)

    # 1. SUMMARY GENERATION
    async def generate_summary(
        self, db: AsyncSession, user: User, request: SummaryGenerateRequest
    ) -> SummaryRead:
        doc, chunks, context_text = await self._get_document_context(
            db, user.id, request.document_id
        )

        system_prompt = (
            "You are an expert educational content summarizer. "
            "Produce structured, clear, and comprehensive summaries directly based on provided study material."
        )
        user_prompt = (
            f"Document Title: {doc.title}\n"
            f"Summary Style Requested: {request.summary_type}\n"
            f"Optional Topic Focus: {request.topic or 'Entire Document'}\n\n"
            f"Study Content:\n{context_text}\n\n"
            f"Provide a structured summary with a title, formatted content (with clear markdown headings and bullet points), "
            f"and a list of 3-7 key takeaways."
        )

        generated = await ai_provider.generate_structured(
            prompt=user_prompt,
            response_model=GeneratedSummarySchema,
            system_instruction=system_prompt,
        )

        summary_id = uuid.uuid4()
        now = datetime.now(timezone.utc)
        summary = Summary(
            id=summary_id,
            user_id=user.id,
            document_id=doc.id,
            title=generated.title or f"{doc.title} - {request.summary_type.replace('_', ' ').title()}",
            summary_type=request.summary_type,
            content=generated.content or "Summary generated from educational document.",
            key_takeaways=generated.key_takeaways or [],
            status="completed",
            model_name=settings.GEMINI_MODEL,
        )
        db.add(summary)

        for c in chunks[:5]:
            db.add(SummarySource(summary_id=summary_id, chunk_id=c.id, document_id=doc.id))

        db.add(
            LearningActivity(
                user_id=user.id,
                activity_type="summary_generated",
                document_id=doc.id,
                activity_metadata={"summary_type": request.summary_type, "title": summary.title},
            )
        )

        await db.commit()
        await db.refresh(summary)
        return SummaryRead.model_validate(summary)

    # 2. QUIZ GENERATION & SCORING
    async def generate_quiz(
        self, db: AsyncSession, user: User, request: QuizGenerateRequest
    ) -> QuizStudentRead:
        doc, chunks, context_text = await self._get_document_context(
            db, user.id, request.document_id
        )

        system_prompt = (
            "You are an assessment author for higher education. Generate challenging, unambiguous "
            "multiple-choice questions strictly grounded in the provided document content."
        )
        user_prompt = (
            f"Document Title: {doc.title}\n"
            f"Difficulty: {request.difficulty}\n"
            f"Question Count: {request.question_count}\n"
            f"Topic: {request.topic or 'Comprehensive'}\n\n"
            f"Study Content:\n{context_text}\n\n"
            f"For each question provide: question_text, 4 options (with ids 'A', 'B', 'C', 'D'), "
            f"the correct_answer (must be one of 'A', 'B', 'C', or 'D'), a detailed explanation, and the topic."
        )

        generated = await ai_provider.generate_structured(
            prompt=user_prompt,
            response_model=GeneratedQuizSchema,
            system_instruction=system_prompt,
        )

        quiz = Quiz(
            user_id=user.id,
            document_id=doc.id,
            subject_id=doc.subject_id,
            title=generated.title or f"Quiz: {doc.title}",
            difficulty=request.difficulty,
            question_count=len(generated.questions),
            status="ready",
        )
        db.add(quiz)
        await db.flush()

        student_questions: List[QuizQuestionStudentRead] = []
        for idx, q in enumerate(generated.questions):
            q_rec = QuizQuestion(
                quiz_id=quiz.id,
                question_text=q.question_text,
                question_type="multiple_choice",
                options=[opt.model_dump() for opt in q.options],
                correct_answer=q.correct_answer,
                explanation=q.explanation,
                topic=q.topic,
                points=1,
                order_index=idx,
                source_chunk_id=chunks[0].id if chunks else None,
            )
            db.add(q_rec)
            await db.flush()

            student_questions.append(
                QuizQuestionStudentRead(
                    id=q_rec.id,
                    question_text=q.question_text,
                    question_type="multiple_choice",
                    options=[QuizOption(id=opt.id, text=opt.text) for opt in q.options],
                    points=1,
                    order_index=idx,
                )
            )

        db.add(
            LearningActivity(
                user_id=user.id,
                activity_type="quiz_started",
                quiz_id=quiz.id,
                document_id=doc.id,
            )
        )
        await db.commit()
        await db.refresh(quiz)

        return QuizStudentRead(
            id=quiz.id,
            title=quiz.title,
            description=quiz.description,
            difficulty=quiz.difficulty,
            question_count=quiz.question_count,
            questions=student_questions,
        )

    async def get_quiz_for_student(
        self, db: AsyncSession, user_id: uuid.UUID, quiz_id: uuid.UUID
    ) -> QuizStudentRead:
        stmt = (
            select(Quiz)
            .where(Quiz.id == quiz_id, Quiz.user_id == user_id)
        )
        quiz = (await db.execute(stmt)).scalar_one_or_none()
        if not quiz:
            raise NotFoundException("Quiz", str(quiz_id))

        q_stmt = (
            select(QuizQuestion)
            .where(QuizQuestion.quiz_id == quiz.id)
            .order_by(QuizQuestion.order_index)
        )
        questions = list((await db.execute(q_stmt)).scalars().all())

        student_questions = [
            QuizQuestionStudentRead(
                id=q.id,
                question_text=q.question_text,
                question_type=q.question_type,
                options=[QuizOption(**opt) for opt in q.options],
                points=q.points,
                order_index=q.order_index,
            )
            for q in questions
        ]

        return QuizStudentRead(
            id=quiz.id,
            title=quiz.title,
            description=quiz.description,
            difficulty=quiz.difficulty,
            question_count=quiz.question_count,
            questions=student_questions,
        )

    async def submit_quiz(
        self, db: AsyncSession, user: User, quiz_id: uuid.UUID, submission: QuizSubmitRequest
    ) -> QuizAttemptRead:
        stmt = select(Quiz).where(Quiz.id == quiz_id, Quiz.user_id == user.id)
        quiz = (await db.execute(stmt)).scalar_one_or_none()
        if not quiz:
            raise NotFoundException("Quiz", str(quiz_id))

        q_stmt = select(QuizQuestion).where(QuizQuestion.quiz_id == quiz.id)
        questions = {q.id: q for q in (await db.execute(q_stmt)).scalars().all()}

        submission_dict = {ans.question_id: ans.answer for ans in submission.answers}

        total_points = sum(q.points for q in questions.values())
        awarded_total = 0.0
        correct_count = 0
        incorrect_count = 0
        now = datetime.now(timezone.utc)

        attempt = QuizAttempt(
            quiz_id=quiz.id,
            user_id=user.id,
            total_points=float(total_points),
            status="completed",
            started_at=now,
            submitted_at=now,
        )
        db.add(attempt)
        await db.flush()

        results: List[QuestionResultRead] = []

        for q_id, question in questions.items():
            user_ans = submission_dict.get(q_id)
            is_correct = (
                str(user_ans).strip().upper() == str(question.correct_answer).strip().upper()
                if user_ans is not None
                else False
            )
            points = float(question.points) if is_correct else 0.0
            if is_correct:
                correct_count += 1
                awarded_total += points
            else:
                incorrect_count += 1

            ans_rec = QuizAttemptAnswer(
                attempt_id=attempt.id,
                question_id=q_id,
                submitted_answer=user_ans,
                is_correct=is_correct,
                awarded_points=points,
                feedback=question.explanation,
            )
            db.add(ans_rec)

            results.append(
                QuestionResultRead(
                    question_id=q_id,
                    question_text=question.question_text,
                    submitted_answer=user_ans,
                    correct_answer=question.correct_answer,
                    is_correct=is_correct,
                    explanation=question.explanation,
                    points_awarded=points,
                )
            )

        percentage = (awarded_total / total_points * 100.0) if total_points > 0 else 0.0
        attempt.score = awarded_total
        attempt.percentage = percentage
        attempt.correct_count = correct_count
        attempt.incorrect_count = incorrect_count

        db.add(
            LearningActivity(
                user_id=user.id,
                activity_type="quiz_completed",
                quiz_id=quiz.id,
                attempt_id=attempt.id,
                document_id=quiz.document_id,
                activity_metadata={"percentage": percentage, "score": awarded_total},
            )
        )

        await db.commit()
        await db.refresh(attempt)

        return QuizAttemptRead(
            id=attempt.id,
            quiz_id=quiz.id,
            score=attempt.score,
            total_points=attempt.total_points,
            percentage=attempt.percentage,
            correct_count=attempt.correct_count,
            incorrect_count=attempt.incorrect_count,
            status=attempt.status,
            started_at=attempt.started_at,
            submitted_at=attempt.submitted_at,
            results=results,
        )

    # 3. FLASHCARD GENERATION & REVIEW
    async def generate_flashcards(
        self, db: AsyncSession, user: User, request: FlashcardGenerateRequest
    ) -> FlashcardSetRead:
        doc, chunks, context_text = await self._get_document_context(
            db, user.id, request.document_id
        )

        system_prompt = (
            "You are an active recall flashcard creator. Formulate bite-sized, high-yield front (question/prompt) "
            "and back (concise answer) cards based directly on the provided study materials."
        )
        user_prompt = (
            f"Document Title: {doc.title}\n"
            f"Target Card Count: {request.card_count}\n"
            f"Topic Focus: {request.topic or 'Comprehensive'}\n\n"
            f"Study Content:\n{context_text}\n\n"
            f"Generate a set title and a list of cards with 'front' and 'back' fields."
        )

        generated = await ai_provider.generate_structured(
            prompt=user_prompt,
            response_model=GeneratedFlashcardSetSchema,
            system_instruction=system_prompt,
        )

        card_set = FlashcardSet(
            user_id=user.id,
            document_id=doc.id,
            subject_id=doc.subject_id,
            title=generated.title or f"Flashcards: {doc.title}",
            card_count=len(generated.cards),
        )
        db.add(card_set)
        await db.flush()

        cards: List[Flashcard] = []
        for idx, card in enumerate(generated.cards):
            card_rec = Flashcard(
                set_id=card_set.id,
                user_id=user.id,
                front_content=card.front,
                back_content=card.back,
                order_index=idx,
                source_chunk_id=chunks[0].id if chunks else None,
            )
            db.add(card_rec)
            cards.append(card_rec)

        db.add(
            LearningActivity(
                user_id=user.id,
                activity_type="flashcard_reviewed",
                flashcard_set_id=card_set.id,
                document_id=doc.id,
                activity_metadata={"cards_generated": len(cards)},
            )
        )

        await db.commit()
        await db.refresh(card_set)

        stmt = select(Flashcard).where(Flashcard.set_id == card_set.id).order_by(Flashcard.order_index)
        loaded_cards = list((await db.execute(stmt)).scalars().all())
        card_set.cards = loaded_cards

        return FlashcardSetRead.model_validate(card_set)

    async def review_flashcard(
        self, db: AsyncSession, user: User, flashcard_id: uuid.UUID, rating: str
    ) -> None:
        stmt = select(Flashcard).where(Flashcard.id == flashcard_id, Flashcard.user_id == user.id)
        card = (await db.execute(stmt)).scalar_one_or_none()
        if not card:
            raise NotFoundException("Flashcard", str(flashcard_id))

        review = FlashcardReview(
            flashcard_id=card.id,
            user_id=user.id,
            rating=rating,
        )
        db.add(review)

        db.add(
            LearningActivity(
                user_id=user.id,
                activity_type="flashcard_reviewed",
                flashcard_set_id=card.set_id,
                activity_metadata={"rating": rating},
            )
        )
        await db.commit()


learning_studio_service = LearningStudioService()
