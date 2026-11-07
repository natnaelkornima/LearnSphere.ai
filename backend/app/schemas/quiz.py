import uuid
from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class QuizGenerateRequest(BaseModel):
    document_id: uuid.UUID
    topic: Optional[str] = None
    difficulty: str = Field(default="medium", pattern="^(easy|medium|hard|mixed)$")
    question_count: int = Field(default=5, ge=1, le=20)
    question_types: List[str] = Field(default=["multiple_choice"])


class QuizOption(BaseModel):
    id: str  # e.g., "A", "B", "C", "D"
    text: str


class QuizQuestionStudentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    question_text: str
    question_type: str
    options: List[QuizOption]
    points: int
    order_index: int


class QuizStudentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: Optional[str] = None
    difficulty: str
    question_count: int
    questions: List[QuizQuestionStudentRead] = []


class QuestionAnswerSubmission(BaseModel):
    question_id: uuid.UUID
    answer: Any


class QuizSubmitRequest(BaseModel):
    answers: List[QuestionAnswerSubmission]


class QuestionResultRead(BaseModel):
    question_id: uuid.UUID
    question_text: str
    submitted_answer: Optional[Any]
    correct_answer: Any
    is_correct: bool
    explanation: Optional[str] = None
    points_awarded: float


class QuizAttemptRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    quiz_id: uuid.UUID
    score: Optional[float]
    total_points: float
    percentage: Optional[float]
    correct_count: int
    incorrect_count: int
    status: str
    started_at: datetime
    submitted_at: Optional[datetime]
    results: List[QuestionResultRead] = []

