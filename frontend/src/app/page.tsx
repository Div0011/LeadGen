'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function Home() {
  const [pActiveNode, setPActiveNode] = useState(1);
  const revealsRef = useRef<HTMLDivElement>(null);

  // Pipeline node animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPActiveNode((prev) => {
        const nextVal = prev + 1;
        return nextVal > 5 ? 1 : nextVal;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // stop observing once visible
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -50px 0px" } // lower threshold ensures it triggers earlier
    );

    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Counter animation
  useEffect(() => {
    const animCount = (el: HTMLElement | null, target: number) => {
      if (!el) return;
      let start = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        start += step;
        el.textContent = Math.floor(start).toLocaleString();
        if (start >= target) {
          clearInterval(timer);
          el.textContent = target.toLocaleString();
        }
      }, 1000 / 60);
    };

    setTimeout(() => {
      animCount(document.getElementById('mLeads'), 12483);
      animCount(document.getElementById('mRate'), 18);
    }, 600);
  }, []);

  // Mini chart
  useEffect(() => {
    const bars = [40, 55, 45, 70, 60, 80, 65, 90, 75, 85, 72, 95];
    const chartEl = document.getElementById('miniChart');
    if (chartEl && chartEl.children.length === 0) {
      bars.forEach((h) => {
        const b = document.createElement('div');
        b.className = 'cbar';
        b.style.height = h + '%';
        chartEl.appendChild(b);
      });
    }
  }, []);

  return (
    <>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-bg"></div>
        <div className="hero-line"></div>
        <div className="hero-content">
          <div className="hero-tag">Intelligent Lead Generation</div>
          <h1 className="hero-title">
            Precision Leads. <em>Automated.</em>
          </h1>
          <p className="hero-subtitle">
            LeadGenius discovers, validates, and contacts your ideal prospects — 24 hours a day, 7 days a week. You
            focus on closing; we handle everything else.
          </p>
          <div className="hero-actions">
            <Link href="/login" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              BEGIN YOUR CAMPAIGN
            </Link>
            <button className="btn-ghost">
              See how it works <span>↓</span>
            </button>
          </div>
        </div>
        <div className="hero-metrics">
          <div className="metric-card">
            <div className="metric-val" id="mLeads">
              0
            </div>
            <div className="metric-label">Leads Qualified</div>
          </div>
          <div className="metric-card">
            <div className="metric-val" id="mRate">
              0
            </div>
            <div className="metric-label">Avg Reply Rate</div>
          </div>
          <div className="metric-card">
            <div className="metric-val">2,847</div>
            <div className="metric-label">Meetings Booked</div>
          </div>
        </div>
      </section>

      {/* Ticker Banner */}
      <div className="ticker">
        <div className="ticker-track" id="tickerTrack">
          {[
            'Lead Discovery',
            'Email Validation',
            'Automated Outreach',
            'Reply Monitoring',
            'Campaign Analytics',
            'Brochure Distribution',
            'Google Sheets Export',
            '24/7 Automation',
          ].map((item) => (
            <span className="ticker-item" key={item}>
              {item}
            </span>
          ))}
          {[
            'Lead Discovery',
            'Email Validation',
            'Automated Outreach',
            'Reply Monitoring',
            'Campaign Analytics',
            'Brochure Distribution',
            'Google Sheets Export',
            '24/7 Automation',
          ].map((item) => (
            <span className="ticker-item" key={item + '-2'}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <section className="how-it-works" id="how">
        <div className="section-tag">The Process</div>
        <h2 className="section-title">
          Five steps from<br />
          <em>prospect to partner</em>
        </h2>
        <div className="how-grid">
          <div className="steps-list">
            {[
              {
                num: 1,
                title: 'Prospect Discovery',
                desc: 'LeadGenius uses advanced search to identify agencies matching your ideal client profile across the entire web.',
              },
              {
                num: 2,
                title: 'Email Validation',
                desc: 'Every prospect email is verified in real-time. No bounces, no wasted outreach, only valid contacts.',
              },
              {
                num: 3,
                title: 'Personalized Outreach',
                desc: 'Automated yet personal emails are sent on your behalf, referencing specific company details to build instant rapport.',
              },
              {
                num: 4,
                title: 'Reply Monitoring',
                desc: 'Every reply is captured and categorized. Follow-ups are triggered automatically based on lead behavior.',
              },
              {
                num: 5,
                title: 'Conversion Tracking',
                desc: 'Track every lead from first contact to close. Real-time dashboards show exactly which campaigns convert.',
              },
            ].map((step) => (
              <div className="step-item" key={step.num}>
                <div className="step-num">{step.num}</div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="how-visual reveal">
            <div className="pipeline-display">
              <div className="pipeline-title">Pipeline in Motion</div>
              <div className="pipeline-nodes">
                {[
                  { label: 'Discovered', value: '342' },
                  { label: 'Validated', value: '298' },
                  { label: 'Contacted', value: '256' },
                  { label: 'Replied', value: '47' },
                  { label: 'Converted', value: '12' },
                ].map((node, i) => (
                  <React.Fragment key={i}>
                    <div className={`pnode ${pActiveNode === i + 1 ? 'active' : ''}`}>
                      <div className="pnode-dot"></div>
                      <div className="pnode-label">{node.label}</div>
                      <div className="pnode-count">{node.value}</div>
                    </div>
                    {i < 4 && <div className="connector"></div>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="dashboard-preview" id="dashboard">
        <div className="db-header reveal">
          <div>
            <div className="section-tag">Dashboard</div>
            <h2 className="section-title">
              Real-time insights into <em>every campaign</em>
            </h2>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--umber)' }}>Last updated: 2 minutes ago</div>
        </div>

        <div className="db-grid reveal">
          {[
            { val: '1,247', label: 'Leads Qualified', change: '↑ 12% from last week' },
            { val: '342', label: 'Emails Sent', change: '↑ 28% from last week' },
            { val: '62', label: 'Replies Received', change: '18% reply rate' },
            { val: '12', label: 'Meetings Booked', change: '↑ 33% from last week' },
          ].map((stat, i) => (
            <div className="db-stat" key={i}>
              <div className="db-stat-val">{stat.val}</div>
              <div className="db-stat-label">{stat.label}</div>
              <div className="db-stat-change">{stat.change}</div>
            </div>
          ))}
        </div>

        <div className="db-main reveal">
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
            <div className="mini-chart" id="miniChart"></div>
            <div style={{ marginTop: '1rem' }}>
              {[
                { name: 'Campaign: Q2 Outreach', progress: 'Active', dot: 'running' },
                { name: 'Email Validation', progress: '100%', dot: 'completed' },
                { name: 'Follow-up Queue', progress: '24', dot: 'pending' },
              ].map((task, i) => (
                <div className="task-item" key={i}>
                  <div className={`task-dot ${task.dot}`}></div>
                  <div className="task-name">{task.name}</div>
                  <div className="task-progress">{task.progress}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section className="campaigns-section" id="campaigns">
        <div className="section-tag reveal">Campaigns</div>
        <h2 className="section-title reveal">
          All your <em>campaigns,</em>
          <br />
          in one place
        </h2>
        <div className="campaigns-grid">
          {[
            {
              title: 'Q2 Tech Agencies',
              location: 'United States',
              progress: 75,
              status: 'running',
              stats: [
                { val: '342', label: 'Leads' },
                { val: '62', label: 'Replied' },
              ],
            },
            {
              title: 'Enterprise Markets',
              location: 'EMEA & APAC',
              progress: 48,
              status: 'running',
              stats: [
                { val: '218', label: 'Leads' },
                { val: '31', label: 'Replied' },
              ],
            },
            {
              title: 'Pilot Program',
              location: 'Canada',
              progress: 100,
              status: 'completed',
              stats: [
                { val: '47', label: 'Leads' },
                { val: '12', label: 'Converted' },
              ],
            },
          ].map((campaign, i) => (
            <div className={`campaign-card ${campaign.status}-camp`} key={i}>
              <div className="camp-status">
                <div className="camp-status-dot"></div>
                {campaign.status === 'running' ? 'Active' : 'Completed'}
              </div>
              <h3 className="camp-title">{campaign.title}</h3>
              <div className="camp-loc">{campaign.location}</div>
              <div className="camp-progress-bar">
                <div className="camp-progress-fill" style={{ width: `${campaign.progress}%` }}></div>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--umber)', marginBottom: '1rem' }}>
                {campaign.progress}% complete
              </div>
              <div className="camp-stats">
                {campaign.stats.map((stat, idx) => (
                  <div className="camp-stat" key={idx}>
                    <div className="camp-stat-val">{stat.val}</div>
                    <div className="camp-stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Automation Section */}
      <section className="automation-section" id="automation">
        <div className="auto-inner">
          <div className="auto-content">
            <div className="section-tag">Automation</div>
            <h2 className="section-title">
              Works while you <em>sleep</em>
            </h2>
            <p>
              Set it once, forget it. LeadGenius runs 24/7, discovering new prospects, validating contacts, and sending
              personalized outreach — all without you lifting a finger. Your campaigns never stop working.
            </p>
          </div>

          <div className="auto-schedule">
            {[
              { time: '12:00 AM', name: 'Lead Discovery', freq: 'Every 4 hours', badge: 'Active' },
              { time: '02:30 AM', name: 'Email Outreach', freq: 'Batch campaign', badge: 'Paused' },
              { time: '08:15 AM', name: 'Reply Monitoring', freq: 'Real-time', badge: 'Active' },
              { time: '04:00 PM', name: 'Follow-up Sequence', freq: 'Daily', badge: 'Active' },
            ].map((item, i) => (
              <div className="schedule-item" key={i}>
                <div className="sched-time">{item.time}</div>
                <div className="sched-info">
                  <div className="sched-name">{item.name}</div>
                  <div className="sched-freq">{item.freq}</div>
                </div>
                <div className="sched-badge">{item.badge}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      
    </>
  );
}
