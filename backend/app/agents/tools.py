import base64
import httpx
from typing import Dict, Any, List, Optional
from langchain_core.tools import tool
from langchain_core.runnables.config import RunnableConfig
from app.core.config import settings
from app.services.waha_service import waha_service
from app.services.minio_service import minio_service
from app.core.config import settings as app_settings
from app.db.postgres import async_session
from app.models.domain import ComplaintDB, OrderDB
from sqlalchemy import select, desc, String
from datetime import datetime
from app.core.logger import logger

def _get_headers(config: RunnableConfig) -> Dict[str, str]:
    user_jwt = config.get("configurable", {}).get("user_jwt")
    if user_jwt:
        return {"Authorization": f"Bearer {user_jwt}"}
    return {}

def _get_buyer_phone(config: RunnableConfig) -> str:
    """Get the buyer's resolved phone number from config."""
    return config.get("configurable", {}).get("buyer_phone", "")

@tool
async def search_products(query: str, config: RunnableConfig) -> List[Dict[str, Any]]:
    """Search for existing products in the catalog by name.
    ALWAYS call this FIRST before creating or updating products to check if the product already exists.
    Returns product details including id, name, price, category, description, and stock_variants."""
    if query == "*":
        query = ""
    
    async with httpx.AsyncClient() as client:
        url = f"{settings.API_BASE_URL}/api/v1/dashboard/products?search={query}"
        response = await client.get(url, headers=_get_headers(config))
        if response.status_code == 200:
            return response.json().get("items", [])
        return [{"error": f"Failed to search products: {response.text}"}]

@tool
async def create_order(product_name: str, size: str, qty: int, config: RunnableConfig) -> str:
    """Create a new order for the current buyer. The buyer's phone number is automatically used.
    After creating the order, the buyer MUST transfer payment before the order is processed.
    Always tell the buyer the payment instructions after creating the order."""
    if product_name == "*":
        product_name = ""
    
    headers = _get_headers(config)
    buyer_phone = _get_buyer_phone(config)
    
    if not buyer_phone:
        return "Error: Could not determine buyer phone number."
    
    async with httpx.AsyncClient() as client:
        # First find the product ID
        search_url = f"{settings.API_BASE_URL}/api/v1/dashboard/products?search={product_name}"
        search_res = await client.get(search_url, headers=headers)
        if search_res.status_code != 200:
            return f"Error: Could not search for product. {search_res.text}"
        
        items = search_res.json().get("items", [])
        if not items:
            return f"Error: Product '{product_name}' not found."
        
        product = items[0]
        product_id = product["id"]
        price = product["price"]
        
        # Check stock availability
        stock_variants = product.get("stock_variants", {})
        available = stock_variants.get(size, 0)
        if available < qty:
            return f"Error: Insufficient stock for '{product_name}' size {size}. Available: {available}, requested: {qty}."
        
        # Create the order with pending_payment status
        order_url = f"{settings.API_BASE_URL}/api/v1/orders"
        payload = {
            "buyer_phone": buyer_phone,
            "items": [
                {
                    "product_id": product_id,
                    "size": size,
                    "qty": qty,
                    "price": price
                }
            ]
        }
        order_res = await client.post(order_url, json=payload, headers=headers)
        if order_res.status_code == 200:
            order_id = order_res.json().get("order_id")
            total = price * qty
            return (
                f"Order created successfully! Order ID: {order_id}\n"
                f"Product: {product_name} (Size: {size}, Qty: {qty})\n"
                f"Total: Rp {total:,.0f}\n"
                f"Status: PENDING PAYMENT\n\n"
                f"PAYMENT INSTRUCTIONS:\n"
                f"Bank: {settings.COMPANY_BANK_NAME}\n"
                f"Account: {settings.COMPANY_BANK_ACCOUNT}\n"
                f"Holder: {settings.COMPANY_ACCOUNT_HOLDER}\n"
                f"Amount: Rp {total:,.0f}\n\n"
                f"After payment, please send the payment proof image to confirm."
            )
        return f"Failed to create order: {order_res.text}"

@tool
async def update_stock(product_name: str, size: str, quantity_change: int, config: RunnableConfig) -> str:
    """Update stock quantity for an EXISTING product. Use this when the owner wants to add or remove stock.
    Positive quantity_change adds stock, negative removes stock.
    Do NOT use create_product to update stock — use this tool instead."""
    if product_name == "*":
        product_name = ""
    
    headers = _get_headers(config)
    async with httpx.AsyncClient() as client:
        # First find the product ID
        search_url = f"{settings.API_BASE_URL}/api/v1/dashboard/products?search={product_name}"
        search_res = await client.get(search_url, headers=headers)
        if search_res.status_code != 200:
            return f"Error: Could not search for product. {search_res.text}"
        
        items = search_res.json().get("items", [])
        if not items:
            return f"Error: Product '{product_name}' not found."
        
        product = items[0]
        product_id = product["id"]
        variants = product.get("stock_variants", {})
        
        current_stock = variants.get(size, 0)
        variants[size] = current_stock + quantity_change
        
        # Update product
        update_url = f"{settings.API_BASE_URL}/api/v1/dashboard/products/{product_id}"
        payload = {"stock_variants": variants}
        update_res = await client.put(update_url, json=payload, headers=headers)
        if update_res.status_code == 200:
            return f"Successfully updated stock for '{product_name}' size {size}. New total: {variants[size]}."
        return f"Failed to update stock: {update_res.text}"

@tool
async def create_product(name: str, price: float, category: str, description: str, stock_variants: dict, config: RunnableConfig, images: Optional[List[str]] = None) -> str:
    """Create a BRAND NEW product that does NOT exist yet in the catalog.
    IMPORTANT: Before calling this, you MUST first call search_products to verify the product doesn't already exist.
    If the product already exists, use update_stock instead to modify stock quantities.
    Parameters: name, price (in Rupiah), category (e.g. 'Batik Tulis'), description, stock_variants (e.g. {'M': 3, 'L': 10}), images (optional list of image URLs)."""
    if name == "*":
        name = ""
    
    headers = _get_headers(config)
    async with httpx.AsyncClient() as client:
        # Check if product already exists
        search_url = f"{settings.API_BASE_URL}/api/v1/dashboard/products?search={name}"
        search_res = await client.get(search_url, headers=headers)
        if search_res.status_code == 200:
            items = search_res.json().get("items", [])
            if items:
                existing = items[0]
                return (
                    f"Error: Product '{name}' already exists (ID: {existing['id']}). "
                    f"Use update_stock to modify stock quantities instead."
                )
        
        url = f"{settings.API_BASE_URL}/api/v1/dashboard/products"
        payload = {
            "name": name,
            "price": price,
            "category": category,
            "description": description,
            "stock_variants": stock_variants,
            "images": images or []
        }
        response = await client.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            return f"Successfully created product: {response.json().get('product_id')}"
        return f"Failed to create product: {response.text}"
@tool
async def check_order_status(config: RunnableConfig) -> str:
    """Check the status of all orders for the current buyer.
    Use this when the buyer asks about their order status, delivery status, or wants to know
    what happened to their order. The buyer's phone number is automatically used.
    Returns all orders with their current status, product details, payment proof, and amounts."""
    headers = _get_headers(config)
    buyer_phone = _get_buyer_phone(config)
    
    if not buyer_phone:
        return "Error: Could not determine buyer phone number."
    
    async with httpx.AsyncClient() as client:
        # Query orders by buyer phone
        url = f"{settings.API_BASE_URL}/api/v1/dashboard/orders?search={buyer_phone}"
        response = await client.get(url, headers=headers)
        
        if response.status_code != 200:
            return f"Error: Could not fetch orders. {response.text}"
        
        orders = response.json().get("items", [])
        
        if not orders:
            return "No orders found for your account. You haven't placed any orders yet."
        
        return _format_orders(orders, include_buyer=False)


@tool
async def list_all_orders(status_filter: str = "", config: RunnableConfig = None) -> str:
    """List all orders in the system. ONLY for owner/admin use.
    Use this when the owner asks to check orders, see unfinished orders, pending payments, etc.
    
    Parameters:
    - status_filter: Optional comma-separated status filter. You can pass one or multiple statuses.
      Valid values: 'pending_payment', 'paid_unverified', 'processing', 'shipped', 'completed'.
      Examples:
        - Single: 'pending_payment'
        - Multiple: 'pending_payment,paid_unverified,processing'
        - All unfinished: 'pending_payment,paid_unverified,processing,shipped'
        - Leave empty string '' for ALL orders.
    
    Returns full order details including buyer phone, payment proof URL, items, amounts, and status."""
    headers = _get_headers(config)
    
    async with httpx.AsyncClient() as client:
        url = f"{settings.API_BASE_URL}/api/v1/dashboard/orders?limit=50"
        if status_filter:
            url += f"&status={status_filter}"
        
        response = await client.get(url, headers=headers)
        
        if response.status_code != 200:
            return f"Error: Could not fetch orders. {response.text}"
        
        orders = response.json().get("items", [])
        
        if not orders:
            if status_filter:
                return f"No orders found with status '{status_filter}'."
            return "No orders found in the system."
        
        return _format_orders(orders, include_buyer=True)


def _format_orders(orders: list, include_buyer: bool = False) -> str:
    """Format order data into a readable string for the agent."""
    STATUS_LABELS = {
        "pending_payment": "⏳ Menunggu Pembayaran",
        "paid_unverified": "💳 Pembayaran Diterima (Verifikasi)",
        "processing": "🔄 Sedang Diproses",
        "shipped": "🚚 Dalam Pengiriman",
        "completed": "✅ Selesai",
    }
    
    result_lines = [f"Found {len(orders)} order(s):\n"]
    
    for order in orders:
        order_id = str(order.get("id", ""))[:8].upper()
        status_raw = order.get("status", "unknown")
        status_label = STATUS_LABELS.get(status_raw, status_raw.upper())
        total = order.get("total_amount", 0)
        created = order.get("created_at", "N/A")
        awb = order.get("awb_number")
        payment_proof = order.get("payment_proof_url")
        buyer_phone = order.get("buyer_phone", "N/A")
        items = order.get("items", [])
        
        result_lines.append(f"--- Order ORD-{order_id} ---")
        if include_buyer:
            result_lines.append(f"  Buyer Phone: {buyer_phone}")
        result_lines.append(f"  Status: {status_label}")
        result_lines.append(f"  Total: Rp {total:,.0f}")
        result_lines.append(f"  Date: {created}")
        if awb:
            result_lines.append(f"  AWB/Tracking: {awb}")
        if payment_proof:
            result_lines.append(f"  Payment Proof: {payment_proof}")
        else:
            result_lines.append(f"  Payment Proof: Not uploaded yet")
        
        # Show items
        if items:
            for item in items:
                size = item.get("size", "-")
                qty = item.get("qty", 0)
                price = item.get("price", 0)
                prod_name = item.get("product_name", f"Product ID: {item.get('product_id', 'N/A')}")
                result_lines.append(f"  Item: {prod_name} (Size: {size}, Qty: {qty}, @ Rp {price:,.0f})")
        
        result_lines.append("")
    
    return "\n".join(result_lines)


@tool
async def upload_product_image(product_name: str, config: RunnableConfig) -> str:
    """Upload the image that the user sent in this message as a product image.
    Use this when the owner/admin sends a product photo and wants to attach it to an existing product.
    The image from the current message will be automatically used.
    Parameters: product_name (name of the product to attach the image to)."""
    headers = _get_headers(config)
    
    async with httpx.AsyncClient() as client:
        # Find the product
        search_url = f"{settings.API_BASE_URL}/api/v1/dashboard/products?search={product_name}"
        search_res = await client.get(search_url, headers=headers)
        if search_res.status_code != 200:
            return f"Error: Could not search for product. {search_res.text}"
        
        items = search_res.json().get("items", [])
        if not items:
            return f"Error: Product '{product_name}' not found. Create the product first."
        
        product = items[0]
        product_id = product["id"]
        
        # Get media_data from config
        media_data = config.get("configurable", {}).get("media_data")
        if not media_data:
            return "Error: No image found in the current message. Please send a photo."
        
        object_name = minio_service.upload_file(
            file_data=media_data,
            filename="product_image.jpg",
            content_type="image/jpeg",
            folder="product_images",
        )
        image_url = f"{app_settings.DEPLOYED_API_BASE_URL}/api/v1/files/{object_name}"
        
        # Update product images array
        current_images = product.get("images") or []
        current_images.append(image_url)
        
        update_url = f"{settings.API_BASE_URL}/api/v1/dashboard/products/{product_id}"
        update_res = await client.put(
            update_url,
            json={"images": current_images},
            headers=headers,
        )
        if update_res.status_code == 200:
            return f"Successfully uploaded image for '{product_name}'. Image URL: {image_url}. Total images: {len(current_images)}"
        return f"Failed to update product images: {update_res.text}"


@tool
async def send_product_images(product_name: str, config: RunnableConfig) -> str:
    """Send product images to the user via WhatsApp.
    Use this when the user asks to SEE a product, asks for product photos/images/pictures,
    or asks what a product looks like. This will send the actual product images directly
    to the user's WhatsApp chat.
    Parameters: product_name (name of the product to show images of)."""
    headers = _get_headers(config)
    recipient = config.get("configurable", {}).get("recipient")
    
    if not recipient:
        return "Error: Could not determine recipient chat ID."
    
    async with httpx.AsyncClient() as client:
        # Find the product
        search_url = f"{settings.API_BASE_URL}/api/v1/dashboard/products?search={product_name}"
        search_res = await client.get(search_url, headers=headers)
        if search_res.status_code != 200:
            return f"Error: Could not search for product. {search_res.text}"
        
        items = search_res.json().get("items", [])
        if not items:
            return f"Product '{product_name}' not found."
        
        product = items[0]
        images = product.get("images") or []
        
        if not images:
            return f"Product '{product['name']}' has no images yet."
        
        # sent_count = 0
        # from app.core.logger import logger
        
        # for i, image_url in enumerate(images):
        #     try:
        #         # If the image URL uses the deployed base URL, swap it to the internal API base URL
        #         # to avoid Cloudflare 530 errors when the container tries to download from itself
        #         internal_url = image_url
        #         if settings.DEPLOYED_API_BASE_URL and image_url.startswith(settings.DEPLOYED_API_BASE_URL):
        #             internal_url = image_url.replace(settings.DEPLOYED_API_BASE_URL, settings.API_BASE_URL)
                
        #         content_type = "image/jpeg"
        #         if internal_url.lower().endswith(".png"):
        #             content_type = "image/png"
                    
        #         caption = f"📸 {product['name']}" if i == 0 else ""
                
        #         res = await waha_service.send_image(
        #             chat_id=recipient,
        #             image_url=internal_url,
        #             mimetype=content_type,
        #             filename=f"{product['name']}_{i+1}.jpg",
        #             caption=caption,
        #         )
        #         if res is not None:
        #             sent_count += 1
        #         else:
        #             logger.error(f"WAHA send_image failed for '{product['name']}' image {i+1}")
        #     except Exception as e:
        #         logger.error(f"Error in send_product_images loop: {e}")
        #         continue
        
        # if sent_count > 0:
        #     return f"Successfully sent {sent_count} image(s) of '{product['name']}' to the user."
        # return f"Failed to send images for '{product['name']}'. Please check the server logs."

        public_urls = []
        for image_url in images:
            public_url = image_url
            if settings.API_BASE_URL and settings.DEPLOYED_API_BASE_URL and image_url.startswith(settings.API_BASE_URL):
                public_url = image_url.replace(settings.API_BASE_URL, settings.DEPLOYED_API_BASE_URL)
            public_urls.append(public_url)
            
        links_text = "\n".join([f"- {url}" for url in public_urls])
        return f"Found {len(public_urls)} images for '{product['name']}'. Please share these exact links with the user:\n{links_text}"


@tool
async def file_complaint(description: str, config: RunnableConfig, order_id: str = "") -> str:
    """File a complaint or return/refund request on behalf of the buyer.
    Use this when the buyer describes a problem with their product (e.g., defective, wrong item, missing parts) but does not provide an image.
    If the buyer provides an image, it is handled automatically, but for purely text complaints, use this tool.
    The buyer's phone number is automatically used. 
    If the buyer mentions an order ID (e.g., ORD-12345), pass it to the order_id parameter."""
    
    buyer_phone = _get_buyer_phone(config)
    if not buyer_phone:
        return "Error: Could not determine buyer phone number."
    
    try:
        async with async_session() as db:
            recent_order = None
            if order_id:
                clean_order_id = order_id.replace("ORD-", "").lower()
                result_db = await db.execute(
                    select(OrderDB)
                    .where(OrderDB.id.cast(String).ilike(f"{clean_order_id}%"))
                )
                recent_order = result_db.scalar_one_or_none()
            
            if not recent_order:
                # Fallback: Find most recent order for context
                result_db = await db.execute(
                    select(OrderDB)
                    .where(OrderDB.buyer_phone == buyer_phone)
                    .order_by(desc(OrderDB.created_at))
                    .limit(1)
                )
                recent_order = result_db.scalar_one_or_none()
                
            order_id_str = str(recent_order.id) if recent_order else None
            
            complaint = ComplaintDB(
                order_id=order_id_str,
                buyer_phone=buyer_phone,
                description=description,
                status="pending_review",
                created_at=datetime.utcnow()
            )
            db.add(complaint)
            await db.commit()
            logger.info(f"Text complaint saved for {buyer_phone}")
            
            return "Successfully filed the complaint. Our team will review it shortly. Please advise the buyer to provide a photo of the defect if possible, as it will speed up the process."
            
    except Exception as e:
        return f"Failed to file complaint: {str(e)}"

# List of tools for the agent
agent_tools = [search_products, create_order, update_stock, create_product, check_order_status, list_all_orders, upload_product_image, send_product_images, file_complaint]

