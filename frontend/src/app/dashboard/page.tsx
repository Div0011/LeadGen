'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Settings, Mail, BarChart3, TrendingUp, Zap, Target, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import Button from '@/components/Button';
import GlassCard from '@/components/GlassCard';
import { leadsApi, campaignsApi, pipelineApi, analyticsApi } from '@/services/api';

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
      // Fetch analytics data
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
        setStats([
          { label: 'Total Leads', value: 1248, icon: <Target className="w-6 h-6" />, color: 'text-[#8B4A2F]', trend: '+12%' },
          { label: 'Active Campaigns', value: 5, icon: <Zap className="w-6 h-6" />, color: 'text-[#C4943A]', trend: '+3' },
          { label: 'Response Rate', value: '38%', icon: <TrendingUp className="w-6 h-6" />, color: 'text-[#5A6B50]', trend: '+2.5%' },
          { label: 'Scheduled Runs', value: 12, icon: <Clock className="w-6 h-6" />, color: 'text-[#7A6A52]', trend: '+1' },
        ]);
      }

      // Fetch campaigns
      try {
        const campaignsData = await campaignsApi.getAll();
        setCampaigns(campaignsData.data.slice(0, 5).map((c: any) => ({
          id: c.id,
          name: c.name,
          status: c.status || 'draft',
          leads: c.leads_count || 0,
          responses: c.responses_count || 0,
          createdAt: c.created_at,
        })));
      } catch (err) {
        setCampaigns([
          { id: '1', name: 'Q1 2025 Tech Leads', status: 'active', leads: 324, responses: 54 },
          { id: '2', name: 'SaaS Outreach', status: 'active', leads: 210, responses: 31 },
          { id: '3', name: 'Enterprise Push', status: 'paused', leads: 156, responses: 18 },
        ]);
      }

      setActivities([
        { id: '1', type: 'lead', message: '245 new leads validated', timestamp: '2 hours ago', icon: <CheckCircle className="w-4 h-4 text-green-600" /> },
        { id: '2', type: 'campaign', message: 'Q1 Tech Leads campaign launched', timestamp: '5 hours ago', icon: <Zap className="w-4 h-4 text-[#C4943A]" /> },
        { id: '3', type: 'response', message: '12 positive responses received', timestamp: '1 day ago', icon: <Mail className="w-4 h-4 text-[#8B4A2F]" /> },
        { id: '4', type: 'scheduled', message: 'Automated daily run completed', timestamp: '2 days ago', icon: <Clock className="w-4 h-4 text-[#7A6A52]" /> },
      ]);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col flex-1 bg-transparent min-h-full">

      <div className="flex-1 dashboard-preview" style={{ padding: '5vw', background: 'transparent' }}>
        
        <div className="db-header reveal visible">
          <div className="section-tag">Overview</div>
          <div>
            <h2 className="section-title">Active <em>Pipeline</em></h2>
          </div>
          <Link href="/campaigns" className="btn-ghost" style={{ fontSize: '1rem' }}>
            View All Campaigns <span>→</span>
          </Link>
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
            {[
                { name: 'Sarah Chen', company: 'Peak Digital', status: 'replied' },
                { name: 'Marcus Rodriguez', company: 'Blueprint Agency', status: 'contacted' },
                { name: 'Elena Vasquez', company: 'Nova Studio', status: 'discovered' },
                { name: 'James Mitchell', company: 'Apex Solutions', status: 'converted' },
              ].map((lead, i) => (
                <div className="lead-row" key={i}>
                  <div className="lead-avatar">{lead.name[0]}</div>
                  <div className="lead-info">
                    <div className="lead-name">{lead.name}</div>
                    <div className="lead-company">{lead.company}</div>
                  </div>
                  <div className={`lead-status status-${lead.status}`}>{lead.status}</div>
                </div>
              ))}
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
