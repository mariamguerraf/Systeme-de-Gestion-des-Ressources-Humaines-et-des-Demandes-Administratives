// src/pages/secretaire/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Users, FileText, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

interface StatProps {
  totalUsers: number;
  professeurs: number;
  fonctionnaires: number;
  administres: number;
  demandesEnAttente: number;
}

const SecretaireDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<StatProps>({
    totalUsers: 0,
    professeurs: 0,
    fonctionnaires: 0,
    administres: 0,
    demandesEnAttente: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    // Fetch real data from API
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('🔑 [DEBUG] Utilisateur connecté:', user);
        console.log('🔑 [DEBUG] Token présent:', !!localStorage.getItem('access_token'));
        
        const dashboardStats = await apiService.getDashboardStats() as any;
        setStats({
          totalUsers: dashboardStats.totalUsers || 0,
          professeurs: dashboardStats.enseignants || 0,
          fonctionnaires: dashboardStats.fonctionnaires || 0,
          administres: (dashboardStats.totalUsers || 0) - (dashboardStats.enseignants || 0) - (dashboardStats.fonctionnaires || 0),
          demandesEnAttente: dashboardStats.demandesEnAttente || 0
        });

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        // Keep default/mock values in case of error
        setStats({
          totalUsers: 0,
          professeurs: 0,
          fonctionnaires: 0,
          administres: 0,
          demandesEnAttente: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-2xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
          <button className="ml-4 text-white font-bold" onClick={() => setNotification(null)}>×</button>
        </div>
      )}
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Système de Gestion</h1>
            <div className="ml-10 hidden md:flex space-x-4">
              <Link to="/secretaire/dashboard" className="px-4 py-2 rounded-xl bg-white bg-opacity-20 border-b-2 border-yellow-300 backdrop-blur-sm font-medium underline">Dashboard</Link>
              <Link to="/secretaire/users" className="px-4 py-2 rounded-xl bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm font-medium">Utilisateurs</Link>
              <Link to="/secretaire/demandes" className="px-4 py-2 rounded-xl bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm font-medium">Demandes</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white bg-opacity-10 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">
                Bienvenue, {user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : 'Secrétaire'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 bg-opacity-20 border border-red-300 border-opacity-30 rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Tableau de bord</h2>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
            <h3 className="text-lg text-gray-500">Total Utilisateurs</h3>
            <p className="text-3xl font-bold text-blue-700">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
            <h3 className="text-lg text-gray-500">Professeurs</h3>
            <p className="text-3xl font-bold text-purple-700">{stats.professeurs}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
            <h3 className="text-lg text-gray-500">Fonctionnaires</h3>
            <p className="text-3xl font-bold text-indigo-700">{stats.fonctionnaires}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
            <h3 className="text-lg text-gray-500">Administrés</h3>
            <p className="text-3xl font-bold text-pink-700">{stats.administres}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
            <h3 className="text-lg text-yellow-700">Demandes en attente</h3>
            <p className="text-3xl font-bold text-orange-500">{stats.demandesEnAttente}</p>
          </div>
        </div>

        {/* Boutons d'action principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Bouton Voir Utilisateurs */}
          <div 
            onClick={() => navigate('/secretaire/users')}
            className="bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl shadow-2xl border border-blue-200 p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-3xl group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6 group-hover:bg-opacity-30 transition-all duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Voir Utilisateurs</h3>
              <p className="text-blue-100 text-lg mb-4">Gérer tous les utilisateurs du système</p>
              <div className="bg-white bg-opacity-20 rounded-full px-6 py-2 text-white font-semibold">
                {stats.totalUsers} utilisateurs
              </div>
            </div>
          </div>

          {/* Bouton Voir Demandes */}
          <div 
            onClick={() => navigate('/secretaire/demandes')}
            className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-3xl shadow-2xl border border-yellow-200 p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-3xl group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-yellow-300 bg-opacity-30 rounded-full flex items-center justify-center mb-6 group-hover:bg-opacity-40 transition-all duration-300">
                <FileText className="w-10 h-10 text-yellow-700" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-700 mb-3">Voir Demandes</h3>
              <p className="text-yellow-600 text-lg mb-4">Traiter toutes les demandes administratives</p>
              <div className="bg-yellow-300 bg-opacity-30 rounded-full px-6 py-2 text-yellow-700 font-semibold">
                {stats.demandesEnAttente} en attente
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecretaireDashboard;