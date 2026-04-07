'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isLandingPage = pathname === '/';

  useEffect(() => {
    const checkAuth = () => setIsAuthenticated(!!localStorage.getItem('auth_token'));
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [pathname]);

  const handleProtectedAction = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push(path);
    } else {
      router.push('/login');
    }
  };

  // Landing page footer - minimal, no access to features without login
  if (isLandingPage && !isAuthenticated) {
    return (
      <footer style={{
        background: 'var(--espresso)',
        padding: '3rem 5vw 2rem',
        marginTop: 'auto',
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative gradient overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(139,74,47,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Logo with watermark effect */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%) rotate(90deg)', 
              opacity: 0.1, 
              width: '80px', 
              height: '80px', 
              zIndex: -1 
            }}>
              <Image src="/logo.png" alt="" fill style={{ objectFit: 'contain' }} unoptimized />
            </div>
            <Image src="/logo.png" alt="LeadGenius Logo" width={32} height={32} style={{ objectFit: 'contain' }} unoptimized />
            <span style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--parchment)' }}>Lead<span style={{ color: 'var(--rust)' }}>Genius</span></span>
          </Link>

          {/* CTA to login */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'rgba(217,205,180,0.6)', marginBottom: '1rem', maxWidth: '400px' }}>
              Ready to automate your lead generation? Sign in to access all features.
            </p>
            <Link 
              href="/login" 
              style={{
                display: 'inline-block',
                padding: '0.8rem 2rem',
                background: 'var(--rust)',
                color: 'var(--ivory)',
                textDecoration: 'none',
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease'
              }}
            >
              Sign In to Continue →
            </Link>
          </div>

          {/* Minimal links */}
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(184,169,138,0.4)', cursor: 'not-allowed' }}>Features</span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(184,169,138,0.4)', cursor: 'not-allowed' }}>Pricing</span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(184,169,138,0.4)', cursor: 'not-allowed' }}>About</span>
          </div>

          <div style={{
            width: '100%',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(184,169,138,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(184,169,138,0.3)' }}>&copy; 2026 LeadGenius. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'rgba(184,169,138,0.3)', cursor: 'not-allowed' }}>Privacy</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(184,169,138,0.3)', cursor: 'not-allowed' }}>Terms</span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Authenticated user footer - full access
  if (isAuthenticated) {
    return (
      <footer style={{
        background: 'var(--espresso)',
        padding: '4rem 5vw 2rem',
        marginTop: 'auto',
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse 50% 50% at 80% 20%, rgba(196,148,58,0.06) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '3rem',
          marginBottom: '3rem',
          position: 'relative',
          zIndex: 1
        }}>
          <div className="footer-brand">
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', marginBottom: '1rem', position: 'relative' }}>
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%) rotate(90deg)', 
                opacity: 0.1, 
                width: '70px', 
                height: '70px', 
                zIndex: -1 
              }}>
                <Image src="/logo.png" alt="" fill style={{ objectFit: 'contain' }} unoptimized />
              </div>
              <Image src="/logo.png" alt="LeadGenius Logo" width={32} height={32} style={{ objectFit: 'contain' }} unoptimized />
              <span style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--parchment)' }}>Lead<span style={{ color: 'var(--rust)' }}>Genius</span></span>
            </Link>
            <p style={{ fontSize: '0.85rem', color: 'rgba(217,205,180,0.5)', lineHeight: '1.6', maxWidth: '280px' }}>
              Intelligent lead generation for modern agencies. Discover, validate, and convert prospects automatically.
            </p>
          </div>

          <div className="footer-col" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <h4 style={{ color: 'rgba(217,205,180,0.4)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Management</h4>
            <Link href="/dashboard" style={{ color: 'rgba(217,205,180,0.7)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Dashboard</Link>
            <Link href="/leads" style={{ color: 'rgba(217,205,180,0.7)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Leads Directory</Link>
            <Link href="/campaigns" style={{ color: 'rgba(217,205,180,0.7)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Campaigns</Link>
          </div>
          
          <div className="footer-col" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <h4 style={{ color: 'rgba(217,205,180,0.4)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Account</h4>
            <Link href="/settings" style={{ color: 'rgba(217,205,180,0.7)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Settings</Link>
            <Link href="/guide" style={{ color: 'rgba(217,205,180,0.7)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Platform Guide</Link>
          </div>
          
          <div className="footer-col" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <h4 style={{ color: 'rgba(217,205,180,0.4)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Support</h4>
            <Link href="/guide" style={{ color: 'rgba(217,205,180,0.7)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Help Center</Link>
            <Link href="/settings" style={{ color: 'rgba(217,205,180,0.7)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Contact Support</Link>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(184,169,138,0.1)',
          flexWrap: 'wrap',
          gap: '1rem',
          position: 'relative',
          zIndex: 1
        }}>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(184,169,138,0.3)' }}>&copy; 2026 LeadGenius. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="#" style={{ fontSize: '0.7rem', color: 'rgba(184,169,138,0.3)', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ fontSize: '0.7rem', color: 'rgba(184,169,138,0.3)', textDecoration: 'none' }}>Terms</a>
          </div>
        </div>
      </footer>
    );
  }

  // Non-landing page, not authenticated - redirect to login style
  return (
    <footer style={{
      background: 'rgba(245,240,232,0.8)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(184,169,138,0.2)',
      padding: '4rem 5vw 2rem',
      marginTop: 'auto',
      width: '100%'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '3rem',
        marginBottom: '3rem'
      }}>
        <div className="footer-brand">
          <Link href="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', marginBottom: '1rem', position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%) rotate(90deg)', 
              opacity: 0.08, 
              width: '60px', 
              height: '60px', 
              zIndex: -1 
            }}>
              <Image src="/logo.png" alt="" fill style={{ objectFit: 'contain' }} unoptimized />
            </div>
            <Image src="/logo.png" alt="LeadGenius Logo" width={32} height={32} style={{ objectFit: 'contain' }} unoptimized />
            <span style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--espresso)' }}>Lead<span style={{ color: 'var(--rust)' }}>Genius</span></span>
          </Link>
          <p style={{ fontSize: '0.85rem', color: 'var(--umber)', lineHeight: '1.6' }}>
            Intelligent lead generation for modern agencies. Discover, validate, and convert prospects automatically.
          </p>
        </div>

        <div className="footer-col" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h4 style={{ color: 'var(--espresso)', fontWeight: 600, marginBottom: '0.5rem' }}>Platform</h4>
          <a href="#" onClick={(e) => handleProtectedAction(e, '/login')} style={{ color: 'var(--umber)', textDecoration: 'none', fontSize: '0.9rem' }}>Features (Login Required)</a>
          <a href="#" onClick={(e) => handleProtectedAction(e, '/login')} style={{ color: 'var(--umber)', textDecoration: 'none', fontSize: '0.9rem' }}>Automations</a>
        </div>
        <div className="footer-col" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h4 style={{ color: 'var(--espresso)', fontWeight: 600, marginBottom: '0.5rem' }}>Company</h4>
          <a href="#" onClick={(e) => handleProtectedAction(e, '/login')} style={{ color: 'var(--umber)', textDecoration: 'none', fontSize: '0.9rem' }}>About Us</a>
          <a href="#" onClick={(e) => handleProtectedAction(e, '/login')} style={{ color: 'var(--umber)', textDecoration: 'none', fontSize: '0.9rem' }}>Sign In to access</a>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(184,169,138,0.2)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--umber)' }}>&copy; 2026 LeadGenius. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a href="#" style={{ fontSize: '0.8rem', color: 'var(--umber)', textDecoration: 'none' }}>Privacy</a>
          <a href="#" style={{ fontSize: '0.8rem', color: 'var(--umber)', textDecoration: 'none' }}>Terms</a>
        </div>
      </div>
    </footer>
  );
}
