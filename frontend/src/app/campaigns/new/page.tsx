'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';

export default function NewCampaignPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-transparent">
      <div className="flex-1 overflow-y-auto dashboard-preview" style={{ minHeight: '100vh', padding: '4rem', background: 'var(--parchment)' }}>
        <div className="db-header reveal visible">
          <div className="section-tag" style={{ animation: 'fadeUp .8s ease forwards' }}>Campaigns</div>
          <div style={{ opacity: 0, animation: 'fadeUp .8s ease 0.2s forwards' }}>
            <h2 className="section-title">Create <em>Campaign</em></h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem', opacity: 0, animation: 'fadeUp .8s ease 0.2s forwards' }}>
             <Button onClick={() => router.back()} className="btn-ghost" style={{ background: 'transparent', border: '1px solid rgba(184,169,138,0.4)', padding: '.75rem 1.5rem', color: 'var(--umber)' }}>
              Cancel
            </Button>
          </div>
        </div>

        <div className="form-card reveal visible" style={{ opacity: 0, animation: 'fadeUp .8s ease 0.4s forwards', padding: '3rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Campaign Name</label>
                <input type="text" placeholder="e.g. Q4 Executive Outreach" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Target Industry</label>
                <input type="text" placeholder="e.g. SaaS, Fintech" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Target Role</label>
                <input type="text" placeholder="e.g. CEO, VP of Sales" className="form-input" />
              </div>
              <Button onClick={() => router.push('/campaigns')} className="btn-primary" style={{ marginTop: '1rem', padding: '.75rem 1.5rem', background: 'var(--espresso)', color: 'var(--ivory)', border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '.7rem', letterSpacing: '.2em', textTransform: 'uppercase' }}>
                Launch Campaign
              </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
