"""
Domain models as Pydantic schemas and SQLAlchemy DB models.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
from datetime import datetime
import uuid
from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.postgres import Base


# ── Pydantic Schemas ──

class UserDoc(BaseModel):
    """Firestore: collection 'users', document ID = phone_number."""
    phone_number: str
    username: Optional[str] = None
    name: Optional[str] = None
    hashed_password: Optional[str] = None
    role: str = "buyer"  # "owner", "admin", "buyer"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ProductDoc(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    price: float
    stock_variants: Dict[str, int] = Field(default_factory=dict)
    images: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None


class OrderItemDoc(BaseModel):
    product_id: str
    size: Optional[str] = None
    qty: int
    price: float


class OrderDoc(BaseModel):
    buyer_phone: str
    items: List[OrderItemDoc]
    total_amount: float
    status: str = "pending_payment"
    payment_proof_url: Optional[str] = None
    awb_number: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None


class ComplaintDoc(BaseModel):
    order_id: Optional[str] = None
    buyer_phone: str
    description: Optional[str] = None
    defect_image_url: Optional[str] = None
    ai_confidence_score: Optional[float] = None
    ai_analysis_result: Optional[str] = None
    status: str = "pending_review"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None


class ChatMessageDoc(BaseModel):
    user_phone: str
    role: str
    message_type: str = "text"
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ── SQLAlchemy DB Models ──

class UserDB(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_number = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=True)
    role = Column(String, default="buyer")
    created_at = Column(DateTime, default=datetime.utcnow)


class ProductDB(Base):
    __tablename__ = "products"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sku = Column(String, unique=True, index=True, nullable=True)
    name = Column(String)
    category = Column(String, nullable=True)
    description = Column(String, nullable=True)
    price = Column(Float)
    stock_variants = Column(JSONB, default=dict)
    images = Column(JSONB, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True)


class OrderDB(Base):
    __tablename__ = "orders"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    buyer_phone = Column(String, index=True)
    items = Column(JSONB, default=list)
    total_amount = Column(Float)
    status = Column(String, default="pending_payment")
    payment_proof_url = Column(String, nullable=True)
    awb_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True)


class ComplaintDB(Base):
    __tablename__ = "complaints"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(String, nullable=True)
    buyer_phone = Column(String, index=True)
    description = Column(String, nullable=True)
    defect_image_url = Column(String, nullable=True)
    ai_confidence_score = Column(Float, nullable=True)
    ai_analysis_result = Column(String, nullable=True)
    status = Column(String, default="pending_review")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True)


class ChatMessageDB(Base):
    __tablename__ = "chat_history"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_phone = Column(String, index=True)
    role = Column(String)
    message_type = Column(String, default="text")
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class KnowledgeDocumentDB(Base):
    __tablename__ = "knowledge_documents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doc_id = Column(String, unique=True, index=True)  # e.g. DOC-101
    file_name = Column(String)
    file_size_mb = Column(Float, default=0.0)
    category = Column(String, default="GENERAL")  # TECHNICAL, SUSTAINABILITY, etc.
    upload_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="PROCESSING")  # PROCESSING, INDEXED, FAILED


class ReportJobDB(Base):
    __tablename__ = "report_jobs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(String, unique=True, index=True)  # e.g. JOB-881
    report_id = Column(String, unique=True, index=True, nullable=True)  # e.g. REP-901
    report_type = Column(String)  # SALES, REFUNDS, COMPLAINTS, RECEIPTS
    name = Column(String, nullable=True)
    start_date = Column(String)
    end_date = Column(String)
    period = Column(String, nullable=True)  # e.g. "JUL 01 - SEP 30"
    format = Column(String, default="PDF")  # PDF, XLSX
    generation_type = Column(String, default="Manual Export")
    status = Column(String, default="processing")  # processing, completed, failed
    download_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ShipmentDB(Base):
    __tablename__ = "shipments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tracking_id = Column(String, unique=True, index=True)  # e.g. AWB-JNE-8829331
    order_id = Column(String, index=True)
    courier = Column(String)
    status = Column(String, default="READY_TO_SHIP")  # READY_TO_SHIP, IN_TRANSIT, DELIVERED, FAILED
    estimated_arrival = Column(DateTime, nullable=True)
    recipient = Column(String, nullable=True)
    location = Column(String, nullable=True)
    label_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True)
