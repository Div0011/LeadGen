'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface HeaderProps {
  authenticated?: boolean;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ authenticated = false, onLogout }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    if (onLogout) onLogout();
    router.push('/');
  };

  const navItems = authenticated
    ? [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Leads', href: '/leads' },
        { label: 'Campaigns', href: '/campaigns' },
        { label: 'Settings', href: '/settings' },
      ]
    : [];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'py-2' : 'py-4'
      }`}
    >
      <GlassCard
        intensity="subtle"
        className={`mx-4 md:mx-6 lg:mx-8 ${scrolled ? 'shadow-lg' : 'shadow-md'}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-amber-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-lg">✨</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-amber-600 bg-clip-text text-transparent hidden md:block">
              LeadGenius
            </span>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-amber-600 bg-clip-text text-transparent md:hidden">
              LG
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                  pathname === item.href
                    ? 'bg-teal-500/20 text-teal-700'
                    : 'text-slate-600 hover:bg-white/40'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {authenticated ? (
              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:block px-4 py-2 text-slate-600 font-medium hover:text-teal-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/40 transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-slate-700" />
              ) : (
                <Menu className="w-6 h-6 text-slate-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-white/20 px-6 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                  pathname === item.href
                    ? 'bg-teal-500/20 text-teal-700'
                    : 'text-slate-600 hover:bg-white/40'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </GlassCard>
    </header>
  );
};
