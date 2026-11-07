import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class CitationRead(BaseModel):
    document_id: uuid.UUID
    document_title: Optional[str] = None
    chunk_id: uuid.UUID
    page_start: Optional[int] = None
    page_end: Optional[int] = None
    excerpt: Optional[str] = None
    relevance_score: Optional[float] = None
    citation_order: int = 1


class ChatAskRequest(BaseModel):
    conversation_id: Optional[uuid.UUID] = None
    document_ids: List[uuid.UUID] = Field(..., min_length=1)
    question: str = Field(..., min_length=1, max_length=4000)


class ChatAskResponse(BaseModel):
    message_id: uuid.UUID
    conversation_id: uuid.UUID
    answer: str
    citations: List[CitationRead] = []
    insufficient_context: bool = False


class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    conversation_id: uuid.UUID
    role: str
    content: str
    status: str
    created_at: datetime
    citations: List[CitationRead] = []


class ConversationCreate(BaseModel):
    title: Optional[str] = None
    document_ids: List[uuid.UUID] = Field(default_factory=list)


class ConversationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    title: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    document_ids: List[uuid.UUID] = []

