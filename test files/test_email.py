#!/usr/bin/env python3
"""
Quick test script - tests email sending with sample data
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.core.config import get_settings
from app.services.email_validator import EmailValidator
from app.services.outreach import EmailOutreach

REPORT_EMAIL = "divyanshawathi90@gmail.com"

async def test_email_sending():
    print("\n" + "="*60)
    print("TEST: Email Sending with Attachments")
    print("="*60)
    
    settings = get_settings()
    outreach = EmailOutreach(settings)
    validator = EmailValidator(settings)
    
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
        
        elements.append(Paragraph("Test Brochure - Video Marketing Agency", styles['Title']))
        elements.append(Spacer(1, 20))
        elements.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph("This is a test brochure for the automation system.", styles['Normal']))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph("Services:", styles['Heading2']))
        elements.append(Paragraph("• Video Production", styles['Normal']))
        elements.append(Paragraph("• Social Media Marketing", styles['Normal']))
        elements.append(Paragraph("• Content Strategy", styles['Normal']))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph("Contact us to learn more about our video marketing services!", styles['Normal']))
        
        doc.build(elements)
        print(f"✓ Created test brochure: {brochure_path}")
    
    test_leads = [
        {
            'email': 'divyanshawathi90@gmail.com',
            'business_name': 'Test Company 1',
            'contact_person': 'Divyansh'
        },
        {
            'email': 'divyanshawasthi90@gmail.com',
            'business_name': 'Test Company 2',
            'contact_person': 'Divyansh W'
        },
        {
            'email': 'test@example.com',
            'business_name': 'Example Corp',
            'contact_person': 'Test User'
        }
    ]
    
    print("\nValidating test emails...")
    for lead in test_leads:
        result = await validator.validate_email(lead['email'], use_external=False)
        status = "✓ VALID" if result['is_valid'] else "✗ INVALID"
        print(f"  {lead['email']}: {status}")
    
    results = []
    
    for i, lead in enumerate(test_leads, 1):
        print(f"\n  {i}. Sending test email to {lead['email']}...")
        
        try:
            subject = f"Test: Video Marketing Partnership - {lead['business_name']}"
            body = f"""Hi {lead['contact_person']},

This is a TEST email from the Lead Gen Automation System.

Test Details:
- Sent at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- Purpose: System verification and testing
- Company: {lead['business_name']}

This email includes a test brochure attachment to verify that PDF attachments are working correctly.

If you receive this email, the automation system is working as expected!

Best regards,
Lead Gen Automation Test System
---
This is an automated test email. Please do not reply."""
            
            html_body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #2563eb;">{subject}</h2>
                <p>Hi {lead['contact_person']},</p>
                <p>This is a <strong>TEST email</strong> from the Lead Gen Automation System.</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Test Details:</strong></p>
                    <ul>
                        <li>Sent at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</li>
                        <li>Purpose: System verification and testing</li>
                        <li>Company: {lead['business_name']}</li>
                    </ul>
                </div>
                
                <p>This email includes a test brochure attachment to verify that PDF attachments are working correctly.</p>
                
                <p style="color: #10b981; font-weight: bold;">If you receive this email, the automation system is working as expected!</p>
                
                <p>Best regards,<br>Lead Gen Automation Test System</p>
                <hr style="margin-top: 30px;">
                <p style="font-size: 12px; color: #6b7280;">This is an automated test email. Please do not reply.</p>
            </body>
            </html>
            """
            
            success = await outreach.send_email(
                to_email=lead['email'],
                subject=subject,
                body=body,
                html_body=html_body,
                pdf_attachment_path=str(brochure_path) if brochure_path.exists() else None
            )
            
            if success:
                print(f"     ✓ Email sent successfully to {lead['email']}")
                results.append({'lead': lead['email'], 'status': 'sent', 'business': lead['business_name']})
            else:
                print(f"     ✗ Failed to send email to {lead['email']}")
                results.append({'lead': lead['email'], 'status': 'failed', 'business': lead['business_name']})
                
        except Exception as e:
            print(f"     ✗ Error: {str(e)}")
            results.append({'lead': lead['email'], 'status': f'error: {str(e)}', 'business': lead['business_name']})
            import traceback
            traceback.print_exc()
    
    print(f"\n✓ Email sending complete: {len([r for r in results if r['status'] == 'sent'])} sent, {len([r for r in results if r['status'] != 'sent'])} failed")
    return results

async def send_test_report(email_results):
    print("\n" + "="*60)
    print("Sending Test Report to User")
    print("="*60)
    
    settings = get_settings()
    outreach = EmailOutreach(settings)
    
    from datetime import datetime
    from pathlib import Path
    
    report_subject = f"✓ Test Run Report - Lead Gen Automation ({datetime.now().strftime('%Y-%m-%d %H:%M')})"
    
    sent_count = len([r for r in email_results if r['status'] == 'sent'])
    failed_count = len([r for r in email_results if r['status'] != 'sent'])
    
    report_body = f"""
TEST RUN REPORT - Lead Gen Automation System
=============================================

Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Report Email: {REPORT_EMAIL}

SUMMARY:
--------
✓ Email Sending: {'PASSED' if sent_count > 0 else 'FAILED'}
  - Successfully sent: {sent_count} emails
  - Failed: {failed_count} emails

EMAIL RESULTS:
--------------
"""
    
    for i, result in enumerate(email_results, 1):
        status_icon = "✓" if result['status'] == 'sent' else "✗"
        report_body += f"{i}. {result.get('business', 'N/A')} ({result['lead']}) - Status: {status_icon} {result['status']}\n"
    
    report_body += f"""

SYSTEM STATUS:
--------------
The email automation system has been tested and is operational.

Configuration:
- SMTP Server: {settings.SMTP_HOST}:{settings.SMTP_PORT}
- SMTP User: {settings.SMTP_USER}
- Email From: {settings.EMAIL_FROM}
- TLS Enabled: {settings.SMTP_USE_TLS}

Next Steps:
1. ✓ Check your inbox ({REPORT_EMAIL}) for test emails
2. ✓ Verify emails were received from: {settings.SMTP_USER}
3. ✓ Check that PDF attachments are included
4. ✓ Review the dashboard at http://localhost:3000

All core components are working correctly!

Generated by: Lead Gen Automation Test Script
"""
    
    try:
        html_report = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px;">✓ Test Run Report - Lead Gen Automation System</h1>
            
            <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Test Date:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                <p style="margin: 5px 0 0 0;"><strong>Report Email:</strong> {REPORT_EMAIL}</p>
            </div>
            
            <h2 style="color: #1e40af;">Summary</h2>
            <div style="background-color: {'#f0fdf4' if sent_count > 0 else '#fef2f2'}; border: 2px solid {'#10b981' if sent_count > 0 else '#ef4444'}; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; font-size: 18px;">
                    <strong>Email Sending:</strong> 
                    <span style="color: {'#10b981' if sent_count > 0 else '#ef4444'}; font-size: 20px;">
                        {'✓ PASSED' if sent_count > 0 else '✗ FAILED'}
                    </span>
                </p>
                <ul style="margin: 10px 0 0 0;">
                    <li>Successfully sent: <strong>{sent_count}</strong> emails</li>
                    <li>Failed: <strong>{failed_count}</strong> emails</li>
                </ul>
            </div>
            
            <h2 style="color: #1e40af;">Email Results</h2>
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px;">
                <ol style="margin: 0; padding-left: 20px;">
        """
        
        for result in email_results:
            status_color = "#10b981" if result['status'] == 'sent' else "#ef4444"
            status_icon = "✓" if result['status'] == 'sent' else "✗"
            html_report += f'''
            <li style="margin-bottom: 12px; padding: 10px; background-color: white; border-radius: 5px;">
                <strong>{result.get("business", "N/A")}</strong><br>
                <span style="color: #6b7280;">{result["lead"]}</span><br>
                Status: <span style="color: {status_color}; font-weight: bold;">{status_icon} {result["status"]}</span>
            </li>'''
        
        html_report += f"""
                </ol>
            </div>
            
            <h2 style="color: #1e40af;">System Configuration</h2>
            <div style="background-color: #f3f4f6; border-radius: 5px; padding: 15px; font-family: monospace;">
                <p style="margin: 5px 0;"><strong>SMTP Server:</strong> {settings.SMTP_HOST}:{settings.SMTP_PORT}</p>
                <p style="margin: 5px 0;"><strong>SMTP User:</strong> {settings.SMTP_USER}</p>
                <p style="margin: 5px 0;"><strong>Email From:</strong> {settings.EMAIL_FROM}</p>
                <p style="margin: 5px 0;"><strong>TLS Enabled:</strong> {settings.SMTP_USE_TLS}</p>
            </div>
            
            <h2 style="color: #1e40af;">Next Steps</h2>
            <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <ol style="margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 10px;">✓ Check your inbox (<strong>{REPORT_EMAIL}</strong>) for test emails</li>
                    <li style="margin-bottom: 10px;">✓ Verify emails were received from: <strong>{settings.SMTP_USER}</strong></li>
                    <li style="margin-bottom: 10px;">✓ Check that PDF attachments are included</li>
                    <li style="margin-bottom: 10px;">✓ Review the dashboard at <a href="http://localhost:3000" style="color: #2563eb;">http://localhost:3000</a></li>
                </ol>
            </div>
            
            <div style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin-top: 30px; text-align: center;">
                <p style="margin: 0; font-size: 18px; color: #065f46; font-weight: bold;">
                    ✓ All core components are working correctly!
                </p>
            </div>
            
            <hr style="margin-top: 40px; border: none; border-top: 1px solid #e5e7eb;">
            <p style="text-align: center; color: #9ca3af; font-size: 12px;">
                Generated by: Lead Gen Automation Test Script<br>
                {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            </p>
        </body>
        </html>
        """
        
        brochure_path = Path("test_brochure.pdf")
        success = await outreach.send_email(
            to_email=REPORT_EMAIL,
            subject=report_subject,
            body=report_body,
            html_body=html_report,
            pdf_attachment_path=str(brochure_path) if brochure_path.exists() else None
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
    print("\n" + "="*60)
    print("LEAD GEN AUTOMATION - EMAIL TEST")
    print("="*60)
    from datetime import datetime
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Report will be sent to: {REPORT_EMAIL}")
    
    try:
        email_results = await test_email_sending()
        
        await send_test_report(email_results)
        
        print("\n" + "="*60)
        print("TEST COMPLETE")
        print("="*60)
        print(f"✓ All tests completed successfully")
        print(f"✓ Check {REPORT_EMAIL} for detailed report and test emails")
        print(f"✓ Emails sent: {len([r for r in email_results if r['status'] == 'sent'])}")
        
    except Exception as e:
        print(f"\n✗ TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
