'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        company_name: formData.company,
      } as any);
      const loginResponse = await authApi.login({ 
        email: formData.email, 
        password: formData.password 
      });
      localStorage.setItem('auth_token', loginResponse.data.api_key);
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6rem 2rem',
      fontFamily: "'Jost', sans-serif"
    }}>
      <div className="glass-section" style={{ width: '100%', maxWidth: '600px', opacity: 0, animation: 'fadeUp .8s ease forwards' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '3.5rem',
            fontWeight: 600,
            color: 'var(--espresso)',
            marginBottom: '0.2rem'
          }}>Join LeadGenius</h1>
          <p style={{
            fontSize: '1.2rem',
            fontWeight: 300,
            color: 'var(--umber)'
          }}>Create your account and automate your pipeline</p>
        </div>

        {error && (
          <div style={{
            marginBottom: '2rem', padding: '1rem',
            background: 'rgba(139, 74, 47, 0.1)', border: '1px solid var(--rust)',
            color: 'var(--rust)', fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ borderBottom: '1px solid rgba(184, 169, 138, 0.3)', paddingBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--umber)', marginBottom: '0.8rem' }}>First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" required disabled={loading} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontFamily: "'Jost', sans-serif", fontSize: '1.1rem', color: 'var(--espresso)' }} />
            </div>
            <div style={{ borderBottom: '1px solid rgba(184, 169, 138, 0.3)', paddingBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--umber)', marginBottom: '0.8rem' }}>Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" required disabled={loading} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontFamily: "'Jost', sans-serif", fontSize: '1.1rem', color: 'var(--espresso)' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(184, 169, 138, 0.3)', paddingBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--umber)', marginBottom: '0.8rem' }}>Company</label>
            <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Acme Corp" required disabled={loading} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontFamily: "'Jost', sans-serif", fontSize: '1.1rem', color: 'var(--espresso)' }} />
          </div>

          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(184, 169, 138, 0.3)', paddingBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--umber)', marginBottom: '0.8rem' }}>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required disabled={loading} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontFamily: "'Jost', sans-serif", fontSize: '1.1rem', color: 'var(--espresso)' }} />
          </div>

          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(184, 169, 138, 0.3)', paddingBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--umber)', marginBottom: '0.8rem' }}>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required disabled={loading} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontFamily: "'Jost', sans-serif", fontSize: '1.1rem', color: 'var(--espresso)', letterSpacing: '0.1em' }} />
          </div>

          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(184, 169, 138, 0.3)', paddingBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--umber)', marginBottom: '0.8rem' }}>Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required disabled={loading} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontFamily: "'Jost', sans-serif", fontSize: '1.1rem', color: 'var(--espresso)', letterSpacing: '0.1em' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--umber)', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{ 
                  appearance: 'none', width: '16px', height: '16px', 
                  border: termsAccepted ? 'none' : '1px solid rgba(184, 169, 138, 0.5)', 
                  background: termsAccepted 
                    ? 'var(--rust) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'20 6 9 17 4 12\'%3E%3C/polyline%3E%3C/svg%3E") center/70% no-repeat' 
                    : 'transparent',
                  borderRadius: '2px',
                  outline: 'none',
                  cursor: 'pointer'
                }} 
              />
              I agree to the <Link href="#" style={{ color: 'var(--rust)', textDecoration: 'none' }}>Terms of Service</Link>
            </label>
          </div>

          <button type="submit" disabled={loading} style={{
             width: '100%', padding: '1.2rem',
             background: 'var(--espresso)', color: 'var(--ivory)',
             border: 'none', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase',
             display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
             transition: 'background 0.3s'
          }}>
            {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
            {!loading && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--umber)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--rust)', textDecoration: 'none' }}>Sign in</Link>
        </div>

      </div>
    </div>
  );
}
