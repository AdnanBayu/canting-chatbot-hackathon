from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Literal, Any


class ExtractedData(BaseModel):
    """Specific fields to extract, avoiding generic Dict to satisfy Gemini schema."""
    product_name: Optional[str] = Field(default=None, description="Name of the product")
    size: Optional[str] = Field(default=None, description="Size of the product")
    qty: Optional[int] = Field(default=None, description="Quantity")
    quantity_change: Optional[int] = Field(default=None, description="Quantity change for inventory updates")
    reason: Optional[str] = Field(default=None, description="Reason for escalation or refund")
    amount: Optional[float] = Field(default=None, description="Payment amount")
    bank: Optional[str] = Field(default=None, description="Bank name")
    defect_type: Optional[str] = Field(default=None, description="Type of defect")
    notes: Optional[str] = Field(default=None, description="Additional notes")


# === Intent Router Schemas ===

class IntentClassification(BaseModel):
    """Structured output from the intent router agent."""
    intent: Literal[
        "inventory_update",
        "product_inquiry",
        "order_creation",
        "order_status",
        "payment_upload",
        "complaint_upload",
        "dashboard_request",
        "general_chat",
    ] = Field(description="Classified intent of the user's message.")
    confidence: float = Field(description="Confidence in the classification, 0.0 to 1.0.")
    extracted_entities: Optional[ExtractedData] = Field(
        default=None,
        description="Extracted entities such as product names, sizes, quantities, order IDs, etc."
    )


# === Agent Decision Schemas ===

class AgentDecision(BaseModel):
    """Decision produced by the agentic pipeline for a single user message."""
    reply_message: str = Field(description="The exact message to send to the buyer.")
    action_type: Literal[
        "chat",
        "check_stock",
        "update_stock",
        "create_order",
        "verify_payment",
        "analyze_defect",
        "process_refund",
        "escalate_to_owner",
        "upsell",
    ] = Field(description="The action the agent has decided to take.")
    confidence_score: float = Field(description="Agent's confidence in its decision, 0.0 to 1.0.")
    extracted_data: Optional[ExtractedData] = Field(
        default=None,
        description="Extracted context such as product IDs, tracking numbers, quantities, etc."
    )


# ── Auth Schemas ──
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

from pydantic import BaseModel, Field, model_validator

class UserLogin(BaseModel):
    identifier: Optional[str] = None
    username: Optional[str] = None
    phone_number: Optional[str] = None
    password: str

    @model_validator(mode="before")
    @classmethod
    def validate_identifier(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # If identifier is not provided, try to get it from username or phone_number
            if not data.get("identifier"):
                data["identifier"] = data.get("username") or data.get("phone_number")
            
            if not data.get("identifier"):
                raise ValueError("Login identifier (username or phone number) is required")
        return data

class UserRegister(BaseModel):
    phone_number: str
    username: str
    password: str
    name: Optional[str] = None
    # role: str = "buyer"

# ── Gemini / Agent Schemas ──===

class PaymentVerificationResult(BaseModel):
    """Output from the payment verification vision agent."""
    is_valid: bool = Field(description="Whether the payment proof appears valid.")
    detected_amount: Optional[float] = Field(default=None, description="Extracted payment amount.")
    detected_bank: Optional[str] = Field(default=None, description="Detected bank or payment method.")
    confidence_score: float = Field(description="Confidence in the verification, 0.0 to 1.0.")
    notes: str = Field(default="", description="Additional notes or reasoning.")


class DefectAnalysisResult(BaseModel):
    """Output from the defect analysis vision agent."""
    is_defective: bool = Field(description="Whether the product appears defective.")
    defect_type: Optional[str] = Field(default=None, description="Type of defect detected.")
    severity: Literal["minor", "moderate", "severe"] = Field(
        default="minor", description="Severity of the detected defect."
    )
    confidence_score: float = Field(description="Confidence in the analysis, 0.0 to 1.0.")
    recommendation: Literal["approve_refund", "reject_claim", "escalate_to_human"] = Field(
        description="Recommended action based on the analysis."
    )
    analysis_summary: str = Field(default="", description="Detailed summary of the defect analysis.")


# === Webhook Schemas (WAHA) ===

class WebhookMessagePayload(BaseModel):
    id: str
    from_: str = Field(alias="from")
    to: str
    participant: Optional[str] = None
    body: str
    hasMedia: bool
    type: str  # e.g. 'chat', 'image'
    timestamp: int


class WebhookPayload(BaseModel):
    event: str
    session: str
    payload: WebhookMessagePayload


# === Admin / Dashboard Schemas ===

class ProductCreate(BaseModel):
    sku: Optional[str] = None
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    price: float
    stock_variants: Dict[str, int] = Field(
        default_factory=dict,
        description="Stock per variant, e.g. {'M': 10, 'L': 5}"
    )
    images: List[str] = Field(
        default_factory=list,
        description="List of product image URLs"
    )


class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock_variants: Optional[Dict[str, int]] = None
    images: Optional[List[str]] = None


class OrderItemSchema(BaseModel):
    product_id: str
    size: Optional[str] = None
    qty: int
    price: float


class OrderCreate(BaseModel):
    buyer_phone: str
    items: List[OrderItemSchema]


class KnowledgeUpload(BaseModel):
    """For raw text knowledge ingestion into the vector DB."""
    title: str
    content: str


# ── v2 API Schemas ──

# Inventory
class StockInfo(BaseModel):
    quantity: int
    unit: str = "Units"
    status: str = "NORMAL"  # OPTIMAL, NORMAL, LOW, CRITICAL

class InventoryProduct(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    stock: StockInfo
    price: float

class InventorySummary(BaseModel):
    total_sku: Dict
    low_stock_items: int
    estimated_warehouse_value: float

class PaginationMeta(BaseModel):
    total_items: int
    current_page: int
    total_pages: int

# Complaints
class ComplaintSummary(BaseModel):
    pending_tickets: int
    resolved_today: int
    average_response_time_hours: float
    refund_rate_percentage: float

class ActiveRequest(BaseModel):
    request_id: str
    order_id: str
    requested_at: str
    issue_type: str
    product_name: str
    customer_message: str

class ComplaintAction(BaseModel):
    action: Literal["APPROVE", "REJECT"]
    notes: Optional[str] = None

class ChatLog(BaseModel):
    phone_number: str
    timestamp: str
    message_snippet: str
    tags: List[str]

# Orders
class OrderSummary(BaseModel):
    awaiting_approval: int
    processing_today: int
    completed_24h: int

class OrderStatusUpdate(BaseModel):
    status: str  # UNPAID, PAID, PROCESSING, SHIPPED, COMPLETED

# Reports
class ReportGenerateRequest(BaseModel):
    report_type: Literal["SALES", "REFUNDS", "COMPLAINTS", "RECEIPTS"]
    start_date: str
    end_date: str
    format: Literal["PDF", "XLSX"] = "PDF"

class ReportGenerateResponse(BaseModel):
    status: str
    job_id: str

class ReportHistory(BaseModel):
    report_id: str
    name: str
    generation_type: str
    created_at: str
    period: str
    format: str
    download_url: str

# Shipping
class ShippingSummary(BaseModel):
    ready_to_ship: int
    in_transit: int
    delivered_today: int
    failed_delivery: int

class GenerateLabelRequest(BaseModel):
    order_id: str
    courier: str

class GenerateLabelResponse(BaseModel):
    status: str
    tracking_id: str
    label_url: str

class ShipmentStatusUpdate(BaseModel):
    status: str  # IN_TRANSIT, DELIVERED, FAILED
    timestamp: Optional[str] = None
