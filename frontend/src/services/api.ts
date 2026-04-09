// API Service for LeadGenius Frontend
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
                     process.env.REACT_APP_API_URL || 
                     'http://localhost:8000/api';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `ApiKey ${token}`;
    }
  }
  return config;
});

// Add response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  register: (data: {
    first_name: string;
    last_name: string;
    company_name: string;
    email: string;
    password: string;
  }) => apiClient.post('/auth/register', { 
    email: data.email, 
    password: data.password, 
    name: `${data.first_name} ${data.last_name}`.trim(), 
    company_name: data.company_name 
  }),

  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),

  getProfile: () => apiClient.get('/auth/profile'),

  updateProfile: (data: any) => apiClient.put('/auth/profile', data),

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
  },
};

// Leads APIs
export const leadsApi = {
  getAll: (params?: any) => apiClient.get('/leads', { params }),

  getById: (id: string) => apiClient.get(`/leads/${id}`),

  create: (data: any) => apiClient.post('/leads', data),

  update: (id: string, data: any) => apiClient.put(`/leads/${id}`, data),

  delete: (id: string) => apiClient.delete(`/leads/${id}`),

  bulkDelete: (ids: string[]) => apiClient.post('/leads/bulk-delete', { ids }),

  export: () => apiClient.get('/leads/export', { responseType: 'blob' }),
};

// Campaigns APIs
export const campaignsApi = {
  getAll: (params?: any) => apiClient.get('/campaigns', { params }),

  getById: (id: string) => apiClient.get(`/campaigns/${id}`),

  create: (data: any) => apiClient.post('/campaigns', data),

  update: (id: string, data: any) => apiClient.put(`/campaigns/${id}`, data),

  delete: (id: string) => apiClient.delete(`/campaigns/${id}`),

  launch: (id: string) => apiClient.post(`/campaigns/${id}/launch`),

  pause: (id: string) => apiClient.post(`/campaigns/${id}/pause`),
};

// Pipeline APIs
export const pipelineApi = {
  getStatus: () => apiClient.get('/pipeline/status'),

  getRuns: (params?: any) => apiClient.get('/pipeline/runs', { params }),

  createRun: (data: any) => apiClient.post('/pipeline/run', data),

  getRunDetails: (runId: string) => apiClient.get(`/pipeline/runs/${runId}`),
};

// Analytics APIs
export const analyticsApi = {
  getDashboard: () => apiClient.get('/analytics/dashboard'),

  getCampaignStats: (campaignId: string) => apiClient.get(`/analytics/campaigns/${campaignId}`),

  getLeadMetrics: () => apiClient.get('/analytics/leads'),

  getConversionFunnel: () => apiClient.get('/analytics/conversion-funnel'),
};

// Settings APIs
export const settingsApi = {
  getSettings: () => apiClient.get('/settings'),

  updateSettings: (data: any) => apiClient.put('/settings', data),

  getEmailConfig: () => apiClient.get('/settings/email'),

  updateEmailConfig: (data: any) => apiClient.put('/settings/email', data),

  getGoogleSheetsConfig: () => apiClient.get('/settings/google-sheets'),

  updateGoogleSheetsConfig: (data: any) => apiClient.put('/settings/google-sheets', data),
};

// Tracking APIs
export const trackingApi = {
  getStats: () => apiClient.get('/tracking/leads/tracking-stats'),
  
  getPendingFollowups: (hours?: number) => apiClient.get('/tracking/leads/pending-followup', { 
    params: hours ? { hours } : {} 
  }),
  
  sendFollowup: (leadId: string) => apiClient.post(`/tracking/leads/${leadId}/send-followup`),
  
  scheduleFollowups: (campaignId: string, hoursAfter?: number) => 
    apiClient.post(`/tracking/campaigns/${campaignId}/schedule-followups`, {}, {
      params: hoursAfter ? { hours: hoursAfter } : {}
    }),
};

export default apiClient;
