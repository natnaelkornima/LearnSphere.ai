import uuid
from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SummaryGenerateRequest(BaseModel):
    document_id: uuid.UUID
    summary_type: str = Field(
        default="detailed",
        pattern="^(quick_overview|detailed|exam_revision|key_concepts|chapter_summary)$",
    )
    topic: Optional[str] = None


class SummaryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    document_id: uuid.UUID
    title: str
    summary_type: str
    content: str
    key_takeaways: List[Any] = []
    status: str
    created_at: datetime
    updated_at: datetime

