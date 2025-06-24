import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

interface Demande {
  id: number;
  user_id: number;
  type_demande: string;
  titre: string;
  description?: string;
  date_debut?: string;
  date_fin?: string;
  statut: 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE';
  commentaire_admin?: string;
  created_at: string;
  user?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };
}

const DemandesFonctionnaire = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load user's demandes on component mount
  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        setLoading(true);
        const data = await apiService.getDemandes();
        
        // Filter demandes for current user
        const userDemandes = Array.isArray(data) ? 
          data.filter((demande: any) => demande.user_id === user?.id) : [];
        
        setDemandes(userDemandes);
      } catch (error) {
        console.error('Erreur lors du chargement des demandes:', error);
        setError('Impossible de charger les demandes');
        setDemandes([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDemandes();
    }
  }, [user]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Exemples de demandes déjà faites (à remplacer par API plus tard)
  // const [demandes, setDemandes] = useState<Demande[]>([
  //   { id: 1, type: 'Congé', statut: 'En attente', dateDemande: '2025-06-01' },
  //   { id: 2, type: 'Ordre de Mission', statut: 'Validée', dateDemande: '2025-05-29' },
  //   { id: 3, type: 'Congé', statut: 'Rejetée', dateDemande: '2025-05-25' },
  // ]);
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
              <button
                onClick={() => navigate('/fonctionnaire/profil')}
                className={`px-6 py-3 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm hover:underline font-medium ${window.location.pathname.includes('/profil') ? 'bg-opacity-20 border-b-2 border-yellow-300 underline' : ''}`}
              >Profil</button>
              <button
                onClick={() => navigate('/fonctionnaire/demandes')}
                className={`px-6 py-3 bg-white bg-opacity-20 rounded-xl border-b-2 border-yellow-300 backdrop-blur-sm font-medium hover:underline ${window.location.pathname.includes('/demandes') ? 'underline' : ''}`}
              >Demandes</button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white bg-opacity-10 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Bienvenue, {user?.prenom} {user?.nom}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 bg-opacity-20 border border-red-300 border-opacity-30 rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm"
            >Déconnexion</button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Mes demandes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <button
              onClick={() => navigate('/fonctionnaire/conge')}
              className="block w-full text-left p-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl shadow hover:shadow-lg border border-blue-200 hover:scale-105 transition-transform focus:outline-none"
            >
              <h3 className="text-lg font-semibold text-blue-700 mb-2">Demander un congé</h3>
              <p className="text-gray-600">Effectuez une demande de congé en ligne.</p>
            </button>
            <button
              onClick={() => navigate('/fonctionnaire/ordre-mission')}
              className="block w-full text-left p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl shadow hover:shadow-lg border border-purple-200 hover:scale-105 transition-transform focus:outline-none"
            >
              <h3 className="text-lg font-semibold text-purple-700 mb-2">Demander un ordre de mission</h3>
              <p className="text-gray-600">Effectuez une demande d'ordre de mission.</p>
            </button>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Historique de mes demandes</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        Chargement des demandes...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-red-500">
                        {error}
                      </td>
                    </tr>
                  ) : demandes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        Aucune demande trouvée.
                      </td>
                    </tr>
                  ) : (
                    demandes.map((demande) => (
                      <tr key={demande.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{demande.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{demande.type_demande.replace('_', ' ')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{demande.titre}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(demande.created_at).toLocaleDateString('fr-FR')}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {demande.statut === 'EN_ATTENTE' && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              <Clock className="w-4 h-4 mr-1 inline" /> En attente
                            </span>
                          )}
                          {demande.statut === 'APPROUVEE' && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              <CheckCircle className="w-4 h-4 mr-1 inline" /> Approuvée
                            </span>
                          )}
                          {demande.statut === 'REJETEE' && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              <XCircle className="w-4 h-4 mr-1 inline" /> Rejetée
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DemandesFonctionnaire;
