// src/pages/secretaire/Demandes.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

interface DemandeProps {
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

const DemandesPage = () => {
  const [demandes, setDemandes] = useState<DemandeProps[]>([]);
  const [filteredDemandes, setFilteredDemandes] = useState<DemandeProps[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatut, setFilterStatut] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [totalDemandes, setTotalDemandes] = useState<number>(0);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Load demandes on component mount
  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 [DEBUG] Chargement des demandes...');
        
        // Récupérer toutes les demandes depuis la base de données
        let data;
        try {
          // Essayer d'abord l'endpoint principal
          data = await apiService.getDemandes();
        } catch (error) {
          console.log('📋 [DEBUG] Endpoint principal échoué, utilisation de l\'endpoint de test');
          // En cas d'échec, utiliser l'endpoint de test
          const testData = await apiService.getTestDemandes() as any;
          data = testData?.demandes || testData || [];
        }
        console.log('📋 [DEBUG] Données des demandes reçues:', data);
        
        // Transform data to match interface
        const transformedData = Array.isArray(data) ? data : [];
        
        // Assurer que chaque demande a les bonnes propriétés
        const normalizedDemandes = transformedData.map((demande: any) => ({
          id: demande.id || 0,
          user_id: demande.user_id || 0,
          type_demande: demande.type_demande || 'ATTESTATION',
          titre: demande.titre || 'Sans titre',
          description: demande.description || '',
          date_debut: demande.date_debut || null,
          date_fin: demande.date_fin || null,
          statut: demande.statut || 'EN_ATTENTE',
          commentaire_admin: demande.commentaire_admin || '',
          created_at: demande.created_at || new Date().toISOString(),
          user: demande.user ? {
            id: demande.user.id || 0,
            nom: demande.user.nom || 'Inconnu',
            prenom: demande.user.prenom || 'Inconnu',
            email: demande.user.email || '',
            role: demande.user.role || 'user'
          } : {
            id: 0,
            nom: 'Utilisateur',
            prenom: 'Inconnu',
            email: '',
            role: 'user'
          }
        }));
        
        console.log('📝 [DEBUG] Demandes normalisées:', normalizedDemandes);
        setDemandes(normalizedDemandes);
        setFilteredDemandes(normalizedDemandes);
        setTotalDemandes(normalizedDemandes.length);
        
      } catch (error) {
        console.error('Erreur lors du chargement des demandes:', error);
        setError('Impossible de charger les demandes');
        setDemandes([]);
        setFilteredDemandes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDemandes();
  }, []);

  // Filter demandes based on search criteria
  useEffect(() => {
    if (demandes.length > 0) {
      const filtered = demandes.filter(demande => {
        const matchesSearch = searchTerm === '' ||
          demande.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (demande.user?.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (demande.user?.prenom || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatut = filterStatut === '' || demande.statut === filterStatut;

        return matchesSearch && matchesStatut;
      });

      setFilteredDemandes(filtered);
    }
  }, [searchTerm, filterStatut, demandes]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterStatut = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatut(e.target.value);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleViewDemande = (id: number) => {
    navigate(`/secretaire/demandes/${id}`);
  };

  const handleTraiterDemande = async (id: number) => {
    try {
      console.log(`🔄 [DEBUG] Traitement de la demande ${id}`);
      await apiService.approuverDemande(id, 'Demande approuvée par le secrétaire');
      
      // Update local state
      setDemandes(demandes.map(demande =>
        demande.id === id
          ? { ...demande, statut: 'APPROUVEE' as const, commentaire_admin: 'Demande approuvée par le secrétaire' }
          : demande
      ));
      
      setNotification({type: 'success', message: `Demande ${id} approuvée avec succès.`});
      console.log(`✅ [DEBUG] Demande ${id} approuvée avec succès`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setNotification({type: 'error', message: `Erreur lors de l'approbation de la demande ${id}.`});
    }
  };

  const handleArchiverDemande = async (id: number) => {
    try {
      console.log(`🔄 [DEBUG] Rejet de la demande ${id}`);
      await apiService.rejeterDemande(id, 'Demande rejetée par le secrétaire');
      
      // Update local state
      setDemandes(demandes.map(demande =>
        demande.id === id
          ? { ...demande, statut: 'REJETEE' as const, commentaire_admin: 'Demande rejetée par le secrétaire' }
          : demande
      ));
      
      setNotification({type: 'success', message: `Demande ${id} rejetée avec succès.`});
      console.log(`❌ [DEBUG] Demande ${id} rejetée avec succès`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setNotification({type: 'error', message: `Erreur lors du rejet de la demande ${id}.`});
    }
  };

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-2xl text-gray-600">Chargement des demandes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-2xl text-red-600 mb-4">❌ Erreur</div>
          <div className="text-lg text-gray-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Recharger
          </button>
        </div>
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
              <Link to="/secretaire/dashboard" className="px-4 py-2 rounded-xl bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm font-medium">Dashboard</Link>
              <Link to="/secretaire/users" className="px-4 py-2 rounded-xl bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm font-medium">Utilisateurs</Link>
              <Link to="/secretaire/demandes" className="px-4 py-2 rounded-xl bg-white bg-opacity-20 border-b-2 border-yellow-300 backdrop-blur-sm font-medium underline">Demandes</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-medium">Bienvenue, Secrétaire</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 bg-opacity-20 border border-red-300 border-opacity-30 rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Gestion des Demandes</h2>

        {/* Filtres de recherche */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Rechercher par titre ou nom d'utilisateur..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={filterStatut}
                onChange={handleFilterStatut}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="APPROUVEE">Approuvée</option>
                <option value="REJETEE">Rejetée</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des demandes */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demandeur</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de création</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDemandes.map((demande) => (
                  <tr key={demande.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{demande.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{demande.titre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {demande.user ? `${demande.user.prenom} ${demande.user.nom}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        demande.type_demande === 'CONGE' ? 'bg-purple-100 text-purple-800' :
                        demande.type_demande === 'ABSENCE' ? 'bg-blue-100 text-blue-800' :
                        demande.type_demande === 'ATTESTATION' ? 'bg-green-100 text-green-800' :
                        demande.type_demande === 'ORDRE_MISSION' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {demande.type_demande.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        demande.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                        demande.statut === 'APPROUVEE' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {demande.statut === 'EN_ATTENTE' ? 'En attente' :
                         demande.statut === 'APPROUVEE' ? 'Approuvée' : 'Rejetée'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col md:flex-row gap-2 md:gap-0 md:space-x-2">
                        <button
                          onClick={() => handleViewDemande(demande.id)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          Voir
                        </button>
                        
                        {demande.statut === 'EN_ATTENTE' && (
                          <>
                            <button
                              onClick={() => handleTraiterDemande(demande.id)}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-green-400"
                            >
                              Approuver
                            </button>
                            <button
                              onClick={() => handleArchiverDemande(demande.id)}
                              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg shadow hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
                            >
                              Rejeter
                            </button>
                          </>
                        )}
                        
                        {demande.statut === 'APPROUVEE' && (
                          <span className="px-4 py-2 text-green-600 text-sm font-medium">
                            ✅ Approuvée
                          </span>
                        )}
                        
                        {demande.statut === 'REJETEE' && (
                          <span className="px-4 py-2 text-red-600 text-sm font-medium">
                            ❌ Rejetée
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDemandes.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              Aucune demande trouvée avec ces critères de recherche.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DemandesPage;