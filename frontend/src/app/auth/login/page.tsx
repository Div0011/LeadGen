'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Key, ArrowRight, User, Mail, Lock, Layers } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { authApi } from '@/services/api';
import Link from 'next/link';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form);
      localStorage.setItem('api_key', res.data.api_key);
      localStorage.setItem('email', res.data.email);
      router.push('/leads');
    } catch (err) {
      alert('AUTHENTICATION_FAILED: INVALID_CREDENTIALS_OR_ORCHESTRATOR_OFFLINE');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="animate-fadeUp">
        <div className="max-w-md w-full space-y-12">
           <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-6 px-8 py-3 border border-bone/5 bg-bone/[0.01] text-[10px] font-black tracking-[0.8em] text-ochre/60 uppercase">
                 <Shield size={16} /> SECURE_ENTRY_CHAMBER
              </div>
              <h1 className="text-6xl sm:text-8xl font-display text-bone tracking-tighter leading-none uppercase">ENTER <br /> <span className="italic font-100 gradient-text">OBELISK.</span></h1>
              <p className="text-[10px] font-bold tracking-[0.4em] text-bone/20 uppercase">AUTHORIZED ARCHIVAL ACCESS ONLY</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 relative group">
                 <label className="text-[9px] font-black tracking-[0.5em] text-bone/20 uppercase ml-4">ENTITY_IDENTIFIER</label>
                 <div className="relative">
                    <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-bone/20 group-focus-within:text-ochre transition-all" />
                    <input 
                       required
                       type="email" 
                       placeholder="SYSTEM_EMAIL_PROTOCOL"
                       className="w-full bg-bone/[0.01] border border-bone/10 px-16 py-6 text-[11px] font-black uppercase tracking-[0.4em] text-bone focus:outline-none focus:border-ochre/40 transition-all duration-700"
                       value={form.email}
                       onChange={(e) => setForm({...form, email: e.target.value})}
                    />
                 </div>
              </div>

              <div className="space-y-2 relative group">
                 <label className="text-[9px] font-black tracking-[0.5em] text-bone/20 uppercase ml-4">ACCESS_CYPHER</label>
                 <div className="relative">
                    <Lock size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-bone/20 group-focus-within:text-clay transition-all" />
                    <input 
                       required
                       type="password" 
                       placeholder="ENCRYPTION_PASSWORD"
                       className="w-full bg-bone/[0.01] border border-bone/10 px-16 py-6 text-[11px] font-black uppercase tracking-[0.4em] text-bone focus:outline-none focus:border-clay/40 transition-all duration-700"
                       value={form.password}
                       onChange={(e) => setForm({...form, password: e.target.value})}
                    />
                 </div>
              </div>

              <div className="pt-12">
                 <button 
                    disabled={loading}
                    className="w-full px-16 py-8 bg-bone text-charcoal font-900 text-[12px] uppercase tracking-[1em] hover:bg-ochre hover:scale-105 transition-all duration-1000 group relative overflow-hidden"
                 >
                    <span className="relative z-10">{loading ? 'AUTHENTICATING_IDENTITY...' : 'INITIALIZE_CONNECTION'}</span>
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-charcoal/20" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-charcoal/20" />
                 </button>
              </div>
           </form>

           <div className="flex justify-between items-center pt-12 border-t border-bone/5">
              <Link href="/auth/register" className="text-[10px] font-black tracking-[0.5em] text-bone/20 hover:text-bone hover:italic transition-all">CREATE_NEW_ENTITY</Link>
              <span className="text-[10px] font-black tracking-[0.5em] text-bone/5">LOST_ARCHIVE?</span>
           </div>
        </div>
      </div>
    </div>
  );
}
