import uuid
from datetime import date, datetime, timedelta, timezone
from typing import List
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.document import Document
from app.models.flashcard import FlashcardReview
from app.models.learning_activity import LearningActivity, LearningRecommendation
from app.models.quiz import QuizAttempt, QuizAttemptAnswer, QuizQuestion
from app.models.study_plan import StudyTask
from app.schemas.analytics import (
    AnalyticsDashboardResponse,
    OverviewMetrics,
    RecommendationRead,
    TopicPerformance,
    WeeklyActivityItem,
)


class AnalyticsService:
    async def get_dashboard_analytics(
        self, db: AsyncSession, user_id: uuid.UUID
    ) -> AnalyticsDashboardResponse:
        # 1. Total documents
        doc_count_stmt = select(func.count()).select_from(Document).where(Document.user_id == user_id)
        total_docs = (await db.execute(doc_count_stmt)).scalar() or 0

        # 2. Quizzes completed & average score
        quiz_stats_stmt = (
            select(
                func.count(QuizAttempt.id),
                func.coalesce(func.avg(QuizAttempt.percentage), 0.0),
            )
            .where(QuizAttempt.user_id == user_id, QuizAttempt.status == "completed")
        )
        quiz_row = (await db.execute(quiz_stats_stmt)).first()
        quizzes_completed = quiz_row[0] if quiz_row else 0
        avg_score = float(quiz_row[1]) if quiz_row and quiz_row[1] else 0.0

        # 3. Flashcards reviewed
        card_stats_stmt = (
            select(func.count(FlashcardReview.id)).where(FlashcardReview.user_id == user_id)
        )
        flashcards_reviewed = (await db.execute(card_stats_stmt)).scalar() or 0

        # 4. Study tasks completed
        task_stats_stmt = (
            select(func.count(StudyTask.id))
            .where(StudyTask.user_id == user_id, StudyTask.status == "completed")
        )
        tasks_completed = (await db.execute(task_stats_stmt)).scalar() or 0

        overview = OverviewMetrics(
            total_documents=total_docs,
            quizzes_completed=quizzes_completed,
            average_quiz_score=round(avg_score, 1),
            flashcards_reviewed=flashcards_reviewed,
            study_tasks_completed=tasks_completed,
        )

        # 5. Weekly Activity (Past 7 days)
        today = date.today()
        weekly_items: List[WeeklyActivityItem] = []
        for i in range(6, -1, -1):
            target_date = today - timedelta(days=i)
            start_dt = datetime.combine(target_date, datetime.min.time(), tzinfo=timezone.utc)
            end_dt = datetime.combine(target_date, datetime.max.time(), tzinfo=timezone.utc)

            act_count_stmt = (
                select(func.count(LearningActivity.id))
                .where(
                    LearningActivity.user_id == user_id,
                    LearningActivity.occurred_at >= start_dt,
                    LearningActivity.occurred_at <= end_dt,
                )
            )
            cnt = (await db.execute(act_count_stmt)).scalar() or 0
            day_name = target_date.strftime("%a")
            weekly_items.append(
                WeeklyActivityItem(day=day_name, date=target_date.isoformat(), events_count=cnt)
            )

        # 6. Topic Performance & Weak Topics
        topic_stmt = (
            select(
                QuizQuestion.topic,
                func.count(QuizAttemptAnswer.id).label("total_answers"),
                func.sum(case((QuizAttemptAnswer.is_correct == True, 1), else_=0)).label("correct_answers"),
            )
            .join(QuizQuestion, QuizAttemptAnswer.question_id == QuizQuestion.id)
            .join(QuizAttempt, QuizAttemptAnswer.attempt_id == QuizAttempt.id)
            .where(QuizAttempt.user_id == user_id, QuizQuestion.topic.is_not(None))
            .group_by(QuizQuestion.topic)
        )
        topic_rows = (await db.execute(topic_stmt)).all()

        topic_perf_list: List[TopicPerformance] = []
        weak_topics: List[str] = []

        for row in topic_rows:
            topic_name = row[0]
            total_ans = row[1] or 0
            corr_ans = row[2] or 0
            acc = (corr_ans / total_ans * 100.0) if total_ans > 0 else 0.0
            is_weak = acc < 70.0 and total_ans >= 2
            if is_weak:
                weak_topics.append(topic_name)
            topic_perf_list.append(
                TopicPerformance(
                    topic=topic_name,
                    total_questions=total_ans,
                    correct_count=corr_ans,
                    accuracy_percentage=round(acc, 1),
                    is_weak=is_weak,
                )
            )

        # 7. Generate Real Recommendations
        recommendations: List[RecommendationRead] = []
        rec_stmt = (
            select(LearningRecommendation)
            .where(LearningRecommendation.user_id == user_id, LearningRecommendation.status == "active")
            .order_by(LearningRecommendation.created_at.desc())
            .limit(3)
        )
        stored_recs = list((await db.execute(rec_stmt)).scalars().all())

        if stored_recs:
            for r in stored_recs:
                recommendations.append(
                    RecommendationRead(
                        id=r.id,
                        title=r.title,
                        description=r.description,
                        recommendation_type=r.recommendation_type,
                        related_document_id=r.related_document_id,
                        action_data=r.action_data,
                        created_at=r.created_at,
                    )
                )
        else:
            # Dynamic suggestion based on real conditions
            if weak_topics:
                recommendations.append(
                    RecommendationRead(
                        id=uuid.uuid4(),
                        title=f"Review Weak Topic: {weak_topics[0]}",
                        description=f"Your recent quiz performance indicates difficulty with {weak_topics[0]}. Consider creating a dedicated summary or review quiz.",
                        recommendation_type="revision",
                        created_at=datetime.now(timezone.utc),
                    )
                )
            elif total_docs > 0 and quizzes_completed == 0:
                recommendations.append(
                    RecommendationRead(
                        id=uuid.uuid4(),
                        title="Test Your Knowledge",
                        description="You've uploaded study material! Head over to the Quiz Generator in Learning Studio to test your active recall.",
                        recommendation_type="practice",
                        created_at=datetime.now(timezone.utc),
                    )
                )

        return AnalyticsDashboardResponse(
            metrics=overview,
            weekly_activity=weekly_items,
            topic_performance=topic_perf_list,
            weak_topics=weak_topics,
            recommendations=recommendations,
        )


analytics_service = AnalyticsService()

