import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const DashboardRouter: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    console.log('🎯 DashboardRouter - État:', { user, isAuthenticated, loading });
    if (user) {
      console.log('👤 Utilisateur:', { email: user.email, role: user.role });
    }
  }, [user, isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('❌ Non authentifié, redirection vers /');
    return <Navigate to="/" replace />;
  }

  // Redirection selon le rôle - correspondant aux routes dans App.tsx
  const role = user.role?.toLowerCase();
  console.log('🔄 Redirection basée sur le rôle:', role);

  switch (role) {
    case 'admin':
      console.log('✅ Redirection admin vers /cadmin/dashboard');
      return <Navigate to="/cadmin/dashboard" replace />;
    case 'enseignant':
      console.log('✅ Redirection enseignant vers /enseignant/profil');
      return <Navigate to="/enseignant/profil" replace />;
    case 'secretaire':
      console.log('✅ Redirection secrétaire vers /dashboard');
      return <Navigate to="/dashboard" replace />;
    case 'fonctionnaire':
      console.log('✅ Redirection fonctionnaire vers /fonctionnaire/profil');
      return <Navigate to="/fonctionnaire/profil" replace />;
    default:
      console.log('❓ Rôle non reconnu:', role);
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Rôle non reconnu</h1>
            <p className="mt-2 text-gray-600">Rôle: {user.role}</p>
            <p className="mt-2 text-gray-600">Email: {user.email}</p>
          </div>
        </div>
      );
  }
};

export default DashboardRouter;
