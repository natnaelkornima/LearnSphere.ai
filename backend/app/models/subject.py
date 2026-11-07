import uuid
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.document import Document
    from app.models.quiz import Quiz
    from app.models.flashcard import FlashcardSet
    from app.models.study_plan import StudyPlan


class Subject(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "subjects"
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_subjects_user_name"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    color: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    icon: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="subjects")
    documents: Mapped[List["Document"]] = relationship("Document", back_populates="subject")
    quizzes: Mapped[List["Quiz"]] = relationship("Quiz", back_populates="subject")
    flashcard_sets: Mapped[List["FlashcardSet"]] = relationship("FlashcardSet", back_populates="subject")
    study_plans: Mapped[List["StudyPlan"]] = relationship("StudyPlan", back_populates="subject")

