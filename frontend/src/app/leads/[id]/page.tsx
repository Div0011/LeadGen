'use client';
import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-transparent">
      <div className="flex-1 overflow-y-auto dashboard-preview" style={{ minHeight: '100vh', padding: '4rem', background: 'var(--parchment)' }}>
        <div className="db-header reveal visible">
          <div className="section-tag" style={{ animation: 'fadeUp .8s ease forwards' }}>Directory</div>
          <div style={{ opacity: 0, animation: 'fadeUp .8s ease 0.2s forwards' }}>
            <h2 className="section-title">Lead <em>Details</em></h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem', opacity: 0, animation: 'fadeUp .8s ease 0.2s forwards' }}>
             <Button onClick={() => router.back()} className="btn-ghost" style={{ background: 'transparent', border: '1px solid rgba(184,169,138,0.4)', padding: '.75rem 1.5rem', color: 'var(--umber)' }}>
              &larr; Back to Leads
            </Button>
          </div>
        </div>

        <div className="form-card reveal visible" style={{ opacity: 0, animation: 'fadeUp .8s ease 0.4s forwards', padding: '3rem' }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', color: 'var(--espresso)', marginBottom: '0.5rem' }}>Lead ID: {id}</h3>
            <p style={{ color: 'var(--umber)', fontFamily: "'Jost', sans-serif" }}>Details for this lead will appear here once loaded.</p>
        </div>
      </div>
    </div>
  );
}
