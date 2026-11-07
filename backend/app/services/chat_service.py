import logging
import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.providers.gemini import GeminiAIProvider
from app.core.exceptions import NotFoundException, ValidationException
from app.models.conversation import (
    Conversation,
    ConversationDocument,
    Message,
    MessageSource,
)
from app.models.document import Document, DocumentStatus
from app.models.learning_activity import LearningActivity
from app.models.user import User
from app.rag.citation import build_citations_from_retrieved, build_grounded_rag_prompt
from app.rag.retrieval import retrieve_relevant_chunks
from app.schemas.chat import ChatAskRequest, ChatAskResponse, CitationRead

logger = logging.getLogger(__name__)
ai_provider = GeminiAIProvider()


class ChatService:
    async def ask_question(
        self,
        db: AsyncSession,
        user: User,
        request: ChatAskRequest,
    ) -> ChatAskResponse:
        # 1. Validate documents ownership and readiness
        stmt = select(Document).where(
            Document.id.in_(request.document_ids),
            Document.user_id == user.id,
        )
        docs = list((await db.execute(stmt)).scalars().all())
        if len(docs) != len(request.document_ids):
            raise ValidationException("One or more selected documents are invalid or unauthorized.")

        unready_docs = [d.title for d in docs if d.status != DocumentStatus.READY.value]
        if unready_docs:
            raise ValidationException(
                f"Documents must be in 'ready' status to chat with AI: {', '.join(unready_docs)}"
            )

        # 2. Get or create conversation
        if request.conversation_id:
            conv_stmt = select(Conversation).where(
                Conversation.id == request.conversation_id,
                Conversation.user_id == user.id,
            )
            conversation = (await db.execute(conv_stmt)).scalar_one_or_none()
            if not conversation:
                raise NotFoundException("Conversation", str(request.conversation_id))
        else:
            conversation = Conversation(
                user_id=user.id,
                title=request.question[:60] + "..." if len(request.question) > 60 else request.question,
                status="active",
            )
            db.add(conversation)
            await db.flush()

            # Associate documents with conversation
            for doc_id in request.document_ids:
                conv_doc = ConversationDocument(
                    conversation_id=conversation.id,
                    document_id=doc_id,
                    user_id=user.id,
                )
                db.add(conv_doc)

        # 3. Store Student Message
        student_msg = Message(
            conversation_id=conversation.id,
            user_id=user.id,
            role="user",
            content=request.question,
            status="completed",
        )
        db.add(student_msg)
        await db.flush()

        # 4. Generate query embedding and retrieve relevant chunks
        query_vector = await ai_provider.generate_embedding(request.question)
        retrieved_chunks = await retrieve_relevant_chunks(
            db=db,
            user_id=user.id,
            document_ids=request.document_ids,
            query_vector=query_vector,
            top_k=5,
        )

        # 5. Check if context is sufficient
        min_relevance_threshold = 0.25
        usable_chunks = [c for c in retrieved_chunks if c.score >= min_relevance_threshold]

        if not usable_chunks:
            answer_text = (
                "The selected study materials do not contain enough relevant information to answer this question. "
                "Please verify that the question relates to the uploaded document or select another document."
            )
            insufficient_context = True
            citations: List[CitationRead] = []
        else:
            # Load recent conversation history
            hist_stmt = (
                select(Message)
                .where(Message.conversation_id == conversation.id)
                .order_by(Message.created_at.desc())
                .limit(6)
            )
            hist_msgs = list((await db.execute(hist_stmt)).scalars().all())
            hist_msgs.reverse()
            history_dicts = [{"role": m.role, "content": m.content} for m in hist_msgs]

            sys_prompt, user_prompt = build_grounded_rag_prompt(
                question=request.question,
                retrieved_chunks=usable_chunks,
                conversation_history=history_dicts,
            )

            answer_text = await ai_provider.generate_text(
                prompt=user_prompt,
                system_instruction=sys_prompt,
                temperature=0.3,
            )
            insufficient_context = False
            citations = build_citations_from_retrieved(usable_chunks)

        # 6. Store Assistant Message
        assistant_msg = Message(
            conversation_id=conversation.id,
            user_id=user.id,
            role="assistant",
            content=answer_text,
            status="completed",
        )
        db.add(assistant_msg)
        await db.flush()

        # 7. Store Message Sources
        for citation in citations:
            source_rec = MessageSource(
                message_id=assistant_msg.id,
                chunk_id=citation.chunk_id,
                document_id=citation.document_id,
                page_start=citation.page_start,
                page_end=citation.page_end,
                relevance_score=citation.relevance_score,
                citation_order=citation.citation_order,
            )
            db.add(source_rec)

        # 8. Record Learning Activity
        activity = LearningActivity(
            user_id=user.id,
            activity_type="question_asked",
            document_id=request.document_ids[0] if request.document_ids else None,
            activity_metadata={"question": request.question[:100]},
        )
        db.add(activity)

        await db.commit()

        return ChatAskResponse(
            message_id=assistant_msg.id,
            conversation_id=conversation.id,
            answer=answer_text,
            citations=citations,
            insufficient_context=insufficient_context,
        )


chat_service = ChatService()

