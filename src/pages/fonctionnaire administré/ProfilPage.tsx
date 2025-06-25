import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, ArrowLeftRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { getApiBaseUrl } from '../../utils/config';

interface FonctionnaireData {
  id: number;
  user_id: number;
  service: string;
  poste: string;
  grade: string;
  photo?: string;
  user?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    adresse?: string;
    cin?: string;
    role: string;
    is_active?: boolean;
    created_at?: string;
  };
}

const ProfilPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);
  const [fonctionnaireData, setFonctionnaireData] = useState<FonctionnaireData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFonctionnaireData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 [ProfilFonctionnaire] Début récupération des données');
        console.log('👤 [ProfilFonctionnaire] Utilisateur connecté:', user);

        if (!user?.id) {
          console.error('❌ [ProfilFonctionnaire] Utilisateur non connecté');
          setError('Utilisateur non connecté');
          return;
        }

        console.log('🌐 [ProfilFonctionnaire] Appel API getFonctionnaires...');

        // Récupérer les données du fonctionnaire connecté
        const fonctionnaires = await apiService.getFonctionnaires();
        console.log('📋 [ProfilFonctionnaire] Fonctionnaires reçus:', fonctionnaires);

        const fonctionnairesList = Array.isArray(fonctionnaires) ? fonctionnaires : [];
        console.log('📋 [ProfilFonctionnaire] Liste fonctionnaires:', fonctionnairesList);

        const currentFonctionnaire = fonctionnairesList.find((fonc: any) => {
          console.log('🔍 [ProfilFonctionnaire] Comparaison:', {
            fonc_user_id: fonc.user_id,
            fonc_user_id_nested: fonc.user?.id,
            current_user_id: user.id
          });
          return fonc.user_id === user.id || fonc.user?.id === user.id;
        });

        console.log('🎯 [ProfilFonctionnaire] Fonctionnaire trouvé:', currentFonctionnaire);

        if (currentFonctionnaire) {
          setFonctionnaireData(currentFonctionnaire);
        } else {
          console.warn('⚠️ [ProfilFonctionnaire] Fonctionnaire non trouvé pour user_id:', user.id);
          // Au lieu d'une erreur, utilisons les données de base de l'utilisateur
          setFonctionnaireData({
            id: 0,
            user_id: user.id,
            service: 'Non renseigné',
            poste: 'Non renseigné',
            grade: 'Non renseigné',
            user: {
              ...user,
              telephone: user.telephone || 'Non renseigné',
              adresse: user.adresse || 'Non renseigné',
              cin: user.cin || 'Non renseigné'
            }
          });
        }
      } catch (error) {
        console.error('💥 [ProfilFonctionnaire] Erreur lors de la récupération des données:', error);
        setError(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);

        // En cas d'erreur, utiliser les données de base de l'utilisateur si disponible
        if (user) {
          console.log('🔄 [ProfilFonctionnaire] Utilisation des données utilisateur de base');
          setFonctionnaireData({
            id: 0,
            user_id: user.id,
            service: 'Non renseigné',
            poste: 'Non renseigné',
            grade: 'Non renseigné',
            user: {
              ...user,
              telephone: user.telephone || 'Non renseigné',
              adresse: user.adresse || 'Non renseigné',
              cin: user.cin || 'Non renseigné'
            }
          });
          setError(null); // Effacer l'erreur puisqu'on a des données de base
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFonctionnaireData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non renseigné';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  // Données utilisateur avec fallback amélioré
  const userData = fonctionnaireData?.user || user;
  const nom = userData?.nom || 'Non renseigné';
  const prenom = userData?.prenom || 'Non renseigné';
  const email = userData?.email || 'Non renseigné';
  const telephone = userData?.telephone || 'Non renseigné';
  const adresse = userData?.adresse || 'Non renseigné';
  const cin = userData?.cin || 'Non renseigné';
  const service = fonctionnaireData?.service || 'Non renseigné';
  const poste = fonctionnaireData?.poste || 'Non renseigné';
  const grade = fonctionnaireData?.grade || 'Non renseigné';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center space-x-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-lg font-medium text-gray-700">Chargement de votre profil...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
            <button
              onClick={() => {
                console.log('🧪 [ProfilFonctionnaire] Test de connexion API');
                apiService.getCurrentUser()
                  .then(userData => {
                    console.log('✅ [ProfilFonctionnaire] Utilisateur reçu:', userData);
                    alert('Connexion API OK - Voir la console');
                  })
                  .catch(err => {
                    console.error('❌ [ProfilFonctionnaire] Erreur API:', err);
                    alert('Erreur API: ' + err.message);
                  });
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Test Connexion API
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <Link to="/fonctionnaire/profil" className="px-6 py-3 bg-white bg-opacity-20 rounded-xl border-b-2 border-yellow-300 backdrop-blur-sm font-medium hover:underline">Profil</Link>
              <Link to="/fonctionnaire/demandes" className="px-6 py-3 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm hover:underline">Demandes</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white bg-opacity-10 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Bienvenue, {prenom} {nom}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 bg-opacity-20 border border-red-300 border-opacity-30 rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Mon Profil</h2>
          </div>
          <div className="p-8">
            {/* Interactive Profile Card */}
            <div
              className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-8 cursor-pointer hover:shadow-xl transition-shadow duration-300 overflow-hidden min-h-[500px]"
              onClick={handleCardClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
              aria-label="Cliquez pour voir les informations professionnelles"
            >
              {/* Profile Photo - Fixed center position */}
              <div className="flex justify-center mb-6">
                {fonctionnaireData?.photo ? (
                  <img
                    src={`${getApiBaseUrl()}${fonctionnaireData.photo}`}
                    alt={`${prenom} ${nom}`}
                    className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-white"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-md">
                    <User className="w-12 h-12 text-blue-600" />
                  </div>
                )}
              </div>

              {/* User Name - Always visible */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800">{prenom} {nom}</h3>
                <p className="text-blue-600 font-semibold">{poste}</p>
                <p className="text-gray-500">ID: {fonctionnaireData?.id || 'Non disponible'}</p>
              </div>

              {/* Content Container */}
              <div className="relative h-96">
                {/* Contact Information - Initial State */}
                <div
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    isFlipped ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
                  } ${isFlipped ? 'pointer-events-none' : 'pointer-events-auto'}`}
                >
                  <div className="h-full">
                    {/* Contact Information */}
                    <div className="max-w-2xl mx-auto">
                      <h4 className="text-lg font-semibold text-gray-800 mb-6 text-center">Informations de Contact</h4>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <Mail className="w-5 h-5 text-blue-500" />
                          <span className="text-gray-700 font-medium">{email}</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <Phone className="w-5 h-5 text-green-500" />
                          <span className="text-gray-700 font-medium">{telephone}</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <MapPin className="w-5 h-5 text-orange-500" />
                          <span className="text-gray-700 font-medium">Adresse: {adresse}</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <User className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-700 font-medium">CIN: {cin}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Information - Flipped State */}
                <div
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    isFlipped ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                  } ${isFlipped ? 'pointer-events-auto' : 'pointer-events-none'}`}
                >
                  <div className="h-full">
                    {/* Professional Information */}
                    <div className="max-w-2xl mx-auto">
                      <h4 className="text-lg font-semibold text-gray-800 mb-6 text-center">Informations Professionnelles</h4>
                      <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-blue-50 border-l-4 border-blue-500">
                          <label className="block text-sm font-semibold text-blue-600 mb-1">Statut</label>
                          <p className="text-gray-800 font-medium">Fonctionnaire</p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-50 border-l-4 border-green-500">
                          <label className="block text-sm font-semibold text-green-600 mb-1">Grade</label>
                          <p className="text-gray-800 font-medium">{grade}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-purple-50 border-l-4 border-purple-500">
                          <label className="block text-sm font-semibold text-purple-600 mb-1">Service</label>
                          <p className="text-gray-800 font-medium">{service}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-indigo-50 border-l-4 border-indigo-500">
                          <label className="block text-sm font-semibold text-indigo-600 mb-1">Poste</label>
                          <p className="text-gray-800 font-medium">{poste}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Click indicator */}
              <div className="absolute bottom-4 right-4 flex items-center space-x-2 text-xs text-gray-400 opacity-60 hover:opacity-80 transition-opacity">
                <ArrowLeftRight className="w-4 h-4" />
                <span>{isFlipped ? 'Contacts' : 'Infos pro'}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilPage;