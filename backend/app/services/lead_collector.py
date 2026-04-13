import re
import logging
from typing import List, Dict, Optional
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

from app.core.config import Settings

logger = logging.getLogger(__name__)


class LeadCollector:
    def __init__(self, settings: Optional[Settings] = None) -> None:
        self.settings = settings or Settings()
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        )

    def search_duckduckgo(self, query: str) -> List[str]:
        url = "https://html.duckduckgo.com/html/"
        params = {"q": query}
        try:
            response = self.session.post(
                url,
                data=params,
                timeout=self.settings.REQUEST_TIMEOUT,
            )
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            links = []
            for a in soup.find_all("a", class_="result__snippet"):
                href = a.get("href")
                if href:
                    match = re.search(r"uddg=([^&]+)", href)
                    if match:
                        from urllib.parse import unquote

                        links.append(unquote(match.group(1)))
            return links[: self.settings.DUCKDUCKGO_MAX_RESULTS]
        except Exception as e:
            logger.error(f"DuckDuckGo search failed: {e}")
            return []

    def extract_email_from_website(self, url: str) -> Optional[str]:
        try:
            response = self.session.get(url, timeout=self.settings.REQUEST_TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            text = soup.get_text()
            emails = re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
            for email in emails:
                email_lower = email.lower()
                if not any(
                    email_lower.startswith(prefix)
                    for prefix in [
                        "support@",
                        "info@",
                        "admin@",
                        "noreply@",
                        "sales@",
                        "helpdesk@",
                        "customer.service@",
                        "customerservice@",
                        "cs@",
                        "contact@",
                        "enquiries@",
                        "hello@",
                        "webmaster@",
                    ]
                ):
                    return email
            contact_page = self._find_contact_page(url, soup)
            if contact_page:
                return self.extract_email_from_website(contact_page)
            return None
        except Exception as e:
            logger.warning(f"Failed to extract email from {url}: {e}")
            return None

    def _find_contact_page(self, url: str, soup: BeautifulSoup) -> Optional[str]:
        for a in soup.find_all("a", href=True):
            href = a["href"].lower()
            if "contact" in href or "about" in href:
                return urljoin(url, a["href"])
        return None

    def collect_leads(
        self,
        target_industry: str,
        target_location: Optional[str] = None,
        max_leads: int = 50,
    ) -> List[Dict[str, str]]:
        query = f"{target_industry}"
        if target_location:
            query += f" in {target_location}"
        query += " business contact email"

        logger.info(f"Searching for: {query}")
        urls = self.search_duckduckgo(query)
        leads = []

        for url in urls[:max_leads]:
            if len(leads) >= max_leads:
                break
            email = self.extract_email_from_website(url)
            if email:
                lead = {
                    "business_name": self._extract_business_name(url),
                    "website": url,
                    "contact_person": None,
                    "email": email,
                    "linkedin": None,
                    "source": "duckduckgo",
                }
                leads.append(lead)
                logger.info(f"Found lead: {lead['business_name']} ({email})")

        logger.info(f"Collected {len(leads)} leads")
        return leads

    def _extract_business_name(self, url: str) -> str:
        try:
            domain = url.split("//")[-1].split("/")[0]
            name = domain.replace("www.", "").split(".")[0]
            return name.replace("-", " ").title()
        except Exception:
            return "Unknown Business"
