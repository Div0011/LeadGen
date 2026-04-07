'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Mail, TrendingUp, Zap, Target, BarChart3, Shield } from 'lucide-react';
import Button from '@/components/Button';
import GlassCard from '@/components/GlassCard';

export default function LandingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ scrollY, setScrollY] = useState(0);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(!!token);

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep < 3) {
      setFormStep(formStep + 1);
    } else {
      // Navigate to onboarding
      router.push('/onboarding');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const features = [
    {
      icon: Target,
      title: 'Smart Lead Discovery',
      description: 'AI-powered identification of ideal prospects matched to your criteria.',
    },
    {
      icon: Mail,
      title: 'Automated Outreach',
      description: 'Send personalized multi-channel campaigns at scale.',
    },
    {
      icon: TrendingUp,
      title: 'Real-time Tracking',
      description: 'Monitor responses, track conversions, optimize performance.',
    },
    {
      icon: Zap,
      title: '24/7 Automation',
      description: 'Round-the-clock generation, validation, and follow-up.',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Deep insights into your lead pipeline and campaign performance.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and compliance with industry standards.',
    },
  ];

  const steps = [
    { number: 1, title: 'Define Your Criteria', description: 'Specify industry, company size, location, and more' },
    { number: 2, title: 'AI Discovers Leads', description: 'Intelligent algorithms find perfect matches' },
    { number: 3, title: 'Validate & Clean', description: 'Email verification and duplicate removal' },
    { number: 4, title: 'Personalized Outreach', description: 'Send tailored campaigns with your brochure' },
    { number: 5, title: 'Monitor & Follow Up', description: '24/7 response tracking and automated sequences' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F0E8] overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20 px-4 md:px-8">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{
              background: '#8B4A2F',
              transform: `translateY(${scrollY * 0.3}px)`,
            }}
          />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{
              background: '#C4943A',
              transform: `translateY(${-scrollY * 0.2}px)`,
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl text-center animate-fadeUp">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-[#3D2E1E]">
            Your Sales Pipeline,
            <span className="block text-[#8B4A2F]">Automated</span>
          </h1>
          <p className="text-lg md:text-xl text-[#7A6A52] mb-8 max-w-2xl mx-auto leading-relaxed">
            LeadGenius discovers, validates, and nurtures leads 24/7. Watch your pipeline fill automatically while you focus on closing deals.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button
              onClick={() => !isAuthenticated ? router.push('/register') : router.push('/dashboard')}
              className="h-14 px-8 text-lg"
              size="lg"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push('/login')}
              className="h-14 px-8 text-lg"
              size="lg"
            >
              Sign In
            </Button>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-20">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#8B4A2F]">10K+</div>
              <div className="text-sm text-[#7A6A52]">Leads/Month</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#8B4A2F]">45%</div>
              <div className="text-sm text-[#7A6A52]">Avg Response</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#8B4A2F]">2.3x</div>
              <div className="text-sm text-[#7A6A52]">ROI Increase</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 md:py-32 px-4 md:px-8  bg-gradient-to-b from-transparent via-[#EDE5D0]/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fadeUp" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#3D2E1E]">How It Works</h2>
            <p className="text-lg text-[#7A6A52]">Five simple steps to a full sales pipeline</p>
          </div>

          {/* Pipeline Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-2 mb-16">
            {steps.map((step, idx) => (
              <div
                key={step.number}
                className="animate-fadeUp"
                style={{ animationDelay: `${0.1 * (idx + 1)}s` }}
              >
                <div className="relative">
                  {/* Connecting line */}
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-1/2 w-full h-1 bg-gradient-to-r from-[#8B4A2F] to-transparent" />
                  )}

                  {/* Step card */}
                  <GlassCard intensity="medium" className="p-6 text-center relative z-10">
                    <div className="w-12 h-12 rounded-full bg-[#8B4A2F] text-[#F5F0E8] flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                      {step.number}
                    </div>
                    <h3 className="text-lg font-semibold text-[#3D2E1E] mb-2">{step.title}</h3>
                    <p className="text-sm text-[#7A6A52]">{step.description}</p>
                  </GlassCard>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FORM WIZARD ===== */}
      <section className="py-20 md:py-32 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12 animate-fadeUp" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#3D2E1E]">Join Thousands of Sales Teams</h2>
            <p className="text-lg text-[#7A6A52]">Start generating qualified leads in minutes</p>
          </div>

          {/* Progress bar */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1 flex-1 rounded-full transition-all ${
                  step <= formStep ? 'bg-[#8B4A2F]' : 'bg-[#EDE5D0]'
                }`}
              />
            ))}
          </div>

          {/* Form Card */}
          <GlassCard intensity="light" className="p-8 md:p-12">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {formStep === 1 && (
                <div className="animate-fadeUp">
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="John Smith"
                    className="form-input"
                    required
                  />
                </div>
              )}

              {formStep === 2 && (
                <div className="animate-fadeUp">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleFormChange}
                    placeholder="Acme Corp"
                    className="form-input"
                    required
                  />
                </div>
              )}

              {formStep === 3 && (
                <div className="animate-fadeUp">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="john@acme.com"
                    className="form-input"
                    required
                  />
                </div>
              )}

              <div className="flex gap-4">
                {formStep > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setFormStep(formStep - 1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                <Button type="submit" className="flex-1">
                  {formStep === 3 ? 'Create Account' : 'Next'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section className="py-20 md:py-32 px-4 md:px-8 bg-gradient-to-b from-transparent via-[#EDE5D0]/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fadeUp" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#3D2E1E]">Powerful Features</h2>
            <p className="text-lg text-[#7A6A52]">Everything you need to scale your sales</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <GlassCard
                  key={idx}
                  intensity="medium"
                  className="p-8 hover:shadow-lg transition-all animate-fadeUp"
                  style={{ animationDelay: `${0.1 * (idx + 1)}s` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-[#8B4A2F]/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#8B4A2F]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#3D2E1E] mb-2">{feature.title}</h3>
                  <p className="text-[#7A6A52]">{feature.description}</p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== DASHBOARD PREVIEW ===== */}
      <section className="py-20 md:py-32 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fadeUp" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#3D2E1E]">Your Command Center</h2>
            <p className="text-lg text-[#7A6A52]">See all your leads, campaigns, and analytics in one beautiful dashboard</p>
          </div>

          {/* Dashboard Mock */}
          <GlassCard intensity="light" className="p-8 rounded-2xl overflow-hidden animate-scaleIn">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 h-12 bg-[#8B4A2F]/10 rounded-lg" />
                <div className="flex-1 h-12 bg-[#8B4A2F]/10 rounded-lg" />
                <div className="flex-1 h-12 bg-[#8B4A2F]/10 rounded-lg" />
              </div>
              <div className="h-64 bg-gradient-to-br from-[#8B4A2F]/5 to-[#C4943A]/5 rounded-lg flex items-end gap-2 p-4">
                {[65, 45, 78, 52, 88, 62].map((height, i) => (
                  <div key={i} className="flex-1 h-full" style={{ height: `${height}%` }}>
                    <div className="w-full h-full rounded-t-lg bg-gradient-to-t from-[#8B4A2F] to-[#C4943A] opacity-70" />
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="py-20 md:py-32 px-4 md:px-8 bg-gradient-to-b from-transparent via-[#D9CDB4]/20 to-transparent">
        <div className="max-w-4xl mx-auto text-center animate-fadeUp" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#3D2E1E]">
            Ready to Transform Your Sales?
          </h2>
          <p className="text-lg text-[#7A6A52] mb-8">
            Join leading B2B companies using LeadGenius to automate their entire sales pipeline.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/register')}
              className="h-14 px-8 text-lg"
              size="lg"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push('/')}
              className="h-14 px-8 text-lg"
              size="lg"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-12 px-4 md:px-8 border-t border-[#D9CDB4]/30 bg-[#3D2E1E]/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-bold text-[#3D2E1E] mb-4">LeadGenius</h3>
              <p className="text-sm text-[#7A6A52]">Intelligent lead generation for modern sales teams.</p>
            </div>
            <div>
              <h4 className="font-semibold text-[#3D2E1E] mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[#7A6A52]">
                <li><Link href="#" className="hover:text-[#8B4A2F]">Features</Link></li>
                <li><Link href="#" className="hover:text-[#8B4A2F]">Pricing</Link></li>
                <li><Link href="#" className="hover:text-[#8B4A2F]">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#3D2E1E] mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[#7A6A52]">
                <li><Link href="#" className="hover:text-[#8B4A2F]">About</Link></li>
                <li><Link href="#" className="hover:text-[#8B4A2F]">Blog</Link></li>
                <li><Link href="#" className="hover:text-[#8B4A2F]">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#3D2E1E] mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[#7A6A52]">
                <li><Link href="#" className="hover:text-[#8B4A2F]">Privacy</Link></li>
                <li><Link href="#" className="hover:text-[#8B4A2F]">Terms</Link></li>
                <li><Link href="#" className="hover:text-[#8B4A2F]">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#D9CDB4]/30 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-[#7A6A52]">
            <p>&copy; 2024 LeadGenius. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-[#8B4A2F]">Twitter</Link>
              <Link href="#" className="hover:text-[#8B4A2F]">LinkedIn</Link>
              <Link href="#" className="hover:text-[#8B4A2F]">GitHub</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
