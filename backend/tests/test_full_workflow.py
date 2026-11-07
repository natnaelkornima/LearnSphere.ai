import pytest
from httpx import AsyncClient
import uuid
from datetime import datetime, timezone
from app.models.document import Document
from app.models.chunk import DocumentChunk
from app.models.user import User
from app.core.database import Base
from sqlalchemy import select

@pytest.mark.asyncio
async def test_auth_and_profile(client: AsyncClient):
    headers = {"Authorization": "Bearer dev_user_alex"}
    resp = await client.get("/api/v1/auth/me", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "alex@learnsphere.ai"
    assert "preferences" in data

    pref_resp = await client.patch(
        "/api/v1/auth/preferences",
        headers=headers,
        json={"daily_study_goal_minutes": 60, "theme": "dark"}
    )
    assert pref_resp.status_code == 200
    pref_data = pref_resp.json()
    assert pref_data["daily_study_goal_minutes"] == 60
    assert pref_data["theme"] == "dark"

@pytest.mark.asyncio
async def test_complete_learning_cycle(client: AsyncClient):
    headers = {"Authorization": "Bearer dev_user_student"}

    # 1. Initialize user via authenticated profile endpoint
    me_resp = await client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    user_id = uuid.UUID(me_resp.json()["id"])

    # 2. Ingest document via direct DB setup for deterministic mock testing
    from tests.conftest import TestSessionLocal
    doc_id = uuid.uuid4()
    chunk_id = uuid.uuid4()

    async with TestSessionLocal() as session:
        doc = Document(
            id=doc_id,
            user_id=user_id,
            title="Cell Biology Textbook - Chapter 3",
            original_filename="cell_biology_ch3.pdf",
            storage_key="docs/cell_biology_ch3.pdf",
            file_size_bytes=1048576,
            page_count=12,
            status="ready",
            uploaded_at=datetime.now(timezone.utc),
        )
        session.add(doc)

        chunk = DocumentChunk(
            id=chunk_id,
            document_id=doc_id,
            user_id=user_id,
            chunk_index=0,
            content="Mitochondria are membrane-bound cell organelles that generate most of the chemical energy needed to power the cell's biochemical reactions. Chemical energy produced by the mitochondria is stored in a small molecule called adenosine triphosphate (ATP). Cellular respiration takes place primarily within the inner mitochondrial membrane.",
            page_start=14,
            page_end=15,
            embedding=[0.1, 0.2, 0.3],
        )
        session.add(chunk)
        await session.commit()

    # 2. Test AI Tutor Chat
    chat_resp = await client.post(
        "/api/v1/chat/ask",
        headers=headers,
        json={
            "document_ids": [str(doc_id)],
            "question": "What is the primary function of mitochondria and where is ATP generated?",
        }
    )
    assert chat_resp.status_code == 200
    chat_data = chat_resp.json()
    assert "answer" in chat_data
    assert len(chat_data["citations"]) > 0
    assert chat_data["citations"][0]["page_start"] == 14

    # 3. Test Learning Studio - Summary Generation
    summary_resp = await client.post(
        "/api/v1/summaries",
        headers=headers,
        json={
            "document_id": str(doc_id),
            "summary_type": "detailed",
        }
    )
    assert summary_resp.status_code == 201
    summary_data = summary_resp.json()
    assert summary_data["document_id"] == str(doc_id)
    assert "content" in summary_data

    # 4. Test Learning Studio - Quiz Generation & Server-Authoritative Submission
    quiz_gen_resp = await client.post(
        "/api/v1/quizzes/generate",
        headers=headers,
        json={
            "document_id": str(doc_id),
            "question_count": 3,
            "difficulty": "medium",
        }
    )
    assert quiz_gen_resp.status_code == 201
    quiz_data = quiz_gen_resp.json()
    assert len(quiz_data["questions"]) >= 1
    # Verify answers and explanations are hidden prior to submission
    for q in quiz_data["questions"]:
        assert "correct_answer" not in q or q.get("correct_answer") is None
        assert "explanation" not in q or q.get("explanation") is None

    # Submit Quiz
    first_q = quiz_data["questions"][0]
    first_opt = first_q["options"][0]["id"] if isinstance(first_q["options"], list) else list(first_q["options"].keys())[0]

    submit_resp = await client.post(
        f"/api/v1/quizzes/{quiz_data['id']}/submit",
        headers=headers,
        json={
            "answers": [
                {"question_id": first_q["id"], "answer": first_opt}
            ]
        }
    )
    assert submit_resp.status_code == 200
    attempt_data = submit_resp.json()
    assert "percentage" in attempt_data
    assert "results" in attempt_data
    assert attempt_data["results"][0]["correct_answer"] is not None
    assert attempt_data["results"][0]["explanation"] is not None

    # 5. Test Learning Studio - Flashcards
    fc_gen_resp = await client.post(
        "/api/v1/flashcard-sets/generate",
        headers=headers,
        json={
            "document_id": str(doc_id),
            "card_count": 5,
        }
    )
    assert fc_gen_resp.status_code == 201
    fc_data = fc_gen_resp.json()
    assert len(fc_data["cards"]) >= 1

    first_card = fc_data["cards"][0]
    review_resp = await client.post(
        f"/api/v1/flashcards/{first_card['id']}/review",
        headers=headers,
        json={"rating": "good"}
    )
    assert review_resp.status_code == 200

    # 6. Test Study Planner
    plan_resp = await client.post(
        "/api/v1/study-plans",
        headers=headers,
        json={
            "title": "Cell Biology Mastery",
            "document_ids": [str(doc_id)],
            "target_date": "2026-12-15",
            "daily_goal_minutes": 45,
        }
    )
    assert plan_resp.status_code == 201
    plan_data = plan_resp.json()
    assert len(plan_data["tasks"]) > 0

    first_task = plan_data["tasks"][0]
    task_resp = await client.patch(
        f"/api/v1/study-plans/{plan_data['id']}/tasks/{first_task['id']}",
        headers=headers,
        json={"status": "completed"}
    )
    assert task_resp.status_code == 200
    assert task_resp.json()["status"] == "completed"

    # 7. Test Analytics Dashboard (Must reflect persisted activity!)
    analytics_resp = await client.get("/api/v1/analytics/dashboard", headers=headers)
    assert analytics_resp.status_code == 200
    analytics_data = analytics_resp.json()
    assert analytics_data["metrics"]["total_documents"] >= 1
    assert analytics_data["metrics"]["quizzes_completed"] >= 1
    assert analytics_data["metrics"]["flashcards_reviewed"] >= 1
    assert analytics_data["metrics"]["study_tasks_completed"] >= 1
