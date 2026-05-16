"""
Shipping API — logistics management, shipment tracking, and label generation.
All calculations are dynamic from PostgreSQL.
"""
import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
import math
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, String
from app.db.postgres import get_db
from app.models.domain import ShipmentDB, OrderDB, UserDB
from app.models.schemas import GenerateLabelRequest, ShipmentStatusUpdate
from app.api.auth import require_admin
from app.core.logger import logger

router = APIRouter()

# Courier code mappings for AWB generation
COURIER_CODES = {
    "JNE": "JNE",
    "JNE Reguler": "JNE",
    "JNE Express": "JNE",
    "J&T Express": "JNT",
    "J&T": "JNT",
    "SiCepat": "SCP",
    "Anteraja": "ANT",
    "GoSend": "GSD",
    "GrabExpress": "GRB",
}


@router.get("/summary")
async def shipping_summary(
    db: AsyncSession = Depends(get_db),
    current_user: UserDB = Depends(require_admin),
):
    """Fetches high-level metrics for the shipping dashboard, calculated dynamically."""
    today = datetime.utcnow().date()

    ready_to_ship = await db.scalar(
        select(func.count(ShipmentDB.id)).where(ShipmentDB.status == "READY_TO_SHIP")
    ) or 0

    in_transit = await db.scalar(
        select(func.count(ShipmentDB.id)).where(ShipmentDB.status == "IN_TRANSIT")
    ) or 0

    delivered_today = await db.scalar(
        select(func.count(ShipmentDB.id)).where(
            ShipmentDB.status == "DELIVERED",
            func.date(ShipmentDB.updated_at) == today,
        )
    ) or 0

    failed = await db.scalar(
        select(func.count(ShipmentDB.id)).where(ShipmentDB.status == "FAILED")
    ) or 0

    return {
        "ready_to_ship": ready_to_ship,
        "in_transit": in_transit,
        "delivered_today": delivered_today,
        "failed_delivery": failed,
    }


@router.get("/deliveries")
async def list_deliveries(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter: READY_TO_SHIP, IN_TRANSIT, DELIVERED, FAILED"),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: UserDB = Depends(require_admin),
):
    """Retrieves a paginated list of shipments and their active tracking status."""
    if search and search == "*":
        search = None

    count_stmt = select(func.count(ShipmentDB.id))
    data_stmt = select(ShipmentDB).order_by(desc(ShipmentDB.created_at))

    if status:
        count_stmt = count_stmt.where(ShipmentDB.status == status.upper())
        data_stmt = data_stmt.where(ShipmentDB.status == status.upper())
    
    if search:
        search_filter = (
            (ShipmentDB.tracking_id.ilike(f"%{search}%")) |
            (ShipmentDB.recipient.ilike(f"%{search}%")) |
            (ShipmentDB.location.ilike(f"%{search}%"))
        )
        count_stmt = count_stmt.where(search_filter)
        data_stmt = data_stmt.where(search_filter)

    total_items = await db.scalar(count_stmt) or 0
    total_pages = max(1, math.ceil(total_items / limit))

    data_stmt = data_stmt.offset((page - 1) * limit).limit(limit)
    result = await db.execute(data_stmt)
    shipments = result.scalars().all()

    data = []
    for s in shipments:
        data.append({
            "tracking_id": s.tracking_id,
            "full_id": s.id,
            "order_id": s.order_id,
            "courier": s.courier,
            "status": s.status,
            "estimated_arrival": s.estimated_arrival.isoformat() + "Z" if s.estimated_arrival else None,
            "recipient": s.recipient or "",
            "location": s.location or "",
        })

    return {
        "data": data,
        "meta": {
            "total_items": total_items,
            "current_page": page,
            "total_pages": total_pages,
        },
    }


@router.post("/generate-label")
async def generate_label(
    payload: GenerateLabelRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserDB = Depends(require_admin),
):
    """Generates a shipping label/Airway Bill (AWB) for an order that is ready to ship."""
    # Resolve the order
    clean_order_id = payload.order_id.replace("ORD-", "").lower()
    order = None

    # Try prefix match
    result = await db.execute(
        select(OrderDB).where(
            OrderDB.id.cast(String).ilike(f"{clean_order_id}%")
        )
    )
    order = result.scalar_one_or_none()

    if not order:
        # Try direct UUID
        try:
            result = await db.execute(
                select(OrderDB).where(OrderDB.id == payload.order_id)
            )
            order = result.scalar_one_or_none()
        except Exception:
            pass

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Check if shipment already exists for this order
    existing = await db.execute(
        select(ShipmentDB).where(ShipmentDB.order_id == str(order.id))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Shipment already exists for this order")

    # Generate tracking ID
    courier_code = COURIER_CODES.get(payload.courier, payload.courier[:3].upper())
    tracking_number = random.randint(1000000, 9999999)
    tracking_id = f"AWB-{courier_code}-{tracking_number}"

    # Resolve recipient
    recipient_name = order.buyer_phone
    user_result = await db.execute(
        select(UserDB.name).where(UserDB.phone_number == order.buyer_phone)
    )
    user_name = user_result.scalar_one_or_none()
    if user_name:
        recipient_name = user_name

    # Create shipment record
    shipment = ShipmentDB(
        tracking_id=tracking_id,
        order_id=str(order.id),
        courier=payload.courier,
        status="READY_TO_SHIP",
        estimated_arrival=datetime.utcnow() + timedelta(days=3),
        recipient=recipient_name,
        location="-",
        label_url=f"https://api.canting.my.id/v1/shipping/labels/{tracking_id}.pdf",
    )
    db.add(shipment)

    # Update order status to shipped
    order.status = "shipped"
    order.awb_number = tracking_id
    order.updated_at = datetime.utcnow()

    await db.commit()

    return {
        "status": "success",
        "tracking_id": tracking_id,
        "full_id": str(shipment.id),
        "label_url": shipment.label_url,
    }


@router.patch("/{tracking_id}/status")
async def update_shipment_status(
    tracking_id: str,
    payload: ShipmentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserDB = Depends(require_admin),
):
    """Webhook endpoint for third-party couriers to update delivery status automatically.
    
    Note: This endpoint does not require authentication since it's designed to be
    called by external courier webhooks. In production, add HMAC signature verification.
    """
    valid_statuses = {"IN_TRANSIT", "DELIVERED", "FAILED", "READY_TO_SHIP"}
    if payload.status.upper() not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {valid_statuses}",
        )

    result = await db.execute(
        select(ShipmentDB).where(ShipmentDB.tracking_id == tracking_id)
    )
    shipment = result.scalar_one_or_none()

    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    shipment.status = payload.status.upper()
    shipment.updated_at = datetime.utcnow()
    await db.commit()

    return {"status": "ok"}
