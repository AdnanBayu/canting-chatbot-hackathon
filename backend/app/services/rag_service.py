"""
RAG Service — embedding generation and semantic search via Milvus.
Model and params are configurable via settings.
"""
from google import genai
from app.core.config import settings
from app.db.vector_store import get_milvus_client, COLLECTION_NAME
from app.core.logger import logger


class RAGService:
    def __init__(self):
        self.embed_model = settings.GEMINI_MODEL_EMBEDDING
        self.top_k = settings.RAG_TOP_K
        self.client = None
        if settings.GEMINI_API_KEY:
            try:
                self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
                logger.info(f"RAG Service initialized with embedding model: {self.embed_model}")
            except Exception as e:
                logger.error(f"Failed to initialize RAG Service: {e}")

    def _get_embedding(self, text: str) -> list[float]:
        """Generate embedding using Gemini Embedding model."""
        if not self.client:
            logger.warning("Gemini client not initialized, skipping embedding.")
            return []

        try:
            response = self.client.models.embed_content(
                model=self.embed_model,
                contents=text,
            )
            return response.embeddings[0].values
        except Exception as e:
            logger.error(f"Error generating embedding via Gemini: {e}")
            return []

    def search_knowledge(self, query: str, top_k: int = None) -> str:
        """Searches vector db for relevant product knowledge based on query."""
        if query == "*":
            query = ""
        
        if not self.client or not query.strip():
            return ""

        k = top_k or self.top_k
        vector = self._get_embedding(query)
        if not vector:
            return ""

        try:
            client = get_milvus_client()

            search_params = {
                "metric_type": "L2",
                "params": {"nprobe": 10},
            }

            results = client.search(
                collection_name=COLLECTION_NAME,
                data=[vector],
                limit=k,
                output_fields=["text"],
                search_params=search_params,
            )

            context_pieces = []
            for hit in results[0]:
                context_pieces.append(hit.get("entity", {}).get("text", ""))

            return "\n".join(context_pieces)
        except Exception as e:
            logger.error(f"Error searching vector db: {e}")
            return ""


rag_service = RAGService()
