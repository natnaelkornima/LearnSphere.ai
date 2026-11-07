import os
import uuid
import aiofiles
from pathlib import Path
from typing import Optional
import httpx
from app.core.config import settings
from app.core.exceptions import ExternalServiceException


class StorageService:
    def __init__(self):
        self.bucket = settings.SUPABASE_STORAGE_BUCKET
        self.supabase_url = settings.SUPABASE_URL
        self.service_key = settings.SUPABASE_SERVICE_ROLE_KEY
        self.local_storage_root = Path("storage")

    def get_storage_path(self, user_id: uuid.UUID, document_id: uuid.UUID) -> str:
        return f"users/{str(user_id)}/documents/{str(document_id)}/original.pdf"

    async def upload_file(
        self, user_id: uuid.UUID, document_id: uuid.UUID, file_bytes: bytes, content_type: str = "application/pdf"
    ) -> str:
        storage_key = self.get_storage_path(user_id, document_id)

        # If Supabase storage credentials are provided and valid
        if self.supabase_url and not self.supabase_url.startswith("https://dummy"):
            url = f"{self.supabase_url}/storage/v1/object/{self.bucket}/{storage_key}"
            headers = {
                "Authorization": f"Bearer {self.service_key}",
                "Content-Type": content_type,
            }
            async with httpx.AsyncClient() as client:
                resp = await client.post(url, content=file_bytes, headers=headers)
                if resp.status_code not in (200, 201):
                    raise ExternalServiceException(
                        "Supabase Storage", f"Upload failed ({resp.status_code}): {resp.text}"
                    )
            return storage_key

        # Local filesystem storage fallback
        dest_path = self.local_storage_root / storage_key
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        async with aiofiles.open(dest_path, "wb") as f:
            await f.write(file_bytes)
        return storage_key

    async def read_file(self, storage_key: str) -> bytes:
        if self.supabase_url and not self.supabase_url.startswith("https://dummy"):
            url = f"{self.supabase_url}/storage/v1/object/{self.bucket}/{storage_key}"
            headers = {"Authorization": f"Bearer {self.service_key}"}
            async with httpx.AsyncClient() as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code != 200:
                    raise ExternalServiceException(
                        "Supabase Storage", f"Read failed ({resp.status_code}): {resp.text}"
                    )
                return resp.content

        # Local storage fallback
        local_path = self.local_storage_root / storage_key
        if not local_path.exists():
            raise ExternalServiceException("Storage", f"File not found at {storage_key}")
        async with aiofiles.open(local_path, "rb") as f:
            return await f.read()

    async def delete_file(self, storage_key: str) -> bool:
        if self.supabase_url and not self.supabase_url.startswith("https://dummy"):
            url = f"{self.supabase_url}/storage/v1/object/{self.bucket}"
            headers = {
                "Authorization": f"Bearer {self.service_key}",
                "Content-Type": "application/json",
            }
            async with httpx.AsyncClient() as client:
                await client.request("DELETE", url, json={"prefixes": [storage_key]}, headers=headers)
            return True

        local_path = self.local_storage_root / storage_key
        if local_path.exists():
            local_path.unlink()
        return True


storage_service = StorageService()

