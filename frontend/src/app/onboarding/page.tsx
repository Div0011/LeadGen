'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Lightbulb, Building2, Target, Mail, BarChart3, Lock } from 'lucide-react';
import Button from '@/components/Button';
import GlassCard from '@/components/GlassCard';

type Step = 1 | 2 | 3 | 4 | 5;

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    industry: '',
    targetCompanySize: '',
    targetLocation: '',
    leadQuality: '',
    automationPreference: '',
    selectedFeatures: [] as string[],
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }
  }, []);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('company_info', JSON.stringify(formData));
    router.push('/dashboard');
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(feature)
        ? prev.selectedFeatures.filter(f => f !== feature)
        : [...prev.selectedFeatures, feature],
    }));
  };

  const progressPercentage = (currentStep / 5) * 100;

  return (
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'transparent' }}>
      {/* Dynamic Background */}
      <div className="blobs">
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      <div className="form-card glass-section reveal visible" style={{ width: '100%', maxWidth: '600px', animation: 'fadeUp 1s ease forwards' }}>
        <div className="form-header">
          <div className="brand" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            <div className="logo-mark"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
            <div className="logo-text">Lead<em>Genius</em></div>
          </div>
          <h1>Welcome to LeadGenius</h1>
          <p>Let's set up your account in just a few steps</p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--umber)', fontFamily: "'Jost', sans-serif" }}>Step {currentStep} of 5</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--umber)', fontFamily: "'Jost', sans-serif" }}>{progressPercentage.toFixed(0)}%</span>
          </div>
          <div style={{ width: '100%', background: 'rgba(184,169,138,0.2)', height: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercentage}%`, background: 'linear-gradient(to right, var(--rust), var(--gold))', height: '100%', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        <div className="form-body" style={{ minHeight: '300px' }}>
          {/* Step 1: Industry */}
          {currentStep === 1 && (
            <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: 'var(--espresso)', marginBottom: '0.5rem' }}>What's your industry?</h2>
                <p style={{ color: 'var(--umber)', fontSize: '0.9rem' }}>Help us tailor lead discovery to your sector</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {['SaaS & Software', 'B2B Services', 'Manufacturing', 'Financial Services', 'Real Estate', 'Other'].map((ind) => (
                  <label key={ind} style={{ display: 'flex', alignItems: 'center', padding: '1.25rem', background: formData.industry === ind ? 'rgba(184,169,138,0.15)' : 'transparent', border: `1px solid ${formData.industry === ind ? 'var(--espresso)' : 'rgba(184,169,138,0.3)'}`, cursor: 'pointer', transition: 'all 0.2s ease', color: 'var(--espresso)', fontFamily: "'Jost', sans-serif", fontSize: '0.95rem' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(184,169,138,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = formData.industry === ind ? 'rgba(184,169,138,0.15)' : 'transparent'}>
                    <input type="radio" name="industry" value={ind} checked={formData.industry === ind} onChange={handleChange as any} style={{ accentColor: 'var(--espresso)', width: '16px', height: '16px' }} />
                    <span style={{ marginLeft: '1rem' }}>{ind}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Company Size */}
          {currentStep === 2 && (
            <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: 'var(--espresso)', marginBottom: '0.5rem' }}>Target company size</h2>
                <p style={{ color: 'var(--umber)', fontSize: '0.9rem' }}>Which companies should we focus on?</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {['Startup (1-50)', 'Small (51-200)', 'Mid-Market (201-1000)', 'Enterprise (1000+)', 'No Preference'].map((size) => (
                  <label key={size} style={{ display: 'flex', alignItems: 'center', padding: '1.25rem', background: formData.targetCompanySize === size ? 'rgba(184,169,138,0.15)' : 'transparent', border: `1px solid ${formData.targetCompanySize === size ? 'var(--espresso)' : 'rgba(184,169,138,0.3)'}`, cursor: 'pointer', transition: 'all 0.2s ease', color: 'var(--espresso)', fontFamily: "'Jost', sans-serif", fontSize: '0.95rem' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(184,169,138,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = formData.targetCompanySize === size ? 'rgba(184,169,138,0.15)' : 'transparent'}>
                    <input type="radio" name="targetCompanySize" value={size} checked={formData.targetCompanySize === size} onChange={handleChange as any} style={{ accentColor: 'var(--espresso)', width: '16px', height: '16px' }} />
                    <span style={{ marginLeft: '1rem' }}>{size}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: 'var(--espresso)', marginBottom: '0.5rem' }}>Geographic focus</h2>
                <p style={{ color: 'var(--umber)', fontSize: '0.9rem' }}>Which regions should we prioritize?</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {['North America', 'Europe', 'Asia-Pacific', 'Global', 'Custom'].map((loc) => (
                  <label key={loc} style={{ display: 'flex', alignItems: 'center', padding: '1.25rem', background: formData.targetLocation === loc ? 'rgba(184,169,138,0.15)' : 'transparent', border: `1px solid ${formData.targetLocation === loc ? 'var(--espresso)' : 'rgba(184,169,138,0.3)'}`, cursor: 'pointer', transition: 'all 0.2s ease', color: 'var(--espresso)', fontFamily: "'Jost', sans-serif", fontSize: '0.95rem' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(184,169,138,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = formData.targetLocation === loc ? 'rgba(184,169,138,0.15)' : 'transparent'}>
                    <input type="radio" name="targetLocation" value={loc} checked={formData.targetLocation === loc} onChange={handleChange as any} style={{ accentColor: 'var(--espresso)', width: '16px', height: '16px' }} />
                    <span style={{ marginLeft: '1rem' }}>{loc}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Lead Quality */}
          {currentStep === 4 && (
            <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: 'var(--espresso)', marginBottom: '0.5rem' }}>Lead quality preference</h2>
                <p style={{ color: 'var(--umber)', fontSize: '0.9rem' }}>How should we validate leads?</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {['High (Email verified, decision makers)', 'Medium (Email verified)', 'High Volume (Rapid generation)', 'Custom Rules'].map((quality) => (
                  <label key={quality} style={{ display: 'flex', alignItems: 'center', padding: '1.25rem', background: formData.leadQuality === quality ? 'rgba(184,169,138,0.15)' : 'transparent', border: `1px solid ${formData.leadQuality === quality ? 'var(--espresso)' : 'rgba(184,169,138,0.3)'}`, cursor: 'pointer', transition: 'all 0.2s ease', color: 'var(--espresso)', fontFamily: "'Jost', sans-serif", fontSize: '0.95rem' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(184,169,138,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = formData.leadQuality === quality ? 'rgba(184,169,138,0.15)' : 'transparent'}>
                    <input type="radio" name="leadQuality" value={quality} checked={formData.leadQuality === quality} onChange={handleChange as any} style={{ accentColor: 'var(--espresso)', width: '16px', height: '16px' }} />
                    <span style={{ marginLeft: '1rem' }}>{quality}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Features */}
          {currentStep === 5 && (
            <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: 'var(--espresso)', marginBottom: '0.5rem' }}>Select key features</h2>
                <p style={{ color: 'var(--umber)', fontSize: '0.9rem' }}>Which features matter most to you?</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { id: 'discovery', icon: Target, label: 'Smart Discovery', desc: 'AI-powered lead finding' },
                  { id: 'outreach', icon: Mail, label: 'Automated Outreach', desc: 'Multi-channel campaigns' },
                  { id: 'tracking', icon: BarChart3, label: 'Real-time Tracking', desc: 'Monitor every interaction' },
                  { id: 'automation', icon: Lightbulb, label: '24/7 Automation', desc: 'Round-the-clock operation' },
                ].map((feature) => {
                  const isSelected = formData.selectedFeatures.includes(feature.id);
                  return (
                    <button
                      key={feature.id}
                      onClick={() => toggleFeature(feature.id)}
                      style={{
                        padding: '1.5rem 1.25rem',
                        background: isSelected ? 'rgba(184,169,138,0.15)' : 'transparent',
                        border: `1px solid ${isSelected ? 'var(--espresso)' : 'rgba(184,169,138,0.3)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(184,169,138,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = isSelected ? 'rgba(184,169,138,0.15)' : 'transparent'}
                    >
                      <h4 style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.95rem', color: 'var(--espresso)', margin: 0 }}>{feature.label}</h4>
                      <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.8rem', color: 'var(--umber)', margin: 0 }}>{feature.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(184,169,138,0.2)' }}>
            {currentStep > 1 && (
              <Button type="button" onClick={handleBack} className="btn-ghost" style={{ flex: 1, background: 'transparent', border: '1px solid rgba(184,169,138,0.4)', color: 'var(--umber)' }}>
                Back
              </Button>
            )}
            <Button type="button" onClick={handleNext} disabled={!formData.industry && currentStep === 1} className="btn-primary" style={{ flex: 2, padding: '1rem', background: 'var(--espresso)', color: 'var(--ivory)', border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '.8rem', letterSpacing: '.2em', textTransform: 'uppercase' }}>
              {currentStep === 5 ? 'Complete Setup' : 'Next Step'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
