import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Any, List, Optional, Union
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.providers.gemini import GeminiAIProvider
from app.core.exceptions import NotFoundException, ValidationException
from app.models.document import Document
from app.models.learning_activity import LearningActivity
from app.models.study_plan import StudyPlan, StudyPlanDocument, StudyTask
from app.models.user import User
from app.schemas.study_plan import StudyPlanCreateRequest, StudyPlanRead, StudyTaskRead

ai_provider = GeminiAIProvider()


class GeneratedTaskItem(BaseModel):
    title: str
    description: str
    day_offset: int  # 0, 1, 2, ...
    estimated_minutes: int
    priority: str = "medium"


class GeneratedPlanSchema(BaseModel):
    tasks: List[GeneratedTaskItem]


class PlannerService:
    async def create_study_plan(
        self, db: AsyncSession, user: User, request: StudyPlanCreateRequest
    ) -> StudyPlanRead:
        start_d = request.start_date or date.today()
        target_d = request.target_date or (start_d + timedelta(days=14))

        if target_d < start_d:
            raise ValidationException("Target date cannot be earlier than start date.")

        # Document titles
        doc_titles = []
        if request.document_ids:
            doc_stmt = select(Document).where(
                Document.id.in_(request.document_ids), Document.user_id == user.id
            )
            docs = list((await db.execute(doc_stmt)).scalars().all())
            doc_titles = [d.title for d in docs]

        # Call AI to structure tasks
        sys_prompt = (
            "You are an academic study schedule optimizer. Generate balanced, sequential daily study tasks "
            "distributed realistically within the requested timeframe."
        )
        total_days = max(1, (target_d - start_d).days)
        user_prompt = (
            f"Plan Title: {request.title}\n"
            f"Daily Available Time: {request.daily_goal_minutes} minutes\n"
            f"Duration: {total_days} days\n"
            f"Materials: {', '.join(doc_titles) if doc_titles else 'General coursework'}\n\n"
            f"Generate 4 to 10 sequential tasks. Each task must have a title, short description, "
            f"day_offset (0 to {total_days}), estimated_minutes (max {request.daily_goal_minutes}), "
            f"and priority ('low', 'medium', 'high')."
        )

        generated = await ai_provider.generate_structured(
            prompt=user_prompt,
            response_model=GeneratedPlanSchema,
            system_instruction=sys_prompt,
        )

        plan = StudyPlan(
            user_id=user.id,
            subject_id=request.subject_id,
            title=request.title,
            start_date=start_d,
            target_date=target_d,
            daily_goal_minutes=request.daily_goal_minutes,
            status="active",
        )
        db.add(plan)
        await db.flush()

        # Link documents
        for doc_id in request.document_ids:
            db.add(StudyPlanDocument(plan_id=plan.id, document_id=doc_id, user_id=user.id))

        tasks: List[StudyTask] = []
        for idx, t in enumerate(generated.tasks):
            task_date = start_d + timedelta(days=min(t.day_offset, total_days))
            task_rec = StudyTask(
                plan_id=plan.id,
                user_id=user.id,
                document_id=request.document_ids[0] if request.document_ids else None,
                title=t.title,
                description=t.description,
                scheduled_date=task_date,
                estimated_minutes=t.estimated_minutes,
                priority=t.priority if t.priority in ("low", "medium", "high") else "medium",
                order_index=idx,
                status="pending",
            )
            db.add(task_rec)
            tasks.append(task_rec)

        await db.commit()
        await db.refresh(plan)

        stmt = select(StudyTask).where(StudyTask.plan_id == plan.id).order_by(StudyTask.scheduled_date)
        plan.tasks = list((await db.execute(stmt)).scalars().all())

        return StudyPlanRead.model_validate(plan)

    async def get_user_plans(self, db: AsyncSession, user_id: uuid.UUID) -> List[StudyPlanRead]:
        stmt = (
            select(StudyPlan)
            .where(StudyPlan.user_id == user_id)
            .order_by(StudyPlan.created_at.desc())
        )
        plans = list((await db.execute(stmt)).scalars().all())
        for p in plans:
            t_stmt = select(StudyTask).where(StudyTask.plan_id == p.id).order_by(StudyTask.scheduled_date)
            p.tasks = list((await db.execute(t_stmt)).scalars().all())
        return [StudyPlanRead.model_validate(p) for p in plans]

    async def get_plan_by_id(
        self, db: AsyncSession, user_id: uuid.UUID, plan_id: uuid.UUID
    ) -> StudyPlanRead:
        stmt = select(StudyPlan).where(StudyPlan.id == plan_id, StudyPlan.user_id == user_id)
        plan = (await db.execute(stmt)).scalar_one_or_none()
        if not plan:
            raise NotFoundException("StudyPlan", str(plan_id))

        t_stmt = select(StudyTask).where(StudyTask.plan_id == plan.id).order_by(StudyTask.scheduled_date)
        plan.tasks = list((await db.execute(t_stmt)).scalars().all())
        return StudyPlanRead.model_validate(plan)

    async def update_task_status(
        self,
        db: AsyncSession,
        user: Union[User, uuid.UUID],
        task_id: uuid.UUID,
        new_status: Union[str, Any],
    ) -> StudyTaskRead:
        user_id = user.id if isinstance(user, User) else user
        status_val = getattr(new_status, "status", new_status)
        if hasattr(status_val, "value"):
            status_val = status_val.value

        stmt = select(StudyTask).where(StudyTask.id == task_id, StudyTask.user_id == user_id)
        task = (await db.execute(stmt)).scalar_one_or_none()
        if not task:
            raise NotFoundException("StudyTask", str(task_id))

        task.status = str(status_val)
        if str(status_val) == "completed":
            task.completed_at = datetime.now(timezone.utc)
            db.add(
                LearningActivity(
                    user_id=user_id,
                    activity_type="study_task_completed",
                    study_task_id=task.id,
                    activity_metadata={"title": task.title},
                )
            )
        else:
            task.completed_at = None

        await db.commit()
        await db.refresh(task)
        return StudyTaskRead.model_validate(task)


planner_service = PlannerService()

