import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class DocumentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    subject_id: Optional[uuid.UUID] = None


class DocumentRead(DocumentBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    original_filename: str
    storage_key: str
    mime_type: str
    file_size_bytes: int
    page_count: Optional[int] = None
    status: str
    processing_error: Optional[str] = None
    uploaded_at: datetime
    processed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class DocumentStatusRead(BaseModel):
    id: uuid.UUID
    status: str
    page_count: Optional[int] = None
    processing_error: Optional[str] = None
    processed_at: Optional[datetime] = None


class DocumentListResponse(BaseModel):
    items: List[DocumentRead]
    total: int
    page: int
    page_size: int

