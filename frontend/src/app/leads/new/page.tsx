'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/Button';
import { campaignsApi, settingsApi, leadsApi } from '@/services/api';

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [settings, setSettings] = useState<any>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsApi.getSettings();
      setSettings(response.data);
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };

  const handleGenerateLeads = async () => {
    setGenerating(true);
    setProgress(0);
    setStatus('Initializing campaign...');
    setResult(null);

    try {
      // Fetch fresh settings directly from backend
      const settingsResponse = await settingsApi.getSettings();
      const freshSettings = settingsResponse.data;
      setSettings(freshSettings);
      
      // Get the target industry from fresh settings
      const agencyType = freshSettings.leadType || 'web_development';
      const location = freshSettings.targetLocation || 'India';
      const maxLeads = parseInt(freshSettings.leadVolume) || 50;

      setProgress(10);
      setStatus('Discovering leads...');

      // Run the campaign
      const response = await campaignsApi.run({
        agency_type: agencyType,
        location: location,
        max_leads: maxLeads
      });

      setProgress(100);
      setStatus('Complete!');
      setResult(response.data);

      // Refresh leads after generation
      await leadsApi.getAll();

    } catch (err: any) {
      console.error('Failed to generate leads', err);
      setStatus(err.response?.data?.detail || 'Failed to generate leads');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-transparent">
      <div className="flex-1 overflow-y-auto dashboard-preview" style={{ minHeight: '100vh', padding: '4rem', background: 'var(--parchment)' }}>
        <div className="db-header reveal visible">
          <div className="section-tag" style={{ animation: 'fadeUp .8s ease forwards' }}>Generation</div>
          <div style={{ opacity: 0, animation: 'fadeUp .8s ease 0.2s forwards' }}>
            <h2 className="section-title">Generate <em>Leads</em></h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem', opacity: 0, animation: 'fadeUp .8s ease 0.2s forwards' }}>
            <Button onClick={() => router.back()} className="btn-ghost" style={{ background: 'transparent', border: '1px solid rgba(184,169,138,0.4)', padding: '.75rem 1.5rem', color: 'var(--umber)' }}>
              Back
            </Button>
          </div>
        </div>

        {result ? (
          <div className="form-card reveal visible" style={{ opacity: 0, animation: 'fadeUp .8s ease 0.4s forwards', padding: '3rem', marginTop: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <CheckCircle size={64} style={{ color: 'var(--gold)', marginBottom: '1rem' }} />
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'var(--espresso)', marginBottom: '1rem' }}>
                Campaign Complete!
              </h3>
              <p style={{ color: 'var(--umber)', marginBottom: '0.5rem' }}>
                {result.message}
              </p>
              <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--espresso)' }}>{result.leads_generated}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--umber)' }}>Leads Generated</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--espresso)' }}>{result.leads_delivered}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--umber)' }}>Leads Delivered</div>
                </div>
              </div>
              <Button onClick={() => router.push('/dashboard')} className="btn-primary" style={{ marginTop: '2rem', padding: '.75rem 1.5rem', background: 'var(--espresso)', color: 'var(--ivory)', border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '.7rem', letterSpacing: '.2em', textTransform: 'uppercase' }}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <div className="form-card reveal visible" style={{ opacity: 0, animation: 'fadeUp .8s ease 0.4s forwards', padding: '3rem', marginTop: '2rem' }}>
            {generating ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Loader2 size={48} style={{ color: 'var(--gold)', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                <p style={{ color: 'var(--espresso)', fontSize: '1.1rem', marginBottom: '1rem' }}>{status}</p>
                <div style={{ width: '100%', height: '8px', background: 'rgba(184,169,138,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--gold)', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(196,148,58,0.1)', padding: '1.5rem', borderRadius: '12px' }}>
                  <h4 style={{ color: 'var(--espresso)', fontWeight: 600, marginBottom: '0.75rem' }}>Campaign Settings</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem', color: 'var(--umber)' }}>
                    <div>
                      <strong>Industry:</strong> {settings?.leadType || 'Not set'}
                    </div>
                    <div>
                      <strong>Location:</strong> {settings?.targetLocation || 'India'}
                    </div>
                    <div>
                      <strong>Max Leads:</strong> {settings?.leadVolume || '50'}
                    </div>
                  </div>
                </div>

                {(!settings?.leadType || !settings?.leadVolume) && (
                  <div style={{ background: 'rgba(139,74,47,0.1)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <AlertCircle size={20} color="var(--rust)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ color: 'var(--umber)', fontSize: '0.9rem' }}>
                      Please complete your settings (Target Industry and Lead Volume) in the Settings page before generating leads.
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleGenerateLeads} 
                  disabled={!settings?.leadType || !settings?.leadVolume || loading}
                  className="btn-primary" 
                  style={{ marginTop: '1rem', padding: '1rem 2rem', background: 'var(--espresso)', color: 'var(--ivory)', border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '.8rem', letterSpacing: '.2em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Play size={18} />
                  Start Lead Generation
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}