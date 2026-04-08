import logging
import asyncio
from typing import List, Dict, Optional
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserLead, CampaignRun
from app.models.user import User as UserModel
from app.services.agency_discovery import AgencyLeadDiscovery
from app.services.agency_pipeline import AgencyEmailValidator
from app.services.outreach import EmailOutreach
from app.core.config import Settings

logger = logging.getLogger(__name__)


class UserLeadGenerator:
    """Generate and deliver leads to users"""

    def __init__(self, db: AsyncSession, settings: Settings) -> None:
        self.db = db
        self.settings = settings
        self.discovery = AgencyLeadDiscovery(settings)
        self.validator = AgencyEmailValidator()
        self.outreach = EmailOutreach(settings)

    async def generate_leads_for_user(
        self, user: UserModel, agency_type: str, location: str, max_leads: int = 50
    ) -> Dict:
        """Generate leads for a specific user"""

        if not user.can_generate_leads():
            return {
                "error": "Lead quota exhausted",
                "quota": user.lead_quota,
                "used": user.leads_used,
            }

        # Create campaign run
        campaign = CampaignRun(
            user_id=user.id, agency_type=agency_type, location=location
        )
        self.db.add(campaign)

        try:
            # Discover leads
            logger.info(f"Discovering leads for {user.email}")
            leads = self.discovery.search_businesses(
                agency_type=agency_type, location=location, max_results=max_leads
            )

            campaign.leads_found = len(leads)

            # Validate and save leads
            validated_count = 0
            saved_leads = []

            for lead_data in leads:
                email = lead_data.get("email")
                if not email:
                    continue

                # Validate email
                result = self.validator.validate_business_email(email)
                if not result["is_valid"]:
                    continue

                validated_count += 1

                # Save lead
                user_lead = UserLead(
                    user_id=user.id,
                    business_name=lead_data.get("business_name", "Unknown"),
                    website=lead_data.get("website"),
                    email=email,
                    phone=lead_data.get("phone"),
                    contact_name=lead_data.get("contact_name")
                    or lead_data.get("contact_person"),
                    industry=lead_data.get("service_type"),
                    location=location,
                    is_redesign_needed=lead_data.get("redesign_needed", False),
                    email_valid=True,
                    status="validated",
                )
                self.db.add(user_lead)
                saved_leads.append(user_lead)

                # Check quota
                if user.leads_used + len(saved_leads) >= user.lead_quota:
                    break

            campaign.leads_validated = len(saved_leads)
            await self.db.commit()

            return {
                "status": "success",
                "leads_found": len(leads),
                "leads_validated": len(saved_leads),
                "saved": len(saved_leads),
            }

        except Exception as e:
            logger.error(f"Lead generation error: {e}")
            campaign.status = "error"
            await self.db.commit()
            return {"error": str(e)}

    async def deliver_leads_to_user(
        self, user: UserModel, leads: List[UserLead]
    ) -> Dict:
        """Deliver leads to user's email"""

        if not leads:
            return {"error": "No leads to deliver"}

        # Build lead report
        lead_rows = []
        for lead in leads:
            status = "✓" if lead.email_valid else "✗"
            row = f"""
{status} {lead.business_name}
   Email: {lead.email or "N/A"}
   Phone: {lead.phone or "N/A"}
   Contact: {lead.contact_name or "N/A"}
   Website: {lead.website or "N/A"}
   Needs Redesign: {"Yes" if lead.is_redesign_needed else "No"}
"""
            lead_rows.append(row)

        report = f"""
🎯 LEADS REPORT
==============
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}
Total Leads: {len(leads)}

{"".join(lead_rows)}

---
Your LeadGen Pro Account
"""

        html_report = f"""
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<h1 style="color: #6366f1;">🎯 Your Leads Are Ready!</h1>
<p>We've found <strong>{len(leads)}</strong> new leads for your agency.</p>

<table style="width: 100%; border-collapse: collapse;">
<tr style="background: #f3f4f6;">
<th style="padding: 10px; text-align: left;">Business</th>
<th style="padding: 10px; text-align: left;">Email</th>
<th style="padding: 10px; text-align: left;">Phone</th>
</tr>
"""

        for lead in leads[:20]:
            html_report += f"""
<tr>
<td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
<strong>{lead.business_name}</strong><br>
<small style="color: #6b7280;">{lead.industry or "N/A"}</small>
</td>
<td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{lead.email or "N/A"}</td>
<td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{lead.phone or "N/A"}</td>
</tr>
"""

        html_report += f"""
</table>

<p style="margin-top: 20px; color: #6b7280;">
Showing first 20 leads. View all leads in your dashboard.
</p>

<hr style="margin: 30px 0;">
<p style="color: #9ca3af; font-size: 12px;">
Your LeadGen Pro Account - {datetime.now().strftime("%Y-%m-%d")}
</p>
</body>
</html>
"""

        try:
            # Send email
            success = await self.outreach.send_email(
                to_email=user.email,
                subject=f"🎯 Your {len(leads)} New Leads Are Ready!",
                body=report,
                html_body=html_report,
            )

            if success:
                # Mark leads as delivered
                for lead in leads:
                    lead.delivered = True
                    lead.delivered_at = datetime.now()

                user.leads_used += len(leads)
                await self.db.commit()

                return {
                    "status": "delivered",
                    "delivered": len(leads),
                    "email": user.email,
                }
            else:
                return {"error": "Failed to send email"}

        except Exception as e:
            logger.error(f"Delivery error: {e}")
            return {"error": str(e)}


# API Endpoint for lead generation
async def run_user_campaign(
    user_id: str,
    agency_type: str,
    location: str,
    max_leads: int,
    db: AsyncSession,
    settings: Settings,
) -> Dict:
    """Run campaign for user"""

    # Get user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        return {"error": "User not found"}

    if not user.is_active:
        return {"error": "Account is disabled"}

    generator = UserLeadGenerator(db, settings)

    # Generate leads
    result = await generator.generate_leads_for_user(
        user=user, agency_type=agency_type, location=location, max_leads=max_leads
    )

    if result.get("error"):
        return result

    # Get leads
    leads_result = await db.execute(
        select(UserLead)
        .where(UserLead.user_id == user.id, UserLead.delivered == False)
        .limit(10)
    )
    leads = leads_result.scalars().all()

    # Deliver to user
    if leads:
        await generator.deliver_leads_to_user(user, leads)

    return {
        "status": "success",
        "leads_generated": result.get("saved", 0),
        "leads_delivered": len(leads),
    }
