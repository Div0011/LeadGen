'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { pipelineApi, leadsApi, analyticsApi, campaignsApi } from '@/services/api';
import { TrendingUp, Mail, Target, Zap, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '@/components/Button';
import GlassCard from '@/components/GlassCard';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeCampaigns: 0,
    responseRate: 0,
    scheduledRuns: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch stats
        const [analyticsRes, leadsRes, campaignsRes] = await Promise.all([
          analyticsApi.getDashboard().catch(() => null),
          leadsApi.getAll({ limit: 5 }).catch(() => null),
          campaignsApi.getAll({ limit: 5 }).catch(() => null),
        ]);

        if (analyticsRes?.data) {
          setStats(analyticsRes.data);
        }

        if (leadsRes?.data?.items) {
          const recentLeads = (leadsRes.data.items || []).slice(0, 5).map((lead: any) => ({
            type: 'lead',
            title: `New lead: ${lead.first_name} ${lead.last_name}`,
            timestamp: lead.created_at,
            status: lead.status,
          }));
          setRecentActivity(recentLeads);
        }
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  return (
    <div className="flex min-h-screen bg-[#F5F0E8]">

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-[#3D2E1E] mb-2">Dashboard</h1>
            <p className="text-[#7A6A52]">Welcome back! Here's your campaign overview.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <GlassCard intensity="light" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#7A6A52] text-sm font-semibold mb-1">Total Leads</p>
                  <p className="text-3xl font-bold text-[#3D2E1E]">{stats.totalLeads.toLocaleString()}</p>
                </div>
                <Target className="w-10 h-10 text-[#8B4A2F]/20" />
              </div>
            </GlassCard>

            <GlassCard intensity="light" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#7A6A52] text-sm font-semibold mb-1">Active Campaigns</p>
                  <p className="text-3xl font-bold text-[#3D2E1E]">{stats.activeCampaigns}</p>
                </div>
                <Zap className="w-10 h-10 text-[#8B4A2F]/20" />
              </div>
            </GlassCard>

            <GlassCard intensity="light" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#7A6A52] text-sm font-semibold mb-1">Response Rate</p>
                  <p className="text-3xl font-bold text-[#3D2E1E]">{stats.responseRate}%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-[#8B4A2F]/20" />
              </div>
            </GlassCard>

            <GlassCard intensity="light" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#7A6A52] text-sm font-semibold mb-1">Scheduled Runs</p>
                  <p className="text-3xl font-bold text-[#3D2E1E]">{stats.scheduledRuns}</p>
                </div>
                <Calendar className="w-10 h-10 text-[#8B4A2F]/20" />
              </div>
            </GlassCard>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Pipeline Status */}
            <div className="lg:col-span-2">
              <GlassCard intensity="light" className="p-8">
                <h2 className="text-2xl font-bold text-[#3D2E1E] mb-6">Pipeline Status</h2>

                {/* Pipeline Steps */}
                <div className="space-y-4">
                  {[
                    { step: 'Discovery', count: 2345, status: 'running' },
                    { step: 'Validation', count: 1892, status: 'running' },
                    { step: 'Outreach', count: 1234, status: 'scheduled' },
                    { step: 'Monitoring', count: 456, status: 'idle' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-[#F5F0E8]/50 rounded-lg hover:bg-[#EDE5D0]/50 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-2 h-2 rounded-full bg-[#8B4A2F]" />
                        <div>
                          <p className="font-semibold text-[#3D2E1E]">{item.step}</p>
                          <p className="text-sm text-[#7A6A52]">{item.count.toLocaleString()} items</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'running' ? 'bg-[#5A6B50]/10 text-[#5A6B50]' :
                          item.status === 'scheduled' ? 'bg-[#C4943A]/10 text-[#C4943A]' :
                          'bg-[#7A6A52]/10 text-[#7A6A52]'
                        }`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-6">View Full Pipeline</Button>
              </GlassCard>

              {/* Recent Campaigns */}
              <GlassCard intensity="light" className="p-8 mt-8">
                <h2 className="text-2xl font-bold text-[#3D2E1E] mb-6">Recent Campaigns</h2>

                <div className="space-y-4">
                  {[
                    { name: 'Q1 Tech Outreach', status: 'active', leads: 1250, responses: 340 },
                    { name: 'SaaS Cold Call', status: 'paused', leads: 890, responses: 145 },
                    { name: 'Enterprise B2B', status: 'draft', leads: 0, responses: 0 },
                  ].map((campaign, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-[#F5F0E8]/50 rounded-lg hover:bg-[#EDE5D0]/50 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <p className="font-semibold text-[#3D2E1E]">{campaign.name}</p>
                        <p className="text-sm text-[#7A6A52]">{campaign.leads} leads • {campaign.responses} responses</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        campaign.status === 'active' ? 'bg-[#5A6B50]/10 text-[#5A6B50]' :
                        campaign.status === 'paused' ? 'bg-[#C4943A]/10 text-[#C4943A]' :
                        'bg-[#7A6A52]/10 text-[#7A6A52]'
                      }`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-6">View All Campaigns</Button>
              </GlassCard>
            </div>

            {/* Right Column - Quick Actions */}
            <div>
              <GlassCard intensity="light" className="p-8 sticky top-20">
                <h2 className="text-xl font-bold text-[#3D2E1E] mb-6">Quick Actions</h2>

                <div className="space-y-3">
                  <Button
                    onClick={() => router.push('/campaigns?action=create')}
                    className="w-full"
                  >
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      New Campaign
                    </span>
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => router.push('/leads')}
                    className="w-full"
                  >
                    <span className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Manage Leads
                    </span>
                  </Button>

                  <Button
                    variant="tertiary"
                    onClick={() => router.push('/settings')}
                    className="w-full"
                  >
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Config
                    </span>
                  </Button>
                </div>

                {/* Activity Log */}
                <div className="mt-8">
                  <h3 className="font-semibold text-[#3D2E1E] mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <CheckCircle className="w-4 h-4 text-[#5A6B50] mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[#3D2E1E] font-medium">{activity.title}</p>
                            <p className="text-[#7A6A52] text-xs">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 text-[#7A6A52] text-sm">
                        <AlertCircle className="w-4 h-4" />
                        No recent activity
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
