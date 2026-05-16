"""
Agent Service — main orchestration layer using PostgreSQL.
Routes messages through: Intent Router → Specialized Agent → Action Execution → Reply.
"""
import traceback
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.logger import logger
from app.db.postgres import async_session
from app.models.domain import UserDB, ProductDB, OrderDB, ComplaintDB, ChatMessageDB
from app.models.schemas import AgentDecision
from app.services.waha_service import waha_service
from app.services.llm_service import llm_service
from app.services.rag_service import rag_service
from app.agents.router import intent_router
from app.agents.vision import vision_agent
from app.core.prompt_templates import SYSTEM_PROMPT, INTENT_PROMPT_MAP
from app.agents.graph import graph, AgentState
from app.core.config import settings
from app.api.auth import create_access_token


class AgentService:
    async def handle_incoming_message(
        self,
        from_number: str,
        message_body: str,
        is_media: bool = False,
        media_data: bytes = None,
        message_id: str = "",
        participant: str = None,
        notify_name: str = "",
    ):
        """Main orchestration via LangGraph."""
        async with async_session() as db:
            # Mark as read
            if message_id:
                await waha_service.send_seen(
                    chat_id=from_number, message_id=message_id, participant=participant
                )

            recipient = from_number
            if from_number.endswith("@lid"):
                resolved_phone = await waha_service.resolve_lid_to_phone(from_number)
                recipient = f"{resolved_phone}@c.us"
            
            await waha_service.start_typing(chat_id=recipient)

            user = await self._get_or_create_user(db, from_number, notify_name)

            history = await self._get_recent_history(db, user.phone_number)

            chat_msg = ChatMessageDB(
                user_phone=user.phone_number,
                role="user",
                message_type="image" if is_media else "text",
                content=message_body or "[Image]",
            )
            db.add(chat_msg)
            await db.commit()

            agent_user = await self._get_system_agent(db)
            tool_jwt = create_access_token(
                data={"sub": str(agent_user.id), "role": agent_user.role},
                expires_delta=timedelta(minutes=15)
            )

            try:
                initial_state = AgentState(
                    phone_number=user.phone_number,
                    message_body=message_body,
                    is_media=is_media,
                    media_data=media_data,
                    user_role=user.role,
                    user_name=user.name,
                    chat_history=history,
                    intent=None,
                    rag_context=None,
                    reply_message=None,
                    messages=[]
                )
                
                config = {"configurable": {"user_jwt": tool_jwt, "buyer_phone": user.phone_number, "media_data": media_data, "recipient": recipient}}
                
                final_state = await graph.ainvoke(initial_state, config=config)
                reply_text = final_state.get("reply_message")
                
                if isinstance(reply_text, list):
                    reply_text = " ".join(
                        part.get("text", "") if isinstance(part, dict) else str(part)
                        for part in reply_text
                    ).strip()
                
                # Stop typing right after processing is ready
                await waha_service.stop_typing(chat_id=recipient)
                
                if reply_text:
                    await waha_service.send_message(recipient, reply_text)
                    
                    agent_msg = ChatMessageDB(
                        user_phone=user.phone_number,
                        role="model",
                        message_type="text",
                        content=reply_text,
                    )
                    db.add(agent_msg)
                    await db.commit()

            except Exception as e:
                logger.error(f"Error in LangGraph execution: {e}")
                traceback.print_exc()
                await waha_service.stop_typing(chat_id=recipient)
                await waha_service.send_message(recipient, "Maaf, sistem sedang mengalami kendala. Silakan coba lagi nanti.")

    # ──────────────────────────────────────────
    # Helpers
    # ──────────────────────────────────────────

    async def _get_or_create_user(self, db: AsyncSession, phone_number: str, notify_name: str = "") -> UserDB:
        """Get existing user from Postgres or create a new one.
        
        Resolves LID to real phone number first, then looks up by phone.
        """
        # Resolve LID → real phone number
        real_phone = phone_number
        if phone_number.endswith("@lid"):
            resolved = await waha_service.resolve_lid_to_phone(phone_number)
            if resolved:
                real_phone = resolved
                logger.info(f"Resolved LID {phone_number} -> {real_phone}")
            else:
                logger.warning(f"Could not resolve LID {phone_number}, using as-is")
        else:
            real_phone = phone_number.replace("@c.us", "")

        # Look up by real phone number
        result = await db.execute(select(UserDB).where(UserDB.phone_number == real_phone))
        user = result.scalar_one_or_none()

        if user:
            # Backfill name if missing
            if not user.name and notify_name:
                user.name = notify_name
                await db.commit()
                await db.refresh(user)
                logger.info(f"Backfilled name for {real_phone}: {notify_name}")
            return user

        # New user — default to buyer
        user = UserDB(phone_number=real_phone, role="buyer", name=notify_name or None)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        logger.info(f"Created new user: {real_phone} with role: buyer, name: {notify_name}")
        return user

    async def _get_system_agent(self, db: AsyncSession) -> UserDB:
        """Get the system_agent service account for tool API calls."""
        result = await db.execute(select(UserDB).where(UserDB.phone_number == "system_agent"))
        agent = result.scalar_one_or_none()
        if not agent:
            raise RuntimeError("system_agent user not found in database. Did init_db() run?")
        return agent

    async def _get_recent_history(self, db: AsyncSession, phone_number: str) -> list[dict]:
        """Fetch the last N chat messages for context."""
        if settings.CHAT_HISTORY_LIMIT <= 0:
            return []
            
        result = await db.execute(
            select(ChatMessageDB)
            .where(ChatMessageDB.user_phone == phone_number)
            .order_by(ChatMessageDB.created_at.desc())
            .limit(settings.CHAT_HISTORY_LIMIT)
        )
        # Reverse to get chronological order
        messages = list(result.scalars().all())[::-1]
        
        return [
            {"role": msg.role, "content": msg.content}
            for msg in messages
            if msg.content # Filter out empty messages
        ]

agent_service = AgentService()
