"""
Orders API — order management with summary metrics, paginated listing, and status updates.
All calculations are dynamic from PostgreSQL.
"""
import math
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, String
from app.db.postgres import get_db
from app.models.domain import OrderDB, UserDB, ProductDB
from app.models.schemas import OrderStatusUpdate, OrderCreate
from app.api.auth import require_admin, get_current_user
from app.core.logger import logger

router = APIRouter()


@router.get("/summary")
async def orders_summary(
    db: AsyncSession = Depends(get_db),
    current_user: UserDB = Depends(require_admin),
):
    """Top metrics for incoming orders, calculated dynamically."""
    now = datetime.utcnow()
    today = now.date()
    yesterday = now - timedelta(hours=24)

    # Awaiting approval: orders that are paid but not yet processing
    awaiting = await db.scalar(
        select(func.count(OrderDB.id)).where(
            OrderDB.status.in_(("paid_unverified", "pending_payment"))
        )
    ) or 0

    # Processing today
    processing_today = await db.scalar(
        select(func.count(OrderDB.id)).where(
            OrderDB.status == "processing",
            func.date(OrderDB.created_at) == today,
        )
    ) or 0

    # Completed in last 24h
    completed_24h = await db.scalar(
        select(func.count(OrderDB.id)).where(
            OrderDB.status == "completed",
            OrderDB.updated_at >= yesterday,
        )
    ) or 0

    return {
        "awaiting_approval": awaiting,
        "processing_today": processing_today,
        "processing_today": processing_today,
        "completed_24h": completed_24h,
    }


@router.post("")
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    """Create a new order and deduct product stock."""
    from sqlalchemy.orm.attributes import flag_modified

    total_amount = 0.0
    items_to_save = []
    
    for item in payload.items:
        # Verify product exists
        result = await db.execute(select(ProductDB).where(ProductDB.id == item.product_id))
        product = result.scalar_one_or_none()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID {item.product_id} not found")
        
        # Determine variant size key
        variants = dict(product.stock_variants) if product.stock_variants else {}
        size_key = item.size
        if not size_key:
            if len(variants) == 1:
                size_key = list(variants.keys())[0]
            else:
                size_key = "default"

        current_qty = variants.get(size_key, 0)
        if current_qty < item.qty:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for product '{product.name}' size '{size_key}'. Available: {current_qty}, requested: {item.qty}."
            )
        
        # Deduct stock
        variants[size_key] = current_qty - item.qty
        product.stock_variants = variants
        flag_modified(product, "stock_variants")

        items_to_save.append({
            "product_id": str(product.id),
            "size": item.size,
            "qty": item.qty,
            "price": product.price,
        })
        total_amount += product.price * item.qty

    order = OrderDB(
        buyer_phone=payload.buyer_phone,
        items=items_to_save,
        total_amount=total_amount,
        status="pending_payment",
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)

    return {"status": "success", "order_id": str(order.id)}

@router.get("")
async def list_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter: ALL, UNPAID, PAID, PROCESSING, SHIPPED, COMPLETED"),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: UserDB = Depends(require_admin),
):
    """Retrieves paginated orders with optional status filter and search."""
    if search and search == "*":
        search = None

    # Status mapping to internal status
    status_map = {
        "UNPAID": ["pending_payment"],
        "PAID": ["paid_unverified"],
        "PROCESSING": ["processing"],
        "SHIPPED": ["shipped"],
        "COMPLETED": ["completed"],
    }

    # Build base queries
    base_stmt = select(func.count(OrderDB.id))
    data_stmt = select(OrderDB, UserDB.name).outerjoin(
        UserDB, OrderDB.buyer_phone == UserDB.phone_number
    ).order_by(desc(OrderDB.created_at))

    if status and status.upper() != "ALL":
        internal_statuses = status_map.get(status.upper(), [status.lower()])
        base_stmt = base_stmt.where(OrderDB.status.in_(internal_statuses))
        data_stmt = data_stmt.where(OrderDB.status.in_(internal_statuses))
    
    if search:
        # Search by phone or customer name
        search_filter = (OrderDB.buyer_phone.ilike(f"%{search}%")) | (UserDB.name.ilike(f"%{search}%"))
        base_stmt = base_stmt.where(search_filter)
        data_stmt = data_stmt.where(search_filter)

    total_items = await db.scalar(base_stmt) or 0
    total_pages = max(1, math.ceil(total_items / limit))

    data_stmt = data_stmt.offset((page - 1) * limit).limit(limit)
    result = await db.execute(data_stmt)
    rows = result.all()

    data = []
    for order, user_name in rows:
        # Resolve product summary
        product_summary = "Unknown Product"
        if order.items and len(order.items) > 0:
            first_item = order.items[0]
            prod_id = first_item.get("product_id")
            if prod_id:
                prod_result = await db.execute(
                    select(ProductDB.name).where(ProductDB.id == prod_id)
                )
                prod_name = prod_result.scalar_one_or_none()
                if prod_name:
                    product_summary = prod_name

        short_id = str(order.id)[:8].upper()
        data.append({
            "order_id": f"ORD-{short_id}",
            "full_id": order.id,
            "date": order.created_at.isoformat() + "Z" if order.created_at else "",
            "customer_name": user_name or order.buyer_phone,
            "location": "-",  # Will be populated when address data is available
            "product_summary": product_summary,
            "status": order.status.upper().replace("_", " "),
            "amount": order.total_amount,
        })

    return {
        "data": data,
        "meta": {
            "total_items": total_items,
            "current_page": page,
            "total_pages": total_pages,
        },
    }


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: str,
    payload: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserDB = Depends(require_admin),
):
    """Update the status of an order."""
    valid_statuses = {"UNPAID", "PAID", "PROCESSING", "SHIPPED", "COMPLETED"}
    if payload.status.upper() not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {valid_statuses}",
        )

    # Map status to internal
    internal_map = {
        "UNPAID": "pending_payment",
        "PAID": "paid_unverified",
        "PROCESSING": "processing",
        "SHIPPED": "shipped",
        "COMPLETED": "completed",
    }

    # Handle ORD- prefix
    clean_id = order_id.replace("ORD-", "").lower()

    # Try UUID prefix match
    result = await db.execute(
        select(OrderDB).where(
            OrderDB.id.cast(String).ilike(f"{clean_id}%")
        )
    )
    order = result.scalar_one_or_none()

    if not order:
        # Try direct UUID match
        try:
            result = await db.execute(
                select(OrderDB).where(OrderDB.id == order_id)
            )
            order = result.scalar_one_or_none()
        except Exception:
            pass

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = internal_map.get(payload.status.upper(), payload.status.lower())
    order.updated_at = datetime.utcnow()
    await db.commit()

    return {"status": "ok"}
