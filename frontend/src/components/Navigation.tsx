'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Zap, Settings, FileText, Sun, Moon } from 'lucide-react';
import Image from 'next/image';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    const handleResize = () => setIsMobile(window.innerWidth < 1024);

    handleResize();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
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

  // System theme detection
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');
    
    if (storedTheme === 'dark' || (!storedTheme && isDark)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navLinks = isAuthenticated ? [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Leads', href: '/leads', icon: Users },
    { label: 'Campaigns', href: '/campaigns', icon: Zap },
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'Guide', href: '/guide', icon: FileText },
  ] : [
    { label: 'Process', href: '/#how' },
    { label: 'About', href: '/about' },
    { label: 'Get Started', href: '/#onboard' },
    { label: 'Privacy', href: '/privacy' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
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
        padding: '1.2rem 5vw', background: 'transparent',
        transition: 'all 0.3s ease',
        width: '100%', height: '100%',
        pointerEvents: 'none'
      }}>
        
        {/* Left Side: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, pointerEvents: 'auto' }}>
          <div style={{
            background: scrolled ? 'color-mix(in srgb, var(--ivory) 75%, transparent)' : 'transparent',
            backdropFilter: scrolled ? 'blur(12px)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
            padding: scrolled ? '0.5rem 1.2rem' : '0rem',
            borderRadius: '100px',
            border: scrolled ? '1px solid color-mix(in srgb, var(--tan) 20%, transparent)' : '1px solid transparent',
            transition: 'all 0.3s ease'
          }}>
            <Link href={isAuthenticated ? '/dashboard' : '/'} className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', position: 'relative' }}>
              {/* Main logo */}
              <Image src="/logo.svg" alt="LeadGenius Logo" width={34} height={34} style={{ objectFit: 'contain' }} unoptimized />
              <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>Lead<span style={{ color: 'var(--rust)' }}>Genius</span></span>
            </Link>
          </div>
        </div>

        {/* Center: Nav Links */}
        {!isMobile && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '2.5rem', overflow: 'hidden',
            flex: 1, justifyContent: 'center', whiteSpace: 'nowrap',
            opacity: isHovered || !scrolled ? 1 : 0, 
            transform: isHovered || !scrolled ? 'translateY(0)' : 'translateY(-15px)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: isHovered || !scrolled ? 'auto' : 'none'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '2.5rem',
              background: scrolled ? 'color-mix(in srgb, var(--ivory) 90%, transparent)' : 'transparent',
              backdropFilter: scrolled ? 'blur(12px)' : 'none',
              WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
              border: scrolled ? '1px solid color-mix(in srgb, var(--tan) 20%, transparent)' : '1px solid transparent',
              padding: scrolled ? '0.7rem 2rem' : '0rem',
              borderRadius: '100px',
              transition: 'all 0.3s ease'
            }}>
              {navLinks.map((link) => {
                const Icon = (link as any).icon;
                return (
                  <Link key={link.href} href={link.href} className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--espresso)', textDecoration: 'none', fontWeight: 500 }}>
                    {Icon && <Icon size={14} />}
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Side: Back & Auth CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0, pointerEvents: 'auto' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            background: scrolled ? 'color-mix(in srgb, var(--ivory) 75%, transparent)' : 'transparent',
            backdropFilter: scrolled ? 'blur(12px)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
            padding: scrolled ? '0.5rem 1.2rem' : '0rem',
            borderRadius: '100px',
            border: scrolled ? '1px solid color-mix(in srgb, var(--tan) 20%, transparent)' : '1px solid transparent',
            transition: 'all 0.3s ease'
          }}>
            {isAuthenticated && pathname !== '/dashboard' && pathname !== '/' && !isMobile && (
              <button onClick={() => router.back()} className="btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ← Back
              </button>
            )}
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              style={{ color: 'var(--espresso)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {isAuthenticated ? (
              <button onClick={handleLogout} className="nav-cta">Logout</button>
            ) : (
              <Link href="/login" className="nav-cta" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Begin →
              </Link>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
