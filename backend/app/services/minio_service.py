"""
MinIO Object Storage Service — handles file uploads for payment proofs, etc.
Files are served through a backend proxy endpoint for security.
"""
import io
import uuid
from datetime import datetime
from minio import Minio
from minio.error import S3Error
from app.core.config import settings
from app.core.logger import logger


class MinioService:
    """MinIO client wrapper for object storage operations."""

    def __init__(self):
        self.client = None
        self.bucket = settings.MINIO_BUCKET

    def _ensure_client(self):
        """Lazy-initialize the MinIO client."""
        if self.client is None:
            self.client = Minio(
                settings.MINIO_ENDPOINT,
                access_key=settings.MINIO_ACCESS_KEY,
                secret_key=settings.MINIO_SECRET_KEY,
                secure=settings.MINIO_SECURE,
            )
            # Create bucket if not exists
            try:
                if not self.client.bucket_exists(self.bucket):
                    self.client.make_bucket(self.bucket)
                    logger.info(f"Created MinIO bucket: {self.bucket}")
                else:
                    logger.info(f"MinIO bucket already exists: {self.bucket}")
            except S3Error as e:
                logger.error(f"MinIO bucket init error: {e}")

    def upload_file(self, file_data: bytes, filename: str, content_type: str = "image/jpeg", folder: str = "payment_proofs") -> str:
        """Upload a file to MinIO and return the object name (key).
        
        The actual URL is served through the backend proxy at /api/v1/files/{object_name}.
        """
        self._ensure_client()

        # Generate unique object name
        ext = filename.rsplit(".", 1)[-1] if "." in filename else "jpg"
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        object_name = f"{folder}/{timestamp}_{uuid.uuid4().hex[:8]}.{ext}"

        try:
            data = io.BytesIO(file_data)
            self.client.put_object(
                self.bucket,
                object_name,
                data,
                length=len(file_data),
                content_type=content_type,
            )
            logger.info(f"Uploaded to MinIO: {object_name} ({len(file_data)} bytes)")
            return object_name
        except S3Error as e:
            logger.error(f"MinIO upload error: {e}")
            raise

    def get_file(self, object_name: str) -> tuple[bytes, str]:
        """Download a file from MinIO. Returns (data, content_type)."""
        self._ensure_client()
        try:
            response = self.client.get_object(self.bucket, object_name)
            data = response.read()
            content_type = response.headers.get("Content-Type", "application/octet-stream")
            response.close()
            response.release_conn()
            return data, content_type
        except S3Error as e:
            logger.error(f"MinIO download error: {e}")
            raise


minio_service = MinioService()
