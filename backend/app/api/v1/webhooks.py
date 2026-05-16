from fastapi import APIRouter, Request, BackgroundTasks, HTTPException, status
from app.services.agent_service import agent_service
from app.services.waha_service import waha_service
import base64
import httpx
import hmac
import hashlib
from app.core.config import settings
from app.core.logger import logger
import json
import time

PROCESSED_MESSAGES = {}
CACHE_TTL = 300

router = APIRouter()

@router.post("/waha")
async def waha_webhook(request: Request, background_tasks: BackgroundTasks):
    try:
        raw_body = await request.body()
        
        if settings.WHATSAPP_HOOK_HMAC_KEY:
            hmac_header = request.headers.get("x-webhook-hmac")
            if not hmac_header:
                logger.warning("Missing X-Webhook-Hmac header.")
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing HMAC signature")
            
            calculated_hmac = hmac.new(
                key=settings.WHATSAPP_HOOK_HMAC_KEY.encode('utf-8'),
                msg=raw_body,
                digestmod=hashlib.sha512
            ).hexdigest()
            
            if not hmac.compare_digest(calculated_hmac, hmac_header):
                logger.warning("Invalid HMAC signature.")
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid HMAC signature")

        payload = json.loads(raw_body)
        logger.info(f"Received webhook: {payload}")

        event = payload.get("event")
        if event == "message":
            msg_payload = payload.get("payload", {})
            from_number = msg_payload.get("from", "")

            if msg_payload.get("fromMe", False):
                return {"status": "ignored"}

            if from_number.endswith("@g.us"):
                logger.info(f"Ignoring group message from {from_number}")
                return {"status": "ignored", "reason": "group_message"}


            body = msg_payload.get("body", "")
            has_media = msg_payload.get("hasMedia", False)
            message_id_raw = msg_payload.get("id", "")
            
            if isinstance(message_id_raw, dict):
                message_id = message_id_raw.get("_serialized") or str(message_id_raw)
            else:
                message_id = str(message_id_raw)

            current_time = time.time()
            if message_id in PROCESSED_MESSAGES:
                logger.info(f"Duplicate message ignored: {message_id}")
                return {"status": "ignored", "reason": "duplicate"}
                
            PROCESSED_MESSAGES[message_id] = current_time
            keys_to_delete = [k for k, v in PROCESSED_MESSAGES.items() if current_time - v > CACHE_TTL]
            for k in keys_to_delete:
                del PROCESSED_MESSAGES[k]

            participant = msg_payload.get("participant", None)
            
            raw_data = msg_payload.get("_data", {})
            notify_name = raw_data.get("notifyName", "")
            if notify_name:
                import json as _json
                try:
                    parsed = _json.loads(notify_name)
                    if isinstance(parsed, list) and parsed:
                        notify_name = parsed[0]
                except (ValueError, TypeError):
                    pass

            original_lid = None
            if from_number.endswith("@lid"):
                original_lid = from_number
                logger.info(f"LID detected: {from_number}")

                # Gunakan cache internal dari waha_service
                cached = waha_service.get_cached_lid_mapping(original_lid)
                if cached:
                    logger.info(f"  → Resolved LID via cache: {cached}")
                    from_number = cached
                else:
                    resolved = False

                    if participant and "@c.us" in str(participant):
                        logger.info(f"  → Resolved LID via payload.participant: {participant}")
                        from_number = str(participant)
                        resolved = True

                    if not resolved:
                        author = raw_data.get("author", "")
                        if author and "@c.us" in str(author):
                            logger.info(f"  → Resolved LID via _data.author: {author}")
                            from_number = str(author)
                            resolved = True

                    if not resolved:
                        for field in ["from", "chatId"]:
                            candidate = raw_data.get(field, "")
                            if candidate and "@c.us" in str(candidate):
                                logger.info(f"  → Resolved LID via _data.{field}: {candidate}")
                                from_number = str(candidate)
                                resolved = True
                                break

                    if not resolved:
                        id_field = raw_data.get("id", {})
                        if isinstance(id_field, dict):
                            remote = id_field.get("remote", "")
                            if remote and "@c.us" in str(remote):
                                logger.info(f"  → Resolved LID via _data.id.remote: {remote}")
                                from_number = str(remote)
                                resolved = True

                    if not resolved:
                        chat_id = msg_payload.get("chatId", "")
                        if chat_id and "@c.us" in str(chat_id):
                            logger.info(f"  → Resolved LID via payload.chatId: {chat_id}")
                            from_number = str(chat_id)
                            resolved = True

                    if not resolved:
                        logger.warning(f"  → Could NOT resolve LID {original_lid}, will use as-is")
                    else:
                        # Simpan ke cache waha_service agar bisa dipakai di tempat lain
                        waha_service.cache_lid_mapping(original_lid, from_number)

            caption = msg_payload.get("caption", "")
            if caption:
                body = caption

            media_url = None
            if "media" in msg_payload and isinstance(msg_payload["media"], dict):
                media_url = msg_payload["media"].get("url")
                
            if not media_url:
                media_url = msg_payload.get("mediaUrl")

            media_data = None
            if has_media:
                if media_url:
                    media_data = await waha_service.download_media_from_url(media_url)
                else:
                    media_data = await waha_service.download_media_by_id(message_id)
                
                if not media_data:
                    logger.warning(f"Failed to download media for message {message_id}")

            background_tasks.add_task(
                agent_service.handle_incoming_message,
                from_number=from_number,
                message_body=body,
                is_media=has_media,
                media_data=media_data,
                message_id=message_id,
                participant=participant,
                notify_name=notify_name,
            )

        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}