'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Briefcase, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import Button from '@/components/Button';
import GlassCard from '@/components/GlassCard';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          company_name: formData.company_name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user_id', data.user.id);

      // Redirect to onboarding
      router.push('/onboarding');
    } catch (err) {
      setError('Registration failed. Please try again.');
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
          <h1 className="text-4xl md:text-5xl font-bold text-[#3D2E1E] mb-2">Create Account</h1>
          <p className="text-[#7A6A52]">Join thousands of sales teams using LeadGenius</p>
        </div>

        <GlassCard intensity="light" className="p-8 md:p-12 animate-scaleIn">
          {error && (
            <div className="mb-6 flex gap-3 p-4 bg-[#8B4A2F]/10 border border-[#8B4A2F]/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-[#8B4A2F]" />
              <p className="text-sm text-[#8B4A2F]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B4A2F]/50" />
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="John"
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Smith"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="form-label">Company Name</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B4A2F]/50" />
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Acme Corp"
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
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

            {/* Confirm Password */}
            <div>
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B4A2F]/50" />
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 pt-2">
              <input type="checkbox" className="w-4 h-4 rounded mt-1" required />
              <span className="text-sm text-[#7A6A52]">
                I agree to the{' '}
                <Link href="#" className="text-[#8B4A2F] hover:text-[#C4943A]">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-[#8B4A2F] hover:text-[#C4943A]">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-6"
            >
              {loading ? 'Creating account...' : 'Get Started'}
              {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-8 border-t border-[#D9CDB4]/30 text-center">
            <p className="text-[#7A6A52]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#8B4A2F] hover:text-[#C4943A] font-semibold">
                Sign in
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
