from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin
from app.models.user import User, UserPreference
from app.models.subject import Subject
from app.models.document import Document, DocumentProcessingJob, DocumentStatus, JobStatus
from app.models.chunk import DocumentChunk
from app.models.conversation import (
    Conversation,
    ConversationDocument,
    Message,
    MessageSource,
    AIGenerationLog,
)
from app.models.summary import Summary, SummarySource
from app.models.quiz import Quiz, QuizQuestion, QuizAttempt, QuizAttemptAnswer
from app.models.flashcard import FlashcardSet, Flashcard, FlashcardReview
from app.models.study_plan import StudyPlan, StudyTask, StudyPlanDocument
from app.models.learning_activity import LearningActivity, LearningRecommendation

__all__ = [
    "Base",
    "TimestampMixin",
    "UUIDMixin",
    "User",
    "UserPreference",
    "Subject",
    "Document",
    "DocumentProcessingJob",
    "DocumentStatus",
    "JobStatus",
    "DocumentChunk",
    "Conversation",
    "ConversationDocument",
    "Message",
    "MessageSource",
    "AIGenerationLog",
    "Summary",
    "SummarySource",
    "Quiz",
    "QuizQuestion",
    "QuizAttempt",
    "QuizAttemptAnswer",
    "FlashcardSet",
    "Flashcard",
    "FlashcardReview",
    "StudyPlan",
    "StudyTask",
    "StudyPlanDocument",
    "LearningActivity",
    "LearningRecommendation",
]

