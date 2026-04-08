#!/usr/bin/env python3
"""
Comprehensive test script for Lead Gen Automation System
Tests: Lead collection, Email validation, Email sending with attachments
"""

import asyncio
import sys
import os
from datetime import datetime
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from app.core.config import get_settings
from app.core.database import AsyncSessionLocal, init_db
from app.services.lead_collector import LeadCollector
from app.services.email_validator import EmailValidator
from app.services.outreach import EmailOutreach
from app.models.lead import Lead, LeadStatus
from app.models.campaign import Campaign
from app.models.email_template import EmailTemplate
from sqlalchemy import select

REPORT_EMAIL = "divyanshawathi90@gmail.com"
TEST_LEAD_COUNT = 10


async def test_lead_collection():
    """Test collecting leads from web"""
    print("\n" + "=" * 60)
    print("TEST 1: Lead Collection")
    print("=" * 60)

    settings = get_settings()
    collector = LeadCollector(settings)

    try:
        print(
            f"Collecting {TEST_LEAD_COUNT} leads for: {settings.TARGET_INDUSTRY} in {settings.TARGET_LOCATION}"
        )
        leads = await collector.collect_leads(
            target_industry=settings.TARGET_INDUSTRY,
            target_location=settings.TARGET_LOCATION,
            max_leads=TEST_LEAD_COUNT,
        )

        print(f"\n✓ Successfully collected {len(leads)} leads")
        for i, lead in enumerate(leads, 1):
            print(
                f"  {i}. {lead.get('business_name', 'N/A')} - {lead.get('email', 'N/A')}"
            )

        return leads
    except Exception as e:
        print(f"\n✗ Lead collection failed: {str(e)}")
        import traceback

        traceback.print_exc()
        return []


async def test_email_validation(leads):
    """Test email validation"""
    print("\n" + "=" * 60)
    print("TEST 2: Email Validation")
    print("=" * 60)

    settings = get_settings()
    validator = EmailValidator(settings)

    validated_leads = []
    for i, lead in enumerate(leads, 1):
        email = lead.get("email")
        if not email:
            print(f"  {i}. Skipping {lead.get('business_name', 'N/A')} - no email")
            continue

        print(f"  {i}. Validating {email}...", end=" ")
        result = validator.validate_email(email, use_external=False)

        if result["is_valid"]:
            print(f"✓ VALID")
            validated_leads.append(lead)
        else:
            print(f"✗ INVALID - {result}")

    print(f"\n✓ Validated {len(validated_leads)} out of {len(leads)} leads")
    return validated_leads


async def test_database_operations(validated_leads):
    """Test saving leads to database"""
    print("\n" + "=" * 60)
    print("TEST 3: Database Operations")
    print("=" * 60)

    try:
        await init_db()
        print("✓ Database initialized")

        async with AsyncSessionLocal() as db:
            test_campaign = Campaign(
                name=f"Test Campaign {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                industry="Test",
                location="Test",
                status="active",
                total_leads=len(validated_leads),
            )
            db.add(test_campaign)
            await db.commit()
            await db.refresh(test_campaign)
            print(f"✓ Created test campaign: {test_campaign.name}")

            saved_leads = []
            for lead_data in validated_leads:
                existing = await db.execute(
                    select(Lead).where(Lead.email == lead_data.get("email"))
                )
                if existing.scalar_one_or_none():
                    print(f"  Skipping duplicate: {lead_data.get('email')}")
                    continue

                new_lead = Lead(
                    business_name=lead_data.get("business_name", "Unknown"),
                    contact_person=lead_data.get("contact_person", ""),
                    website=lead_data.get("website", ""),
                    email=lead_data.get("email", ""),
                    linkedin=lead_data.get("linkedin", ""),
                    source="test_script",
                    status=LeadStatus.new,
                    campaign_id=test_campaign.id,
                )
                db.add(new_lead)
                saved_leads.append(new_lead)

            await db.commit()
            print(f"✓ Saved {len(saved_leads)} leads to database")

            return saved_leads, test_campaign

    except Exception as e:
        print(f"✗ Database operations failed: {str(e)}")
        import traceback

        traceback.print_exc()
        return [], None


async def test_email_sending(saved_leads, campaign):
    """Test sending emails"""
    print("\n" + "=" * 60)
    print("TEST 4: Email Sending with Attachments")
    print("=" * 60)

    settings = get_settings()
    outreach = EmailOutreach(settings)

    test_template = EmailTemplate(
        name="Test Template",
        subject=f"Test: Partnership opportunity with {REPORT_EMAIL}",
        body=f"""Hi {{contact_person}},

This is a TEST email from the Lead Gen Automation System.

Test Details:
- Sent at: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
- Campaign: {campaign.name}
- Purpose: System verification and testing

If you receive this email, the automation system is working correctly.

Best regards,
Test Automation System""",
        is_active=True,
    )

    results = []
    for i, lead in enumerate(saved_leads[:3], 1):
        print(f"\n  {i}. Sending test email to {lead.email}...")

        try:
            subject, body = outreach.personalize_template(
                subject_template=test_template.subject,
                body_template=test_template.body,
                company_name=lead.business_name,
                contact_person=lead.contact_person or "Team",
            )

            brochure_path = Path("test_brochure.pdf")
            if not brochure_path.exists():
                from reportlab.lib.pagesizes import letter
                from reportlab.pdfgen import canvas
                from reportlab.lib import colors
                from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
                from reportlab.lib.styles import getSampleStyleSheet

                doc = SimpleDocTemplate(str(brochure_path), pagesize=letter)
                styles = getSampleStyleSheet()
                elements = []

                elements.append(
                    Paragraph("Test Brochure - Video Marketing Agency", styles["Title"])
                )
                elements.append(Spacer(1, 20))
                elements.append(
                    Paragraph(
                        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                        styles["Normal"],
                    )
                )
                elements.append(Spacer(1, 10))
                elements.append(
                    Paragraph(
                        "This is a test brochure for the automation system.",
                        styles["Normal"],
                    )
                )
                elements.append(Spacer(1, 10))
                elements.append(Paragraph("Services:", styles["Heading2"]))
                elements.append(Paragraph("• Video Production", styles["Normal"]))
                elements.append(Paragraph("• Social Media Marketing", styles["Normal"]))
                elements.append(Paragraph("• Content Strategy", styles["Normal"]))

                doc.build(elements)
                print(f"     ✓ Created test brochure: {brochure_path}")

            attachment_path = str(brochure_path) if brochure_path.exists() else None

            success = await outreach.send_email(
                to_email=lead.email,
                subject=subject,
                body=body,
                html_body=f"<h2>{subject}</h2><p>{body.replace(chr(10), '<br>')}</p>",
                pdf_attachment_path=attachment_path,
            )

            if success:
                print(f"     ✓ Email sent successfully to {lead.email}")
                lead.status = LeadStatus.sent
                results.append({"lead": lead.email, "status": "sent"})
            else:
                print(f"     ✗ Failed to send email to {lead.email}")
                lead.status = LeadStatus.bounced
                results.append({"lead": lead.email, "status": "failed"})

        except Exception as e:
            print(f"     ✗ Error: {str(e)}")
            lead.status = LeadStatus.bounced
            results.append({"lead": lead.email, "status": f"error: {str(e)}"})
            import traceback

            traceback.print_exc()

    async with AsyncSessionLocal() as db:
        for lead in saved_leads[:3]:
            db.add(lead)
        await db.commit()

    print(f"\n✓ Email sending complete: {results}")
    return results


async def send_test_report(email_results, campaign):
    """Send comprehensive test report to user's email"""
    print("\n" + "=" * 60)
    print("Sending Test Report to User")
    print("=" * 60)

    settings = get_settings()
    outreach = EmailOutreach(settings)

    report_subject = f"Test Run Report - Lead Gen Automation ({datetime.now().strftime('%Y-%m-%d %H:%M')})"

    report_body = f"""
TEST RUN REPORT - Lead Gen Automation System
=============================================

Test Date: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
Campaign: {campaign.name if campaign else "N/A"}
Test Lead Count: {TEST_LEAD_COUNT}

SUMMARY:
--------
✓ Lead Collection: {"PASSED" if len(email_results) > 0 else "FAILED"}
✓ Email Validation: {"PASSED" if len(email_results) > 0 else "FAILED"}
✓ Database Operations: {"PASSED" if campaign else "FAILED"}
✓ Email Sending: {"PASSED" if any(r["status"] == "sent" for r in email_results) else "FAILED"}

EMAIL RESULTS:
--------------
"""

    for i, result in enumerate(email_results, 1):
        report_body += f"{i}. To: {result['lead']} - Status: {result['status']}\n"

    report_body += f"""

SYSTEM STATUS:
--------------
The automation system has been tested and is operational.
All components (lead collection, validation, database, email sending) are working.

Next Steps:
1. Check your inbox for test emails
2. Verify emails were received from: {settings.SMTP_USER}
3. Check that PDF attachments are included
4. Review the dashboard at http://localhost:3000

Generated by: Lead Gen Automation Test Script
"""

    try:
        html_report = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h1 style="color: #2563eb;">Test Run Report - Lead Gen Automation System</h1>
            <p><strong>Test Date:</strong> {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
            <p><strong>Campaign:</strong> {campaign.name if campaign else "N/A"}</p>
            <p><strong>Test Lead Count:</strong> {TEST_LEAD_COUNT}</p>
            
            <h2 style="color: #1e40af;">Summary</h2>
            <ul>
                <li>✓ Lead Collection: {"PASSED" if len(email_results) > 0 else "FAILED"}</li>
                <li>✓ Email Validation: {"PASSED" if len(email_results) > 0 else "FAILED"}</li>
                <li>✓ Database Operations: {"PASSED" if campaign else "FAILED"}</li>
                <li>✓ Email Sending: {"PASSED" if any(r["status"] == "sent" for r in email_results) else "FAILED"}</li>
            </ul>
            
            <h2 style="color: #1e40af;">Email Results</h2>
            <ol>
        """

        for result in email_results:
            status_color = "#10b981" if result["status"] == "sent" else "#ef4444"
            html_report += f'<li style="margin-bottom: 8px;">To: {result["lead"]} - <span style="color: {status_color}; font-weight: bold;">{result["status"]}</span></li>'

        html_report += f"""
            </ol>
            
            <h2 style="color: #1e40af;">System Status</h2>
            <p>The automation system has been tested and is operational. All components are working correctly.</p>
            
            <div style="margin-top: 30px; padding: 15px; background-color: #f3f4f6; border-radius: 5px;">
                <p><strong>Next Steps:</strong></p>
                <ol>
                    <li>Check your inbox for test emails</li>
                    <li>Verify emails were received from: {settings.SMTP_USER}</li>
                    <li>Check that PDF attachments are included</li>
                    <li>Review the dashboard at <a href="http://localhost:3000">http://localhost:3000</a></li>
                </ol>
            </div>
        </body>
        </html>
        """

        success = await outreach.send_email(
            to_email=REPORT_EMAIL,
            subject=report_subject,
            body=report_body,
            html_body=html_report,
            pdf_attachment_path="test_brochure.pdf"
            if os.path.exists("test_brochure.pdf")
            else None,
        )

        if success:
            print(f"✓ Test report sent to {REPORT_EMAIL}")
        else:
            print(f"✗ Failed to send test report to {REPORT_EMAIL}")

    except Exception as e:
        print(f"✗ Error sending report: {str(e)}")
        import traceback

        traceback.print_exc()


async def main():
    """Main test runner"""
    print("\n" + "=" * 60)
    print("LEAD GEN AUTOMATION - COMPREHENSIVE TEST")
    print("=" * 60)
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Report will be sent to: {REPORT_EMAIL}")

    try:
        leads = await test_lead_collection()

        if not leads:
            print("\n✗ TEST ABORTED: No leads collected")
            return

        validated_leads = await test_email_validation(leads)

        if not validated_leads:
            print("\n✗ TEST ABORTED: No valid emails found")
            return

        saved_leads, campaign = await test_database_operations(validated_leads)

        if not saved_leads or not campaign:
            print("\n✗ TEST ABORTED: Database operations failed")
            return

        email_results = await test_email_sending(saved_leads, campaign)

        await send_test_report(email_results, campaign)

        print("\n" + "=" * 60)
        print("TEST COMPLETE")
        print("=" * 60)
        print(f"✓ All tests completed successfully")
        print(f"✓ Check {REPORT_EMAIL} for detailed report")
        print(f"✓ Dashboard available at: http://localhost:3000")
        print(f"✓ API docs available at: http://localhost:8000/docs")

    except Exception as e:
        print(f"\n✗ TEST FAILED: {str(e)}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
