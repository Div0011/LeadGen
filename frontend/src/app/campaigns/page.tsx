'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Play, Pause, Trash2, BarChart3, Users, Mail, TrendingUp, ChevronRight, Edit2 } from 'lucide-react';
import Button from '@/components/Button';
import GlassCard from '@/components/GlassCard';
import { campaignsApi } from '@/services/api';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft' | 'completed';
  leads: number;
  responses: number;
  responseRate: number;
  createdAt: string;
  description?: string;
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      try {
        const response = await campaignsApi.getAll();
        setCampaigns(response.data.map((campaign: any) => ({
          id: campaign.id,
          name: campaign.name,
          status: campaign.status || 'draft',
          leads: campaign.leads_count || 0,
          responses: campaign.responses_count || 0,
          responseRate: ((campaign.responses_count || 0) / (campaign.leads_count || 1)) * 100,
          createdAt: campaign.created_at || new Date().toISOString(),
          description: campaign.description,
        })));
      } catch (err) {
        setCampaigns([
          { id: '1', name: 'Q1 2025 Tech Leads', status: 'active', leads: 324, responses: 54, responseRate: 16.7, createdAt: '2025-01-15', description: 'Target tech decision makers' },
          { id: '2', name: 'SaaS Outreach', status: 'active', leads: 210, responses: 31, responseRate: 14.8, createdAt: '2025-01-10', description: 'Enterprise SaaS companies' },
          { id: '3', name: 'Enterprise Push', status: 'paused', leads: 156, responses: 18, responseRate: 11.5, createdAt: '2025-01-05', description: 'Fortune 500 enterprises' },
          { id: '4', name: 'Startup Blitz', status: 'draft', leads: 0, responses: 0, responseRate: 0, createdAt: '2025-01-20', description: 'Series A/B funded startups' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-700',
      'paused': 'bg-yellow-100 text-yellow-700',
      'draft': 'bg-gray-100 text-gray-700',
      'completed': 'bg-blue-100 text-blue-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-transparent">

      <div className="flex-1 campaigns-section" style={{ minHeight: 'calc(100vh - 80px)', padding: '5vw' }}>
        <div className="section-tag" style={{ animation: 'fadeUp .8s ease forwards' }}>Outreach</div>
        <div className="db-header" style={{ opacity: 0, animation: 'fadeUp .8s ease 0.2s forwards' }}>
          <h2 className="section-title">Active <em>Campaigns</em></h2>
          <Button onClick={() => router.push('/campaigns/new')} className="btn-primary" style={{ padding: '.9rem 2.5rem', background: 'var(--espresso)', color: 'var(--ivory)', border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '.75rem', letterSpacing: '.2em', textTransform: 'uppercase' }}>
            + New Campaign
          </Button>
        </div>

        <div className="campaigns-grid" style={{ opacity: 0, animation: 'fadeUp .8s ease 0.4s forwards' }}>
          {campaigns.map((campaign, idx) => {
            const isRunning = campaign.status === 'active';
            const isCompleted = campaign.status === 'completed';
            const isPaused = campaign.status === 'paused' || campaign.status === 'draft';
            return (
              <div key={campaign.id} className={`campaign-card ${isRunning ? 'running-camp' : isCompleted ? 'completed-camp' : 'paused-camp'}`}>
                <div className="camp-status">
                  <div className="camp-status-dot"></div>
                  {campaign.status.toUpperCase()}
                </div>
                <div className="camp-title">{campaign.name}</div>
                <div className="camp-loc">{campaign.description || 'Targeting pending...'}</div>
                
                <div className="camp-progress-bar">
                  <div className="camp-progress-fill" style={{ width: `${Math.min(100, Math.floor((campaign.responses / Math.max(1, campaign.leads)) * 100))}%` }}></div>
                </div>

                <div className="camp-stats">
                  <div className="camp-stat">
                    <div className="camp-stat-val">{campaign.leads}</div>
                    <div className="camp-stat-label">Leads</div>
                  </div>
                  <div className="camp-stat">
                    <div className="camp-stat-val">{campaign.responses}</div>
                    <div className="camp-stat-label">Responses</div>
                  </div>
                  <div className="camp-stat">
                    <div className="camp-stat-val">{campaign.responseRate.toFixed(1)}%</div>
                    <div className="camp-stat-label">Rate</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
