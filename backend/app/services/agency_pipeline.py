import re
import logging
from typing import List, Dict, Optional
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)


class AgencyEmailValidator:
    """Enhanced email validation for business contacts"""

    # Blocked email patterns - only truly generic/noreply addresses
    BLOCKED_PREFIXES = [
        "noreply",
        "no-reply",
        "noreply",
        "donotreply",
        "do.not.reply",
        "do-not-reply",
        "undelivered",
        "bounce",
        "mailer-daemon",
        "invalid",
        "test",
        "fake",
        "example",
        "null",
        "admin@admin",
    ]

    # Allowed domains (business domains)
    ALLOWED_BUSINESS_DOMAINS = [
        "co.in",
        "in",
        "com",
        "net",
        "org",
        "co.uk",
        "com.au",
        "ae",
        "sa",
        "sg",
        "my",
        "ph",
        "th",
        "vn",
        "id",
    ]

    # Suspicious TLDs
    SUSPICIOUS_TLDS = [
        "xyz",
        "top",
        "click",
        "loan",
        "work",
        "date",
        "racing",
        "download",
        "stream",
        "accountant",
        "review",
        "science",
    ]

    def __init__(self) -> None:
        pass

    def validate_business_email(self, email: str) -> Dict:
        """Comprehensive business email validation"""
        result = {
            "email": email,
            "is_valid": False,
            "syntax_valid": False,
            "blocked_prefix": False,
            "suspicious_domain": False,
            "allowed_domain": False,
            "is_catchall": False,
            "validation_method": "internal",
            "confidence_score": 0,
        }

        if not email or "@" not in email:
            return result

        email = email.strip().lower()

        # 1. Syntax validation
        syntax_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(syntax_pattern, email):
            return result
        result["syntax_valid"] = True

        # 2. Check blocked prefix
        local_part = email.split("@")[0]
        for blocked in self.BLOCKED_PREFIXES:
            if local_part.startswith(blocked) or local_part == blocked:
                result["blocked_prefix"] = True
                return result

        result["blocked_prefix"] = False

        # 3. Check domain
        domain = email.split("@")[1] if "@" in email else ""

        # Check suspicious TLDs
        for tld in self.SUSPICIOUS_TLDS:
            if domain.endswith(f".{tld}"):
                result["suspicious_domain"] = True
                return result

        # Check allowed business domains
        for allowed in self.ALLOWED_BUSINESS_DOMAINS:
            if domain.endswith(f".{allowed}") or domain == allowed:
                result["allowed_domain"] = True
                break

        # 4. Calculate confidence
        score = 0
        if result["syntax_valid"]:
            score += 30
        if not result["blocked_prefix"]:
            score += 30
        if not result["suspicious_domain"]:
            score += 20
        if result["allowed_domain"]:
            score += 20

        result["confidence_score"] = score
        result["is_valid"] = score >= 50 and result["syntax_valid"]

        return result

    def validate_batch(self, emails: List[str]) -> List[Dict]:
        """Validate a batch of emails"""
        results = []
        for email in emails:
            result = self.validate_business_email(email)
            if result["is_valid"]:
                results.append(result)
        return results

    def get_best_email(self, emails: List[str]) -> Optional[str]:
        """Get the best validated email from a list"""
        results = self.validate_batch(emails)
        if not results:
            return None

        # Sort by confidence score
        results.sort(key=lambda x: x["confidence_score"], reverse=True)
        return results[0]["email"]


class AgencyOutreach:
    """Send brochures to target leads"""

    def __init__(self, settings) -> None:
        self.settings = settings
        self.validator = AgencyEmailValidator()

    def create_brochure_email(
        self, agency_name: str, agency_services: str, to_name: str, to_company: str
    ) -> Dict:
        """Create personalized brochure email"""

        subject_templates = {
            "web_development": f"Quick question about {to_company}'s website",
            "ecommerce": f"New website for {to_company}?",
            "mobile_app": f"Mobile app for {to_company}?",
            "seo": f"Digital marketing for {to_company}",
            "video_production": f"Video content for {to_company}",
        }

        body_template = f"""Hi {to_name},

I came across {to_company} and noticed your online presence could benefit from some improvements.

As a {agency_name} offering {agency_services}, we'd love to help you with:

• Modern, responsive website design
• Improved user experience  
• Better conversion optimization
• Professional online presence

Would you be open to a quick 15-minute call to discuss your needs?

Best regards,
{agency_name} Team

---
This is an automated outreach. Please reply if interested."""

        service_type = getattr(self.settings, "TARGET_INDUSTRY", "web_development")
        subject = subject_templates.get(
            service_type, subject_templates["web_development"]
        )

        return {"subject": subject, "body": body_template}

    async def send_brochure_email(
        self,
        to_email: str,
        to_name: str,
        to_company: str,
        subject: str,
        body: str,
        brochure_path: str = None,
        html_body: str = None,
    ) -> bool:
        """Send brochure email"""
        from app.services.outreach import EmailOutreach

        outreach = EmailOutreach(self.settings)

        try:
            return await outreach.send_email(
                to_email=to_email,
                subject=subject,
                body=body,
                html_body=html_body,
                pdf_attachment_path=brochure_path,
            )
        except Exception as e:
            logger.error(f"Failed to send brochure email: {e}")
            return False


class AgencyPipeline:
    """Full pipeline for agency outreach automation"""

    def __init__(self, db, settings) -> None:
        self.db = db
        self.settings = settings
        self.discovery = AgencyLeadDiscovery(settings)
        self.validator = AgencyEmailValidator()
        self.outreach = AgencyOutreach(settings)
        self.progress = {
            "stage": "idle",
            "progress": 0,
            "total": 0,
            "processed": 0,
            "errors": [],
        }

    async def run_agency_pipeline(
        self,
        agency_type: str,
        agency_name: str,
        agency_url: str,
        agency_services: str,
        brochure_path: str = None,
        location: str = "India",
        max_leads: int = 50,
    ) -> Dict:
        """Run the full agency outreach pipeline"""

        try:
            # Stage 1: Discover leads (10%)
            self.progress = {
                "stage": "discovering",
                "progress": 10,
                "total": max_leads,
                "processed": 0,
                "errors": [],
            }

            leads = self.discovery.search_businesses(
                agency_type=agency_type, location=location, max_results=max_leads
            )

            self.progress["processed"] = len(leads)

            # Stage 2: Validate emails (40%)
            self.progress["stage"] = "validating"
            self.progress["progress"] = 40

            validated_leads = []
            for lead in leads:
                email = lead.get("email")
                if email:
                    result = self.validator.validate_business_email(email)
                    if result["is_valid"]:
                        lead["email_valid"] = True
                        lead["validation_score"] = result["confidence_score"]
                        validated_leads.append(lead)

            self.progress["processed"] = len(validated_leads)

            # Stage 3: Priority leads for redesign (60%)
            self.progress["stage"] = "prioritizing"
            self.progress["progress"] = 60

            priority_leads = []
            for lead in validated_leads:
                if lead.get("redesign_needed"):
                    priority_leads.append(lead)
                    if lead.get("redesign_priority") == "high":
                        lead["priority"] = "high"

                # Add leads without redesign but in high-value industries
                elif any(
                    ind in lead.get("business_name", "").lower()
                    for ind in self.discovery.HIGH_VALUE_INDUSTRIES
                ):
                    priority_leads.append(lead)

            priority_leads.sort(key=lambda x: x.get("priority", "low"), reverse=True)
            self.progress["processed"] = len(priority_leads)

            # Stage 4: Send brochures (80%)
            self.progress["stage"] = "sending"
            self.progress["progress"] = 80

            sent_count = 0
            sent_leads = []

            for lead in priority_leads[:10]:  # Send to top 10 leads
                to_email = lead.get("email")
                to_name = (
                    lead.get("contact_name") or lead.get("contact_person") or "Team"
                )
                to_company = lead.get("business_name")

                if not to_email:
                    continue

                email_body = self.outreach.create_brochure_email(
                    agency_name=agency_name,
                    agency_services=agency_services,
                    to_name=to_name,
                    to_company=to_company,
                )

                try:
                    success = await self.outreach.send_brochure_email(
                        to_email=to_email,
                        to_name=to_name,
                        to_company=to_company,
                        subject=email_body["subject"],
                        body=email_body["body"],
                        brochure_path=brochure_path,
                    )

                    if success:
                        sent_count += 1
                        lead["status"] = "sent"
                        sent_leads.append(lead)

                except Exception as e:
                    self.progress["errors"].append(
                        f"Failed to send to {to_email}: {str(e)}"
                    )

            # Complete
            self.progress["stage"] = "completed"
            self.progress["progress"] = 100

            return {
                "status": "completed",
                "discovered": len(leads),
                "validated": len(validated_leads),
                "priority": len(priority_leads),
                "sent": sent_count,
                "leads": sent_leads,
                "errors": self.progress["errors"],
            }

        except Exception as e:
            logger.error(f"Pipeline error: {e}")
            self.progress["stage"] = "error"
            self.progress["errors"].append(str(e))
            return {"status": "error", "error": str(e), "progress": self.progress}

    def get_progress(self) -> Dict:
        """Get pipeline progress"""
        return self.progress.copy()
