import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Calendar, MapPin, ArrowLeftRight, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

const ProfilPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await apiService.getCurrentUser();
        setUserData(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
        setUserData(user);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white px-6 py-6 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <User className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Système de Gestion</h1>
            <nav className="ml-8 flex space-x-1">
              <Link to="/enseignant/profil" className="px-6 py-3 bg-white bg-opacity-20 rounded-xl border-b-2 border-yellow-300 backdrop-blur-sm font-medium hover:underline">Profil</Link>
              <Link to="/enseignant/demandes" className="px-6 py-3 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm hover:underline">Demandes</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white bg-opacity-10 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">
                Bienvenue, {userData?.nom && userData?.prenom ? `${userData.prenom} ${userData.nom}` : user?.nom && user?.prenom ? `${user.prenom} ${user.nom}` : 'Enseignant'}
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
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Mon Profil</h2>
          </div>
          <div className="p-8">
            <div
              className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-8 cursor-pointer hover:shadow-xl transition-shadow duration-300 overflow-hidden min-h-[500px]"
              onClick={handleCardClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
              aria-label="Cliquez pour voir les informations professionnelles"
            >
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
              </div>

              <div className="text-center mb-8">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {userData?.prenom && userData?.nom ? `${userData.prenom} ${userData.nom}` : 'Utilisateur'}
                    </h3>
                    <p className="text-blue-600 font-semibold">
                      {userData?.role === 'enseignant' ? 'Professeur' : userData?.role || 'Utilisateur'}
                    </p>
                    <p className="text-gray-500">ID: {userData?.id || 'N/A'}</p>
                  </>
                )}
              </div>

              <div className="relative h-96">
                <div
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    isFlipped ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
                  } ${isFlipped ? 'pointer-events-none' : 'pointer-events-auto'}`}
                >
                  <div className="h-full">
                    <div className="max-w-2xl mx-auto">
                      <h4 className="text-lg font-semibold text-gray-800 mb-6 text-center">Informations de Contact</h4>
                      <div className="space-y-4">
                        {loading ? (
                          <div className="animate-pulse space-y-4">
                            <div className="h-12 bg-gray-200 rounded-lg"></div>
                            <div className="h-12 bg-gray-200 rounded-lg"></div>
                            <div className="h-12 bg-gray-200 rounded-lg"></div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                              <Mail className="w-5 h-5 text-blue-500" />
                              <span className="text-gray-700 font-medium">{userData?.email || 'Email non disponible'}</span>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                              <Phone className="w-5 h-5 text-green-500" />
                              <span className="text-gray-700 font-medium">{userData?.telephone || 'Téléphone non renseigné'}</span>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                              <MapPin className="w-5 h-5 text-red-500" />
                              <span className="text-gray-700 font-medium">{userData?.adresse || 'Adresse non renseignée'}</span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex justify-center mt-8">
                        <div className="flex items-center space-x-2 text-gray-500 text-sm">
                          <ArrowLeftRight className="w-4 h-4" />
                          <span>Cliquez pour voir les informations professionnelles</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    isFlipped ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                  } ${isFlipped ? 'pointer-events-auto' : 'pointer-events-none'}`}
                >
                  <div className="h-full">
                    <div className="max-w-2xl mx-auto">
                      <h4 className="text-lg font-semibold text-gray-800 mb-6 text-center">Informations Professionnelles</h4>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                          <User className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-700 font-medium">Statut: {userData?.role === 'enseignant' ? 'Enseignant Titulaire' : 'Enseignant'}</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                          <Calendar className="w-5 h-5 text-green-600" />
                          <span className="text-gray-700 font-medium">
                            Date d'inscription: {userData?.created_at ? new Date(userData.created_at).toLocaleDateString('fr-FR') : 'Non disponible'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
                          <User className="w-5 h-5 text-purple-600" />
                          <span className="text-gray-700 font-medium">CIN: {userData?.cin || 'Non renseigné'}</span>
                        </div>
                      </div>

                      <div className="flex justify-center mt-8">
                        <div className="flex items-center space-x-2 text-gray-500 text-sm">
                          <ArrowLeftRight className="w-4 h-4" />
                          <span>Cliquez pour revenir aux informations de contact</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilPage;
