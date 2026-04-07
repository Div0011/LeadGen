'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="LeadGenius - Intelligent Lead Generation Platform" />
        <title>LeadGenius — Intelligent Lead Generation</title>
      </head>
      <body className="bg-[#F5F0E8] text-[#3D2E1E]">
        <Navigation />
        <main role="main">{children}</main>
      </body>
    </html>
  );
}
