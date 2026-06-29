import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return (
    <div className="flex-center" style={{ minHeight: '100vh' }}>
      <div className="spinner" style={{ borderColor: 'rgba(249,115,22,.3)', borderTopColor: 'var(--color-primary)' }} />
    </div>
  );
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

interface PermissionRouteProps {
  moduleId: string;
  action?: string;
  children: React.ReactNode;
}

export const PermissionGate = ({ moduleId, action = 'view', children }: PermissionRouteProps) => {
  const { hasPermission } = useAuth();
  if (!hasPermission(moduleId, action)) return null;
  return <>{children}</>;
};
