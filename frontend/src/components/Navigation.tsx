'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);

    handleResize();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    const checkAuth = () => setIsAuthenticated(!!localStorage.getItem('auth_token'));
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [pathname]);

  const navLinks = isAuthenticated ? [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Leads', href: '/leads' },
    { label: 'Campaigns', href: '/campaigns' },
    { label: 'Settings', href: '/settings' },
    { label: 'Guide', href: '/guide' },
  ] : [
    { label: 'Process', href: '/#how' },
    { label: 'About', href: '/about' },
    { label: 'Get Started', href: '/#onboard' },
    { label: 'Privacy', href: '/privacy' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsMenuOpen(false);
    window.dispatchEvent(new Event('storage'));
    router.push('/');
  };

  return (
    <div 
      className="fixed top-0 z-[500] w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ height: '80px' }}
    >
      <nav id="navbar" style={{
        position: 'absolute', top: 0, left: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.2rem 5vw', background: isHovered || !scrolled || (isMobile && isMenuOpen) ? 'rgba(245,240,232, 1)' : 'rgba(245,240,232, 0)',
        backdropFilter: scrolled && !isHovered && !(isMobile && isMenuOpen) ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled && !isHovered && !(isMobile && isMenuOpen) ? 'blur(12px)' : 'none',
        borderBottom: scrolled && isHovered ? '1px solid rgba(184,169,138,0.1)' : 'none', 
        transition: 'all 0.3s ease',
        width: '100%', height: '100%',
      }}>
        
        {/* Left Side: Burger Menu + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--espresso)', 
              cursor: 'pointer', 
              display: isHovered || !scrolled ? 'flex' : 'none',
              alignItems: 'center',
              transition: 'opacity 0.3s ease'
            }}
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
          
          <Link href={isAuthenticated ? '/dashboard' : '/'} className="nav-logo" onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', position: 'relative' }}>
            {/* Main logo - updated to icon.png */}
            <Image src="/icon.png" alt="LeadGenius Logo" width={40} height={40} style={{ objectFit: 'contain', borderRadius: '8px' }} unoptimized />
            <span style={{ fontSize: '1.3rem', fontWeight: 600 }}>Lead<span style={{ color: 'var(--rust)' }}>Genius</span></span>
          </Link>
        </div>

        {/* Center: Nav Links - only visible on hover or when not scrolled */}
        {!isMobile && (isHovered || !scrolled) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '2.5rem', overflow: 'hidden',
            flex: 1, justifyContent: 'center', whiteSpace: 'nowrap',
            opacity: isHovered || !scrolled ? 1 : 0, transition: 'opacity 0.3s ease'
          }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link" style={{ color: 'var(--espresso)', textDecoration: 'none', fontWeight: 500 }} onClick={() => setIsMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right Side: Back & Auth CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          {isAuthenticated && pathname !== '/dashboard' && pathname !== '/' && !isMobile && (
            <button onClick={() => router.back()} className="btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ← Back
            </button>
          )}
          {isAuthenticated ? (
            <button onClick={handleLogout} className="nav-cta">Logout</button>
          ) : (
            <Link href="/login" className="nav-cta" style={{ display: 'inline-block', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>
              Begin →
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobile && (
        <div style={{ position: 'absolute', top: '80px', left: 0, width: '100%', height: isMenuOpen ? 'calc(100vh - 80px)' : '0px', overflow: 'hidden',
          background: 'rgba(245,240,232, 0.98)', backdropFilter: 'blur(16px)', transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 499 }}>
          <div style={{ padding: '3vw 5vw', display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--espresso)', textDecoration: 'none' }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
