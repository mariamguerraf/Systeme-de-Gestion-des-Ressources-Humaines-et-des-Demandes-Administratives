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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Load demandes on component mount
  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        setLoading(true);
        const data = await apiService.getDemandes();
        
        // Transform data to match interface
        const transformedData = Array.isArray(data) ? data : [];
        
        setDemandes(transformedData);
        setFilteredDemandes(transformedData);
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
      await apiService.updateDemandeStatus(id, 'APPROUVEE');
      // Update local state
      setDemandes(demandes.map(demande =>
        demande.id === id
          ? { ...demande, statut: 'APPROUVEE' as const }
          : demande
      ));
      console.log(`Demande ${id} approuvée`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const handleArchiverDemande = async (id: number) => {
    try {
      await apiService.updateDemandeStatus(id, 'REJETEE');
      // Update local state
      setDemandes(demandes.map(demande =>
        demande.id === id
          ? { ...demande, statut: 'REJETEE' as const }
          : demande
      ));
      console.log(`Demande ${id} rejetée`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  // Fonctions de pagination
  const totalPages = Math.ceil(filteredDemandes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDemandes = filteredDemandes.slice(indexOfFirstItem, indexOfLastItem);

  const handlePaginationPrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handlePaginationNext = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageNumber = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-2xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
                {currentDemandes.map((demande) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex flex-col md:flex-row gap-2 md:gap-0 md:space-x-2">
                      <button
                        onClick={() => handleViewDemande(demande.id)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        Voir
                      </button>
                      <button
                        onClick={() => handleTraiterDemande(demande.id)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        Traiter
                      </button>
                      <button
                        onClick={() => handleArchiverDemande(demande.id)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg shadow hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
                      >
                        Archiver
                      </button>
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

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Précédent
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredDemandes.length}</span> sur <span className="font-medium">{demandes.length}</span> résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    &laquo; Précédent
                  </button>
                  <button className="bg-blue-50 border-blue-500 z-10 relative inline-flex items-center px-4 py-2 border text-sm font-medium text-blue-600 hover:bg-blue-100">
                    1
                  </button>
                  <button className="bg-white border-gray-300 relative inline-flex items-center px-4 py-2 border text-sm font-medium text-gray-500 hover:bg-gray-50">
                    2
                  </button>
                  <button className="bg-white border-gray-300 relative inline-flex items-center px-4 py-2 border text-sm font-medium text-gray-500 hover:bg-gray-50">
                    3
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Suivant &raquo;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DemandesPage;