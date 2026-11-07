import uuid
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.document import DocumentListResponse, DocumentRead, DocumentStatusRead
from app.services.document_service import document_service

router = APIRouter()


@router.post("", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    subject_id: Optional[uuid.UUID] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentRead:
    doc = await document_service.upload_document(
        db=db,
        user=current_user,
        file=file,
        title=title,
        subject_id=subject_id,
    )
    return DocumentRead.model_validate(doc)


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    subject_id: Optional[uuid.UUID] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentListResponse:
    docs, total = await document_service.get_user_documents(
        db=db,
        user_id=current_user.id,
        subject_id=subject_id,
        status=status,
        search=search,
        page=page,
        page_size=limit,
    )
    return DocumentListResponse(
        items=[DocumentRead.model_validate(d) for d in docs],
        total=total,
        page=page,
        page_size=limit,
    )


@router.get("/{document_id}", response_model=DocumentRead)
async def get_document(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentRead:
    doc = await document_service.get_document_by_id(db, current_user.id, document_id)
    return DocumentRead.model_validate(doc)


@router.get("/{document_id}/status", response_model=DocumentStatusRead)
async def get_document_status(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentStatusRead:
    doc = await document_service.get_document_by_id(db, current_user.id, document_id)
    return DocumentStatusRead(
        id=doc.id,
        status=doc.status,
        page_count=doc.page_count,
        processing_error=doc.processing_error,
        processed_at=doc.processed_at,
    )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await document_service.delete_document(db, current_user.id, document_id)

