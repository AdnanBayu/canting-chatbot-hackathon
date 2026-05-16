"""
Vision Agent — specialized Gemini multimodal agent for:
1. Payment proof verification (extract amount, bank, validate)
2. Product defect analysis (damage assessment, refund recommendation)

Uses Pydantic response_schema for validated structured output.
"""
from google import genai
from google.genai import types
from app.core.config import settings
from app.core.logger import logger
from app.models.schemas import PaymentVerificationResult, DefectAnalysisResult


PAYMENT_VERIFICATION_PROMPT = """You are a payment verification agent for an E-commerce platform.
Analyze the provided payment proof image and extract:
1. Whether the payment appears legitimate and valid
2. The payment amount shown
3. The bank or payment method used (e.g., BCA, BNI, Mandiri, GoPay, OVO, DANA)
4. Your confidence in the verification"""


DEFECT_ANALYSIS_PROMPT = """You are a product quality inspection agent for an E-commerce platform.
Analyze the provided product image for defects or damage and determine:
1. Whether the product appears defective
2. The type of defect (e.g., torn, scratched, broken, stained, miscolored, wrong item)
3. Severity: "minor" (cosmetic only), "moderate" (affects usability), "severe" (unusable/broken)
4. Your recommendation: "approve_refund", "reject_claim", or "escalate_to_human"
5. A detailed summary of your analysis"""


class VisionAgent:
    """Specialized vision agent for payment verification and defect analysis."""

    def __init__(self):
        self.model_name = settings.GEMINI_MODEL_VISION
        self.client = None
        if settings.GEMINI_API_KEY:
            try:
                self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
                logger.info(f"Vision Agent initialized with model: {self.model_name}")
            except Exception as e:
                logger.error(f"Failed to initialize Vision Agent: {e}")

    async def verify_payment(
        self, image_data: bytes, order_amount: float = None
    ) -> PaymentVerificationResult:
        """Analyze a payment proof image and return Pydantic-validated result."""
        if not self.client:
            return PaymentVerificationResult(
                is_valid=False,
                confidence_score=0.0,
                notes="Vision agent not initialized.",
            )

        extra_context = ""
        if order_amount:
            extra_context = f"\n\nExpected payment amount: Rp {order_amount:,.0f}. Verify if the amount matches."

        contents = [
            types.Part.from_bytes(data=image_data, mime_type="image/jpeg"),
            f"{PAYMENT_VERIFICATION_PROMPT}{extra_context}",
        ]

        try:
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=PaymentVerificationResult,
                ),
            )

            result: PaymentVerificationResult = response.parsed
            return result

        except Exception as e:
            logger.error(f"Payment verification error: {e}")
            return PaymentVerificationResult(
                is_valid=False,
                confidence_score=0.0,
                notes=f"Error during verification: {str(e)}",
            )

    async def analyze_defect(
        self, image_data: bytes, product_name: str = None
    ) -> DefectAnalysisResult:
        """Analyze a product image for defects and return Pydantic-validated result."""
        if not self.client:
            return DefectAnalysisResult(
                is_defective=False,
                confidence_score=0.0,
                recommendation="escalate_to_human",
                analysis_summary="Vision agent not initialized.",
            )

        extra_context = ""
        if product_name:
            extra_context = f"\n\nProduct name: {product_name}"

        contents = [
            types.Part.from_bytes(data=image_data, mime_type="image/jpeg"),
            f"{DEFECT_ANALYSIS_PROMPT}{extra_context}",
        ]

        try:
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=DefectAnalysisResult,
                ),
            )

            result: DefectAnalysisResult = response.parsed
            return result

        except Exception as e:
            logger.error(f"Defect analysis error: {e}")
            return DefectAnalysisResult(
                is_defective=False,
                confidence_score=0.0,
                recommendation="escalate_to_human",
                analysis_summary=f"Error during analysis: {str(e)}",
            )


vision_agent = VisionAgent()
