"""
LLM Service — Gemini structured output using Pydantic response_schema.
Uses response.parsed to get validated Pydantic objects directly.
"""
import typing
from google import genai
from google.genai import types
from app.core.logger import logger
from app.core.config import settings
from app.models.schemas import AgentDecision


class GeminiService:
    """Gemini LLM service with Pydantic-validated structured output."""

    def __init__(self):
        self.model_name = settings.GEMINI_MODEL_AGENT
        self.client = None
        if settings.GEMINI_API_KEY:
            try:
                self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
                logger.info(f"Gemini LLM initialized with model: {self.model_name}")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini client: {e}")

    async def get_agent_decision(
        self,
        system_prompt: str,
        user_message: str,
        image_data: typing.Optional[bytes] = None,
        chat_history: list = None,
    ) -> AgentDecision:
        if not self.client:
            logger.warning("Gemini client not initialized.")
            return AgentDecision(
                reply_message="Error: Gemini not configured.",
                action_type="chat",
                confidence_score=0.0,
            )

        contents = []
        if image_data:
            contents.append(types.Part.from_bytes(data=image_data, mime_type="image/jpeg"))
        history_text = ""
        if chat_history:
            history_text = "Recent Conversation History:\n" + "\n".join(
                [f"{msg['role'].capitalize()}: {msg['content']}" for msg in chat_history]
            ) + "\n\n"

        contents.append(f"System: {system_prompt}\n\n{history_text}Current User Message: {user_message}")

        try:
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=AgentDecision,
                ),
            )

            # Pydantic-parsed output — no manual JSON parsing needed
            decision: AgentDecision = response.parsed
            return decision

        except Exception as e:
            logger.error(f"Error calling Gemini: {e}")
            return AgentDecision(
                reply_message="Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.",
                action_type="chat",
                confidence_score=0.0,
            )


llm_service = GeminiService()
