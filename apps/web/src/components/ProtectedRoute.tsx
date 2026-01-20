import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, currentTenant } = useAuthStore();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Se está tentando acessar dashboard e não tem tenant, redireciona para seleção
  if (!currentTenant && location.pathname.startsWith('/dashboard')) {
    return <Navigate to="/tenant-select" replace />;
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: { children: ReactNode }) {
  const { token, currentTenant } = useAuthStore();

  if (token) {
    if (currentTenant) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/tenant-select" replace />;
    }
  }

  return <>{children}</>;
}
