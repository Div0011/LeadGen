'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Download, Trash2, Mail, Phone, MapPin, TrendingUp, Filter, ChevronRight } from 'lucide-react';
import Button from '@/components/Button';
import GlassCard from '@/components/GlassCard';
import { leadsApi } from '@/services/api';

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  position: string;
  status: 'new' | 'contacted' | 'interested' | 'qualified' | 'converted';
  score: number;
  addedDate?: string;
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      try {
        const response = await leadsApi.getAll();
        setLeads(response.data.slice(0, 20).map((lead: any) => ({
          id: lead.id,
          name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
          email: lead.email,
          company: lead.company || 'N/A',
          position: lead.title || 'Not specified',
          status: lead.status || 'new',
          score: lead.score || Math.floor(Math.random() * 100),
        })));
      } catch (err) {
        console.error('Failed to load leads:', err);
        setLeads([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'new': 'bg-blue-100 text-blue-700',
      'contacted': 'bg-purple-100 text-purple-700',
      'interested': 'bg-yellow-100 text-yellow-700',
      'qualified': 'bg-green-100 text-green-700',
      'converted': 'bg-emerald-100 text-emerald-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-transparent">

      <div className="flex-1 dashboard-preview" style={{ minHeight: 'calc(100vh - 80px)', padding: '5vw', background: 'var(--parchment)' }}>
        
        <div className="db-header reveal visible">
          <div className="section-tag" style={{ animation: 'fadeUp .8s ease forwards' }}>Directory</div>
          <div style={{ opacity: 0, animation: 'fadeUp .8s ease 0.2s forwards' }}>
            <h2 className="section-title">Lead <em>Database</em></h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem', opacity: 0, animation: 'fadeUp .8s ease 0.2s forwards' }}>
            <Button variant="secondary" onClick={() => leadsApi.getAll()} className="btn-ghost" style={{ background: 'transparent', border: '1px solid rgba(184,169,138,0.4)', padding: '.75rem 1.5rem', color: 'var(--umber)' }}>
              Export
            </Button>
            <Button onClick={() => router.push('/leads/new')} className="btn-primary" style={{ padding: '.75rem 1.5rem', background: 'var(--espresso)', color: 'var(--ivory)', border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '.7rem', letterSpacing: '.2em', textTransform: 'uppercase' }}>
              + Add Lead
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="form-card reveal visible" style={{ opacity: 0, animation: 'fadeUp .8s ease 0.4s forwards', padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1rem' }}>
            <div>
              <input
                type="text"
                placeholder="Search leads by name, email, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="interested">Interested</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="db-panel reveal visible" style={{ opacity: 0, animation: 'fadeUp .8s ease 0.6s forwards', padding: '0' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Jost', sans-serif" }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(184,169,138,0.2)' }}>
                  <th style={{ padding: '1.5rem', textAlign: 'left', color: 'var(--umber)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Name</th>
                  <th style={{ padding: '1.5rem', textAlign: 'left', color: 'var(--umber)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Email</th>
                  <th style={{ padding: '1.5rem', textAlign: 'left', color: 'var(--umber)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Company</th>
                  <th style={{ padding: '1.5rem', textAlign: 'left', color: 'var(--umber)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1.5rem', textAlign: 'left', color: 'var(--umber)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, i) => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid rgba(184,169,138,0.1)', transition: 'background 0.2s', cursor: 'pointer' }} onClick={() => router.push(`/leads/${lead.id}`)} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(237,229,208,0.6)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div className="lead-avatar" style={{width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 500, background: 'rgba(196,148,58,0.1)', color: 'var(--gold)', flexShrink: 0}}>
                            {lead.name === 'Not specified' ? '?' : lead.name[0]}
                          </div>
                          <div>
                            <div style={{fontSize: '.85rem', fontWeight: 400, color: 'var(--espresso)'}}>{lead.name}</div>
                            <div style={{fontSize: '.7rem', color: 'var(--umber)'}}>{lead.position}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--umber)', fontSize: '0.85rem' }}>{lead.email}</td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--espresso)', fontSize: '0.85rem', fontWeight: 500 }}>{lead.company}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ fontSize: '.65rem', padding: '.2rem .5rem', borderRadius: '4px', letterSpacing: '.1em'}} className={`status-${lead.status.toLowerCase().replace(' ', '-')}`}>
                          {lead.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <div style={{ width: '60px', height: '3px', background: 'rgba(184,169,138,0.2)', overflow: 'hidden' }}>
                            <div style={{ width: `${lead.score}%`, height: '100%', background: 'linear-gradient(to right, var(--rust), var(--gold))' }} />
                          </div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--espresso)', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>{lead.score}</span>
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
