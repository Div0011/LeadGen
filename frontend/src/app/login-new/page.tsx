'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import Button from '@/components/Button';
import GlassCard from '@/components/GlassCard';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user_id', data.user.id);
      
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F5F0E8] flex items-center justify-center py-12 px-4 md:px-8">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-20 bg-[#8B4A2F]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-10 bg-[#C4943A]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-12 animate-fadeUp">
          <h1 className="text-4xl md:text-5xl font-bold text-[#3D2E1E] mb-2">Welcome Back</h1>
          <p className="text-[#7A6A52]">Sign in to your LeadGenius account</p>
        </div>

        <GlassCard intensity="light" className="p-8 md:p-12 animate-scaleIn">
          {error && (
            <div className="mb-6 flex gap-3 p-4 bg-[#8B4A2F]/10 border border-[#8B4A2F]/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-[#8B4A2F]" />
              <p className="text-sm text-[#8B4A2F]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B4A2F]/50" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B4A2F]/50" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-[#7A6A52]">Remember me</span>
              </label>
              <Link href="#" className="text-[#8B4A2F] hover:text-[#C4943A]">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>
          </form>

          {/* Signup Link */}
          <div className="mt-8 pt-8 border-t border-[#D9CDB4]/30 text-center">
            <p className="text-[#7A6A52]">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#8B4A2F] hover:text-[#C4943A] font-semibold">
                Create one
              </Link>
            </p>
          </div>
        </GlassCard>

        {/* Back to home */}
        <div className="text-center mt-8">
          <Link href="/" className="text-[#7A6A52] hover:text-[#8B4A2F]">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
