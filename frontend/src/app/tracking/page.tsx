'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, MousePointer, Send, Clock, RefreshCw, CheckCircle, AlertCircle, BarChart3, Users } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { trackingApi, leadsApi } from '@/services/api';

interface TrackingStats {
  total_emails_sent: number;
  total_emails_opened: number;
  open_rate: number;
  total_brochure_clicks: number;
  brochure_click_rate: number;
  total_replies: number;
  reply_rate: number;
  total_follow_ups_sent: number;
}

interface PendingFollowup {
  id: string;
  business_name: string;
  email: string;
  date_sent: string | null;
  follow_up_count: number;
  hours_pending: number;
}

interface Lead {
  id: string;
  business_name: string;
  email: string;
  contact_person?: string;
  email_opened: boolean;
  email_opened_at?: string;
  brochure_clicked: boolean;
  brochure_clicked_at?: string;
  follow_up_count: number;
  follow_up_sent: boolean;
  last_follow_up_sent_at?: string;
  status: string;
  date_sent?: string;
}

export default function TrackingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TrackingStats | null>(null);
  const [pendingFollowups, setPendingFollowups] = useState<PendingFollowup[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'followups'>('dashboard');
  const [sendingFollowup, setSendingFollowup] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, leadsRes, followupsRes] = await Promise.all([
        trackingApi.getStats().catch(() => null),
        leadsApi.getAll({ limit: 50 }).catch(() => null),
        trackingApi.getPendingFollowups(48).catch(() => null),
      ]);

      if (statsRes?.data) {
        setStats(statsRes.data);
      }

      if (leadsRes?.data?.items) {
        setLeads(leadsRes.data.items.map((lead: any) => ({
          id: lead.id,
          business_name: lead.business_name,
          email: lead.email,
          contact_person: lead.contact_person,
          email_opened: lead.email_opened || false,
          email_opened_at: lead.email_opened_at,
          brochure_clicked: lead.brochure_clicked || false,
          brochure_clicked_at: lead.brochure_clicked_at,
          follow_up_count: lead.follow_up_count || 0,
          follow_up_sent: lead.follow_up_sent || false,
          last_follow_up_sent_at: lead.last_follow_up_sent_at,
          status: lead.status,
          date_sent: lead.date_sent,
        })));
      }

      if (followupsRes?.data?.leads) {
        setPendingFollowups(followupsRes.data.leads);
      }
    } catch (error) {
      console.error('Failed to load tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFollowup = async (leadId: string) => {
    try {
      setSendingFollowup(leadId);
      await trackingApi.sendFollowup(leadId);
      await loadData();
    } catch (error) {
      console.error('Failed to send follow-up:', error);
    } finally {
      setSendingFollowup(null);
    }
  };

  const sentLeads = leads.filter(l => l.status === 'sent' || l.status === 'replied');

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-transparent">
      <div className="flex-1" style={{ minHeight: 'calc(100vh - 80px)', padding: '5vw' }}>
        
        <div className="db-header">
          <div className="section-tag">Analytics</div>
          <div>
            <h2 className="section-title">Email <em>Tracking</em></h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={loadData}
              className="btn-ghost"
              style={{ background: 'transparent', border: '1px solid rgba(184,169,138,0.4)', padding: '.75rem 1.5rem', color: 'var(--umber)' }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'dashboard' ? 'var(--espresso)' : 'transparent',
              color: activeTab === 'dashboard' ? 'var(--ivory)' : 'var(--umber)',
              border: '1px solid rgba(184,169,138,0.3)',
              borderRadius: '4px',
              fontFamily: "'Jost', sans-serif",
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'leads' ? 'var(--espresso)' : 'transparent',
              color: activeTab === 'leads' ? 'var(--ivory)' : 'var(--umber)',
              border: '1px solid rgba(184,169,138,0.3)',
              borderRadius: '4px',
              fontFamily: "'Jost', sans-serif",
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Lead Status
          </button>
          <button
            onClick={() => setActiveTab('followups')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'followups' ? 'var(--espresso)' : 'transparent',
              color: activeTab === 'followups' ? 'var(--ivory)' : 'var(--umber)',
              border: '1px solid rgba(184,169,138,0.3)',
              borderRadius: '4px',
              fontFamily: "'Jost', sans-serif",
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            <Send className="w-4 h-4 inline mr-2" />
            Pending Follow-ups
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
              <GlassCard intensity="light" className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#7A6A52] text-sm font-semibold mb-1">Emails Sent</p>
                    <p className="text-3xl font-bold text-[#3D2E1E]">{stats?.total_emails_sent || 0}</p>
                  </div>
                  <Send className="w-10 h-10 text-[#8B4A2F]/20" />
                </div>
              </GlassCard>

              <GlassCard intensity="light" className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#7A6A52] text-sm font-semibold mb-1">Open Rate</p>
                    <p className="text-3xl font-bold text-[#3D2E1E]">{stats?.open_rate || 0}%</p>
                  </div>
                  <Mail className="w-10 h-10 text-[#8B4A2F]/20" />
                </div>
              </GlassCard>

              <GlassCard intensity="light" className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#7A6A52] text-sm font-semibold mb-1">Brochure Clicks</p>
                    <p className="text-3xl font-bold text-[#3D2E1E]">{stats?.total_brochure_clicks || 0}</p>
                  </div>
                  <MousePointer className="w-10 h-10 text-[#8B4A2F]/20" />
                </div>
              </GlassCard>

              <GlassCard intensity="light" className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#7A6A52] text-sm font-semibold mb-1">Follow-ups Sent</p>
                    <p className="text-3xl font-bold text-[#3D2E1E]">{stats?.total_follow_ups_sent || 0}</p>
                  </div>
                  <RefreshCw className="w-10 h-10 text-[#8B4A2F]/20" />
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <GlassCard intensity="light" className="p-8">
            <h3 className="text-xl font-bold text-[#3D2E1E] mb-6">Lead Email Status</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Jost', sans-serif" }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(184,169,138,0.2)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--umber)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Company</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--umber)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Email</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--umber)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--umber)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Email Opened</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--umber)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Brochure Click</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--umber)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Follow-ups</th>
                  </tr>
                </thead>
                <tbody>
                  {sentLeads.length > 0 ? (
                    sentLeads.map((lead) => (
                      <tr key={lead.id} style={{ borderBottom: '1px solid rgba(184,169,138,0.1)' }}>
                        <td style={{ padding: '1rem', color: 'var(--espresso)', fontSize: '0.85rem', fontWeight: 500 }}>{lead.business_name}</td>
                        <td style={{ padding: '1rem', color: 'var(--umber)', fontSize: '0.85rem' }}>{lead.email}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            fontSize: '.65rem', 
                            padding: '.2rem .5rem', 
                            borderRadius: '4px',
                            letterSpacing: '.1em',
                            background: lead.status === 'replied' ? 'rgba(90,107,80,0.1)' : 'rgba(196,148,58,0.1)',
                            color: lead.status === 'replied' ? 'var(--sage)' : 'var(--gold)'
                          }}>
                            {lead.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {lead.email_opened ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-[#5A6B50]" />
                              <span className="text-[#5A6B50] text-sm">Yes</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-[#7A6A52]" />
                              <span className="text-[#7A6A52] text-sm">Not opened</span>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {lead.brochure_clicked ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-[#5A6B50]" />
                              <span className="text-[#5A6B50] text-sm">Clicked</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-[#7A6A52]" />
                              <span className="text-[#7A6A52] text-sm">No click</span>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            fontSize: '0.85rem', 
                            color: lead.follow_up_count > 0 ? 'var(--gold)' : 'var(--umber)'
                          }}>
                            {lead.follow_up_count}/3
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--umber)' }}>
                        No sent emails to track yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {activeTab === 'followups' && (
          <GlassCard intensity="light" className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#3D2E1E]">Pending Follow-ups</h3>
              <span style={{ 
                fontSize: '0.7rem', 
                padding: '0.3rem 0.8rem', 
                borderRadius: '4px',
                background: 'rgba(196,148,58,0.1)',
                color: 'var(--gold)',
                letterSpacing: '0.1em'
              }}>
                {pendingFollowups.length} leads awaiting follow-up
              </span>
            </div>
            
            {pendingFollowups.length > 0 ? (
              <div className="space-y-3">
                {pendingFollowups.map((lead) => (
                  <div 
                    key={lead.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '1rem 1.5rem',
                      background: 'rgba(245,240,232,0.5)',
                      borderRadius: '8px',
                      border: '1px solid rgba(184,169,138,0.2)'
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--espresso)' }}>{lead.business_name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--umber)' }}>{lead.email}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--umber)', fontSize: '0.75rem' }}>
                        <Clock className="w-4 h-4" />
                        {lead.hours_pending}h pending
                      </div>
                      <button 
                        onClick={() => handleSendFollowup(lead.id)}
                        disabled={sendingFollowup === lead.id || lead.follow_up_count >= 3}
                        style={{ 
                          padding: '0.5rem 1rem',
                          fontSize: '0.65rem',
                          background: lead.follow_up_count >= 3 ? 'var(--aged)' : 'var(--espresso)',
                          color: 'var(--ivory)',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: lead.follow_up_count >= 3 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {sendingFollowup === lead.id ? 'Sending...' : lead.follow_up_count >= 3 ? 'Max reached' : `Send Follow-up (${lead.follow_up_count}/3)`}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--umber)' }}>
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-[#5A6B50]" />
                <p>All caught up! No pending follow-ups.</p>
              </div>
            )}
          </GlassCard>
        )}

      </div>
    </div>
  );
}
