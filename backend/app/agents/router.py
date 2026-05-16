"""
Intent Router Agent — classifies incoming user messages into structured intents
using Gemini Pydantic structured output.
"""
from google import genai
from google.genai import types
from app.core.config import settings
from app.core.logger import logger
from app.models.schemas import IntentClassification


ROUTER_SYSTEM_PROMPT = """You are an intent classification engine for an E-commerce WhatsApp chatbot.
Given a user message (text or description of an image), classify the intent into ONE of these categories:

- "inventory_update": The SELLER wants to update product stock (add/remove quantities, new variants).
- "product_inquiry": The BUYER is asking about products, prices, availability, or seeking recommendations.
- "order_creation": The BUYER wants to place a NEW order or add items to a cart.
- "order_status": The user is asking about order status. For BUYERS: checking their own order status, tracking, or delivery. For OWNERS/ADMINS: checking all orders, unfinished orders, pending payments, or order details. Keywords: "status pesanan", "pesanan saya", "cek pesanan", "order belum selesai", "cek order", "check orders", "pending orders".
- "payment_upload": The BUYER is sending a payment proof image or mentioning they've paid.
- "complaint_upload": The BUYER is sending a defect image or filing a complaint about a product.
- "dashboard_request": The SELLER/OWNER is asking for sales reports, analytics, or dashboard data.
- "general_chat": Greetings, thank you messages, or anything that doesn't fit the above categories.

Also extract any relevant entities such as product names, sizes, quantities, order IDs, etc."""


class IntentRouter:
    """Routes incoming messages to the correct agent by classifying intent."""

    def __init__(self):
        self.model_name = settings.GEMINI_MODEL_ROUTER
        self.client = None
        if settings.GEMINI_API_KEY:
            try:
                self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
                logger.info(f"Intent Router initialized with model: {self.model_name}")
            except Exception as e:
                logger.error(f"Failed to initialize Intent Router: {e}")

    async def classify(
        self, message: str, user_role: str = "buyer", has_image: bool = False, chat_history: list = None
    ) -> IntentClassification:
        """Classify a user message into a structured intent using Pydantic schema."""
        if not self.client:
            logger.warning("Gemini client not initialized for intent routing.")
            return IntentClassification(intent="general_chat", confidence=0.0)

        history_text = ""
        if chat_history:
            history_text = "\n\nRecent Conversation History:\n" + "\n".join(
                [f"{msg['role'].capitalize()}: {msg['content']}" for msg in chat_history]
            )

        context = f"{history_text}\n\nUser role: {user_role}\nHas image attachment: {has_image}\n\nCurrent User message: {message}"

        try:
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=[f"{ROUTER_SYSTEM_PROMPT}\n\n{context}"],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=IntentClassification,
                    max_output_tokens=150,
                ),
            )

            result: IntentClassification = response.parsed
            return result

        except Exception as e:
            logger.error(f"Intent classification error: {e}")
            return IntentClassification(intent="general_chat", confidence=0.0)


intent_router = IntentRouter()
