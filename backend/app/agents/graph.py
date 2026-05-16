# import warnings
# warnings.filterwarnings("ignore", category=DeprecationWarning, module="langgraph")
# warnings.filterwarnings("ignore", message=".*allowed_objects.*")

from typing import TypedDict, Optional, Annotated, Literal
import operator
from langgraph.graph import StateGraph, START, END
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langgraph.prebuilt import ToolNode
from app.core.prompt_templates import SYSTEM_PROMPT, INTENT_PROMPT_MAP
from app.agents.router import intent_router
from app.agents.vision import vision_agent
from app.services.rag_service import rag_service
from app.core.logger import logger
from app.agents.tools import agent_tools


# Import the correct Google genai integration for LangChain
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings

class AgentState(TypedDict):
    phone_number: str
    message_body: str
    is_media: bool
    media_data: Optional[bytes]
    user_role: str
    user_name: Optional[str]
    chat_history: list[dict]
    
    intent: Optional[str]
    rag_context: Optional[str]
    reply_message: Optional[str]
    
    # Internal LangGraph message history (for tool calling)
    messages: Annotated[list, operator.add]

# 1. Router Node
async def router_node(state: AgentState):
    logger.info(f"Router Node: Classifying intent for {state['phone_number']}")
    result = await intent_router.classify(
        message=state["message_body"] or "[Image Attached]",
        user_role=state["user_role"],
        has_image=state["is_media"],
        chat_history=state["chat_history"]
    )
    return {"intent": result.intent}

# 2. Vision Node (for payment and complaints)
async def vision_node(state: AgentState):
    logger.info(f"Vision Node: Processing image for intent {state['intent']}")
    if state["intent"] == "payment_upload":
        # 1. Verify payment image with AI
        result = await vision_agent.verify_payment(image_data=state["media_data"])
        
        if result.is_valid:
            # 2. Upload proof to MinIO
            try:
                from app.services.minio_service import minio_service
                object_name = minio_service.upload_file(
                    file_data=state["media_data"],
                    filename="payment_proof.jpg",
                    content_type="image/jpeg"
                )
                proof_url = f"{settings.DEPLOYED_API_BASE_URL}/api/v1/files/{object_name}"
                logger.info(f"Payment proof uploaded: {proof_url}")
            except Exception as e:
                logger.error(f"Failed to upload payment proof to MinIO: {e}")
                proof_url = None
            
            # 3. Find buyer's most recent pending_payment order and update it
            try:
                from app.db.postgres import async_session
                from app.models.domain import OrderDB
                from sqlalchemy import select, desc
                from datetime import datetime
                
                async with async_session() as db:
                    result_db = await db.execute(
                        select(OrderDB)
                        .where(
                            OrderDB.buyer_phone == state["phone_number"],
                            OrderDB.status == "pending_payment"
                        )
                        .order_by(desc(OrderDB.created_at))
                        .limit(1)
                    )
                    order = result_db.scalar_one_or_none()
                    
                    if order:
                        order.status = "paid_unverified"
                        if proof_url:
                            order.payment_proof_url = proof_url
                        order.updated_at = datetime.utcnow()
                        await db.commit()
                        
                        short_id = str(order.id)[:8].upper()
                        reply = (
                            f"✅ Bukti pembayaran diterima!\n"
                            f"💰 Jumlah: Rp {result.detected_amount:,.0f}\n"
                            f"🏦 Bank: {result.detected_bank or 'N/A'}\n"
                            f"📦 Order: ORD-{short_id}\n\n"
                            f"Pesanan Anda sedang diverifikasi dan akan segera diproses. Terima kasih! 🙏"
                        )
                    else:
                        reply = (
                            f"✅ Bukti pembayaran diterima!\n"
                            f"💰 Jumlah: Rp {result.detected_amount:,.0f}\n"
                            f"🏦 Bank: {result.detected_bank or 'N/A'}\n\n"
                            f"⚠️ Namun kami tidak menemukan pesanan aktif untuk nomor Anda. "
                            f"Silakan buat pesanan terlebih dahulu, lalu kirim ulang bukti pembayaran."
                        )
            except Exception as e:
                logger.error(f"Failed to update order with payment proof: {e}")
                reply = (
                    f"✅ Bukti pembayaran diterima!\n"
                    f"💰 Jumlah: Rp {result.detected_amount:,.0f}\n"
                    f"🏦 Bank: {result.detected_bank or 'N/A'}\n\n"
                    f"Pesanan Anda sedang diproses. Terima kasih!"
                )
        else:
            reply = "⚠️ Maaf, kami tidak dapat memverifikasi bukti pembayaran ini.\nMohon kirim ulang foto yang lebih jelas."
        return {"reply_message": reply}
        
    elif state["intent"] == "complaint_upload":
        result = await vision_agent.analyze_defect(image_data=state["media_data"])
        
        # 1. Upload defect image to MinIO
        defect_url = None
        try:
            from app.services.minio_service import minio_service
            object_name = minio_service.upload_file(
                file_data=state["media_data"],
                filename="defect_proof.jpg",
                content_type="image/jpeg"
            )
            defect_url = f"{settings.DEPLOYED_API_BASE_URL}/api/v1/files/{object_name}"
            logger.info(f"Defect image uploaded: {defect_url}")
        except Exception as e:
            logger.error(f"Failed to upload defect image to MinIO: {e}")
            
        # 2. Save complaint to DB
        try:
            from app.db.postgres import async_session
            from app.models.domain import ComplaintDB, OrderDB
            from sqlalchemy import select, desc
            from datetime import datetime
            
            async with async_session() as db:
                # Find most recent order for context
                result_db = await db.execute(
                    select(OrderDB)
                    .where(OrderDB.buyer_phone == state["phone_number"])
                    .order_by(desc(OrderDB.created_at))
                    .limit(1)
                )
                recent_order = result_db.scalar_one_or_none()
                order_id_str = str(recent_order.id) if recent_order else None
                
                initial_status = "pending_review"
                if result.recommendation == "approve_refund":
                    initial_status = "approved"
                elif result.recommendation == "reject_claim":
                    initial_status = "rejected"

                complaint = ComplaintDB(
                    order_id=order_id_str,
                    buyer_phone=state["phone_number"],
                    description=state["message_body"] or result.analysis_summary,
                    defect_image_url=defect_url,
                    ai_confidence_score=result.confidence_score,
                    ai_analysis_result=f"Recommendation: {result.recommendation} | Summary: {result.analysis_summary}",
                    status=initial_status,
                    created_at=datetime.utcnow()
                )
                db.add(complaint)
                await db.commit()
                logger.info(f"Complaint saved for {state['phone_number']} with status {initial_status}")
                
        except Exception as e:
            logger.error(f"Failed to save complaint to DB: {e}")

        if result.recommendation == "approve_refund":
            reply = f"📋 Analisis Keluhan:\n• Jenis kerusakan: {result.defect_type or 'Teridentifikasi'}\n• Tingkat: {result.severity}\n\n✅ Keluhan Anda telah disetujui untuk proses refund."
        elif result.recommendation == "reject_claim":
            reply = "📋 Analisis Keluhan:\n• Produk tampak dalam kondisi normal.\n\nMaaf, keluhan ini tidak memenuhi kriteria refund."
        else:
            reply = "📋 Keluhan Anda telah diterima dan sedang ditinjau oleh tim kami."
        return {"reply_message": reply}
    
    return {"reply_message": "Mohon maaf, terjadi kesalahan saat memproses gambar Anda."}

# 3. RAG Node
def rag_node(state: AgentState):
    logger.info(f"RAG Node: Fetching context for {state['intent']}")
    context = ""
    if state["message_body"]:
        context = rag_service.search_knowledge(state["message_body"])
    return {"rag_context": context}

# 4. LLM Agent Node (with Tool Calling)
def _sanitize_messages_for_gemini(messages):
    """Enforce strict turn alternation for Gemini.
    Merges consecutive same-role messages and ensures proper ordering.
    """
    if not messages:
        return messages
    
    sanitized = [messages[0]]  # Keep SystemMessage
    
    for msg in messages[1:]:
        if sanitized and type(msg) == type(sanitized[-1]):
            # Merge consecutive same-type messages
            sanitized[-1] = type(msg)(
                content=sanitized[-1].content + "\n\n" + msg.content
            )
        else:
            sanitized.append(msg)
    
    # Gemini requires the last message before response to be HumanMessage
    # If it's not, wrap it
    if len(sanitized) > 1 and not isinstance(sanitized[-1], HumanMessage):
        sanitized.append(HumanMessage(content="[Continue]"))
    
    return sanitized

async def llm_agent_node(state: AgentState):
    logger.info("LLM Node: Generating response and tool calls")
    logger.info(f"  User role: {state['user_role']}")
    logger.info(f"  Intent: {state['intent']}")
    logger.info(f"  Message: {state['message_body'][:100] if state['message_body'] else '[empty]'}")
    logger.info(f"  Existing messages in state: {len(state.get('messages', []))}")
    
    # Initialize LLM with tools
    llm = ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL_AGENT,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.3,
        max_tokens=2048
    )
    llm_with_tools = llm.bind_tools(agent_tools)
    
    # Prepare prompt
    intent_prompt = INTENT_PROMPT_MAP.get(state["intent"], INTENT_PROMPT_MAP["general_chat"])
    context_text = state["rag_context"] or "[NONE - THE STORE HAS NO PRODUCTS CURRENTLY]"
    
    sys_prompt = f"{SYSTEM_PROMPT}\n\nRelevant Product Knowledge:\n{context_text}\n\n{intent_prompt}"
    
    role = state['user_role'].upper()
    user_name = state.get("user_name") or "Unknown"
    sys_prompt += f"\n\nCURRENT USER: {user_name}\nCURRENT USER ROLE: {role}."
    
    if role in ("OWNER", "ADMIN"):
        sys_prompt += f" This user has FULL ACCESS to ALL tools including adding products, managing orders, updating inventory, and all other administrative actions. USE tools when the user requests an action."
    else:
        sys_prompt += f" This user can only search products, create orders, and ask general questions. If they request admin actions like adding products or managing inventory, politely explain they don't have permission."
    
    if not state.get("messages"):
        # First call — build the full conversation from scratch
        messages = [SystemMessage(content=sys_prompt)]
        # Add chat history
        for msg in state["chat_history"]:
            content = msg["content"]
            if msg["role"] == "user":
                messages.append(HumanMessage(content=content))
            else:
                messages.append(AIMessage(content=content))
                
        messages.append(HumanMessage(content=state["message_body"] or "[User sent an image]"))
        
        # Sanitize for Gemini's strict turn alternation
        messages = _sanitize_messages_for_gemini(messages)
        logger.info(f"  Built fresh messages: {len(messages)} total (after sanitization)")
        is_first_call = True
    else:
        # Re-entry after tool execution — use messages as-is
        # (SystemMessage → ... → HumanMessage → AIMessage(tool_calls) → ToolMessage)
        messages = state["messages"]
        logger.info(f"  Re-entry with existing messages: {len(messages)} total")
        is_first_call = False
    
    # Log message types for debugging
    for i, m in enumerate(messages):
        logger.info(f"  msg[{i}]: {type(m).__name__} | {str(m.content)[:80]}...")

    response = await llm_with_tools.ainvoke(messages)
    
    logger.info(f"  LLM response type: {type(response).__name__}")
    logger.info(f"  Tool calls: {len(response.tool_calls) if response.tool_calls else 0}")
    if response.tool_calls:
        for tc in response.tool_calls:
            logger.info(f"    -> Tool: {tc['name']}({tc['args']})")
    logger.info(f"  Response content: {str(response.content)[:200]}")

    if is_first_call:
        # First call: save ALL messages (system + human + response) so re-entry
        # has the full conversation context
        all_messages = messages + [response]
        if not response.tool_calls:
            return {"messages": all_messages, "reply_message": response.content}
        else:
            return {"messages": all_messages}
    else:
        # Re-entry: just append the new response
        if not response.tool_calls:
            return {"messages": [response], "reply_message": response.content}
        else:
            return {"messages": [response]}

# 5. Tool Executor Node
_raw_tool_node = ToolNode(agent_tools)

async def tool_node(state: AgentState):
    logger.info("Tool Node: Executing tool calls")
    last_msg = state["messages"][-1]
    if hasattr(last_msg, "tool_calls"):
        for tc in last_msg.tool_calls:
            logger.info(f"  Executing: {tc['name']}({tc['args']})")
    result = await _raw_tool_node.ainvoke(state)
    logger.info(f"  Tool result keys: {list(result.keys()) if isinstance(result, dict) else type(result)}")
    if isinstance(result, dict) and "messages" in result:
        for m in result["messages"]:
            logger.info(f"  Tool response: {str(m.content)[:200]}")
    return result

# Define conditional edges
def route_after_router(state: AgentState) -> Literal["vision_node", "rag_node"]:
    if state["intent"] in ["payment_upload", "complaint_upload"] and state["is_media"]:
        return "vision_node"
    return "rag_node"

def route_after_llm(state: AgentState) -> Literal["tool_node", "__end__"]:
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and len(last_message.tool_calls) > 0:
        return "tool_node"
    return "__end__"

# Build Graph
builder = StateGraph(AgentState)

builder.add_node("router_node", router_node)
builder.add_node("vision_node", vision_node)
builder.add_node("rag_node", rag_node)
builder.add_node("llm_agent_node", llm_agent_node)
builder.add_node("tool_node", tool_node)

builder.add_edge(START, "router_node")
builder.add_conditional_edges("router_node", route_after_router)

# Vision path
builder.add_edge("vision_node", END)

# Text path
builder.add_edge("rag_node", "llm_agent_node")
builder.add_conditional_edges("llm_agent_node", route_after_llm)
builder.add_edge("tool_node", "llm_agent_node")

# Compile
graph = builder.compile()
