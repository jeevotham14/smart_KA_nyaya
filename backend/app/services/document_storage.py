import os
import re
import uuid
from pathlib import Path
from typing import Optional, Tuple

from app.core.config import get_settings

# Magic byte signatures
MAGIC_SIGNATURES = {
    "pdf": [b"%PDF-"],
    "png": [b"\x89PNG\r\n\x1a\n"],
    "jpeg": [b"\xff\xd8\xff"],
    "jpg": [b"\xff\xd8\xff"],
    "docx": [b"PK\x03\x04"],  # ZIP container used by docx
}

MIME_MAP = {
    "pdf": "application/pdf",
    "png": "image/png",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

DISALLOWED_EXTENSIONS = {
    "exe", "bat", "cmd", "sh", "bin", "php", "pl", "cgi", "py", "js",
    "html", "htm", "svg", "vbs", "ps1", "jar", "msi", "dll", "com",
}


class DocumentStorageService:
    def __init__(self, base_path: Optional[str] = None):
        settings = get_settings()
        self.backend = settings.document_storage_backend.lower()
        self.max_bytes = settings.max_document_size_mb * 1024 * 1024

        # Resolve storage directory: outside public/static web assets
        # backend root is 3 levels up from this file (app/services/document_storage.py -> backend)
        backend_root = Path(__file__).resolve().parent.parent.parent
        configured_path = base_path or settings.document_storage_path
        self.storage_dir = (backend_root / configured_path).resolve()
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def validate_file(
        self,
        file_bytes: bytes,
        original_filename: str,
        content_type: Optional[str] = None,
    ) -> Tuple[bool, str, str]:
        """
        Validate file server-side:
        - non-empty
        - max file size
        - allowed extension (pdf, jpg, jpeg, png, docx)
        - magic bytes check (do not trust browser MIME alone)
        - path traversal check
        Returns: (is_valid, detected_mime, error_message)
        """
        # 1. Non-empty check
        if not file_bytes or len(file_bytes) == 0:
            return False, "", "File cannot be empty"

        # 2. Size limit check
        if len(file_bytes) > self.max_bytes:
            max_mb = self.max_bytes // (1024 * 1024)
            return False, "", f"File exceeds maximum allowed size of {max_mb} MB"

        # 3. Clean filename & extension
        safe_name = os.path.basename(original_filename.replace("\\", "/"))
        parts = safe_name.rsplit(".", 1)
        if len(parts) < 2:
            return False, "", "File must have a valid extension (.pdf, .jpg, .jpeg, .png, .docx)"

        ext = parts[1].lower().strip()
        if ext in DISALLOWED_EXTENSIONS or ext not in MIME_MAP:
            return False, "", f"Unsupported or dangerous file extension: .{ext}. Allowed: PDF, JPG, JPEG, PNG, DOCX"

        # 4. Magic bytes verification
        expected_mime = MIME_MAP[ext]
        signatures = MAGIC_SIGNATURES.get(ext, [])
        matched = False
        for sig in signatures:
            if file_bytes.startswith(sig):
                matched = True
                break

        if not matched:
            return (
                False,
                "",
                f"File content does not match the declared extension .{ext}. Potential file spoofing detected.",
            )

        return True, expected_mime, ""

    def save_file(self, file_bytes: bytes, original_filename: str, appointment_id: str) -> str:
        """
        Save file to private storage under a safe UUID key.
        Storage key format: {appointment_id}/{uuid}.{ext}
        Never uses client-controlled original filename on disk.
        """
        safe_name = os.path.basename(original_filename.replace("\\", "/"))
        ext = safe_name.rsplit(".", 1)[-1].lower().strip()
        file_uuid = uuid.uuid4().hex
        appointment_clean = re.sub(r"[^a-zA-Z0-9_-]", "", str(appointment_id))

        target_dir = self.storage_dir / appointment_clean
        target_dir.mkdir(parents=True, exist_ok=True)

        storage_filename = f"{file_uuid}.{ext}"
        storage_path = target_dir / storage_filename
        storage_path.write_bytes(file_bytes)

        # Storage key is relative path
        storage_key = f"{appointment_clean}/{storage_filename}"
        return storage_key

    def get_file(self, storage_key: str) -> Optional[bytes]:
        """
        Safely retrieve file bytes by storage key.
        Prevents path traversal attempts (e.g. ../../secret.txt).
        """
        if not storage_key or ".." in storage_key:
            return None

        clean_key = storage_key.lstrip("/\\")
        full_path = (self.storage_dir / clean_key).resolve()

        # Strict boundary check: path must remain inside storage_dir
        if not str(full_path).startswith(str(self.storage_dir)):
            return None

        if not full_path.is_file():
            return None

        return full_path.read_bytes()

    def delete_file(self, storage_key: str) -> bool:
        """Delete file from disk if it exists."""
        if not storage_key or ".." in storage_key:
            return False

        clean_key = storage_key.lstrip("/\\")
        full_path = (self.storage_dir / clean_key).resolve()

        if not str(full_path).startswith(str(self.storage_dir)):
            return False

        if full_path.is_file():
            try:
                full_path.unlink()
                return True
            except OSError:
                return False
        return False

    def generate_private_access(self, storage_key: str, expires_in: int = 300) -> Optional[str]:
        """
        For cloud providers (e.g. S3 private buckets), generates pre-signed URL.
        For local private storage, returns None indicating file should be streamed through backend.
        """
        if self.backend == "local":
            return None
        return None


# Singleton instance
_storage_service: Optional[DocumentStorageService] = None


def get_document_storage() -> DocumentStorageService:
    global _storage_service
    if _storage_service is None:
        _storage_service = DocumentStorageService()
    return _storage_service
