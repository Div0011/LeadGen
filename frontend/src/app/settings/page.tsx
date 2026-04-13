'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Bell, Key, CreditCard, Save, AlertCircle, Target, UploadCloud } from 'lucide-react';
import Button from '@/components/Button';
import GlassCard from '@/components/GlassCard';
import { settingsApi } from '@/services/api';

type Tab = 'account' | 'email' | 'preferences' | 'integrations' | 'billing' | 'security';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    emailFrom: '',
    emailProvider: 'smtp',
    googleSheetsApiKey: '',
    slackWebhook: '',
    notificationsEmail: true,
    notificationsSms: false,
    brochureUrl: '',
    smtpEmail: '',
    smtpPassword: '',
    leadType: '',
    leadVolume: '100',
    reportFrequency: 'weekly',
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      try {
        const response = await settingsApi.getSettings();
        setSettings(prev => ({ ...prev, ...response.data }));
      } catch (err) {
        // Use defaults
      }
    } finally {
      setLoading(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrochureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF files are allowed');
      return;
    }

    try {
      setLoading(true);
      const response = await settingsApi.uploadBrochure(file);
      setSettings(prev => ({ ...prev, brochureUrl: response.data.filename }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to upload brochure:', err);
      alert('Failed to upload brochure');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.updateSettings(settings);
      
      if (response.data.success) {
        setSaved(true);
        setTimeout(() => {
          setSaved(false);
          router.push('/dashboard');
        }, 1500);
      } else {
        alert(response.data.errors?.join('\n') || 'Please fill all required fields');
      }
    } catch (err: any) {
      console.error('Failed to save settings', err);
      const errors = err.response?.data?.errors;
      if (errors) {
        alert(errors.join('\n'));
      } else {
        alert('Failed to save settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'account', label: 'General', icon: <Key size={18} /> },
    { id: 'email', label: 'Email Accounts', icon: <Mail size={18} /> },
    { id: 'preferences', label: 'Lead Preferences', icon: <Target size={18} /> },
    { id: 'integrations', label: 'Integrations', icon: <AlertCircle size={18} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> },
    { id: 'security', label: 'Security', icon: <Lock size={18} /> },
  ];

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-transparent">

      <div className="flex-1 dashboard-preview" style={{ minHeight: 'calc(100vh - 80px)', padding: '5vw', background: 'var(--parchment)' }}>
        <div className="db-header reveal visible">
          <div className="section-tag" style={{ animation: 'fadeUp .8s ease forwards' }}>Configuration</div>
          <div style={{ opacity: 0, animation: 'fadeUp .8s ease 0.2s forwards' }}>
            <h2 className="section-title">System <em>Settings</em></h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem', opacity: 0, animation: 'fadeUp .8s ease 0.2s forwards' }}>
            <Button onClick={handleSave} disabled={loading} className="btn-primary" style={{ padding: '.75rem 1.5rem', background: 'var(--espresso)', color: 'var(--ivory)', border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '.7rem', letterSpacing: '.2em', textTransform: 'uppercase' }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="reveal visible" style={{ opacity: 0, animation: 'fadeUp .8s ease 0.3s forwards', marginBottom: '2rem', borderBottom: '1px solid rgba(184,169,138,0.2)', paddingBottom: '1rem', display: 'flex', gap: '2rem' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Jost', sans-serif",
                fontSize: '0.85rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                paddingBottom: '0.5rem',
                color: activeTab === tab.id ? 'var(--espresso)' : 'var(--umber)',
                borderBottom: activeTab === tab.id ? '2px solid var(--espresso)' : '2px solid transparent',
                transition: 'all 0.3s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Success Message */}
        {saved && (
          <div className="form-card reveal visible" style={{ marginBottom: '2rem', padding: '1rem 2rem', background: 'rgba(237,229,208, 0.5)', borderLeft: '4px solid var(--gold)' }}>
            <p style={{ color: 'var(--espresso)', fontFamily: "'Jost', sans-serif", fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--gold)' }}>✓</span> Settings saved successfully.
            </p>
          </div>
        )}

        {/* Content */}
        <div className="form-card reveal visible" style={{ opacity: 0, animation: 'fadeUp .8s ease 0.4s forwards', padding: '5vw' }}>
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="firstName">First Name</label>
                  <input type="text" id="firstName" name="firstName" value={settings.firstName} onChange={handleChange as any} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="lastName">Last Name</label>
                  <input type="text" id="lastName" name="lastName" value={settings.lastName} onChange={handleChange as any} className="form-input" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="company">Company Name</label>
                <input type="text" id="company" name="company" value={settings.company} onChange={handleChange as any} className="form-input" />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="brochureUrl">Company Brochure (PDF)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf"
                    onChange={handleBrochureUpload}
                    style={{ display: 'none' }}
                  />
                  <Button 
                    className="btn-ghost" 
                    onClick={() => fileInputRef.current?.click()}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(184,169,138,0.3)', padding: '0.5rem 1rem' }}
                  >
                    <UploadCloud size={16} /> Update Brochure
                  </Button>
                  <span style={{ fontSize: '0.8rem', color: 'var(--umber)' }}>Current: {settings.brochureUrl || 'None uploaded'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="smtpEmail">Sending Email Address</label>
                <input type="email" id="smtpEmail" name="smtpEmail" value={settings.smtpEmail} onChange={handleChange as any} placeholder="your-email@company.com" className="form-input" required />
                <p style={{ fontSize: '0.75rem', color: 'var(--umber)', marginTop: '0.5rem' }}>This is the email address your campaigns will be sent from.</p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="smtpPassword">SMTP Password / App Password</label>
                <input type="password" id="smtpPassword" name="smtpPassword" value={settings.smtpPassword} onChange={handleChange as any} placeholder="••••••••••••••••" className="form-input" required />
                <div style={{ background: 'rgba(196,148,58,0.1)', padding: '1rem', borderRadius: '8px', marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <AlertCircle size={18} color="var(--rust)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ color: 'var(--espresso)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>How to get an App Password</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--umber)', lineHeight: 1.5 }}>
                      For security, you must use an <strong>App Password</strong> rather than your standard email password. <br />
                      • <strong>Google Workspace:</strong> Go to Manage your Google Account &gt; Security &gt; 2-Step Verification &gt; App passwords. <br />
                      • <strong>Microsoft 365:</strong> Go to My Account &gt; Security &gt; Advanced Security Options &gt; App passwords.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="leadType">Target Audience & Lead Profile</label>
                <textarea id="leadType" name="leadType" value={settings.leadType} onChange={handleChange as any} placeholder="E.g., VPs of Marketing at SaaS companies in Europe with $1M+ ARR..." className="form-input" style={{ minHeight: '120px', resize: 'vertical' }} required></textarea>
                <p style={{ fontSize: '0.75rem', color: 'var(--umber)', marginTop: '0.5rem' }}>Describe exactly what kind of leads we should hunt for you.</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="leadVolume">Target Lead Volume</label>
                  <input type="number" id="leadVolume" name="leadVolume" value={settings.leadVolume} onChange={handleChange as any} placeholder="E.g., 200" className="form-input" required />
                  <p style={{ fontSize: '0.75rem', color: 'var(--umber)', marginTop: '0.5rem' }}>Leads per delivery cycle</p>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="reportFrequency">Reporting & Delivery Frequency</label>
                  <select id="reportFrequency" name="reportFrequency" value={settings.reportFrequency} onChange={handleChange as any} className="form-select" required>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <p style={{ fontSize: '0.75rem', color: 'var(--umber)', marginTop: '0.5rem' }}>When you want your lead reports to be delivered.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="googleSheetsApiKey">Google Sheets API Key</label>
                <input type="password" id="googleSheetsApiKey" name="googleSheetsApiKey" value={settings.googleSheetsApiKey} onChange={handleChange as any} placeholder="Paste your API key" className="form-input" />
                <div style={{ background: 'rgba(196,148,58,0.1)', padding: '1rem', borderRadius: '8px', marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <AlertCircle size={18} color="var(--rust)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ color: 'var(--espresso)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>How to get Google Sheets API Key</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--umber)', lineHeight: 1.5 }}>
                      1. Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#8B4A2F', textDecoration: 'underline' }}>Google Cloud Console</a><br/>
                      2. Create a new project or select existing<br/>
                      3. Go to <strong>APIs & Services → Credentials</strong><br/>
                      4. Click <strong>Create Credentials → API Key</strong><br/>
                      5. Copy the key and paste here<br/>
                      <em style={{ color: '#8B7355' }}>Note: Enable "Google Sheets API" in Library for full functionality</em>
                    </p>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="slackWebhook">Slack Webhook URL</label>
                <input type="url" id="slackWebhook" name="slackWebhook" value={settings.slackWebhook} onChange={handleChange as any} placeholder="https://hooks.slack.com/..." className="form-input" />
                <div style={{ background: 'rgba(196,148,58,0.1)', padding: '1rem', borderRadius: '8px', marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <AlertCircle size={18} color="var(--rust)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ color: 'var(--espresso)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>How to get Slack Webhook URL</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--umber)', lineHeight: 1.5 }}>
                      1. Go to your Slack workspace <strong>Settings → Apps</strong><br/>
                      2. Search for <strong>Incoming Webhooks</strong> and add it<br/>
                      3. Click <strong>Add New Webhook to Workspace</strong><br/>
                      4. Select the channel for notifications (e.g., #leads)<br/>
                      5. Copy the webhook URL and paste here<br/>
                      <em style={{ color: '#8B7355' }}>Leads notifications will be sent to this channel</em>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="db-panel" style={{ background: 'rgba(255,255,255,0.4)', padding: '2rem' }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'var(--espresso)', margin: '0 0 0.5rem 0' }}>Professional Plan</h3>
                <p style={{ fontFamily: "'Jost', sans-serif", color: 'var(--umber)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Active Subscription</p>
                <div style={{ fontSize: '2.5rem', fontFamily: "'Cormorant Garamond', serif", color: 'var(--gold)', marginBottom: '2rem' }}>$99<span style={{ fontSize: '1rem', color: 'var(--umber)' }}>/month</span></div>
                <Button className="btn-primary" style={{ padding: '.75rem 1.5rem', background: 'var(--espresso)', color: 'var(--ivory)', border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '.7rem', letterSpacing: '.2em', textTransform: 'uppercase', width: '100%' }}>
                  Manage Subscription
                </Button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="currentPassword">Current Password</label>
                <input type="password" id="currentPassword" placeholder="••••••••" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="newPassword">New Password</label>
                <input type="password" id="newPassword" placeholder="••••••••" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" placeholder="••••••••" className="form-input" />
              </div>
              <Button style={{ marginTop: '1rem', padding: '.75rem 1.5rem', background: 'var(--espresso)', color: 'var(--ivory)', border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '.7rem', letterSpacing: '.2em', textTransform: 'uppercase' }}>
                Update Password
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
