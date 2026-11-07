import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy import select
from app.models.quiz import Quiz, QuizQuestion
from app.models.flashcard import Flashcard, FlashcardSet, FlashcardReview
from tests.conftest import TestSessionLocal

@pytest.mark.asyncio
async def test_quiz_authoritative_grading(client: AsyncClient):
    """
    Verifies server-authoritative deterministic grading:
    Answers are verified on server, explanations returned, score is mathematically exact.
    """
    headers = {"Authorization": "Bearer dev_user_evaluator"}
    me_resp = await client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    user_id = uuid.UUID(me_resp.json()["id"])

    # Setup a 2-question quiz directly in DB
    quiz_id = uuid.uuid4()
    q1_id = uuid.uuid4()
    q2_id = uuid.uuid4()

    async with TestSessionLocal() as session:
        quiz = Quiz(
            id=quiz_id,
            user_id=user_id,
            title="Biochemistry Quick Check",
            difficulty="medium",
            question_count=2,
            status="published",
            quiz_settings={},
        )
        session.add(quiz)

        q1 = QuizQuestion(
            id=q1_id,
            quiz_id=quiz_id,
            question_text="What is the net ATP yield of glycolysis?",
            question_type="multiple_choice",
            options=[
                {"id": "A", "text": "2 ATP"},
                {"id": "B", "text": "4 ATP"},
                {"id": "C", "text": "36 ATP"},
                {"id": "D", "text": "0 ATP"},
            ],
            correct_answer="A",
            explanation="Glycolysis yields a net gain of 2 ATP per glucose molecule.",
            order_index=0,
            topic="Glycolysis",
        )
        q2 = QuizQuestion(
            id=q2_id,
            quiz_id=quiz_id,
            question_text="Which enzyme catalyzes the rate-limiting step of glycolysis?",
            question_type="multiple_choice",
            options=[
                {"id": "A", "text": "Hexokinase"},
                {"id": "B", "text": "Phosphofructokinase-1 (PFK-1)"},
                {"id": "C", "text": "Pyruvate kinase"},
                {"id": "D", "text": "Aldolase"},
            ],
            correct_answer="B",
            explanation="PFK-1 catalyzes the principal committed and rate-limiting step.",
            order_index=1,
            topic="Enzyme Kinetics",
        )
        session.add(q1)
        session.add(q2)
        await session.commit()

    # 1. Fetch student view (ensure correct_answer and explanation are withheld)
    get_resp = await client.get(f"/api/v1/quizzes/{quiz_id}", headers=headers)
    assert get_resp.status_code == 200
    student_quiz = get_resp.json()
    assert len(student_quiz["questions"]) == 2
    for q in student_quiz["questions"]:
        assert "correct_answer" not in q or q.get("correct_answer") is None
        assert "explanation" not in q or q.get("explanation") is None

    # 2. Submit: 1 correct ("A"), 1 incorrect ("C") -> Expect exactly 50%
    sub_resp = await client.post(
        f"/api/v1/quizzes/{quiz_id}/submit",
        headers=headers,
        json={
            "answers": [
                {"question_id": str(q1_id), "answer": "A"},
                {"question_id": str(q2_id), "answer": "C"},
            ]
        },
    )
    assert sub_resp.status_code == 200
    res = sub_resp.json()
    assert res["score"] == 1.0
    assert res["total_points"] == 2.0
    assert res["percentage"] == 50.0

    # Ensure results contain the correct answers and explanations now
    results = {r["question_id"]: r for r in res["results"]}
    assert results[str(q1_id)]["is_correct"] is True
    assert results[str(q1_id)]["correct_answer"] == "A"
    assert "Glycolysis yields" in results[str(q1_id)]["explanation"]

    assert results[str(q2_id)]["is_correct"] is False
    assert results[str(q2_id)]["correct_answer"] == "B"
    assert results[str(q2_id)]["submitted_answer"] == "C"

@pytest.mark.asyncio
async def test_flashcard_review_lifecycle(client: AsyncClient):
    """
    Verifies that rating a card records reviews and persists review history.
    """
    headers = {"Authorization": "Bearer dev_user_recall"}
    me_resp = await client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    user_id = uuid.UUID(me_resp.json()["id"])

    set_id = uuid.uuid4()
    card_id = uuid.uuid4()

    async with TestSessionLocal() as session:
        fset = FlashcardSet(
            id=set_id,
            user_id=user_id,
            title="Genetics Terminology",
            card_count=1,
        )
        session.add(fset)
        card = Flashcard(
            id=card_id,
            set_id=set_id,
            user_id=user_id,
            front_content="What is an allele?",
            back_content="An alternative form of a gene at a specific locus.",
            order_index=0,
        )
        session.add(card)
        await session.commit()

    # Rate card "easy"
    rev_resp = await client.post(
        f"/api/v1/flashcards/{card_id}/review",
        headers=headers,
        json={"rating": "easy"},
    )
    assert rev_resp.status_code == 200
    assert rev_resp.json()["status"] == "success"

    # Fetch set and inspect cards
    set_resp = await client.get(f"/api/v1/flashcard-sets/{set_id}", headers=headers)
    assert set_resp.status_code == 200
    card_data = set_resp.json()["cards"][0]
    assert card_data["front_content"] == "What is an allele?"

    # Verify review was stored in DB
    async with TestSessionLocal() as session:
        rev_stmt = select(FlashcardReview).where(FlashcardReview.flashcard_id == card_id)
        reviews = list((await session.execute(rev_stmt)).scalars().all())
        assert len(reviews) == 1
        assert reviews[0].rating == "easy"
