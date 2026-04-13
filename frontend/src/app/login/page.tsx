'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('saved_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      localStorage.setItem('auth_token', response.data.api_key);
      
      if (rememberMe) {
        localStorage.setItem('saved_email', email);
      } else {
        localStorage.removeItem('saved_email');
      }
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
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
      padding: '2rem',
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
          }}>Welcome Back</h1>
          <p style={{
            fontSize: '1.2rem',
            fontWeight: 300,
            color: 'var(--umber)'
          }}>Sign in to your LeadGenius account</p>
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
          {/* Email Row */}
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(184, 169, 138, 0.3)', paddingBottom: '0.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.65rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--umber)',
              marginBottom: '0.8rem'
            }}>Email Address</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--tan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                style={{
                  flex: 1, border: 'none', background: 'transparent', outline: 'none',
                  fontFamily: "'Jost', sans-serif", fontSize: '1.1rem', color: 'var(--espresso)'
                }}
              />
            </div>
          </div>

          {/* Password Row */}
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(184, 169, 138, 0.3)', paddingBottom: '0.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.65rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--umber)',
              marginBottom: '0.8rem'
            }}>Password</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--tan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                style={{
                  flex: 1, border: 'none', background: 'transparent', outline: 'none',
                  fontFamily: "'Jost', sans-serif", fontSize: '1.1rem', color: 'var(--espresso)', letterSpacing: '0.1em'
                }}
              />
            </div>
          </div>

          {/* Options Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--umber)', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ 
                  appearance: 'none', width: '16px', height: '16px', 
                  border: rememberMe ? 'none' : '1px solid rgba(184, 169, 138, 0.5)', 
                  background: rememberMe 
                    ? 'var(--rust) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'20 6 9 17 4 12\'%3E%3C/polyline%3E%3C/svg%3E") center/70% no-repeat' 
                    : 'transparent',
                  borderRadius: '2px',
                  outline: 'none',
                  cursor: 'pointer'
                }} 
              />
              Remember me
            </label>
            <Link href="#" style={{ fontSize: '0.9rem', color: 'var(--rust)', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} style={{
             width: '100%', padding: '1.2rem',
             background: 'var(--espresso)', color: 'var(--ivory)',
             border: 'none', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase',
             display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
             transition: 'background 0.3s'
          }}>
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
            {!loading && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--umber)' }}>
          Don't have an account? <Link href="/register" style={{ color: 'var(--rust)', textDecoration: 'none' }}>Sign up</Link>
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--umber)', marginBottom: '1rem' }}>Or continue with</p>
          <div style={{ display: 'flex', borderTop: '1px solid rgba(184, 169, 138, 0.3)' }}>
            <button style={{
              flex: 1, padding: '1.2rem', border: 'none', background: 'transparent',
              borderRight: '1px solid rgba(184, 169, 138, 0.3)', color: 'var(--espresso)',
              fontSize: '0.8rem', cursor: 'pointer'
            }}>Google</button>
            <button style={{
              flex: 1, padding: '1.2rem', border: 'none', background: 'transparent', color: 'var(--espresso)',
              fontSize: '0.8rem', cursor: 'pointer'
            }}>LinkedIn</button>
          </div>
        </div>

      </div>
    </div>
  );
}
