// Dashboard du cadmin pour gérer enseignants et fonctionnaires
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, UserCheck, BarChart3, Settings, Bell } from 'lucide-react';

const CadminDashboard = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    navigate('/');
  };

  const stats = [
    { title: 'Enseignants', count: 24, color: 'from-blue-500 to-blue-600', icon: UserCheck },
    { title: 'Fonctionnaires', count: 18, color: 'from-purple-500 to-purple-600', icon: Users },
    { title: 'Demandes en attente', count: 7, color: 'from-orange-500 to-orange-600', icon: Bell },
    { title: 'Demandes traitées', count: 45, color: 'from-green-500 to-green-600', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white px-6 py-6 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Administration Centrale</h1>
            <nav className="ml-8 flex space-x-1">
              <button
                onClick={() => navigate('/cadmin/dashboard')}
                className={`px-6 py-3 bg-white bg-opacity-20 rounded-xl border-b-2 border-yellow-300 backdrop-blur-sm font-medium hover:underline ${window.location.pathname.includes('/dashboard') ? 'underline' : ''}`}
              >Dashboard</button>
              <button
                onClick={() => navigate('/cadmin/enseignants')}
                className={`px-6 py-3 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm hover:underline font-medium ${window.location.pathname.includes('/enseignants') ? 'bg-opacity-20 border-b-2 border-yellow-300 underline' : ''}`}
              >Enseignants</button>
              <button
                onClick={() => navigate('/cadmin/fonctionnaires')}
                className={`px-6 py-3 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm hover:underline font-medium ${window.location.pathname.includes('/fonctionnaires') ? 'bg-opacity-20 border-b-2 border-yellow-300 underline' : ''}`}
              >Fonctionnaires</button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white bg-opacity-10 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Bienvenue, Administrateur</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 bg-opacity-20 border border-red-300 border-opacity-30 rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm"
            >Déconnexion</button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        {/* Message de bienvenue admin */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Tableau de Bord Administrateur</h2>
              <p className="text-blue-100">Gérez les utilisateurs, supervisez les demandes et contrôlez l'ensemble du système depuis cette interface centralisée.</p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{stat.count}</span>
                </div>
                <h3 className="text-gray-600 font-medium">{stat.title}</h3>
              </div>
            );
          })}
        </div>

        {/* Actions principales */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Actions Principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button 
              onClick={() => navigate('/cadmin/enseignants')}
              className="block p-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl shadow hover:shadow-lg border border-blue-200 hover:scale-105 transition-transform text-left"
            >
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-blue-700">Gérer les Enseignants</h3>
              </div>
              <p className="text-gray-600">Créer, modifier, supprimer et consulter les profils enseignants. Gérez leurs permissions et suivez leur activité.</p>
            </button>
            <button 
              onClick={() => navigate('/cadmin/fonctionnaires')}
              className="block p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl shadow hover:shadow-lg border border-purple-200 hover:scale-105 transition-transform text-left"
            >
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-purple-700">Gérer les Fonctionnaires</h3>
              </div>
              <p className="text-gray-600">Administrez les fonctionnaires, gérez leurs demandes de congé et ordres de mission. Contrôlez leur accès au système.</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CadminDashboard;
