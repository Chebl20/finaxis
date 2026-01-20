import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string;
  tenants?: any[];
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  currentTenant: Tenant | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setCurrentTenant: (tenant: Tenant | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  currentTenant: JSON.parse(localStorage.getItem('currentTenant') || 'null'),

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user });
  },

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },

  setCurrentTenant: (tenant) => {
    if (tenant) {
      localStorage.setItem('currentTenant', JSON.stringify(tenant));
    } else {
      localStorage.removeItem('currentTenant');
    }
    set({ currentTenant: tenant });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('currentTenant');
    set({ user: null, token: null, currentTenant: null });
  },
}));
