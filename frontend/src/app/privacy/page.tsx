'use client';

import GlassCard from '@/components/GlassCard';

export default function PrivacyPage() {
  return (
    <div className="flex-1 dashboard-preview" style={{ padding: '2rem 4rem', background: 'var(--parchment)', minHeight: 'calc(100vh - 80px)' }}>
      <div className="db-header reveal visible">
        <div className="section-tag">Legal</div>
        <div>
          <h2 className="section-title">Privacy <em>Policy</em></h2>
        </div>
      </div>

      <div className="reveal visible" style={{ maxWidth: '800px', margin: '0 auto', marginTop: '3rem' }}>
        <GlassCard>
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.9rem' }}>
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(184,169,138,0.2)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--espresso)', marginBottom: '1rem', fontFamily: '"Cormorant Garamond", serif' }}>1. Information We Collect</h3>
              <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                We collect information you provide directly to us, including:
              </p>
              <ul style={{ color: 'var(--umber)', lineHeight: 1.8, fontSize: '0.9rem', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <li><strong>Account Information:</strong> Name, email address, company name when you register</li>
                <li><strong>Company Details:</strong> Business description, target industry, location preferences</li>
                <li><strong>SMTP Credentials:</strong> Email address and App Password for sending campaigns (stored securely encrypted)</li>
                <li><strong>Lead Data:</strong> Contact information of leads you generate through our platform</li>
                <li><strong>Usage Data:</strong> How you interact with our platform, features used, and campaign performance</li>
              </ul>
            </div>

            <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(184,169,138,0.2)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--espresso)', marginBottom: '1rem', fontFamily: '"Cormorant Garamond", serif' }}>2. How We Use Your Information</h3>
              <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                We use the collected information to:
              </p>
              <ul style={{ color: 'var(--umber)', lineHeight: 1.8, fontSize: '0.9rem', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>Provide, maintain, and improve our lead generation services</li>
                <li>Generate and deliver leads based on your target criteria</li>
                <li>Send email campaigns to your leads using your SMTP credentials</li>
                <li>Generate reports on campaign performance and lead metrics</li>
                <li>Communicate with you about your account and provide customer support</li>
                <li>Protect against fraud, abuse, and illegal activity</li>
              </ul>
            </div>

            <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(184,169,138,0.2)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--espresso)', marginBottom: '1rem', fontFamily: '"Cormorant Garamond", serif' }}>3. Data Storage and Security</h3>
              <ul style={{ color: 'var(--umber)', lineHeight: 1.8, fontSize: '0.9rem', paddingLeft: '1.5rem' }}>
                <li><strong>Storage:</strong> Your data is stored in secure databases with encryption at rest</li>
                <li><strong>SMTP Credentials:</strong> Passwords are encrypted using industry-standard encryption (PBKDF2 with SHA-256)</li>
                <li><strong>Access Control:</strong> Only authorized personnel can access your data</li>
                <li><strong>Retention:</strong> We retain your data as long as your account is active or as needed to provide services</li>
                <li><strong>Deletion:</strong> You can request deletion of your data at any time</li>
              </ul>
            </div>

            <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(184,169,138,0.2)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--espresso)', marginBottom: '1rem', fontFamily: '"Cormorant Garamond", serif' }}>4. Third-Party Services</h3>
              <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                We may share your information with third-party service providers who assist us in operating our platform:
              </p>
              <ul style={{ color: 'var(--umber)', lineHeight: 1.8, fontSize: '0.9rem', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <li><strong>Email Services:</strong> SMTP providers for sending your campaigns (only uses your credentials as you configure)</li>
                <li><strong>Email Validation:</strong> Third-party services to validate lead email addresses</li>
                <li><strong>Analytics:</strong> Tools to understand platform usage and improve services</li>
                <li><strong>Cloud Infrastructure:</strong> Hosting and database services</li>
              </ul>
              <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.9rem', marginTop: '1rem' }}>
                These providers are bound by confidentiality agreements and are prohibited from using your data for any other purpose.
              </p>
            </div>

            <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(184,169,138,0.2)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--espresso)', marginBottom: '1rem', fontFamily: '"Cormorant Garamond", serif' }}>5. Your Rights</h3>
              <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                You have the following rights regarding your personal data:
              </p>
              <ul style={{ color: 'var(--umber)', lineHeight: 1.8, fontSize: '0.9rem', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate personal data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data ("Right to be forgotten")</li>
                <li><strong>Data Portability:</strong> Request your data in a structured, machine-readable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
              </ul>
            </div>

            <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(184,169,138,0.2)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--espresso)', marginBottom: '1rem', fontFamily: '"Cormorant Garamond", serif' }}>6. Lead Data and Email Campaigns</h3>
              <ul style={{ color: 'var(--umber)', lineHeight: 1.8, fontSize: '0.9rem', paddingLeft: '1.5rem' }}>
                <li><strong>Your Leads:</strong> Leads you generate are owned by you. We do not use your lead data for our own purposes</li>
                <li><strong>Campaign Sending:</strong> Emails are sent using your SMTP credentials - we never store or use your email content</li>
                <li><strong>Email Compliance:</strong> You are responsible for ensuring your email campaigns comply with CAN-SPAM, GDPR, and other applicable laws</li>
                <li><strong>Unsubscribe:</strong> All sent emails include an unsubscribe option</li>
              </ul>
            </div>

            <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(184,169,138,0.2)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--espresso)', marginBottom: '1rem', fontFamily: '"Cormorant Garamond", serif' }}>7. Cookies and Tracking</h3>
              <ul style={{ color: 'var(--umber)', lineHeight: 1.8, fontSize: '0.9rem', paddingLeft: '1.5rem' }}>
                <li><strong>Essential Cookies:</strong> Required for authentication and platform functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our platform</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                You can control cookies through your browser settings.
              </p>
            </div>

            <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(184,169,138,0.2)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--espresso)', marginBottom: '1rem', fontFamily: '"Cormorant Garamond", serif' }}>8. Children's Privacy</h3>
              <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                Our services are not intended for individuals under the age of 16. We do not knowingly collect personal information from children.
              </p>
            </div>

            <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(184,169,138,0.2)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--espresso)', marginBottom: '1rem', fontFamily: '"Cormorant Garamond", serif' }}>9. Changes to This Policy</h3>
              <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--espresso)', marginBottom: '1rem', fontFamily: '"Cormorant Garamond", serif' }}>10. Contact Us</h3>
              <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                <strong>Email:</strong> support@leadgenius.ai<br />
                <strong>Address:</strong> LeadGenius Inc., [Your Address]
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}