'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Settings, Mail, BarChart3, TrendingUp, Zap, Target, Clock, CheckCircle, AlertCircle, ChevronRight, Play } from 'lucide-react';
import Button from '@/components/Button';
import GlassCard from '@/components/GlassCard';
import { leadsApi, campaignsApi, pipelineApi, analyticsApi, settingsApi } from '@/services/api';

interface Stat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  leads: number;
  responses: number;
  createdAt?: string;
}

interface Activity {
  id: string;
  type: 'lead' | 'campaign' | 'response' | 'scheduled';
  message: string;
  timestamp: string;
  icon: React.ReactNode;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stat[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userSettings, setUserSettings] = useState<any>(null);
  const [showSettingsAlert, setShowSettingsAlert] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      // Check user settings for required fields
      try {
        const settingsData = await settingsApi.getSettings();
        setUserSettings(settingsData.data);
        
        // Validate required fields for lead generation
        const missing: string[] = [];
        const settings = settingsData.data;
        
        if (!settings.leadType) {
          missing.push('Target Industry / Lead Type');
        }
        if (!settings.leadVolume) {
          missing.push('Daily Lead Volume');
        }
        if (!settings.smtpEmail || !settings.smtpPassword) {
          missing.push('SMTP Email Settings (for sending outreach)');
        }
        
        if (missing.length > 0) {
          setMissingFields(missing);
          setShowSettingsAlert(true);
        }
      } catch (err) {
        // Settings not configured - show alert
        setMissingFields(['Target Industry', 'Lead Volume', 'SMTP Settings']);
        setShowSettingsAlert(true);
      }

      // Fetch recent leads - only show if leads exist
      try {
        const leadsData = await leadsApi.getAll({ limit: 5 });
        if (leadsData.data && leadsData.data.length > 0) {
          setRecentLeads(leadsData.data);
        }
        // If no leads, recentLeads stays empty - correct for new users
      } catch (err) {
        // Keep empty for new users
        setRecentLeads([]);
      }
      try {
        const analyticsData = await analyticsApi.getDashboard();
        const dashData = analyticsData.data;
        
        setStats([
          {
            label: 'Total Leads',
            value: dashData.total_leads || 0,
            icon: <Target className="w-6 h-6" />,
            color: 'text-[#8B4A2F]',
            trend: '+12%',
          },
          {
            label: 'Active Campaigns',
            value: dashData.active_campaigns || 0,
            icon: <Zap className="w-6 h-6" />,
            color: 'text-[#C4943A]',
            trend: '+3',
          },
          {
            label: 'Response Rate',
            value: `${dashData.response_rate || 0}%`,
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'text-[#5A6B50]',
            trend: '+2.5%',
          },
          {
            label: 'Scheduled Runs',
            value: dashData.scheduled_runs || 0,
            icon: <Clock className="w-6 h-6" />,
            color: 'text-[#7A6A52]',
            trend: '+1',
          },
        ]);
      } catch (err) {
        // For new users with no data, show empty state
        setStats([
          { label: 'Total Leads', value: 0, icon: <Target className="w-6 h-6" />, color: 'text-[#8B4A2F]', trend: '' },
          { label: 'Active Campaigns', value: 0, icon: <Zap className="w-6 h-6" />, color: 'text-[#C4943A]', trend: '' },
          { label: 'Response Rate', value: '0%', icon: <TrendingUp className="w-6 h-6" />, color: 'text-[#5A6B50]', trend: '' },
          { label: 'Scheduled Runs', value: 0, icon: <Clock className="w-6 h-6" />, color: 'text-[#7A6A52]', trend: '' },
        ]);
      }

      // Fetch campaigns - show empty state for new users
      try {
        const campaignsData = await campaignsApi.getAll();
        if (campaignsData.data && campaignsData.data.length > 0) {
          setCampaigns(campaignsData.data.slice(0, 5).map((c: any) => ({
            id: c.id,
            name: c.name,
            status: c.status || 'draft',
            leads: c.leads_count || 0,
            responses: c.responses_count || 0,
            createdAt: c.created_at,
          })));
        }
        // New users have no campaigns - leave empty
      } catch (err) {
        setCampaigns([]);
      }

      // Set empty activities for new users
      setActivities([]);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  const handleGenerateLeads = () => {
    if (showSettingsAlert) {
      router.push('/settings');
    } else {
      router.push('/leads/new');
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-transparent min-h-full">

      {/* Settings Alert */}
      {showSettingsAlert && (
        <div style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          zIndex: 1000,
          background: '#FFF8E7',
          border: '1px solid #C4943A',
          borderRadius: '12px',
          padding: '16px 20px',
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <AlertCircle style={{ color: '#C4943A', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#3D2E1E', marginBottom: '8px' }}>
                Complete Your Setup
              </h4>
              <p style={{ fontSize: '14px', color: '#5A4A3A', marginBottom: '12px' }}>
                To generate leads, please fill in these settings:
              </p>
              <ul style={{ fontSize: '13px', color: '#5A4A3A', paddingLeft: '16px', marginBottom: '12px' }}>
                {missingFields.map((field, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>{field}</li>
                ))}
              </ul>
              <button 
                onClick={() => router.push('/settings')}
                style={{
                  background: '#C4943A',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Go to Settings <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 dashboard-preview" style={{ padding: '5vw', background: 'transparent' }}>
        
        <div className="db-header reveal visible">
          <div>
            <div className="section-tag">Overview</div>
            <h2 className="section-title">Active <em>Pipeline</em></h2>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={handleGenerateLeads}
              style={{
                background: '#8B4A2F',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Play size={18} />
              Generate Leads
            </button>
            <Link href="/settings" className="btn-ghost" style={{ fontSize: '1rem' }}>
              <Settings size={20} />
            </Link>
            <Link href="/campaigns" className="btn-ghost" style={{ fontSize: '1rem' }}>
              View All Campaigns <span>→</span>
            </Link>
          </div>
        </div>

        <div className="db-grid reveal visible">
          {stats.map((stat, idx) => (
            <div className="db-stat" key={idx}>
              <div className="db-stat-val">{stat.value}</div>
              <div className="db-stat-label">{stat.label}</div>
              {stat.trend && <div className="db-stat-change">{stat.trend} this week</div>}
            </div>
          ))}
        </div>

        <div className="db-main reveal visible" style={{ marginTop: '3rem' }}>
          <div className="db-panel">
            <div className="db-panel-title">Recent Leads</div>
            {recentLeads.length > 0 ? (
              recentLeads.map((lead: any, i: number) => (
                <div className="lead-row" key={i}>
                  <div className="lead-avatar">{(lead.contact_name || lead.business_name || 'U')[0].toUpperCase()}</div>
                  <div className="lead-info">
                    <div className="lead-name">{lead.contact_name || lead.business_name || 'Unknown'}</div>
                    <div className="lead-company">{lead.website || lead.email || 'No contact info'}</div>
                  </div>
                  <div className={`lead-status status-${lead.status || 'discovered'}`}>{lead.status || 'discovered'}</div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8B7355' }}>
                <Target size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p style={{ fontSize: '15px', marginBottom: '8px' }}>No leads yet</p>
                <p style={{ fontSize: '13px', opacity: 0.7 }}>Click "Generate Leads" to start finding leads</p>
              </div>
            )}
          </div>

          <div className="db-panel">
            <div className="db-panel-title">Activity</div>
            <div className="mini-chart" id="miniChart" style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px', marginBottom: '1.5rem' }}>
              {[40,55,45,70,60,80,65,90,75,85,72,95].map((h, i) => (
                <div key={i} className="cbar" style={{ height: `${h}%`, flex: 1, background: 'rgba(196,148,58,0.15)', borderTop: '2px solid rgba(196,148,58,0.4)', transition: 'all .5s', minHeight: '4px' }}></div>
              ))}
            </div>
            <div style={{ marginTop: '1rem' }}>
              {[
                { name: 'Campaign: Q2 Outreach', progress: 'Active', dot: 'running' },
                { name: 'Email Validation', progress: '100%', dot: 'completed' },
                { name: 'Follow-up Queue', progress: '24', dot: 'pending' },
              ].map((task, i) => (
                <div className="task-item" key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.8rem 0', borderBottom: '1px solid rgba(184,169,138,0.1)' }}>
                  <div className={`task-dot ${task.dot}`} style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, 
                    ...(task.dot === 'running' ? { background: 'var(--gold)', animation: 'pulse 1.5s infinite' } : 
                       task.dot === 'completed' ? { background: 'var(--sage)' } : 
                       { background: 'var(--tan)' })
                  }}></div>
                  <div className="task-name" style={{ fontSize: '.8rem', color: 'var(--espresso)', flex: 1 }}>{task.name}</div>
                  <div className="task-progress" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', color: 'var(--umber)' }}>{task.progress}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
