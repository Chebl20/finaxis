import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const tenantsAPI = {
  create: (data: any) => api.post('/tenants', data),
  list: () => api.get('/tenants'),
  get: (id: string) => api.get(`/tenants/${id}`),
  invite: (id: string, data: any) => api.post(`/tenants/${id}/invite`, data),
};

export const accountsAPI = {
  create: (tenantId: string, data: any) =>
    api.post(`/tenants/${tenantId}/accounts`, data),
  list: (tenantId: string) => api.get(`/tenants/${tenantId}/accounts`),
  get: (tenantId: string, id: string) =>
    api.get(`/tenants/${tenantId}/accounts/${id}`),
  update: (tenantId: string, id: string, data: any) =>
    api.put(`/tenants/${tenantId}/accounts/${id}`, data),
  delete: (tenantId: string, id: string) =>
    api.delete(`/tenants/${tenantId}/accounts/${id}`),
};

export const categoriesAPI = {
  create: (tenantId: string, data: any) =>
    api.post(`/tenants/${tenantId}/categories`, data),
  list: (tenantId: string, type?: string) =>
    api.get(`/tenants/${tenantId}/categories`, { params: { type } }),
  get: (tenantId: string, id: string) =>
    api.get(`/tenants/${tenantId}/categories/${id}`),
  update: (tenantId: string, id: string, data: any) =>
    api.put(`/tenants/${tenantId}/categories/${id}`, data),
  delete: (tenantId: string, id: string) =>
    api.delete(`/tenants/${tenantId}/categories/${id}`),
};

export const transactionsAPI = {
  create: (tenantId: string, data: any) =>
    api.post(`/tenants/${tenantId}/transactions`, data),
  list: (tenantId: string, filters?: any) =>
    api.get(`/tenants/${tenantId}/transactions`, { params: filters }),
  get: (tenantId: string, id: string) =>
    api.get(`/tenants/${tenantId}/transactions/${id}`),
  update: (tenantId: string, id: string, data: any) =>
    api.put(`/tenants/${tenantId}/transactions/${id}`, data),
  delete: (tenantId: string, id: string) =>
    api.delete(`/tenants/${tenantId}/transactions/${id}`),
};

export const dashboardAPI = {
  getSummary: (tenantId: string) =>
    api.get(`/tenants/${tenantId}/dashboard/summary`),
};

export const ticketsAPI = {
  create: (tenantId: string, data: any) =>
    api.post(`/tenants/${tenantId}/tickets`, data),
  list: (tenantId: string) => api.get(`/tenants/${tenantId}/tickets`),
  get: (tenantId: string, id: string) =>
    api.get(`/tenants/${tenantId}/tickets/${id}`),
  update: (tenantId: string, id: string, data: any) =>
    api.put(`/tenants/${tenantId}/tickets/${id}`, data),
};
