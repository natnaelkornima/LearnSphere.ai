from fastapi import APIRouter
from app.api.v1.endpoints import (
    analytics,
    auth,
    chat,
    documents,
    flashcards,
    quizzes,
    study_plans,
    summaries,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Profile"])
api_router.include_router(documents.router, prefix="/documents", tags=["Document Intelligence"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Tutor"])
api_router.include_router(summaries.router, prefix="/summaries", tags=["Learning Studio - Summaries"])
api_router.include_router(quizzes.router, prefix="/quizzes", tags=["Learning Studio - Quizzes"])
api_router.include_router(flashcards.router, prefix="", tags=["Learning Studio - Flashcards"])
api_router.include_router(study_plans.router, prefix="", tags=["Study Planner"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Learning Analytics"])

