'use client';

import { useState, useEffect, useCallback } from 'react';

export interface AppSettings {
  companyName: string;
  companyWebsite: string;
  companyEmail: string;
  industry: string;
  targetLocation: string;
  targetIndustry: string;
  maxLeadsPerDay: number;
  maxTotalLeads: number;
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_password: string;
}

const defaultSettings: AppSettings = {
  companyName: '',
  companyWebsite: '',
  companyEmail: '',
  industry: 'Web Development',
  targetLocation: 'India',
  targetIndustry: 'web development',
  maxLeadsPerDay: 50,
  maxTotalLeads: 1000,
  smtp_host: 'smtp.gmail.com',
  smtp_port: '587',
  smtp_user: '',
  smtp_password: '',
};

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(defaultSettings);
  const [companyInfo, setCompanyInfoState] = useState<any>(null);

  const loadSettings = useCallback(() => {
    const stored = localStorage.getItem('app_settings');
    if (stored) {
      setSettingsState({ ...defaultSettings, ...JSON.parse(stored) });
    }
    
    const info = localStorage.getItem('company_info');
    if (info) {
      setCompanyInfoState(JSON.parse(info));
    }
  }, []);

  useEffect(() => {
    loadSettings();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_settings' || e.key === 'company_info') {
        loadSettings();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadSettings]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettingsState(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('app_settings', JSON.stringify(updated));
      localStorage.setItem('company_info', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const saveSettings = useCallback((newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettingsState(updated);
    localStorage.setItem('app_settings', JSON.stringify(updated));
    localStorage.setItem('company_info', JSON.stringify(updated));
    setCompanyInfoState(updated);
  }, [settings]);

  return {
    settings,
    companyInfo,
    updateSettings,
    saveSettings,
    loadSettings,
  };
}

export function useCompanyInfo() {
  const [companyInfo, setCompanyInfo] = useState<any>(null);

  useEffect(() => {
    const info = localStorage.getItem('company_info') || localStorage.getItem('app_settings');
    if (info) {
      setCompanyInfo(JSON.parse(info));
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'company_info' || e.key === 'app_settings') {
        const info = localStorage.getItem('company_info') || localStorage.getItem('app_settings');
        setCompanyInfo(info ? JSON.parse(info) : null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return companyInfo;
}