'use client';

import GlassCard from '@/components/GlassCard';
import { Zap, Users, Mail, Settings, Target, FileText, BarChart3, Clock, CheckCircle } from 'lucide-react';

export default function GuidePage() {
  return (
    <div className="flex-1 dashboard-preview" style={{ padding: '2rem 4rem', background: 'var(--parchment)', minHeight: 'calc(100vh - 80px)' }}>
      <div className="db-header reveal visible">
        <div className="section-tag">Help & Tutorials</div>
        <div>
          <h2 className="section-title">Platform <em>Guide</em></h2>
        </div>
      </div>

      <div className="reveal visible" style={{ maxWidth: '900px', margin: '0 auto', marginTop: '3rem' }}>
        <GlassCard>
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Introduction */}
            <div style={{ paddingBottom: '2rem', borderBottom: '1px solid rgba(184,169,138,0.2)' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--espresso)', marginBottom: '1rem', fontFamily: '"Cormorant Garamond", serif' }}>
                Welcome to LeadGenius
              </h3>
              <p style={{ color: 'var(--umber)', lineHeight: 1.8, fontSize: '0.95rem' }}>
                LeadGenius is an AI-powered lead generation and outreach automation platform. Our intelligent system helps you find, validate, and engage with potential customers automatically. Here's how to get the most out of our platform.
              </p>
            </div>

            {/* What AI Does */}
            <div style={{ paddingBottom: '2rem', borderBottom: '1px solid rgba(184,169,138,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Zap size={22} color="var(--gold)" />
                <h3 style={{ fontSize: '1.25rem', color: 'var(--espresso)', margin: 0, fontFamily: '"Cormorant Garamond", serif' }}>What AI Does For You</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.4)', borderRadius: '8px', border: '1px solid rgba(184,169,138,0.2)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--rust)', marginBottom: '0.5rem' }}>Smart Lead Discovery</h4>
                  <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.85rem', margin: 0 }}>
                    AI searches and discovers potential leads based on your target industry, location, and criteria using advanced web scraping and data enrichment.
                  </p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.4)', borderRadius: '8px', border: '1px solid rgba(184,169,138,0.2)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--rust)', marginBottom: '0.5rem' }}>Email Validation</h4>
                  <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.85rem', margin: 0 }}>
                    Our AI validates each lead's email address to ensure deliverability, reducing bounce rates and improving campaign performance.
                  </p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.4)', borderRadius: '8px', border: '1px solid rgba(184,169,138,0.2)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--rust)', marginBottom: '0.5rem' }}>Personalized Outreach</h4>
                  <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.85rem', margin: 0 }}>
                    AI personalizes email templates with lead-specific details like company name and contact person for higher engagement.
                  </p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.4)', borderRadius: '8px', border: '1px solid rgba(184,169,138,0.2)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--rust)', marginBottom: '0.5rem' }}>Response Monitoring</h4>
                  <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.85rem', margin: 0 }}>
                    AI automatically detects and categorizes email responses - positive replies, out-of-office, and rejections for effective follow-ups.
                  </p>
                </div>
              </div>
            </div>

            {/* Step by Step Guide */}
            <div style={{ paddingBottom: '2rem', borderBottom: '1px solid rgba(184,169,138,0.2)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--espresso)', marginBottom: '1.5rem', fontFamily: '"Cormorant Garamond", serif' }}>Step-by-Step Setup Guide</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--espresso)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: 'var(--ivory)', fontWeight: 600 }}>1</span>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, color: 'var(--espresso)', marginBottom: '0.5rem' }}>Create Your Account</h4>
                    <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                      Sign up with your email and password. You'll be redirected to complete your company profile with your business details.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--espresso)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: 'var(--ivory)', fontWeight: 600 }}>2</span>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, color: 'var(--espresso)', marginBottom: '0.5rem' }}>Configure SMTP Settings</h4>
                    <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                      Go to <strong>Settings → Email Accounts</strong> and enter your Gmail address and 16-character App Password. This enables our system to send emails on your behalf.
                    </p>
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(196,148,58,0.1)', borderRadius: '8px' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--umber)', margin: 0 }}>
                        <strong>How to get App Password:</strong> Google Account → Security → Enable 2-Step Verification → Search "App Passwords" → Create for Mail → Copy the 16-character password
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--espresso)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: 'var(--ivory)', fontWeight: 600 }}>3</span>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, color: 'var(--espresso)', marginBottom: '0.5rem' }}>Set Lead Preferences</h4>
                    <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                      In <strong>Settings → Lead Preferences</strong>, define your target audience. Describe the type of leads you want (industry, company size, location) and how many leads per cycle.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--espresso)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: 'var(--ivory)', fontWeight: 600 }}>4</span>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, color: 'var(--espresso)', marginBottom: '0.5rem' }}>Upload Your Brochure (Optional)</h4>
                    <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                      In <strong>Settings → General</strong>, upload your company brochure (PDF). This will be automatically attached to outreach emails.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--espresso)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: 'var(--ivory)', fontWeight: 600 }}>5</span>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, color: 'var(--espresso)', marginBottom: '0.5rem' }}>Generate Leads</h4>
                    <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                      Go to <strong>Dashboard</strong> and click "Start Lead Generation". The AI will find leads matching your criteria, validate their emails, and send your brochure automatically.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--espresso)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: 'var(--ivory)', fontWeight: 600 }}>6</span>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, color: 'var(--espresso)', marginBottom: '0.5rem' }}>Monitor & Optimize</h4>
                    <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                      Track your campaign performance in <strong>Analytics</strong>. View delivery rates, open rates, and responses. Adjust your targeting and email templates for better results.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Features */}
            <div style={{ paddingBottom: '2rem', borderBottom: '1px solid rgba(184,169,138,0.2)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--espresso)', marginBottom: '1.5rem', fontFamily: '"Cormorant Garamond", serif' }}>Platform Features</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.4)', borderRadius: '8px', textAlign: 'center' }}>
                  <Users size={24} color="var(--rust)" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--espresso)', marginBottom: '0.25rem' }}>Leads Management</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--umber)', margin: 0 }}>View, add, and manage your leads</p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.4)', borderRadius: '8px', textAlign: 'center' }}>
                  <Mail size={24} color="var(--rust)" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--espresso)', marginBottom: '0.25rem' }}>Campaigns</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--umber)', margin: 0 }}>Create email sequences</p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.4)', borderRadius: '8px', textAlign: 'center' }}>
                  <FileText size={24} color="var(--rust)" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--espresso)', marginBottom: '0.25rem' }}>Templates</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--umber)', margin: 0 }}>Email template library</p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.4)', borderRadius: '8px', textAlign: 'center' }}>
                  <Zap size={24} color="var(--rust)" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--espresso)', marginBottom: '0.25rem' }}>Pipeline</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--umber)', margin: 0 }}>Run lead generation</p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.4)', borderRadius: '8px', textAlign: 'center' }}>
                  <BarChart3 size={24} color="var(--rust)" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--espresso)', marginBottom: '0.25rem' }}>Analytics</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--umber)', margin: 0 }}>Performance insights</p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.4)', borderRadius: '8px', textAlign: 'center' }}>
                  <Settings size={24} color="var(--rust)" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--espresso)', marginBottom: '0.25rem' }}>Settings</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--umber)', margin: 0 }}>Configure your account</p>
                </div>
              </div>
            </div>

            {/* Report Generation */}
            <div style={{ paddingBottom: '2rem', borderBottom: '1px solid rgba(184,169,138,0.2)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--espresso)', marginBottom: '1rem', fontFamily: '"Cormorant Garamond", serif' }}>Reports & Delivery</h3>
              <p style={{ color: 'var(--umber)', lineHeight: 1.7, fontSize: '0.9rem', marginBottom: '1rem' }}>
                Configure how and when you receive reports about your lead generation campaigns:
              </p>
              <ul style={{ color: 'var(--umber)', lineHeight: 1.8, fontSize: '0.9rem', paddingLeft: '1.5rem' }}>
                <li><strong>Daily Reports:</strong> Get daily updates on leads generated and emails sent</li>
                <li><strong>Weekly Reports:</strong> Comprehensive weekly summary of campaign performance</li>
                <li><strong>Bi-Weekly:</strong> Bi-weekly digest with trends and recommendations</li>
                <li><strong>Monthly Reports:</strong> Full monthly analytics with ROI analysis</li>
              </ul>
              <p style={{ color: 'var(--umber)', lineHeight: 1.7, fontSize: '0.9rem', marginTop: '1rem' }}>
                Set your preferred report frequency in <strong>Settings → Lead Preferences</strong>.
              </p>
            </div>

            {/* Troubleshooting */}
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--espresso)', marginBottom: '1rem', fontFamily: '"Cormorant Garamond", serif' }}>Common Issues & Solutions</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.4)', borderRadius: '8px', borderLeft: '3px solid var(--rust)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--espresso)', marginBottom: '0.5rem' }}>Emails Not Sending</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--umber)', margin: 0 }}>
                    Verify your SMTP credentials in Settings. Make sure you're using an App Password, not your regular password.
                  </p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.4)', borderRadius: '8px', borderLeft: '3px solid var(--rust)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--espresso)', marginBottom: '0.5rem' }}>Low Lead Quality</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--umber)', margin: 0 }}>
                    Refine your target criteria in Settings. Be more specific about industry, company size, and location.
                  </p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.4)', borderRadius: '8px', borderLeft: '3px solid var(--rust)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--espresso)', marginBottom: '0.5rem' }}>High Bounce Rate</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--umber)', margin: 0 }}>
                    Our AI validates emails, but some may still bounce. Monitor your bounce rate and adjust targeting if needed.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </GlassCard>
      </div>
    </div>
  );
}