'use client';

import './globals.css';
import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import WatermarkBackground from '@/components/WatermarkBackground';
import Footer from '@/components/Footer';
import { SpeedInsights } from '@vercel/speed-insights/next';

const publicRoutes = ['/', '/login', '/register', '/onboarding'];
const dashboardRoutes = ['/dashboard', '/leads', '/campaigns', '/settings', '/profile', '/guide'];

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Initialize custom cursor and effects
  useEffect(() => {
    // Check if cursor already exists to prevent duplicates
    if (document.getElementById('cursor') && document.getElementById('cursorRing')) {
      return;
    }

    // Custom cursor
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.id = 'cursor';
    cursor.style.cssText = 'position:fixed;width:8px;height:8px;background:var(--rust);border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:width .3s,height .3s,opacity .3s;';
    document.body.appendChild(cursor);

    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    ring.id = 'cursorRing';
    ring.style.cssText = 'position:fixed;width:32px;height:32px;border:1px solid var(--rust);border-radius:50%;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:all .12s ease;opacity:.6;';
    document.body.appendChild(ring);

    let mx = 0, my = 0, rx = 0, ry = 0;
    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
    };

    const animateRing = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      rafId = requestAnimationFrame(animateRing);
    };

    animateRing();
    
    // Use passive listener for better scroll performance
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
        ring.style.transform = 'translate(-50%,-50%) scale(1.5)';
      }
    };

    const handleHoverEnd = () => {
      ring.style.transform = 'translate(-50%,-50%) scale(1)';
    };

    document.addEventListener('mouseover', handleHover);
    document.addEventListener('mouseout', handleHoverEnd);

    // Scroll reveal animation with passive observer
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    reveals.forEach((el) => observer.observe(el));

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleHover);
      document.removeEventListener('mouseout', handleHoverEnd);
      observer.disconnect();
      if (cursor && cursor.parentNode) cursor.remove();
      if (ring && ring.parentNode) ring.remove();
    };
  }, []);
  
  // Check authentication for protected routes
  useEffect(() => {
    const isPublicRoute = publicRoutes.includes(pathname);
    const isDashboardRoute = dashboardRoutes.some(route => pathname === route || pathname.startsWith(route));
    
    if (isDashboardRoute) {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
      }
    }
  }, [pathname, router]);

  // For public pages - minimal layout
  if (publicRoutes.includes(pathname)) {
    return (
      <html lang="en" className="scroll-smooth">
        <head>
          <title>LeadGenius - Intelligent Lead Generation</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="Automate your lead generation pipeline with AI-powered discovery and 24/7 outreach" />
        </head>
        <body className="antialiased text-[#3D2E1E]" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(to bottom, var(--ivory), var(--parchment))' }}>
        <WatermarkBackground />
        <Navigation />
        <main style={{ paddingTop: '80px', width: '100%', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
          {children}
        </main>
        <Footer />
        <SpeedInsights />
      </body>
      </html>
    );
  }

  // For dashboard pages - with full layout
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <title>LeadGenius - Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Your LeadGenius command center" />
      </head>
      <body className="antialiased" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(to bottom, var(--ivory), var(--parchment))', color: 'var(--espresso)' }}>
        <WatermarkBackground />
        <Navigation />
        <main style={{ paddingTop: '80px', width: '100%', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
          {children}
        </main>
        <Footer />
        <SpeedInsights />
      </body>
    </html>
  );
}
