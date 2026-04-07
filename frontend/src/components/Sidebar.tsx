'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, BarChart3, Target, Zap, Settings, LogOut } from 'lucide-react';
import GlassCard from './GlassCard';

interface SidebarProps {
  authenticated?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ authenticated = true }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { label: 'Leads', href: '/leads', icon: Target },
    { label: 'Campaigns', href: '/campaigns', icon: Zap },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-6 right-6 z-[70] w-14 h-14 rounded-full bg-[#3D2E1E] text-[#F5F0E8] shadow-[0_10px_25px_rgba(61,46,30,0.5)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-screen w-64 z-[60] transition-all duration-400 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-full rounded-none md:rounded-r-3xl p-6 flex flex-col bg-[rgba(245,240,232,0.6)] border-r border-[rgba(184,169,138,0.25)] backdrop-[20px] shadow-sm relative overflow-hidden" style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          {/* Logo */}
          <Link href="/" className="nav-logo mb-10 block text-center" style={{ textDecoration: 'none' }}>
            Lead<span>Genius</span>
          </Link>

          {/* Menu Items */}
          <nav className="flex-1 flex flex-col gap-3 relative z-10">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 transition-all duration-400 border relative ${
                    isActive
                      ? 'bg-[rgba(196,148,58,0.05)] text-[var(--espresso)] border-[var(--gold)] shadow-[inset_0_0_0_2px_rgba(196,148,58,0.05)]'
                      : 'bg-[rgba(245,240,232,0.5)] border-[rgba(184,169,138,0.2)] text-[var(--umber)] hover:border-[var(--gold)] hover:bg-[rgba(196,148,58,0.05)] hover:text-[#3D2E1E]'
                  }`}
                  style={{
                    fontSize: '.75rem',
                    fontWeight: 400,
                    letterSpacing: '.05em',
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 transition-all duration-400 ${isActive ? 'bg-[var(--gold)] shadow-[0_0_0_3px_rgba(196,148,58,0.15)]' : 'bg-[rgba(184,169,138,0.4)] group-hover:bg-[var(--gold)]'}`}></div>
                  <IconComponent className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="flex flex-col gap-3 pt-6 border-t border-[rgba(184,169,138,0.2)] relative z-10">
            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 transition-all duration-400 border border-[rgba(184,169,138,0.2)] bg-[rgba(245,240,232,0.5)] text-[var(--umber)] hover:border-[var(--gold)] hover:bg-[rgba(196,148,58,0.05)] hover:text-[var(--espresso)]"
              style={{ fontSize: '.75rem', fontWeight: 400, letterSpacing: '.05em' }}
              onClick={() => setIsOpen(false)}
            >
              <div className="w-2 h-2 rounded-full shrink-0 bg-[rgba(184,169,138,0.4)] transition-all duration-400"></div>
              <Settings className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              Settings
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_id');
                router.push('/login');
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 transition-all duration-400 border border-[rgba(184,169,138,0.2)] bg-[rgba(245,240,232,0.5)] text-[var(--umber)] hover:border-[var(--rust)] hover:bg-[rgba(139,74,47,0.05)] hover:text-[var(--rust)] w-full text-left"
              style={{ fontSize: '.75rem', fontWeight: 400, letterSpacing: '.05em' }}
            >
              <div className="w-2 h-2 rounded-full shrink-0 bg-[rgba(184,169,138,0.4)] transition-all duration-400"></div>
              <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[rgba(61,46,30,0.5)] backdrop-blur-sm z-50 md:hidden transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
