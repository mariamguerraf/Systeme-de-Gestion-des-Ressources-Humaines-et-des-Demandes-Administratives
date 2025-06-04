import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [] 
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Rediriger vers le dashboard approprié selon le rôle
    switch (user.role) {
      case 'admin':
        return <Navigate to="/cadmin/dashboard" replace />;
      case 'secretaire':
        return <Navigate to="/dashboard" replace />;
      case 'enseignant':
        return <Navigate to="/enseignant/demandes" replace />;
      case 'fonctionnaire':
        return <Navigate to="/fonctionnaire/demandes" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
