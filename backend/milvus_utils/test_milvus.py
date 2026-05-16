import asyncio
from app.db.vector_store import get_milvus_client, COLLECTION_NAME

client = get_milvus_client()
client.load_collection(collection_name=COLLECTION_NAME)
stats = client.get_collection_stats(collection_name=COLLECTION_NAME)
num_entities = int(stats.get("row_count", 0))

print(f"Num entities: {num_entities}")
if num_entities > 0:
    results = client.query(
        collection_name=COLLECTION_NAME,
        filter="id >= 0",
        output_fields=["text"],
        limit=10
    )
    for res in results:
        print(res.get('text'))
