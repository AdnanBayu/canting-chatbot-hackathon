from pymilvus import MilvusClient, FieldSchema, CollectionSchema, DataType
from app.core.config import settings

COLLECTION_NAME = settings.MILVUS_COLLECTION_NAME

# Global client instance
_milvus_client = None

def get_milvus_client() -> MilvusClient:
    global _milvus_client
    if _milvus_client is None:
        uri = f"http://{settings.MILVUS_HOST}:{settings.MILVUS_PORT}"
        _milvus_client = MilvusClient(uri=uri)
    return _milvus_client

def init_milvus():
    client = get_milvus_client()
    
    if not client.has_collection(collection_name=COLLECTION_NAME):
        fields = [
            FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
            FieldSchema(name="text", dtype=DataType.VARCHAR, max_length=65535),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=settings.EMBEDDING_DIMENSION),
        ]
        schema = CollectionSchema(fields, description="Product Knowledge for RAG")
        
        index_params = client.prepare_index_params()
        index_params.add_index(
            field_name="embedding",
            metric_type="L2",
            index_type="IVF_FLAT",
            params={"nlist": 1024}
        )
        
        client.create_collection(
            collection_name=COLLECTION_NAME,
            schema=schema,
            index_params=index_params
        )
