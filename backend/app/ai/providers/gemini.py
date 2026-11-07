import json
import logging
from typing import Any, List, Optional, Type
from google import genai
from google.genai import types
from pydantic import BaseModel
from app.ai.providers.base import BaseAIProvider
from app.core.config import settings
from app.core.exceptions import ExternalServiceException

logger = logging.getLogger(__name__)


class GeminiAIProvider(BaseAIProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = settings.GEMINI_MODEL
        self.embedding_model = settings.EMBEDDING_MODEL
        self._client: Optional[genai.Client] = None

    @property
    def client(self) -> genai.Client:
        if not self._client:
            if not self.api_key or self.api_key.startswith("dummy"):
                logger.warning("Gemini API key is not configured or is a dummy placeholder.")
            self._client = genai.Client(api_key=self.api_key)
        return self._client

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.3,
    ) -> str:
        if not self.api_key or self.api_key.startswith("dummy"):
            return (
                "LearnSphere AI Tutor is currently in offline demonstration mode. "
                "Please configure a valid GEMINI_API_KEY in backend/.env to enable live AI responses."
            )
        try:
            config = types.GenerateContentConfig(
                temperature=temperature,
                system_instruction=system_instruction,
            )
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=config,
            )
            return response.text or ""
        except Exception as e:
            logger.error(f"Gemini generate_text failed: {e}")
            raise ExternalServiceException("Gemini", str(e))

    async def generate_structured(
        self,
        prompt: str,
        response_model: Type[BaseModel],
        system_instruction: Optional[str] = None,
    ) -> BaseModel:
        if not self.api_key or self.api_key.startswith("dummy"):
            logger.warning("Mocking structured response because Gemini API key is not set.")
            model_name = response_model.__name__
            if "Summary" in model_name:
                mock_data = {
                    "title": "Comprehensive Summary: Core Concepts & Mechanisms",
                    "content": "### Overview\nEducational study summary highlighting fundamental principles.\n\n### Key Mechanisms\n- Primary structures and biological processes.\n- Energy transduction and metabolic pathways.",
                    "key_takeaways": [
                        "Energy conversion in cellular respiration",
                        "Key structural compartmentalization",
                        "Synthesis and regulation mechanisms",
                    ],
                }
            elif "Quiz" in model_name:
                mock_data = {
                    "title": "Practice Knowledge Assessment",
                    "questions": [
                        {
                            "question_text": "What is the primary function of mitochondria in eukaryotic cells?",
                            "options": [
                                {"id": "A", "text": "ATP chemical energy synthesis via respiration"},
                                {"id": "B", "text": "Direct lipid storage and membrane folding"},
                                {"id": "C", "text": "Polypeptide translation exclusively"},
                                {"id": "D", "text": "Genomic sequence replication only"},
                            ],
                            "correct_answer": "A",
                            "explanation": "Mitochondria generate the overwhelming majority of ATP required by cellular metabolism.",
                            "topic": "Cell Biology",
                        }
                    ],
                }
            elif "Flashcard" in model_name:
                mock_data = {
                    "title": "Active Recall Deck",
                    "cards": [
                        {
                            "front": "What organelle produces ATP through cellular respiration?",
                            "back": "The mitochondrion.",
                        },
                        {
                            "front": "Where does the electron transport chain reside?",
                            "back": "Across the inner mitochondrial membrane.",
                        },
                    ],
                }
            elif "Plan" in model_name:
                mock_data = {
                    "tasks": [
                        {
                            "title": "Core Foundations Review",
                            "description": "Read through primary syllabus notes and extract key definitions.",
                            "day_offset": 0,
                            "estimated_minutes": 30,
                            "priority": "high",
                        },
                        {
                            "title": "Practice Quiz & Knowledge Check",
                            "description": "Test concept mastery with practice quiz questions.",
                            "day_offset": 2,
                            "estimated_minutes": 25,
                            "priority": "medium",
                        },
                    ]
                }
            else:
                mock_data = {}
            return response_model.model_validate(mock_data)
        try:
            config = types.GenerateContentConfig(
                temperature=0.2,
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=response_model,
            )
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=config,
            )
            if not response.text:
                raise ExternalServiceException("Gemini", "Empty response received.")
            data = json.loads(response.text)
            return response_model.model_validate(data)
        except Exception as e:
            logger.error(f"Gemini generate_structured failed: {e}")
            raise ExternalServiceException("Gemini", str(e))

    async def generate_embedding(self, text: str) -> List[float]:
        if not self.api_key or self.api_key.startswith("dummy"):
            # Deterministic mock embedding of exact dimension
            import hashlib
            seed = int(hashlib.sha256(text.encode()).hexdigest(), 16)
            import random
            rng = random.Random(seed)
            return [rng.uniform(-0.1, 0.1) for _ in range(settings.EMBEDDING_DIMENSIONS)]
        try:
            result = self.client.models.embed_content(
                model=self.embedding_model,
                contents=text,
            )
            # Handle SDK response structure
            if hasattr(result, "embedding") and result.embedding:
                return result.embedding.values
            if hasattr(result, "embeddings") and result.embeddings:
                return result.embeddings[0].values
            raise ExternalServiceException("Gemini", "No embedding vector returned.")
        except Exception as e:
            logger.error(f"Gemini generate_embedding failed: {e}")
            raise ExternalServiceException("Gemini", str(e))

    async def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        # Batch embedding generation
        results = []
        for t in texts:
            emb = await self.generate_embedding(t)
            results.append(emb)
        return results

