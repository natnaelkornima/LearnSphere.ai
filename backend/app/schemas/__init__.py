from app.schemas.user import (
    UserRead,
    UserUpdate,
    UserPreferenceRead,
    UserPreferenceUpdate,
)
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectRead
from app.schemas.document import DocumentRead, DocumentStatusRead, DocumentListResponse
from app.schemas.chat import (
    ChatAskRequest,
    ChatAskResponse,
    CitationRead,
    ConversationCreate,
    ConversationRead,
    MessageRead,
)
from app.schemas.summary import SummaryGenerateRequest, SummaryRead
from app.schemas.quiz import (
    QuizGenerateRequest,
    QuizStudentRead,
    QuizSubmitRequest,
    QuizAttemptRead,
)
from app.schemas.flashcard import (
    FlashcardGenerateRequest,
    FlashcardRead,
    FlashcardSetRead,
    FlashcardReviewRequest,
)
from app.schemas.study_plan import (
    StudyPlanCreateRequest,
    StudyPlanRead,
    StudyTaskRead,
    StudyTaskUpdate,
)
from app.schemas.analytics import AnalyticsDashboardResponse, OverviewMetrics

__all__ = [
    "UserRead",
    "UserUpdate",
    "UserPreferenceRead",
    "UserPreferenceUpdate",
    "SubjectCreate",
    "SubjectUpdate",
    "SubjectRead",
    "DocumentRead",
    "DocumentStatusRead",
    "DocumentListResponse",
    "ChatAskRequest",
    "ChatAskResponse",
    "CitationRead",
    "ConversationCreate",
    "ConversationRead",
    "MessageRead",
    "SummaryGenerateRequest",
    "SummaryRead",
    "QuizGenerateRequest",
    "QuizStudentRead",
    "QuizSubmitRequest",
    "QuizAttemptRead",
    "FlashcardGenerateRequest",
    "FlashcardRead",
    "FlashcardSetRead",
    "FlashcardReviewRequest",
    "StudyPlanCreateRequest",
    "StudyPlanRead",
    "StudyTaskRead",
    "StudyTaskUpdate",
    "AnalyticsDashboardResponse",
    "OverviewMetrics",
]

