'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Key, ArrowRight, User, Mail, Lock, Layers, Target, Database } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { authApi } from '@/services/api';
import Link from 'next/link';

export default function RegisterPage() {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', company_name: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register(form);
      alert('ENTITY_CREATED_SUCCESSFULLY: ACCESSING_ENTRY_CHAMBER');
      router.push('/auth/login');
    } catch (err) {
      alert('REGISTRATION_FAILED: ENTITY_ALREADY_EXISTS_OR_SYSTEM_ERR_500');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 py-24">
      <div className="animate-fadeUp">
        <div className="max-w-2xl w-full space-y-16">
           <div className="text-center space-y-8">
              <div className="inline-flex items-center gap-8 px-10 py-4 border border-bone/5 bg-bone/[0.01] text-[11px] font-black tracking-[1em] text-clay/60 uppercase">
                 <Target size={18} /> INITIALIZE_NEW_ENTITY
              </div>
              <h1 className="text-6xl sm:text-9xl font-display text-bone tracking-tighter leading-none uppercase">JOIN <br /> <span className="italic font-100 text-tan">OBELISK.</span></h1>
              <p className="text-[12px] font-bold tracking-[0.5em] text-bone/20 uppercase">REGISTER WITHIN THE ARCHIVAL VANGUARD</p>
           </div>

           <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-12">
              <div className="space-y-12">
                <div className="space-y-6 relative group">
                   <label className="text-[10px] font-black tracking-[0.6em] text-bone/20 uppercase ml-4">AGENCY_NAME</label>
                   <div className="relative">
                      <User size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-bone/20 group-focus-within:text-ochre transition-all" />
                      <input 
                         required
                         type="text" 
                         placeholder="ENTITY_IDENTITY"
                         className="w-full bg-bone/[0.01] border border-bone/10 px-16 py-6 text-[11px] font-black uppercase tracking-[0.4em] text-bone focus:outline-none focus:border-ochre/40 transition-all duration-700"
                         value={form.first_name}
                         onChange={(e) => setForm({...form, first_name: e.target.value})}
                      />
                   </div>
                </div>

                <div className="space-y-6 relative group">
                   <label className="text-[10px] font-black tracking-[0.6em] text-bone/20 uppercase ml-4">COMPANY_ID</label>
                   <div className="relative">
                      <Database size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-bone/20 group-focus-within:text-clay transition-all" />
                      <input 
                         required
                         type="text" 
                         placeholder="CORPORATE_METADATA"
                         className="w-full bg-bone/[0.01] border border-bone/10 px-16 py-6 text-[11px] font-black uppercase tracking-[0.4em] text-bone focus:outline-none focus:border-clay/40 transition-all duration-700"
                         value={form.company_name}
                         onChange={(e) => setForm({...form, company_name: e.target.value})}
                      />
                   </div>
                </div>
              </div>

              <div className="space-y-12">
                <div className="space-y-6 relative group">
                   <label className="text-[10px] font-black tracking-[0.6em] text-bone/20 uppercase ml-4">SYSTEM_EMAIL</label>
                   <div className="relative">
                      <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-bone/20 group-focus-within:text-ochre transition-all" />
                      <input 
                         required
                         type="email" 
                         placeholder="SYNC_COMMUNICATION"
                         className="w-full bg-bone/[0.01] border border-bone/10 px-16 py-6 text-[11px] font-black uppercase tracking-[0.4em] text-bone focus:outline-none focus:border-ochre/40 transition-all duration-700"
                         value={form.email}
                         onChange={(e) => setForm({...form, email: e.target.value})}
                      />
                   </div>
                </div>

                <div className="space-y-6 relative group">
                   <label className="text-[10px] font-black tracking-[0.6em] text-bone/20 uppercase ml-4">ACCESS_CYPHER</label>
                   <div className="relative">
                      <Lock size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-bone/20 group-focus-within:text-clay transition-all" />
                      <input 
                         required
                         type="password" 
                         placeholder="ENCRYPTION_PASS"
                         className="w-full bg-bone/[0.01] border border-bone/10 px-16 py-6 text-[11px] font-black uppercase tracking-[0.4em] text-bone focus:outline-none focus:border-clay/40 transition-all duration-700"
                         value={form.password}
                         onChange={(e) => setForm({...form, password: e.target.value})}
                      />
                   </div>
                </div>
              </div>

              <div className="md:col-span-2 pt-12">
                 <button 
                    disabled={loading}
                    className="w-full px-24 py-10 bg-bone text-charcoal font-900 text-[14px] uppercase tracking-[1em] hover:bg-ochre hover:scale-105 transition-all duration-1000 group relative overflow-hidden"
                 >
                    <span className="relative z-10">{loading ? 'CONSTRUCTING_ENTITY_ARCHIVE...' : 'REGISTER_OBELISK_PROTOCOL'}</span>
                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-charcoal/20" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-charcoal/20" />
                 </button>
              </div>
           </form>

           <div className="flex justify-between items-center pt-12 border-t border-bone/10">
              <Link href="/auth/login" className="text-[11px] font-black tracking-[0.5em] text-bone/20 hover:text-bone hover:italic transition-all">ACCESS_EXISTING_CHAMBER</Link>
              <span className="text-[11px] font-black tracking-[0.5em] text-bone/5">TERMS_ACCEPTED_ON_SYNC</span>
           </div>
        </div>
      </div>
    </div>
  );
}
