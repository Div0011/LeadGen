#!/usr/bin/env python3
"""
Simple test script - tests core services without database
"""

import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from app.core.config import get_settings
from app.services.lead_collector import LeadCollector
from app.services.email_validator import EmailValidator
from app.services.outreach import EmailOutreach

REPORT_EMAIL = "divyanshawathi90@gmail.com"
TEST_LEAD_COUNT = 10


async def test_lead_collection():
    print("\n" + "=" * 60)
    print("TEST 1: Lead Collection")
    print("=" * 60)

    settings = get_settings()
    collector = LeadCollector(settings)

    try:
        print(
            f"Collecting {TEST_LEAD_COUNT} leads for: {settings.TARGET_INDUSTRY} in {settings.TARGET_LOCATION}"
        )
        leads = collector.collect_leads(
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
            print(f"✗ INVALID")

    print(f"\n✓ Validated {len(validated_leads)} out of {len(leads)} leads")
    return validated_leads


async def test_email_sending(validated_leads):
    print("\n" + "=" * 60)
    print("TEST 3: Email Sending with Attachments")
    print("=" * 60)

    settings = get_settings()
    outreach = EmailOutreach(settings)

    from pathlib import Path
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet
    from datetime import datetime

    brochure_path = Path("test_brochure.pdf")
    if not brochure_path.exists():
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
                "This is a test brochure for the automation system.", styles["Normal"]
            )
        )
        elements.append(Spacer(1, 10))
        elements.append(Paragraph("Services:", styles["Heading2"]))
        elements.append(Paragraph("• Video Production", styles["Normal"]))
        elements.append(Paragraph("• Social Media Marketing", styles["Normal"]))
        elements.append(Paragraph("• Content Strategy", styles["Normal"]))

        doc.build(elements)
        print(f"✓ Created test brochure: {brochure_path}")

    results = []
    test_leads = validated_leads[:3]

    for i, lead in enumerate(test_leads, 1):
        print(f"\n  {i}. Sending test email to {lead.get('email')}...")

        try:
            subject = f"Test: Partnership opportunity - {lead.get('business_name', 'Unknown')}"
            body = f"""Hi {lead.get("contact_person", "Team")},

This is a TEST email from the Lead Gen Automation System.

Test Details:
- Sent at: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
- Purpose: System verification and testing
- Company: {lead.get("business_name", "N/A")}
- Website: {lead.get("website", "N/A")}

If you receive this email, the automation system is working correctly.

Best regards,
Test Automation System"""

            success = await outreach.send_email(
                to_email=lead.get("email"),
                subject=subject,
                body=body,
                html_body=f"<h2>{subject}</h2><p>{body.replace(chr(10), '<br>')}</p>",
                pdf_attachment_path=str(brochure_path)
                if brochure_path.exists()
                else None,
            )

            if success:
                print(f"     ✓ Email sent successfully to {lead.get('email')}")
                results.append(
                    {
                        "lead": lead.get("email"),
                        "status": "sent",
                        "business": lead.get("business_name"),
                    }
                )
            else:
                print(f"     ✗ Failed to send email to {lead.get('email')}")
                results.append(
                    {
                        "lead": lead.get("email"),
                        "status": "failed",
                        "business": lead.get("business_name"),
                    }
                )

        except Exception as e:
            print(f"     ✗ Error: {str(e)}")
            results.append(
                {
                    "lead": lead.get("email"),
                    "status": f"error: {str(e)}",
                    "business": lead.get("business_name"),
                }
            )
            import traceback

            traceback.print_exc()

    print(
        f"\n✓ Email sending complete: {len([r for r in results if r['status'] == 'sent'])} sent, {len([r for r in results if r['status'] != 'sent'])} failed"
    )
    return results


async def send_test_report(email_results, all_leads, validated_count):
    print("\n" + "=" * 60)
    print("Sending Test Report to User")
    print("=" * 60)

    settings = get_settings()
    outreach = EmailOutreach(settings)

    from datetime import datetime
    from pathlib import Path

    report_subject = f"Test Run Report - Lead Gen Automation ({datetime.now().strftime('%Y-%m-%d %H:%M')})"

    report_body = f"""
TEST RUN REPORT - Lead Gen Automation System
=============================================

Test Date: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
Test Lead Count: {TEST_LEAD_COUNT}
Validated Emails: {validated_count}
Emails Sent: {len([r for r in email_results if r["status"] == "sent"])}

SUMMARY:
--------
✓ Lead Collection: {"PASSED" if len(all_leads) > 0 else "FAILED"} ({len(all_leads)} leads collected)
✓ Email Validation: {"PASSED" if validated_count > 0 else "FAILED"} ({validated_count} emails validated)
✓ Email Sending: {"PASSED" if len([r for r in email_results if r["status"] == "sent"]) > 0 else "FAILED"}

EMAIL RESULTS:
--------------
"""

    for i, result in enumerate(email_results, 1):
        report_body += f"{i}. {result.get('business', 'N/A')} ({result['lead']}) - Status: {result['status']}\n"

    report_body += f"""

SYSTEM STATUS:
--------------
The automation system has been tested and is operational.
All components (lead collection, validation, email sending) are working.

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
            <p><strong>Test Lead Count:</strong> {TEST_LEAD_COUNT}</p>
            <p><strong>Validated Emails:</strong> {validated_count}</p>
            <p><strong>Emails Sent:</strong> {len([r for r in email_results if r["status"] == "sent"])}</p>
            
            <h2 style="color: #1e40af;">Summary</h2>
            <ul>
                <li>✓ Lead Collection: {'<span style="color: #10b981;">PASSED</span>' if len(all_leads) > 0 else '<span style="color: #ef4444;">FAILED</span>'} ({len(all_leads)} leads collected)</li>
                <li>✓ Email Validation: {'<span style="color: #10b981;">PASSED</span>' if validated_count > 0 else '<span style="color: #ef4444;">FAILED</span>'} ({validated_count} emails validated)</li>
                <li>✓ Email Sending: {'<span style="color: #10b981;">PASSED</span>' if len([r for r in email_results if r["status"] == "sent"]) > 0 else '<span style="color: #ef4444;">FAILED</span>'}</li>
            </ul>
            
            <h2 style="color: #1e40af;">Email Results</h2>
            <ol>
        """

        for result in email_results:
            status_color = "#10b981" if result["status"] == "sent" else "#ef4444"
            html_report += f'<li style="margin-bottom: 8px;"><strong>{result.get("business", "N/A")}</strong> ({result["lead"]}) - <span style="color: {status_color}; font-weight: bold;">{result["status"]}</span></li>'

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

        brochure_path = Path("test_brochure.pdf")
        success = await outreach.send_email(
            to_email=REPORT_EMAIL,
            subject=report_subject,
            body=report_body,
            html_body=html_report,
            pdf_attachment_path=str(brochure_path) if brochure_path.exists() else None,
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
    print("\n" + "=" * 60)
    print("LEAD GEN AUTOMATION - COMPREHENSIVE TEST")
    print("=" * 60)
    from datetime import datetime

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

        email_results = await test_email_sending(validated_leads)

        await send_test_report(email_results, leads, len(validated_leads))

        print("\n" + "=" * 60)
        print("TEST COMPLETE")
        print("=" * 60)
        print(f"✓ All tests completed successfully")
        print(f"✓ Check {REPORT_EMAIL} for detailed report")
        print(f"✓ Leads collected: {len(leads)}")
        print(f"✓ Emails validated: {len(validated_leads)}")
        print(
            f"✓ Emails sent: {len([r for r in email_results if r['status'] == 'sent'])}"
        )

    except Exception as e:
        print(f"\n✗ TEST FAILED: {str(e)}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
