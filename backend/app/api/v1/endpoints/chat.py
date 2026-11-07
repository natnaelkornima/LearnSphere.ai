import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.models.conversation import Conversation, ConversationDocument, Message, MessageSource
from app.models.document import Document
from app.models.user import User
from app.schemas.chat import (
    ChatAskRequest,
    ChatAskResponse,
    CitationRead,
    ConversationRead,
    MessageRead,
)
from app.services.chat_service import chat_service

router = APIRouter()


@router.post("/ask", response_model=ChatAskResponse)
async def ask_ai_tutor(
    request: ChatAskRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChatAskResponse:
    return await chat_service.ask_question(db, current_user, request)


@router.get("/conversations", response_model=List[ConversationRead])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[ConversationRead]:
    stmt = (
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
    )
    convs = list((await db.execute(stmt)).scalars().all())

    result = []
    for c in convs:
        doc_stmt = select(ConversationDocument.document_id).where(
            ConversationDocument.conversation_id == c.id
        )
        doc_ids = list((await db.execute(doc_stmt)).scalars().all())
        c_read = ConversationRead.model_validate(c)
        c_read.document_ids = doc_ids
        result.append(c_read)

    return result


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageRead])
async def get_conversation_messages(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[MessageRead]:
    # Check conversation ownership
    c_stmt = select(Conversation).where(
        Conversation.id == conversation_id, Conversation.user_id == current_user.id
    )
    conv = (await db.execute(c_stmt)).scalar_one_or_none()
    if not conv:
        raise NotFoundException("Conversation", str(conversation_id))

    m_stmt = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )
    messages = list((await db.execute(m_stmt)).scalars().all())

    response: List[MessageRead] = []
    for msg in messages:
        # Load sources for assistant messages
        citations: List[CitationRead] = []
        if msg.role == "assistant":
            s_stmt = (
                select(MessageSource, Document.title)
                .join(Document, MessageSource.document_id == Document.id)
                .where(MessageSource.message_id == msg.id)
                .order_by(MessageSource.citation_order.asc())
            )
            s_rows = (await db.execute(s_stmt)).all()
            for source, doc_title in s_rows:
                citations.append(
                    CitationRead(
                        document_id=source.document_id,
                        document_title=doc_title,
                        chunk_id=source.chunk_id,
                        page_start=source.page_start,
                        page_end=source.page_end,
                        relevance_score=source.relevance_score,
                        citation_order=source.citation_order,
                    )
                )

        m_read = MessageRead.model_validate(msg)
        m_read.citations = citations
        response.append(m_read)

    return response

