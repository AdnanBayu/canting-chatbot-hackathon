from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.db.postgres import init_db
from app.db.vector_store import init_milvus
from app.api.v1 import webhooks, dashboard, knowledge, auth_routes, owner
from app.api.v1 import inventory, complaints, orders, reports, shipping, files
from app.core.logger import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Databases
    logger.info("Initializing PostgreSQL...")
    try:
        await init_db()
    except Exception as e:
        logger.error(f"Failed to initialize PostgreSQL: {e}")
    
    logger.info("Initializing vector database...")
    try:
        init_milvus()
    except Exception as e:
        logger.error(f"Failed to connect to Milvus: {e}")
        
    yield
    # Shutdown logic if any

app = FastAPI(title="CANTING - AI CS Backend", lifespan=lifespan)

# Webhook routes (WAHA)
app.include_router(webhooks.router, prefix="/webhook", tags=["webhooks"])

# Auth routes (login/register)
app.include_router(auth_routes.router, prefix="/api/v1/auth", tags=["auth"])

# Owner routes (user management)
app.include_router(owner.router, prefix="/api/v1/owner", tags=["owner"])

# Admin routes (quick product management)
# app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])

# Dashboard routes (full CRUD for frontend)
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])

# Knowledge (RAG ingestion + document management)
app.include_router(knowledge.router, prefix="/api/v1/knowledge", tags=["knowledge"])

# Inventory Management (Stok Barang)
app.include_router(inventory.router, prefix="/api/v1/inventory", tags=["inventory"])

# Customer Care (Komplain)
app.include_router(complaints.router, prefix="/api/v1/complaints", tags=["complaints"])

# Order Management (Pesanan Masuk)
app.include_router(orders.router, prefix="/api/v1/orders", tags=["orders"])

# Reports & Analytics (Laporan)
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])

# Shipping & Logistics (Pengiriman)
app.include_router(shipping.router, prefix="/api/v1/shipping", tags=["shipping"])

# File proxy (MinIO)
app.include_router(files.router, prefix="/api/v1/files", tags=["files"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
