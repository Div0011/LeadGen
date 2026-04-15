'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Loader2, CheckCircle, AlertCircle, Search, Users, Mail, TrendingUp, Sparkles } from 'lucide-react';
import Button from '@/components/Button';
import { campaignsApi, settingsApi, leadsApi } from '@/services/api';

interface ProgressStep {
  id: number;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [settings, setSettings] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([
    { id: 1, label: 'Initializing', status: 'pending' },
    { id: 2, label: 'Discovering Leads', status: 'pending' },
    { id: 3, label: 'Validating Emails', status: 'pending' },
    { id: 4, label: 'Analyzing Websites', status: 'pending' },
    { id: 5, label: 'Scoring & Prioritizing', status: 'pending' },
    { id: 6, label: 'Finalizing Results', status: 'pending' },
  ]);

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

  const updateProgressStep = (stepId: number, stepStatus: ProgressStep['status']) => {
    setProgressSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status: stepStatus } : step
    ));
  };

  const resetProgressSteps = () => {
    setProgressSteps([
      { id: 1, label: 'Initializing', status: 'pending' },
      { id: 2, label: 'Discovering Leads', status: 'pending' },
      { id: 3, label: 'Validating Emails', status: 'pending' },
      { id: 4, label: 'Analyzing Websites', status: 'pending' },
      { id: 5, label: 'Scoring & Prioritizing', status: 'pending' },
      { id: 6, label: 'Finalizing Results', status: 'pending' },
    ]);
  };

  const handleGenerateLeads = async () => {
    setGenerating(true);
    setProgress(0);
    setStatus('Initializing campaign...');
    setResult(null);
    resetProgressSteps();
    updateProgressStep(1, 'running');

    try {
      // Fetch fresh settings directly from backend
      const settingsResponse = await settingsApi.getSettings();
      const freshSettings = settingsResponse.data;
      setSettings(freshSettings);
      
      // Get the target industry from fresh settings
      const agencyType = freshSettings.leadType || 'web_development';
      const location = freshSettings.targetLocation || 'India';
      const maxLeads = parseInt(freshSettings.leadVolume) || 50;

      updateProgressStep(1, 'completed');
      updateProgressStep(2, 'running');
      setProgress(15);
      setStatus('Searching for potential leads...');

      // Small delay to show the step
      await new Promise(resolve => setTimeout(resolve, 500));

      // Run the campaign
      const response = await campaignsApi.run({
        agency_type: agencyType,
        location: location,
        max_leads: maxLeads
      });

      updateProgressStep(2, 'completed');
      updateProgressStep(3, 'running');
      setProgress(40);
      setStatus('Validating email addresses...');
      
      await new Promise(resolve => setTimeout(resolve, 500));

      updateProgressStep(3, 'completed');
      updateProgressStep(4, 'running');
      setProgress(60);
      setStatus('Analyzing website quality and status...');
      
      await new Promise(resolve => setTimeout(resolve, 500));

      updateProgressStep(4, 'completed');
      updateProgressStep(5, 'running');
      setProgress(80);
      setStatus('Scoring leads by priority...');
      
      await new Promise(resolve => setTimeout(resolve, 500));

      updateProgressStep(5, 'completed');
      updateProgressStep(6, 'running');
      setProgress(95);
      setStatus('Finalizing results...');
      
      await new Promise(resolve => setTimeout(resolve, 500));

      updateProgressStep(6, 'completed');
      setProgress(100);
      setStatus('Complete!');
      setResult(response.data);

      // Auto-redirect to leads page after 2 seconds
      setTimeout(() => {
        router.push('/leads');
      }, 2000);

    } catch (err: any) {
      console.error('Failed to generate leads', err);
      setStatus(err.response?.data?.detail || 'Failed to generate leads');
      updateProgressStep(progressSteps.find(s => s.status === 'running')?.id || 1, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewLeads = () => {
    router.push('/leads');
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
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: 'rgba(196,148,58,0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <Sparkles size={40} style={{ color: 'var(--gold)' }} />
              </div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'var(--espresso)', marginBottom: '1rem' }}>
                Campaign Complete!
              </h3>
              <p style={{ color: 'var(--umber)', marginBottom: '0.5rem' }}>
                {result.message || 'Leads have been generated successfully'}
              </p>
              <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--espresso)' }}>{result.leads_generated || result.leads_found || 0}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--umber)' }}>Leads Generated</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--espresso)' }}>{result.leads_delivered || result.leads_validated || 0}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--umber)' }}>Valid Leads</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <Button onClick={handleViewLeads} className="btn-primary" style={{ padding: '.75rem 1.5rem', background: 'var(--espresso)', color: 'var(--ivory)', border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '.7rem', letterSpacing: '.2em', textTransform: 'uppercase' }}>
                  View All Leads
                </Button>
                <Button onClick={() => { setResult(null); setGenerating(false); }} className="btn-ghost" style={{ background: 'transparent', border: '1px solid rgba(184,169,138,0.4)', padding: '.75rem 1.5rem', color: 'var(--umber)' }}>
                  Generate More
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="form-card reveal visible" style={{ opacity: 0, animation: 'fadeUp .8s ease 0.4s forwards', padding: '3rem', marginTop: '2rem' }}>
            {generating ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                {/* Animated Circle Progress */}
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  border: '4px solid rgba(196,148,58,0.2)',
                  position: 'relative',
                  margin: '0 auto 1.5rem'
                }}>
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle 
                      cx="60" 
                      cy="60" 
                      r="54" 
                      fill="none" 
                      stroke="var(--gold)" 
                      strokeWidth="4"
                      strokeDasharray={`${(progress / 100) * 339} 339`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 0.3s ease' }}
                    />
                  </svg>
                  <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'var(--espresso)'
                  }}>
                    {progress}%
                  </div>
                </div>

                <p style={{ color: 'var(--espresso)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{status}</p>
                
                {/* Progress Bar */}
                <div style={{ width: '80%', height: '8px', background: 'rgba(184,169,138,0.2)', borderRadius: '4px', overflow: 'hidden', margin: '1rem auto' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--gold)', transition: 'width 0.3s ease' }} />
                </div>

                {/* Progress Steps */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '0.5rem', 
                  marginTop: '2rem',
                  flexWrap: 'wrap'
                }}>
                  {progressSteps.map((step, index) => (
                    <div 
                      key={step.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        background: step.status === 'completed' ? 'rgba(90,107,80,0.1)' : 
                                   step.status === 'running' ? 'rgba(196,148,58,0.1)' : 
                                   'rgba(184,169,138,0.1)',
                        opacity: step.status === 'pending' ? 0.5 : 1,
                      }}
                    >
                      {step.status === 'completed' ? (
                        <CheckCircle size={14} style={{ color: 'var(--sage)' }} />
                      ) : step.status === 'running' ? (
                        <Loader2 size={14} style={{ color: 'var(--gold)', animation: 'spin 1s linear infinite' }} />
                      ) : step.status === 'error' ? (
                        <AlertCircle size={14} style={{ color: 'var(--rust)' }} />
                      ) : (
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid var(--tan)' }} />
                      )}
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: step.status === 'completed' ? 'var(--sage)' : 
                               step.status === 'running' ? 'var(--gold)' : 
                               'var(--umber)',
                        fontWeight: step.status === 'running' ? 600 : 400
                      }}>
                        {step.label}
                      </span>
                    </div>
                  ))}
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