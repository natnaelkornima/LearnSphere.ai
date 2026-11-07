import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class OverviewMetrics(BaseModel):
    total_documents: int = 0
    quizzes_completed: int = 0
    average_quiz_score: float = 0.0
    flashcards_reviewed: int = 0
    study_tasks_completed: int = 0


class WeeklyActivityItem(BaseModel):
    day: str  # e.g., "Mon", "Tue"
    date: str  # "YYYY-MM-DD"
    events_count: int = 0


class TopicPerformance(BaseModel):
    topic: str
    total_questions: int
    correct_count: int
    accuracy_percentage: float
    is_weak: bool


class RecommendationRead(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    recommendation_type: str
    related_document_id: Optional[uuid.UUID] = None
    action_data: Dict[str, Any] = {}
    created_at: datetime


class AnalyticsDashboardResponse(BaseModel):
    metrics: OverviewMetrics
    weekly_activity: List[WeeklyActivityItem] = []
    topic_performance: List[TopicPerformance] = []
    weak_topics: List[str] = []
    recommendations: List[RecommendationRead] = []

