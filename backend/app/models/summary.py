import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any, Dict, List, Optional
from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin, utc_now

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.document import Document
    from app.models.chunk import DocumentChunk


class Summary(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "summaries"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary_type: Mapped[str] = mapped_column(String(40), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    key_takeaways: Mapped[List[Any]] = mapped_column(JSONB, default=list, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="completed", nullable=False)
    model_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="summaries")
    document: Mapped["Document"] = relationship("Document", back_populates="summaries")
    sources: Mapped[List["SummarySource"]] = relationship(
        "SummarySource", back_populates="summary", cascade="all, delete-orphan"
    )


class SummarySource(Base, UUIDMixin):
    __tablename__ = "summary_sources"

    summary_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("summaries.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    chunk_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("document_chunks.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )

    # Relationships
    summary: Mapped["Summary"] = relationship("Summary", back_populates="sources")

