from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Custom Authentication ──
    JWT_SECRET_KEY: str = "supersecretkey"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 1 day

    # ── Internal API Base URL ──
    API_BASE_URL: str = "http://backend-api:8000"
    DEPLOYED_API_BASE_URL: str = "http://localhost:8000"

    # ── Database ──
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/cahbot_db"
    DATABASE_URL_SYNC: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/cahbot_db"

    # ── Vector Store (Milvus) ──
    MILVUS_HOST: str = "localhost"
    MILVUS_PORT: str = "19530"
    MILVUS_COLLECTION_NAME: str = "product_knowledge"
    EMBEDDING_DIMENSION: int = 3072

    # ── WAHA (WhatsApp HTTP API) ──
    WAHA_BASE_URL: str = "http://localhost:3000"
    WAHA_SESSION: str = "default"
    WAHA_API_KEY: str = ""
    WHATSAPP_HOOK_HMAC_KEY: str = ""

    # ── Gemini API ──
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL_ROUTER: str = "gemini-2.0-flash-lite"
    GEMINI_MODEL_AGENT: str = "gemini-2.0-flash-lite"
    GEMINI_MODEL_VISION: str = "gemini-2.0-flash"
    GEMINI_MODEL_EMBEDDING: str = "gemini-embedding-001"
    
    # Chat Settings
    CHAT_HISTORY_LIMIT: int = 5

    # ── Owner / Seller ──
    OWNER_WHATSAPP_NUMBER: str = ""

    # ── Company Payment Info ──
    COMPANY_BANK_NAME: str = "BCA"
    COMPANY_BANK_ACCOUNT: str = "1234567890"
    COMPANY_ACCOUNT_HOLDER: str = "PT Canting Mahakarya"

    # ── MinIO Object Storage ──
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "cahbot"
    MINIO_SECURE: bool = False

    # ── RAG Chunking ──
    RAG_CHUNK_SIZE: int = 500
    RAG_CHUNK_OVERLAP: int = 50
    RAG_TOP_K: int = 3

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
