import re
import logging
from typing import List, Dict, Optional

import httpx

from app.core.config import Settings

logger = logging.getLogger(__name__)

BLOCKED_PREFIXES = [
    "support@",
    "info@",
    "admin@",
    "noreply@",
    "sales@",
    "help@",
    "contact@",
]


class EmailValidator:
    def __init__(self, settings: Optional[Settings] = None) -> None:
        self.settings = settings or Settings()

    def validate_syntax(self, email: str) -> bool:
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        return bool(re.match(pattern, email))

    def is_blocked_prefix(self, email: str) -> bool:
        return any(email.lower().startswith(prefix) for prefix in BLOCKED_PREFIXES)

    async def validate_with_hunter(self, email: str, domain: str) -> Dict[str, bool]:
        if not self.settings.HUNTER_IO_API_KEY:
            return {"valid": None, "source": "hunter_io_skipped"}
        url = "https://api.hunter.io/v2/email-verifier"
        params = {
            "email": email,
            "api_key": self.settings.HUNTER_IO_API_KEY,
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=10.0)
                response.raise_for_status()
                data = response.json()
                result = data.get("data", {})
                return {
                    "valid": result.get("status") == "valid",
                    "score": result.get("score"),
                    "source": "hunter_io",
                }
        except Exception as e:
            logger.warning(f"Hunter.io validation failed: {e}")
            return {"valid": None, "source": "hunter_io_error"}

    async def validate_with_zerobounce(self, email: str) -> Dict[str, bool]:
        if not self.settings.ZEROBOUNCE_API_KEY:
            return {"valid": None, "source": "zerobounce_skipped"}
        url = "https://api.zerobounce.net/v2/validate"
        params = {
            "api_key": self.settings.ZEROBOUNCE_API_KEY,
            "email": email,
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=10.0)
                response.raise_for_status()
                data = response.json()
                return {
                    "valid": data.get("status") == "valid",
                    "sub_status": data.get("sub_status"),
                    "source": "zerobounce",
                }
        except Exception as e:
            logger.warning(f"ZeroBounce validation failed: {e}")
            return {"valid": None, "source": "zerobounce_error"}

    async def validate_email(
        self,
        email: str,
        use_external: bool = True,
    ) -> Dict[str, any]:
        result = {
            "email": email,
            "syntax_valid": False,
            "blocked_prefix": False,
            "external_valid": None,
            "is_valid": False,
        }

        if not self.validate_syntax(email):
            result["error"] = "Invalid email syntax"
            return result
        result["syntax_valid"] = True

        if self.is_blocked_prefix(email):
            result["blocked_prefix"] = True
            result["error"] = "Blocked email prefix"
            return result

        if use_external:
            domain = email.split("@")[-1]
            hunter_result = await self.validate_with_hunter(email, domain)
            zerobounce_result = await self.validate_with_zerobounce(email)

            external_results = [hunter_result, zerobounce_result]
            valid_results = [r for r in external_results if r.get("valid") is not None]

            if valid_results:
                result["external_valid"] = all(r["valid"] for r in valid_results)
                result["is_valid"] = result["external_valid"]
            else:
                result["is_valid"] = True
        else:
            result["is_valid"] = True

        return result

    async def validate_batch(
        self,
        emails: List[str],
        use_external: bool = True,
    ) -> List[Dict[str, any]]:
        results = []
        for email in emails:
            result = await self.validate_email(email, use_external)
            results.append(result)
        return results
