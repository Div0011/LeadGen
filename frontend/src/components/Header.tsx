'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Menu, X, Sun, Moon, LayoutDashboard, Users, Zap, Settings, LogOut, FileText } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface HeaderProps {
  authenticated?: boolean;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ authenticated = false, onLogout }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [saveDataOptions, setSaveDataOptions] = useState({ state: true, cache: false });
  const [isIdle, setIsIdle] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const headerRef = useRef<HTMLElement>(null);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Idle timer for header
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    
    const handleActivity = () => {
      setIsIdle(false);
      clearTimeout(timeoutId);
      
      if (scrolled) {
        timeoutId = setTimeout(() => {
          if (!isHovered) {
            setIsIdle(true);
          }
        }, 2000);
      }
    };

    if (scrolled) {
      handleActivity();
    } else {
      setIsIdle(false);
      clearTimeout(timeoutId);
    }

    const events = ['mousemove', 'scroll', 'keydown', 'click', 'touchstart'];
    events.forEach(e => window.addEventListener(e, handleActivity));
    
    return () => {
      clearTimeout(timeoutId);
      events.forEach(e => window.removeEventListener(e, handleActivity));
    };
  }, [scrolled, isHovered]);

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

  const handleLogoutClick = () => {
    if (authenticated) {
      setShowLogoutModal(true);
    }
  };

  const confirmLogout = () => {
    if (!saveDataOptions.cache) {
      localStorage.removeItem('auth_token');
    }
    // Any other requested data clearing
    setShowLogoutModal(false);
    if (onLogout) onLogout();
    router.push('/');
  };

  const navItems = authenticated
    ? [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Leads', href: '/leads', icon: Users },
        { label: 'Campaigns', href: '/campaigns', icon: Zap },
        { label: 'Settings', href: '/settings', icon: Settings },
        { label: 'Guide', href: '/guide', icon: FileText },
      ]
    : [];

  return (
    <>
      <header
        ref={headerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 w-full z-[70] transition-all duration-700 ease-in-out border-b border-transparent ${
          scrolled && isIdle
            ? 'backdrop-blur-md bg-transparent' // Blur out when idle and scrolled
            : scrolled 
              ? 'bg-[#F5F0E8] dark:bg-[var(--bark)] shadow-sm border-[var(--tan)]/20'
              : 'bg-[#F5F0E8] dark:bg-[var(--bark)]'
        }`}
      >
        <div className="w-full mx-auto px-4 md:px-8 py-4">
          <div className="flex justify-between items-center w-full">
            
            <div className="flex items-center flex-1">
              {/* Logo and Brand */}
              <Link href="/" className="flex items-center gap-3 cursor-pointer mr-6 transition-opacity duration-500">
                <Image src="/logo.svg" alt="LeadGenius Logo" width={32} height={32} style={{ objectFit: 'contain' }} unoptimized />
                <span className="hidden sm:block text-[1.3rem] font-semibold text-[var(--espresso)] dark:text-[var(--parchment)]">
                  Lead<span className="text-[var(--rust)]">Genius</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation (Center) */}
            {authenticated && (
              <nav className={`hidden md:flex items-center justify-center gap-8 flex-1 transition-all duration-500 whitespace-nowrap overflow-hidden ${scrolled && isIdle ? 'opacity-0 pointer-events-none max-w-0' : 'opacity-100 max-w-[800px]'}`}>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 transition-colors duration-300 font-medium text-sm ${
                        pathname === item.href
                          ? 'text-[var(--espresso)] dark:text-[var(--ivory)]'
                          : 'text-[var(--umber)] dark:text-[var(--tan)] hover:text-[var(--espresso)] dark:hover:text-[var(--ivory)]'
                      }`}
                    >
                      {Icon && <Icon size={14} />}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right Actions */}
            <div className="flex items-center justify-end gap-4 flex-1">
              {authenticated && (
                <button 
                  onClick={() => router.back()}
                  className={`hidden sm:block text-[var(--umber)] dark:text-[var(--tan)] hover:text-[var(--espresso)] dark:hover:text-[var(--ivory)] text-xs tracking-wider uppercase font-medium transition-all duration-500 overflow-hidden ${scrolled && isIdle ? 'opacity-0 pointer-events-none max-w-0 mr-0' : 'opacity-100 max-w-[100px] mr-2'}`}
                >
                  ← Back
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[var(--espresso)] dark:text-[var(--ivory)] flex-shrink-0"
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              {authenticated ? (
                <button
                  onClick={handleLogoutClick}
                  className="hidden sm:block px-6 py-2 border border-[var(--espresso)] dark:border-[var(--ivory)] text-[var(--espresso)] dark:text-[var(--ivory)] text-[11px] font-semibold tracking-widest uppercase hover:bg-[var(--espresso)] hover:text-[var(--ivory)] dark:hover:bg-[var(--ivory)] dark:hover:text-[var(--espresso)] transition-all duration-300 whitespace-nowrap"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:block text-[var(--espresso)] dark:text-[var(--ivory)] text-sm font-medium hover:text-[var(--rust)] transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2 border border-[var(--espresso)] dark:border-[var(--ivory)] text-[var(--espresso)] dark:text-[var(--ivory)] text-[11px] font-semibold tracking-widest uppercase hover:bg-[var(--espresso)] hover:text-[var(--ivory)] dark:hover:bg-[var(--ivory)] dark:hover:text-[var(--espresso)] transition-all duration-300"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[var(--ivory)] dark:bg-[var(--bark)] rounded-2xl p-6 shadow-2xl max-w-md w-full border border-[var(--rust)]/20 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[var(--espresso)] dark:text-[var(--parchment)] mb-2 flex items-center gap-2">
              <span className="text-[var(--rust)]">⚠️</span> Logout Warning
            </h3>
            <p className="text-[var(--umber)] dark:text-[var(--tan)] text-sm mb-6">
              You are about to log out. Please select the session data you wish to save locally before signing out.
            </p>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-[var(--tan)]/30 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={saveDataOptions.state} 
                  onChange={e => setSaveDataOptions({...saveDataOptions, state: e.target.checked})}
                  className="w-5 h-5 accent-[var(--rust)]" 
                />
                <span className="text-[var(--espresso)] dark:text-[var(--parchment)] font-medium text-sm">Save application preferences</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-[var(--tan)]/30 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={saveDataOptions.cache} 
                  onChange={e => setSaveDataOptions({...saveDataOptions, cache: e.target.checked})}
                  className="w-5 h-5 accent-[var(--rust)]" 
                />
                <span className="text-[var(--espresso)] dark:text-[var(--parchment)] font-medium text-sm">Keep cache & form drafts</span>
              </label>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg text-[var(--umber)] dark:text-[var(--tan)] hover:bg-black/5 dark:hover:bg-white/5 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="px-6 py-2 rounded-lg bg-[var(--rust)] text-[var(--ivory)] font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Proceed & Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
