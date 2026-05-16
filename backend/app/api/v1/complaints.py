"""
Complaints API — customer care metrics, active requests, action handling, and chat logs.
All calculations are dynamic from PostgreSQL.
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, String
from app.db.postgres import get_db
from app.models.domain import ComplaintDB, OrderDB, ProductDB, ChatMessageDB, UserDB
from app.models.schemas import ComplaintAction
from app.api.auth import require_admin
from app.core.logger import logger

router = APIRouter()


@router.get("/summary")
async def complaints_summary(
    db: AsyncSession = Depends(get_db),
    current_user: UserDB = Depends(require_admin),
):
    """Metrics for the complaint dashboard, calculated dynamically."""
    today = datetime.utcnow().date()
    now = datetime.utcnow()

    # Pending tickets (status = pending_review)
    pending = await db.scalar(
        select(func.count(ComplaintDB.id)).where(ComplaintDB.status == "pending_review")
    ) or 0

    # Resolved today
    resolved_today = await db.scalar(
        select(func.count(ComplaintDB.id)).where(
            ComplaintDB.status.in_(("approved", "rejected")),
            func.date(ComplaintDB.updated_at) == today,
        )
    ) or 0

    # Average response time (hours) — diff between created_at and updated_at for resolved
    avg_result = await db.execute(
        select(
            func.avg(
                func.extract("epoch", ComplaintDB.updated_at) -
                func.extract("epoch", ComplaintDB.created_at)
            )
        ).where(
            ComplaintDB.status.in_(("approved", "rejected")),
            ComplaintDB.updated_at.isnot(None),
        )
    )
    avg_seconds = avg_result.scalar() or 0
    avg_hours = round(avg_seconds / 3600, 1) if avg_seconds else 0.0

    # Refund rate: approved complaints / total resolved
    total_resolved = await db.scalar(
        select(func.count(ComplaintDB.id)).where(
            ComplaintDB.status.in_(("approved", "rejected"))
        )
    ) or 0
    total_approved = await db.scalar(
        select(func.count(ComplaintDB.id)).where(ComplaintDB.status == "approved")
    ) or 0

    refund_rate = round((total_approved / total_resolved * 100), 1) if total_resolved > 0 else 0.0

    return {
        "pending_tickets": pending,
        "resolved_today": resolved_today,
        "average_response_time_hours": avg_hours,
        "refund_rate_percentage": refund_rate,
    }


@router.get("/active-requests")
async def active_requests(
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: UserDB = Depends(require_admin),
):
    """Fetches active refund/severe complaint requests needing manual action."""
    if search and search == "*":
        search = None

    stmt = (
        select(ComplaintDB)
        .where(ComplaintDB.status == "pending_review")
    )
    
    if search:
        stmt = stmt.where(ComplaintDB.description.ilike(f"%{search}%"))

    stmt = stmt.order_by(desc(ComplaintDB.created_at)).limit(50)
    result = await db.execute(stmt)
    complaints = result.scalars().all()

    items = []
    for c in complaints:
        # Resolve product name from order if possible
        product_names = []
        formatted_order_id = "N/A"
        
        if c.order_id and c.order_id != "N/A":
            try:
                short_order_id = str(c.order_id)[:8].upper()
                formatted_order_id = f"ORD-{short_order_id}"
            except Exception:
                formatted_order_id = c.order_id

            try:
                order_result = await db.execute(
                    select(OrderDB).where(OrderDB.id.cast(String) == str(c.order_id))
                )
                order = order_result.scalar_one_or_none()
                if order and order.items:
                    for item in order.items:
                        prod_id = item.get("product_id")
                        if prod_id:
                            prod_result = await db.execute(
                                select(ProductDB.name, ProductDB.category).where(ProductDB.id.cast(String) == str(prod_id))
                            )
                            prod_row = prod_result.first()
                            if prod_row:
                                p_name, p_category = prod_row
                                product_names.append(f"{p_name} ({p_category or 'Uncategorized'})")
            except Exception as e:
                logger.error(f"Error resolving products for complaint {c.id}: {e}")

        if product_names:
            product_name = ", ".join(product_names)
        else:
            product_name = "Unknown Product"

        # Determine issue type from AI analysis
        issue_type = "COMPLAINT"
        if c.defect_image_url:
            issue_type = "DEFECTIVE"
        elif c.ai_analysis_result and "refund" in (c.ai_analysis_result or "").lower():
            issue_type = "REFUND"

        short_id = str(c.id)[:8].upper()
        items.append({
            "request_id": f"REQ-{short_id}",
            "full_id": c.id,
            "order_id": formatted_order_id,
            "buyer_phone": c.buyer_phone or "N/A",
            "requested_at": c.created_at.isoformat() + "Z" if c.created_at else "",
            "issue_type": issue_type,
            "product_name": product_name,
            "customer_message": c.description or "",
        })

    return items


@router.post("/requests/{request_id}/action")
async def handle_complaint_action(
    request_id: str,
    payload: ComplaintAction,
    db: AsyncSession = Depends(get_db),
    current_user: UserDB = Depends(require_admin),
):
    """Approve or reject a refund request."""
    # request_id format: REQ-XXXXXXXX — extract the short UUID
    clean_id = request_id.replace("REQ-", "").lower()

    # Find complaint whose UUID starts with this prefix
    result = await db.execute(
        select(ComplaintDB).where(
            ComplaintDB.id.cast(String).ilike(f"{clean_id}%")
        )
    )
    complaint = result.scalar_one_or_none()

    if not complaint:
        # Try direct ID lookup
        try:
            result = await db.execute(
                select(ComplaintDB).where(ComplaintDB.id == request_id)
            )
            complaint = result.scalar_one_or_none()
        except Exception:
            pass

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint request not found")

    new_status = "approved" if payload.action == "APPROVE" else "rejected"
    complaint.status = new_status
    complaint.updated_at = datetime.utcnow()
    await db.commit()

    return {"status": "ok", "action": payload.action, "notes": payload.notes}


@router.get("/logs")
async def complaint_logs(
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: UserDB = Depends(require_admin),
):
    """Fetches recent WhatsApp interaction logs handled by the chatbot."""
    if search and search == "*":
        search = None

    stmt = select(ChatMessageDB).where(ChatMessageDB.role == "user")

    if search:
        stmt = stmt.where(
            (ChatMessageDB.user_phone.ilike(f"%{search}%")) |
            (ChatMessageDB.content.ilike(f"%{search}%"))
        )
    
    stmt = stmt.order_by(desc(ChatMessageDB.created_at)).limit(limit)
    result = await db.execute(stmt)
    messages = result.scalars().all()

    print([i.role for i in messages])

    # Group by phone number and pick latest message snippet
    seen_phones = {}
    logs = []
    for msg in messages:
        phone = msg.user_phone
        if phone in seen_phones:
            continue
        seen_phones[phone] = True

        # Derive tags from message content
        tags = []
        content_lower = (msg.content or "").lower()
        if any(kw in content_lower for kw in ["kirim", "paket", "ongkir", "pengiriman", "sampai"]):
            tags.append("SHIPPING")
        if any(kw in content_lower for kw in ["bayar", "transfer", "payment"]):
            tags.append("PAYMENT")
        if any(kw in content_lower for kw in ["rusak", "defect", "cacat", "complaint", "luntur", "komplain", "sobek"]):
            tags.append("COMPLAINT")
        if not tags:
            tags.append("GENERAL")

        # Mask phone number
        # masked = phone[:8] + "XXXX" if len(phone) > 8 else phone

        last_msg_role = (await db.execute(select(ChatMessageDB.role).where(ChatMessageDB.user_phone == phone).order_by(desc(ChatMessageDB.created_at)).limit(1))).scalar()

        if last_msg_role == "model":
            tags.append("REPLIED")

        logs.append({
            "phone_number": phone,
            "timestamp": msg.created_at.isoformat() + "Z" if msg.created_at else "",
            "message_snippet": (msg.content or "")[:100] + ("..." if len(msg.content or "") > 100 else ""),
            "tags": tags,
        })

    return logs
