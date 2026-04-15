import re
import logging
from typing import List, Dict, Optional
from datetime import datetime
from urllib.parse import urljoin, urlparse, unquote
import requests
from bs4 import BeautifulSoup

from app.core.config import Settings

logger = logging.getLogger(__name__)


class AgencyLeadDiscovery:
    """Discover potential clients for web development agencies"""

    AGENCY_TYPES = {
        "web_development": [
            "web development company",
            "website design company",
            "digital agency",
            "wordpress developer",
            "shopify developer",
            "react developer",
            "nextjs developer",
            "full stack developer",
        ],
        "ecommerce": [
            "e-commerce development",
            "shopify store",
            "woocommerce developer",
            "magento developer",
            "ecommerce platform",
        ],
        "mobile_app": [
            "mobile app development",
            "ios developer",
            "android developer",
            "react native developer",
            "flutter developer",
        ],
        "seo": [
            "seo company",
            "digital marketing agency",
            "search engine optimization",
        ],
        "video_production": [
            "video production company",
            "video editing",
            "motion graphics",
            "animation studio",
            "corporate video",
        ],
    }

    REDESIGN_INDICATORS = [
        "outdated",
        "old website",
        "new look",
        "redesign",
        "modernize",
        "mobile responsive",
        "responsive design",
        "slow website",
    ]

    HIGH_VALUE_INDUSTRIES = [
        "real estate",
        "healthcare",
        "hospital",
        "clinic",
        "medical",
        "legal",
        "law firm",
        "attorney",
        "restaurant",
        "food",
        "catering",
        "hotel",
        "travel",
        "tourism",
        "finance",
        "insurance",
        "loan",
        "education",
        "training",
        "coaching",
        "retail",
        "fashion",
        "clothing",
        "automotive",
        "car dealer",
        "construction",
    ]

    def __init__(self, settings: Optional[Settings] = None) -> None:
        self.settings = settings or Settings()
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
            }
        )
        self.session.cookies.set("kl", "ADw", domain=".duckduckgo.com")

    def search_businesses(
        self, agency_type: str, location: str = "India", max_results: int = 50
    ) -> List[Dict]:
        """Search for businesses that NEED website services"""
        leads = []

        logger.info(
            f"Starting lead discovery - agency_type: {agency_type}, location: {location}, max_results: {max_results}"
        )

        search_queries = self._build_need_based_queries(agency_type, location)
        logger.info(f"Generated search queries: {search_queries}")

        agency_key = (
            agency_type.lower().replace(" ", "_").replace("+", "_").replace("-", "_")
        )
        if agency_key in self.AGENCY_TYPES:
            for q in self.AGENCY_TYPES[agency_key][:3]:
                search_queries.append(f"{q} {location}")
            logger.info(f"Added fallback queries, total: {len(search_queries)}")

        total_urls_found = 0

        for query in search_queries:
            logger.info(f"=== Processing query: {query} ===")

            urls = self._search_google(query, max_results=max_results)
            logger.info(f"Found {len(urls)} URLs from search")
            total_urls_found += len(urls)

            for url in urls[:max_results]:
                try:
                    lead_data = self._extract_business_info(url, query)
                    if lead_data and lead_data.get("email"):
                        lead_data["redesign_needed"] = True
                        leads.append(lead_data)
                        logger.info(
                            f"Found: {lead_data.get('business_name')} - {lead_data.get('email')}"
                        )
                except Exception as e:
                    logger.error(f"Error extracting {url}: {e}")

        logger.info(
            f"=== SUMMARY: Total URLs: {total_urls_found}, Total leads with email: {len(leads)} ==="
        )
        return leads

    def _build_need_based_queries(self, agency_type: str, location: str) -> List[str]:
        """Build queries that find businesses needing services"""
        base_location = ""
        if location:
            base_location = location.split(",")[0].strip()

        agency_clean = agency_type.lower().replace("+", " ").replace("-", " ").strip()

        queries = []

        if "redesign" in agency_clean or "rebuild" in agency_clean:
            queries = [
                f"business needs website redesign {base_location}",
                f"old website needs update {base_location}",
                f"company looking for redesign {base_location}",
                f"website redesign service {base_location}",
            ]
        elif "saas" in agency_clean or "development" in agency_clean:
            queries = [
                f"need web development company {base_location}",
                f"looking for website developer {base_location}",
                f"business needs new website {base_location}",
                f"startup needs website {base_location}",
            ]
        elif (
            "ecommerce" in agency_clean
            or "shop" in agency_clean
            or "store" in agency_clean
        ):
            queries = [
                f"need ecommerce website {base_location}",
                f"want to sell online {base_location}",
                f"online store development {base_location}",
            ]
        elif "mobile" in agency_clean or "app" in agency_clean:
            queries = [
                f"need mobile app development {base_location}",
                f"want to build app {base_location}",
            ]
        else:
            keywords = agency_clean.split()[:3]
            keyword_queries = []
            for kw in keywords:
                if len(kw) > 2:
                    keyword_queries.append(f"{kw} company {base_location}")

            queries = [
                f"need website services {base_location}",
                f"business needs website {base_location}",
                f"looking for web development {base_location}",
            ]
            queries.extend(keyword_queries[:3])

        return queries[:5]

    def _search_google(self, query: str, max_results: int = 50) -> List[str]:
        """Search using multiple methods"""
        urls = []

        # Method 1: DuckDuckGo HTML
        try:
            logger.info(f"[DDG] Starting search for: {query}")
            response = self.session.post(
                "https://html.duckduckgo.com/html/",
                data={"q": query},
                timeout=30,
                allow_redirects=True,
            )
            logger.info(
                f"[DDG] Status: {response.status_code}, Length: {len(response.text)}"
            )

            if response.status_code == 200 and len(response.text) > 500:
                soup = BeautifulSoup(response.text, "html.parser")

                # Method 1a: Look for encoded links (uddg=)
                for a in soup.find_all("a", href=True):
                    href = a.get("href", "")
                    if "uddg=" in href:
                        match = re.search(r"uddg=([^&]+)", href)
                        if match:
                            url = unquote(match.group(1))
                            if (
                                url.startswith("http")
                                and "duckduckgo" not in url.lower()
                            ):
                                urls.append(url)

                # Method 1b: If no encoded links, look for direct result links
                if not urls:
                    for a in soup.find_all("a", href=True):
                        href = a.get("href", "")
                        if href.startswith("http") and not any(
                            x in href.lower()
                            for x in [
                                "duckduckgo",
                                "bing.com",
                                "microsoft",
                                "google",
                                "yahoo",
                                "facebook",
                                "twitter",
                                "linkedin",
                            ]
                        ):
                            # Include known business listing sites
                            if any(
                                x in href.lower()
                                for x in [
                                    "clutch",
                                    "designrush",
                                    "goodfirms",
                                    "topdesign",
                                    "agency",
                                    "firm",
                                    "company",
                                    "web develop",
                                    "developer",
                                    "digital",
                                ]
                            ):
                                urls.append(href)

                # Method 1c: Regex fallback for any URLs
                if not urls:
                    url_pattern = r'https?://[^"<>\s]+'
                    matches = re.findall(url_pattern, response.text)
                    for url in matches:
                        if not any(
                            x in url.lower()
                            for x in [
                                "duckduckgo",
                                "bing",
                                "microsoft",
                                "google",
                                "yahoo",
                                "facebook",
                                "twitter",
                                "linkedin",
                            ]
                        ):
                            urls.append(url)

                # Dedupe
                unique_urls = list(set(urls))[:max_results]
                logger.info(f"[DDG] Parsed {len(unique_urls)} URLs")
                return unique_urls

        except Exception as e:
            logger.error(f"[DDG] Error: {e}")

        # Method 2: Bing fallback
        try:
            logger.info(f"[BING] Trying fallback for: {query}")
            response = self.session.get(
                "https://www.bing.com/search",
                params={"q": query, "count": max_results},
                timeout=30,
            )
            logger.info(f"[BING] Status: {response.status_code}")

            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")
                for a in soup.find_all("a", href=True):
                    href = a.get("href", "")
                    if href.startswith("http") and "bing" not in href.lower():
                        urls.append(href)

                if not urls:
                    for a in soup.find_all("a"):
                        href = a.get("href", "")
                        if href.startswith("http"):
                            urls.append(href)

                unique_urls = list(set(urls))[:max_results]
                logger.info(f"[BING] Found {len(unique_urls)} URLs")
                return unique_urls
        except Exception as e:
            logger.error(f"[BING] Error: {e}")

        return list(set(urls))[:max_results]

    def _extract_business_info(self, url: str, service_type: str) -> Optional[Dict]:
        """Extract business information from website"""
        try:
            response = self.session.get(url, timeout=15, allow_redirects=True)
            if response.status_code != 200:
                return None

            soup = BeautifulSoup(response.text, "html.parser")

            business_name = self._extract_business_name(soup, url)
            emails = self._extract_emails(response.text)
            phones = self._extract_phones(response.text)
            contact_name = self._extract_contact_name(soup)
            redesign_needed, priority = self._analyze_website(soup, response.text)

            if not emails:
                return None

            valid_emails = [e for e in emails if not self._is_blocked_email(e)]
            if not valid_emails:
                return None

            return {
                "business_name": business_name,
                "website": url,
                "email": valid_emails[0],
                "phone": phones[0] if phones else None,
                "contact_name": contact_name,
                "contact_person": contact_name,
                "service_type": service_type,
                "redesign_needed": redesign_needed,
                "redesign_priority": priority,
                "source": "web_search",
            }

        except Exception as e:
            logger.error(f"Error extracting from {url}: {e}")
            return None

    def _extract_business_name(self, soup: BeautifulSoup, url: str) -> str:
        """Extract business name from website"""
        for meta in soup.find_all("meta"):
            if meta.get("property") == "og:site_name":
                return meta.get("content", "")
            if meta.get("name") in ["application-name", "apple-mobile-web-app-title"]:
                return meta.get("content", "")

        title = soup.find("title")
        if title:
            name = title.text.strip().split("|")[0].split("-")[0].strip()
            if name and len(name) < 100:
                return name

        h1 = soup.find("h1")
        if h1:
            return h1.text.strip()

        domain = urlparse(url).netloc
        name = domain.replace("www.", "").split(".")[0]
        return name.replace("-", " ").title()

    def _extract_emails(self, text: str) -> List[str]:
        """Extract email addresses from text"""
        email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
        emails = re.findall(email_pattern, text)
        return list(set(emails))

    def _extract_phones(self, text: str) -> List[str]:
        """Extract phone numbers from text"""
        phone_patterns = [
            r"\+?91[-.\s]?\d{10}",
            r"\+?1[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}",
            r"\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b",
            r"\(\d{3}\)\s*\d{3}[-.\s]?\d{4}",
            r"\b\d{5}[-.\s]?\d{5}\b",
        ]

        phones = []
        for pattern in phone_patterns:
            phones.extend(re.findall(pattern, text))

        return list(set(phones))

    def _extract_contact_name(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract contact person name from website"""
        contact_patterns = [
            ("a", {"href": re.compile(r"contact", re.I)}),
            ("a", {"href": re.compile(r"about", re.I)}),
            ("a", {"href": re.compile(r"team", re.I)}),
        ]

        for tag, attrs in contact_patterns:
            for elem in soup.find_all(tag, attrs):
                href = elem.get("href", "")
                if "contact" in href.lower():
                    try:
                        if href.startswith("http"):
                            resp = self.session.get(href, timeout=10)
                            contact_soup = BeautifulSoup(resp.text, "html.parser")
                            name = self._find_contact_name_on_page(contact_soup)
                            if name:
                                return name
                    except:
                        pass

        return self._find_contact_name_on_page(soup)

    def _find_contact_name_on_page(self, soup: BeautifulSoup) -> Optional[str]:
        """Find contact name on a page"""
        name_patterns = [
            ("h2", {"class": re.compile(r"contact|name|person", re.I)}),
            ("h3", {"class": re.compile(r"contact|name|person", re.I)}),
            ("p", {"class": re.compile(r"contact|name|person", re.I)}),
            ("div", {"class": re.compile(r"contact|name|person", re.I)}),
        ]

        common_names = [
            "John",
            "David",
            "Mike",
            "Sarah",
            "James",
            "Robert",
            "Michael",
            "Chris",
            "Tom",
            "Alex",
            "Mark",
            "Peter",
            "Steve",
        ]

        for tag, attrs in name_patterns:
            for elem in soup.find_all(tag, attrs):
                text = elem.text.strip()
                for name in common_names:
                    if name.lower() in text.lower():
                        return text.strip()

        return None

    def _analyze_website(self, soup: BeautifulSoup, text: str) -> tuple:
        """Analyze website to determine if redesign is needed"""
        needs_redesign = False
        priority = "low"

        old_design_tags = ["table", "font", "center", "blink"]
        for tag in old_design_tags:
            if soup.find(tag):
                needs_redesign = True
                priority = "high"
                break

        if not soup.find("meta", {"name": "viewport"}):
            needs_redesign = True
            priority = "medium"

        if "slow" in text.lower() or "outdated" in text.lower():
            needs_redesign = True
            priority = "high"

        return needs_redesign, priority

    def _is_blocked_email(self, email: str) -> bool:
        """Check if email is a blocked/no-reply email"""
        email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_pattern, email):
            return True

        bad_extensions = [
            ".png",
            ".jpg",
            ".jpeg",
            ".gif",
            ".svg",
            ".webp",
            ".pdf",
            ".doc",
            ".docx",
            ".ico",
            ".txt",
        ]
        email_lower = email.lower()
        if any(email_lower.endswith(ext) for ext in bad_extensions):
            return True

        local_part = email_lower.split("@")[0] if "@" in email_lower else email_lower
        if local_part.isdigit():
            return True

        blocked_patterns = [
            "noreply",
            "no-reply",
            "no.reply",
            "donotreply",
            "do.not.reply",
            "undelivered",
            "bounce",
            "mailer-daemon",
        ]

        for pattern in blocked_patterns:
            if pattern in local_part:
                return True

        blocked_domains = [
            "mailinator.com",
            "throwaway.email",
            "temp-mail.org",
            "fakeinbox.com",
            "hotmail.com",
            "outlook.com",
            "rediffmail.com",
            "tempmail.com",
        ]

        domain = email_lower.split("@")[1] if "@" in email_lower else ""
        if any(domain.endswith(d) for d in blocked_domains):
            if not any(
                name in local_part
                for name in ["info", "contact", "support", "hello", "team", "admin"]
            ):
                return True

        return False

    def get_agency_types(self) -> Dict[str, List[str]]:
        """Get available agency types"""
        return self.AGENCY_TYPES
