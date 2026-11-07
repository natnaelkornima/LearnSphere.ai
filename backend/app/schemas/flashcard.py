import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class FlashcardGenerateRequest(BaseModel):
    document_id: uuid.UUID
    topic: Optional[str] = None
    card_count: int = Field(default=10, ge=3, le=50)


class FlashcardRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    set_id: uuid.UUID
    front_content: str
    back_content: str
    order_index: int
    created_at: datetime


class FlashcardSetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    document_id: Optional[uuid.UUID]
    title: str
    description: Optional[str]
    card_count: int
    created_at: datetime
    updated_at: datetime
    cards: List[FlashcardRead] = []


class FlashcardReviewRequest(BaseModel):
    rating: str = Field(..., pattern="^(again|difficult|good|easy)$")

