import httpx
from app.core.config import settings
from app.core.logger import logger

class WahaService:
    def __init__(self):
        self.base_url = settings.WAHA_BASE_URL
        self.session = settings.WAHA_SESSION
        self.headers = {"X-Api-Key": settings.WAHA_API_KEY} if settings.WAHA_API_KEY else {}

    async def send_message(self, chat_id: str, text: str):
        async with httpx.AsyncClient(headers=self.headers) as client:
            url = f"{self.base_url}/api/sendText"
            payload = {
                "session": self.session,
                "chatId": chat_id,
                "text": text
            }
            try:
                response = await client.post(url, json=payload, timeout=10.0)
                if response.status_code not in (200, 201):
                    logger.error(f"Failed to send WAHA message to {chat_id}: {response.status_code} - {response.text}")
                    return None
                
                logger.info(f"Successfully sent text message to {chat_id}")
                # Safely parse JSON
                try:
                    return response.json()
                except Exception:
                    # If it's a 200 but empty/non-JSON, just return a success-like dict
                    return {"status": "success"}
            except Exception as e:
                logger.error(f"Exception sending WAHA message: {e}")
                return None

    async def send_image(self, chat_id: str, mimetype: str, filename: str, caption: str = None, base64_data: str = None, image_url: str = None):
        """Send an image via WAHA API. Supports either base64_data or image_url."""
        async with httpx.AsyncClient(headers=self.headers) as client:
            url = f"{self.base_url}/api/sendImage"
            
            file_payload = {
                "mimetype": mimetype,
                "filename": filename,
            }
            
            if image_url:
                file_payload["url"] = image_url
            elif base64_data:
                if not base64_data.startswith("data:"):
                    base64_data = f"data:{mimetype};base64,{base64_data}"
                file_payload["data"] = base64_data
            else:
                logger.error("send_image requires either image_url or base64_data")
                return None
                
            payload = {
                "session": self.session,
                "chatId": chat_id,
                "file": file_payload
            }
            if caption:
                payload["caption"] = caption
                
            try:
                response = await client.post(url, json=payload, timeout=30.0)
                if response.status_code not in (200, 201):
                    logger.error(f"Failed to send WAHA image to {chat_id}: {response.status_code} - {response.text}")
                    return None
                
                logger.info(f"Successfully sent image to {chat_id}")
                # Safely parse JSON
                try:
                    return response.json()
                except Exception:
                    return {"status": "success"}
            except Exception as e:
                logger.error(f"Exception sending WAHA image: {e}")
                return None

    async def send_seen(self, chat_id: str, message_id: str, participant: str = None):
        async with httpx.AsyncClient(headers=self.headers) as client:
            url = f"{self.base_url}/api/sendSeen"
            payload = {
                "session": self.session,
                "chatId": chat_id,
                "messageIds": [message_id],
                "participant": participant,
            }
            try:
                response = await client.post(url, json=payload, timeout=5.0)
                if response.status_code not in (200, 201):
                    logger.error(f"Error sending seen to {chat_id}: {response.status_code} - {response.text}")
                else:
                    logger.info(f"Sent seen status for message {message_id} to {chat_id}")
            except Exception as e:
                logger.error(f"Exception sending seen: {e}")

    async def start_typing(self, chat_id: str):
        async with httpx.AsyncClient(headers=self.headers) as client:
            url = f"{self.base_url}/api/startTyping"
            try:
                response = await client.post(url, json={"session": self.session, "chatId": chat_id}, timeout=5.0)
                if response.status_code not in (200, 201):
                    logger.error(f"Error start typing for {chat_id}: {response.status_code} - {response.text}")
                else:
                    logger.info(f"Started typing indicator for {chat_id}")
            except Exception as e:
                logger.error(f"Exception start typing: {e}")

    async def stop_typing(self, chat_id: str):
        async with httpx.AsyncClient(headers=self.headers) as client:
            url = f"{self.base_url}/api/stopTyping"
            try:
                response = await client.post(url, json={"session": self.session, "chatId": chat_id}, timeout=5.0)
                if response.status_code not in (200, 201):
                    logger.error(f"Error stop typing for {chat_id}: {response.status_code} - {response.text}")
                else:
                    logger.info(f"Stopped typing indicator for {chat_id}")
            except Exception as e:
                logger.error(f"Exception stop typing: {e}")

    async def download_media_from_url(self, media_url: str) -> bytes:
        """Download media bytes directly from a URL (e.g. from WAHA's file server)."""
        async with httpx.AsyncClient(headers=self.headers) as client:
            try:
                response = await client.get(media_url, timeout=30.0)
                response.raise_for_status()
                return response.content
            except Exception as e:
                logger.error(f"Error downloading media from {media_url}: {e}")
                return None

    async def download_media_by_id(self, message_id: str) -> bytes:
        """Download media bytes by requesting the message attachment from WAHA API."""
        async with httpx.AsyncClient(headers=self.headers) as client:
            url = f"{self.base_url}/api/{self.session}/messages/{message_id}/download"
            try:
                response = await client.get(url, timeout=30.0)
                response.raise_for_status()
                return response.content
            except Exception as e:
                logger.error(f"Error downloading media for message {message_id}: {e}")
                return None

    # In-memory LID → phone cache
    _lid_cache: dict[str, str] = {}

    def cache_lid_mapping(self, lid: str, phone: str):
        """Store a LID → phone mapping for future lookups."""
        if lid and phone and lid != phone:
            clean_phone = phone.replace("@c.us", "")
            self._lid_cache[lid] = clean_phone
            logger.info(f"Cached LID mapping: {lid} → {clean_phone}")

    def get_cached_lid_mapping(self, lid: str) -> str | None:
        """Get a cached LID mapping if it exists."""
        return self._lid_cache.get(lid)

    async def resolve_lid_to_phone(self, lid: str) -> str | None:
        """Resolve a LID (@lid) to a phone number. Tries cache first, then WAHA APIs."""
        if not lid.endswith("@lid"):
            return None

        # 1. Check cache
        if lid in self._lid_cache:
            logger.info(f"LID cache hit: {lid} → {self._lid_cache[lid]}")
            return self._lid_cache[lid]

        async with httpx.AsyncClient(headers=self.headers) as client:
            # 2. Try WAHA contacts endpoint
            endpoints = [
                f"{self.base_url}/api/{self.session}/contacts/{lid}",
                f"{self.base_url}/api/{self.session}/contacts/{lid}/about",
                f"{self.base_url}/api/contacts?contactId={lid}&session={self.session}",
            ]
            for url in endpoints:
                try:
                    response = await client.get(url, timeout=5.0)
                    if response.status_code == 200:
                        data = response.json()
                        # Try common fields
                        for field in ["id", "phone", "pn", "number", "chatId"]:
                            val = data.get(field, "")
                            if val and "@c.us" in str(val):
                                phone = str(val).replace("@c.us", "")
                                self.cache_lid_mapping(lid, phone)
                                return phone
                            elif val and val.isdigit() and len(val) > 8:
                                self.cache_lid_mapping(lid, val)
                                return val
                except Exception:
                    continue

            logger.warning(f"Could not resolve LID {lid} via any endpoint")
        return None

waha_service = WahaService()
