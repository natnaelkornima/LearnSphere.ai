import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple
from fastapi import UploadFile
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.providers.gemini import GeminiAIProvider
from app.core.config import settings
from app.core.exceptions import NotFoundException, ValidationException
from app.models.chunk import DocumentChunk
from app.models.document import Document, DocumentProcessingJob, DocumentStatus, JobStatus
from app.models.learning_activity import LearningActivity
from app.models.user import User
from app.rag.chunking import chunk_extracted_pages
from app.rag.extraction import extract_text_from_pdf
from app.services.storage_service import storage_service

logger = logging.getLogger(__name__)
ai_provider = GeminiAIProvider()


class DocumentService:
    async def upload_document(
        self,
        db: AsyncSession,
        user: User,
        file: UploadFile,
        title: Optional[str] = None,
        subject_id: Optional[uuid.UUID] = None,
    ) -> Document:
        # File type validation
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise ValidationException("Only PDF files are supported.")

        content = await file.read()
        file_size = len(content)

        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if file_size > max_bytes:
            raise ValidationException(
                f"File size exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
            )
        if file_size == 0:
            raise ValidationException("Uploaded file is empty.")

        doc_title = title.strip() if title and title.strip() else file.filename.rsplit(".", 1)[0]
        doc_id = uuid.uuid4()
        now = datetime.now(timezone.utc)

        # 1. Save original PDF to private object storage
        storage_key = await storage_service.upload_file(user.id, doc_id, content)

        # 2. Create document record
        document = Document(
            id=doc_id,
            user_id=user.id,
            subject_id=subject_id,
            title=doc_title,
            original_filename=file.filename,
            storage_key=storage_key,
            mime_type=file.content_type or "application/pdf",
            file_size_bytes=file_size,
            status=DocumentStatus.UPLOADED.value,
            uploaded_at=now,
        )
        db.add(document)

        # 3. Create job record
        job = DocumentProcessingJob(
            document_id=doc_id,
            user_id=user.id,
            job_type="extract_and_index",
            status=JobStatus.PENDING.value,
            created_at=now,
        )
        db.add(job)

        # 4. Record learning activity
        activity = LearningActivity(
            user_id=user.id,
            activity_type="document_uploaded",
            document_id=doc_id,
            activity_metadata={"title": doc_title, "file_size": file_size},
        )
        db.add(activity)

        await db.commit()
        await db.refresh(document)

        # Trigger processing pipeline
        await self.process_document(db, document, content)
        return document

    async def process_document(
        self,
        db: AsyncSession,
        document: Document,
        pdf_bytes: Optional[bytes] = None,
    ) -> None:
        """
        Executes text extraction, chunking, and embedding generation.
        """
        try:
            if not pdf_bytes:
                pdf_bytes = await storage_service.read_file(document.storage_key)

            # Step 1: Extract Text
            document.status = DocumentStatus.EXTRACTING.value
            await db.commit()

            pages, total_pages = extract_text_from_pdf(pdf_bytes)
            document.page_count = total_pages

            # Step 2: Chunk Document
            document.status = DocumentStatus.CHUNKING.value
            await db.commit()

            chunks = chunk_extracted_pages(pages)
            if not chunks:
                raise ValidationException("Document yielded no searchable content chunks.")

            # Step 3: Generate Embeddings & Save Chunks
            document.status = DocumentStatus.EMBEDDING.value
            await db.commit()

            texts = [c.content for c in chunks]
            embeddings = await ai_provider.generate_embeddings_batch(texts)

            for chunk_item, emb in zip(chunks, embeddings):
                chunk_record = DocumentChunk(
                    document_id=document.id,
                    user_id=document.user_id,
                    chunk_index=chunk_item.chunk_index,
                    content=chunk_item.content,
                    page_start=chunk_item.page_start,
                    page_end=chunk_item.page_end,
                    token_count=chunk_item.token_count,
                    embedding=emb,
                )
                db.add(chunk_record)

            document.status = DocumentStatus.READY.value
            document.processed_at = datetime.now(timezone.utc)
            document.processing_error = None
            await db.commit()
            await db.refresh(document)
            logger.info(f"Document {document.id} successfully processed with {len(chunks)} chunks.")

        except Exception as e:
            logger.error(f"Processing failed for document {document.id}: {str(e)}")
            document.status = DocumentStatus.FAILED.value
            document.processing_error = str(e)
            await db.commit()

    async def get_user_documents(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        subject_id: Optional[uuid.UUID] = None,
        search: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Document], int]:
        query = select(Document).where(Document.user_id == user_id)

        if subject_id:
            query = query.where(Document.subject_id == subject_id)
        if status:
            query = query.where(Document.status == status)
        if search:
            query = query.where(Document.title.ilike(f"%{search}%"))

        count_stmt = select(func.count()).select_from(query.subquery())
        total = (await db.execute(count_stmt)).scalar() or 0

        offset = (page - 1) * page_size
        stmt = query.order_by(Document.created_at.desc()).offset(offset).limit(page_size)
        result = await db.execute(stmt)
        return list(result.scalars().all()), total

    async def get_document_by_id(
        self, db: AsyncSession, user_id: uuid.UUID, document_id: uuid.UUID
    ) -> Document:
        stmt = select(Document).where(Document.id == document_id, Document.user_id == user_id)
        doc = (await db.execute(stmt)).scalar_one_or_none()
        if not doc:
            raise NotFoundException("Document", str(document_id))
        return doc

    async def delete_document(
        self, db: AsyncSession, user_id: uuid.UUID, document_id: uuid.UUID
    ) -> None:
        doc = await self.get_document_by_id(db, user_id, document_id)
        await storage_service.delete_file(doc.storage_key)
        await db.delete(doc)
        await db.commit()


document_service = DocumentService()

