"""
Files API — proxy endpoint for serving files stored in MinIO.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from app.services.minio_service import minio_service
from app.core.logger import logger

router = APIRouter()


@router.get("/{file_path:path}")
async def get_file(file_path: str):
    """Proxy a file from MinIO storage. Publicly accessible."""
    try:
        data, content_type = minio_service.get_file(file_path)
        return Response(content=data, media_type=content_type)
    except Exception as e:
        logger.error(f"File proxy error for {file_path}: {e}")
        raise HTTPException(status_code=404, detail="File not found")
