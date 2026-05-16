import asyncio
from app.db.postgres import get_db, async_session
from app.api.auth import create_access_token
from app.agents.graph import graph, AgentState
from datetime import timedelta

async def test_agent():
    print("Generating JWT...")
    user_jwt = create_access_token(
        data={"sub": "owner_id", "role": "owner"},
        expires_delta=timedelta(minutes=15)
    )
    
    state = AgentState(
        phone_number="1234567890",
        message_body="Tolong buatkan pesanan untuk Batik Parang ukuran M sebanyak 2 buah.",
        is_media=False,
        media_data=None,
        user_role="owner",
        user_jwt=user_jwt,
        chat_history=[],
        intent=None,
        rag_context=None,
        reply_message=None,
        messages=[]
    )
    
    config = {"configurable": {"user_jwt": user_jwt}}
    print("Invoking graph...")
    result = await graph.ainvoke(state, config=config)
    print("\n\nFINAL REPLY:", result.get("reply_message"))

if __name__ == "__main__":
    asyncio.run(test_agent())
