'use client';

import GlassCard from '@/components/GlassCard';
import { Zap, Target, Mail, BarChart3 } from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: <Target size={24} />,
      title: 'Smart Lead Generation',
      description: 'Our AI identifies and collects high-quality leads based on your target criteria, industry, and location preferences.'
    },
    {
      icon: <Mail size={24} />,
      title: 'Automated Outreach',
      description: 'Send personalized email campaigns to your leads automatically using your configured SMTP settings.'
    },
    {
      icon: <BarChart3 size={24} />,
      title: 'Performance Analytics',
      description: 'Track delivery rates, open rates, and responses with detailed reports delivered to your email.'
    },
    {
      icon: <Zap size={24} />,
      title: 'Seamless Integration',
      description: 'Connect with Google Sheets, Slack, and other tools to streamline your workflow.'
    }
  ];

  const teamValues = [
    { label: 'Innovation', description: 'Continuously improving our AI algorithms' },
    { label: 'Security', description: 'Protecting your data with enterprise-grade encryption' },
    { label: 'Reliability', description: '99.9% uptime guarantee' },
    { label: 'Support', description: '24/7 customer assistance' }
  ];

  return (
    <div className="flex-1 dashboard-preview" style={{ padding: '2rem 4rem', background: 'var(--parchment)', minHeight: 'calc(100vh - 80px)' }}>
      <div className="db-header reveal visible">
        <div className="section-tag">About Us</div>
        <div>
          <h2 className="section-title">Meet <em>LeadGenius</em></h2>
        </div>
      </div>

      <div className="reveal visible" style={{ maxWidth: '800px', margin: '0 auto', marginTop: '3rem' }}>
        <GlassCard>
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ textAlign: 'center', paddingBottom: '2rem', borderBottom: '1px solid rgba(184,169,138,0.2)' }}>
              <p style={{ color: 'var(--umber)', lineHeight: 1.8, fontSize: '1rem' }}>
                LeadGenius is a powerful AI-driven lead generation and outreach automation platform designed to help businesses scale their customer acquisition efforts effortlessly. 
              </p>
              <p style={{ color: 'var(--umber)', lineHeight: 1.8, fontSize: '1rem', marginTop: '1rem' }}>
                Our mission is to make high-quality lead generation accessible to businesses of all sizes by combining cutting-edge AI technology with intuitive, user-friendly tools.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--espresso)', marginBottom: '1.5rem', fontFamily: '"Cormorant Garamond", serif', textAlign: 'center' }}>What We Do</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                {features.map((feature, index) => (
                  <div key={index} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', border: '1px solid rgba(184,169,138,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: 'var(--rust)' }}>
                      {feature.icon}
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--espresso)', margin: 0 }}>{feature.title}</h4>
                    </div>
                    <p style={{ color: 'var(--umber)', lineHeight: 1.6, fontSize: '0.85rem', margin: 0 }}>{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(184,169,138,0.2)' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--espresso)', marginBottom: '1.5rem', fontFamily: '"Cormorant Garamond", serif', textAlign: 'center' }}>Our Values</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {teamValues.map((value, index) => (
                  <div key={index} style={{ textAlign: 'center', padding: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gold)', marginBottom: '0.5rem' }}>{value.label}</h4>
                    <p style={{ color: 'var(--umber)', lineHeight: 1.5, fontSize: '0.8rem', margin: 0 }}>{value.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(184,169,138,0.2)', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--espresso)', marginBottom: '1rem', fontFamily: '"Cormorant Garamond", serif' }}>Join Our Journey</h3>
              <p style={{ color: 'var(--umber)', lineHeight: 1.8, fontSize: '0.95rem' }}>
                Whether you're a startup looking to build your customer base or an enterprise seeking to optimize your outreach, LeadGenius is here to help you succeed.
              </p>
              <p style={{ color: 'var(--umber)', lineHeight: 1.8, fontSize: '0.95rem', marginTop: '1rem' }}>
                Get started today and experience the future of automated lead generation.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', paddingTop: '1rem' }}>
              <a href="/register" style={{ padding: '0.75rem 2rem', background: 'var(--espresso)', color: 'var(--ivory)', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Get Started
              </a>
              <a href="/guide" style={{ padding: '0.75rem 2rem', background: 'transparent', color: 'var(--espresso)', border: '1px solid rgba(184,169,138,0.4)', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Learn More
              </a>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}