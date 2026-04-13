'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Download, Trash2, Mail, Phone, MapPin, TrendingUp, Filter, ChevronRight, X } from 'lucide-react';
import Button from '@/components/Button';
import GlassCard from '@/components/GlassCard';
import { leadsApi, campaignsApi } from '@/services/api';

interface Lead {
  id: string;
  business_name: string;
  contact_person: string;
  email: string;
  phone: string | null;
  website: string;
  status: string;
  email_valid: boolean | null;
  email_validation_status: string | null;
  source: string;
  created_at: string;
  campaign_id: string | null;
  email_opened?: boolean;
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadCampaigns();
    loadLeads();
  }, [campaignFilter]);

  const loadCampaigns = async () => {
    try {
      const response = await campaignsApi.getAll();
      setCampaigns(response.data || []);
    } catch (err) {
      setCampaigns([]);
    }
  };

  const loadLeads = async () => {
    try {
      setLoading(true);
      try {
        const params: any = {};
        if (campaignFilter && campaignFilter !== 'all') {
          params.campaign_id = campaignFilter;
        }
        const response = await leadsApi.getAll(params);
        setLeads(response.data.slice(0, 100).map((lead: any) => ({
          id: lead.id,
          business_name: lead.business_name || 'Unknown',
          contact_person: lead.contact_person || '',
          email: lead.email,
          phone: lead.phone || null,
          website: lead.website || '',
          status: lead.status || 'scraped',
          email_valid: lead.email_valid ?? null,
          email_validation_status: lead.email_validation_status || null,
          source: lead.source || 'manual',
          created_at: lead.created_at,
          campaign_id: lead.campaign_id || null,
          email_opened: lead.email_opened || false,
        })));
      } catch (err) {
        console.error('Failed to load leads:', err);
        setLeads([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setCampaignFilter('all');
    setStatusFilter('all');
    setSearchTerm('');
  };

  const handleSendLead = async (lead: Lead) => {
    if (!confirm(`Send email to ${lead.email}?`)) return;

    try {
      // Call API to send email
      await leadsApi.send(lead.id);
      // Refresh list
      await loadLeads();
      alert(`Email sent to ${lead.email}`);
    } catch (err: any) {
      console.error('Failed to send email:', err);
      alert(err.response?.data?.detail || 'Failed to send email');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      await leadsApi.delete(leadId);
      setLeads(leads.filter(l => l.id !== leadId));
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    } catch (err) {
      console.error('Failed to delete lead:', err);
      alert('Failed to delete lead');
    }
  };

  const handleBulkSend = async () => {
    if (selectedLeads.length === 0) {
      alert('Please select leads to send');
      return;
    }
    if (!confirm(`Send emails to ${selectedLeads.length} leads?`)) return;
    
    try {
      for (const leadId of selectedLeads) {
        await leadsApi.send(leadId);
      }
      await loadLeads();
      setSelectedLeads([]);
      alert(`Emails sent to ${selectedLeads.length} leads`);
    } catch (err) {
      console.error('Failed to send emails:', err);
      alert('Failed to send emails');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) {
      alert('Please select leads to delete');
      return;
    }

    // Check if any selected leads are sent
    const sentLeads = selectedLeads.filter(id => leads.find(l => l.id === id)?.status === 'sent');
    if (sentLeads.length > 0) {
      alert('Cannot delete leads that have already been sent emails');
      return;
    }

    if (!confirm(`Delete ${selectedLeads.length} leads?`)) return;

    try {
      for (const leadId of selectedLeads) {
        await leadsApi.delete(leadId);
      }
      setLeads(leads.filter(l => !selectedLeads.includes(l.id)));
      setSelectedLeads([]);
    } catch (err) {
      console.error('Failed to delete leads:', err);
      alert('Failed to delete leads');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.contact_person && lead.contact_person.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = (leadsToExport: Lead[]) => {
    const headers = ['Business Name', 'Contact Person', 'Email', 'Phone', 'Website', 'Status', 'Email Validation', 'Source', 'Created At'];
    const rows = leadsToExport.map(lead => [
      lead.business_name,
      lead.contact_person || '',
      lead.email,
      lead.phone || '',
      lead.website,
      lead.status,
      lead.email_validation_status || 'not validated',
      lead.source,
      lead.created_at || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleExport = () => {
    if (filteredLeads.length === 0) {
      alert('No leads to export');
      return;
    }
    exportToCSV(filteredLeads);
  };

  const getCampaignName = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign ? campaign.name : 'Unknown Campaign';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'scraped': 'bg-blue-100 text-blue-700',
      'validated': 'bg-purple-100 text-purple-700',
      'sent': 'bg-yellow-100 text-yellow-700',
      'replied': 'bg-green-100 text-green-700',
      'bounced': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getEmailStatusColor = (status: string | null) => {
    if (status === 'valid') return 'text-green-600';
    if (status === 'invalid') return 'text-red-600';
    if (status === 'accept_all') return 'text-yellow-600';
    return 'text-gray-500';
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
            <Button variant="secondary" onClick={handleExport} className="btn-ghost" style={{ background: 'transparent', border: '1px solid rgba(184,169,138,0.4)', padding: '.75rem 1.5rem', color: 'var(--umber)' }}>
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
                <option value="validated">Validated</option>
                <option value="sent">Sent</option>
                <option value="replied">Replied</option>
                <option value="bounced">Bounced</option>
              </select>
            </div>
          </div>
          
          {/* Bulk Actions */}
          {selectedLeads.length > 0 && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', padding: '1rem', background: 'rgba(196,148,58,0.1)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--umber)', fontSize: '0.9rem', alignSelf: 'center' }}>
                {selectedLeads.length} lead(s) selected
              </span>
              <button 
                onClick={handleBulkSend}
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'var(--espresso)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', letterSpacing: '0.1em' }}
              >
                SEND ALL
              </button>
              <button 
                onClick={handleBulkDelete}
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'transparent', color: 'var(--rust)', border: '1px solid var(--rust)', borderRadius: '4px', cursor: 'pointer' }}
              >
                DELETE ALL
              </button>
              <button 
                onClick={() => setSelectedLeads([])}
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'transparent', color: 'var(--umber)', border: '1px solid var(--umber)', borderRadius: '4px', cursor: 'pointer' }}
              >
                CLEAR
              </button>
            </div>
          )}
        </div>

        {/* Leads Table */}
        <div className="db-panel reveal visible" style={{ opacity: 0, animation: "fadeUp .8s ease 0.6s forwards", padding: "0", overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse", fontFamily: "'Jost', sans-serif" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(184,169,138,0.2)" }}>
                <th style={{ padding: "0.75rem", textAlign: "left", color: "var(--umber)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", width: "35px" }}>
                  <input type="checkbox" checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0} onChange={(e) => { if (e.target.checked) { setSelectedLeads(filteredLeads.map(l => l.id)); } else { setSelectedLeads([]); } }} style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--gold)" }} />
                </th>
                <th style={{ padding: "0.75rem", textAlign: "left", color: "var(--umber)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Business</th>
                <th style={{ padding: "0.75rem", textAlign: "left", color: "var(--umber)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Contact</th>
                <th style={{ padding: "0.75rem", textAlign: "left", color: "var(--umber)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Email</th>
                <th style={{ padding: "0.75rem", textAlign: "left", color: "var(--umber)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Phone</th>
                <th style={{ padding: "0.75rem", textAlign: "left", color: "var(--umber)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Email</th>
                <th style={{ padding: "0.75rem", textAlign: "left", color: "var(--umber)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "0.75rem", textAlign: "left", color: "var(--umber)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, i) => (
                <tr key={lead.id} style={{ borderBottom: '1px solid rgba(184,169,138,0.1)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(237,229,208,0.6)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.75rem' }}>
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        disabled={lead.status === 'sent'}
                        onChange={(e) => {
                          if (e.target.checked && lead.status !== 'sent') {
                            setSelectedLeads([...selectedLeads, lead.id]);
                          } else {
                            setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: lead.status === 'sent' ? 'not-allowed' : 'pointer',
                          accentColor: 'var(--gold)',
                          opacity: lead.status === 'sent' ? 0.5 : 1
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem' }} onClick={() => router.push(`/leads/${lead.id}`)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div className="lead-avatar" style={{width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 500, background: 'rgba(196,148,58,0.1)', color: 'var(--gold)', flexShrink: 0}}>
                            {lead.business_name[0]}
                          </div>
                          <div>
                            <div style={{fontSize: '.8rem', fontWeight: 400, color: 'var(--espresso)'}}>{lead.business_name}</div>
                            <div style={{fontSize: '.65rem', color: 'var(--umber)'}}>{lead.website}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.5rem', color: 'var(--umber)', fontSize: '0.8rem' }}>{lead.contact_person || '-'}</td>
                      <td style={{ padding: '0.5rem', color: 'var(--umber)', fontSize: '0.8rem' }}>{lead.email}</td>
                      <td style={{ padding: '0.5rem', color: 'var(--umber)', fontSize: '0.8rem' }}>{lead.phone || '-'}</td>
                      <td style={{ padding: '0.5rem' }}>
                        <span style={{ fontSize: '.65rem', color: getEmailStatusColor(lead.email_validation_status) }}>
                          {lead.email_validation_status || 'not validated'}
                        </span>
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <span style={{ fontSize: '.6rem', padding: '.15rem .4rem', borderRadius: '3px', letterSpacing: '.1em', background: lead.email_opened ? 'rgba(34,139,34,0.2)' : lead.status === 'validated' ? 'rgba(90,107,80,0.15)' : lead.status === 'sent' ? 'rgba(196,148,58,0.15)' : 'rgba(184,169,138,0.15)', color: lead.email_opened ? 'forestgreen' : lead.status === 'validated' ? 'var(--sage)' : lead.status === 'sent' ? 'var(--gold)' : 'var(--umber)' }}>
                          {lead.email_opened ? 'OPENED' : lead.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {lead.status !== 'sent' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSendLead(lead); }}
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', background: 'var(--espresso)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', letterSpacing: '0.1em' }}
                            >
                              SEND
                            </button>
                          )}
                          {lead.status === 'sent' && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--gold)', padding: '0.4rem 0.8rem' }}>SENT</span>
                          )}
                          {lead.status !== 'sent' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteLead(lead.id); }}
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', background: 'transparent', color: 'var(--rust)', border: '1px solid var(--rust)', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              DELETE
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
