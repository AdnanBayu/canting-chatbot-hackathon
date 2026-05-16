"""
Inventory API — product stock management and summary metrics.
All calculations are dynamic from PostgreSQL.
"""
import math
from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.postgres import get_db
from app.models.domain import ProductDB, UserDB
from app.api.auth import require_admin
from app.core.logger import logger

router = APIRouter()

LOW_STOCK_THRESHOLD = 15


def _compute_stock_info(stock_variants: dict) -> tuple[int, str, str]:
    """Compute total stock, unit, and status from stock_variants JSONB."""
    if not isinstance(stock_variants, dict) or not stock_variants:
        return 0, "Units", "CRITICAL"

    total = sum(v for v in stock_variants.values() if isinstance(v, (int, float)))
    unit = "Units"

    if total >= 50:
        status = "OPTIMAL"
    elif total >= LOW_STOCK_THRESHOLD:
        status = "NORMAL"
    elif total > 5:
        status = "LOW"
    else:
        status = "CRITICAL"

    return int(total), unit, status


@router.get("/summary")
async def inventory_summary(
    db: AsyncSession = Depends(get_db),
    current_user: UserDB = Depends(require_admin),
):
    """Fetches top-level inventory metrics, calculated dynamically."""
    result = await db.execute(select(ProductDB))
    products = result.scalars().all()

    total_sku = len(products)
    low_stock_count = 0
    warehouse_value = 0.0

    for p in products:
        total_stock, _, status = _compute_stock_info(p.stock_variants)
        if status in ("LOW", "CRITICAL"):
            low_stock_count += 1
        warehouse_value += p.price * total_stock

    return {
        "total_sku": {"count": total_sku, "trend_percentage": 0},
        "low_stock_items": low_stock_count,
        "estimated_warehouse_value": warehouse_value,
    }


@router.get("/products")
async def list_inventory_products(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query(None, description="e.g. stock:asc, price:desc"),
    db: AsyncSession = Depends(get_db),
    current_user: UserDB = Depends(require_admin),
):
    """Retrieves paginated product catalog with stock information."""
    if search and search == "*":
        search = None

    # Build query
    stmt = select(ProductDB)
    if search:
        stmt = stmt.where(ProductDB.name.ilike(f"%{search}%"))

    # Count total (with filters)
    count_stmt = select(func.count(ProductDB.id))
    if search:
        count_stmt = count_stmt.where(ProductDB.name.ilike(f"%{search}%"))
    
    total_items = await db.scalar(count_stmt) or 0
    total_pages = max(1, math.ceil(total_items / limit))

    stmt = stmt.offset((page - 1) * limit).limit(limit)

    # Apply sorting
    if sort:
        parts = sort.split(":")
        field = parts[0]
        direction = parts[1] if len(parts) > 1 else "asc"
        if field == "price":
            col = ProductDB.price
        elif field == "name":
            col = ProductDB.name
        else:
            col = ProductDB.name  # default sort
        stmt = stmt.order_by(col.asc() if direction == "asc" else col.desc())

    result = await db.execute(stmt)
    products = result.scalars().all()

    data = []
    for p in products:
        total_stock, unit, status = _compute_stock_info(p.stock_variants)
        # Use stored SKU or fallback to ID-based for old records
        sku = p.sku
        if not sku:
            short_id = str(p.id)[:8].upper()
            sku = f"SKU-{short_id}"

        data.append({
            "sku": sku,
            "full_id": p.id,
            "name": p.name,
            "description": p.description or "",
            "category": p.category or "Umum",
            "stock": {
                "quantity": total_stock,
                "unit": unit,
                "status": status,
            },
            "price": p.price,
        })

    # If sort is stock-based, sort in Python (since stock is computed from JSONB)
    if sort and sort.startswith("stock"):
        direction = sort.split(":")[1] if ":" in sort else "asc"
        data.sort(key=lambda x: x["stock"]["quantity"], reverse=(direction == "desc"))

    return {
        "data": data,
        "meta": {
            "total_items": total_items,
            "current_page": page,
            "total_pages": total_pages,
        },
    }
