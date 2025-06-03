// src/pages/secretaire/Demandes.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

interface DemandeProps {
  id: number;
  objet: string;
  expediteur: string;
  typeExpediteur: string;
  dateCreation: string;
  statut: 'en attente' | 'en cours' | 'traitée';
  priorite: 'normale' | 'urgente' | 'basse';
  messageContent: string;
}

const DemandesPage = () => {
  const [demandes, setDemandes] = useState<DemandeProps[]>([]);
  const [filteredDemandes, setFilteredDemandes] = useState<DemandeProps[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatut, setFilterStatut] = useState<string>('');
  const [filterPriorite, setFilterPriorite] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulation de chargement de données
    const fetchData = async () => {
      try {
        // Dans un cas réel, ces données viendraient d'une API
        const mockDemandes = [
          { id: 1, objet: "Demande d'attestation", expediteur: "Jean Martin", typeExpediteur: "professeur", dateCreation: "01/04/2024", statut: "en attente" as const, priorite: "normale" as const, messageContent: "Je souhaiterais obtenir une attestation de service." },
          { id: 2, objet: "Problème d'accès", expediteur: "Marie Dubois", typeExpediteur: "fonctionnaire", dateCreation: "28/03/2024", statut: "en cours" as const, priorite: "urgente" as const, messageContent: "Je n'arrive pas à accéder à mon espace personnel." },
          { id: 3, objet: "Question administrative", expediteur: "Pierre Bernard", typeExpediteur: "administre", dateCreation: "25/03/2024", statut: "traitée" as const, priorite: "normale" as const, messageContent: "Comment puis-je obtenir un duplicata de mon dossier?" },
          { id: 4, objet: "Mise à jour d'information", expediteur: "Sophie Petit", typeExpediteur: "professeur", dateCreation: "23/03/2024", statut: "en attente" as const, priorite: "basse" as const, messageContent: "Je souhaite mettre à jour mes coordonnées." },
          { id: 5, objet: "Demande de rendez-vous", expediteur: "Julie Richard", typeExpediteur: "fonctionnaire", dateCreation: "20/03/2024", statut: "en cours" as const, priorite: "normale" as const, messageContent: "Je souhaiterais prendre rendez-vous avec le secrétaire général." },
          { id: 6, objet: "Réclamation", expediteur: "Thomas Moreau", typeExpediteur: "administre", dateCreation: "18/03/2024", statut: "traitée" as const, priorite: "urgente" as const, messageContent: "Je conteste la décision prise concernant mon dossier." },
          { id: 7, objet: "Demande de document", expediteur: "Laura Simon", typeExpediteur: "professeur", dateCreation: "15/03/2024", statut: "en attente" as const, priorite: "normale" as const, messageContent: "Pouvez-vous me fournir une copie de mon contrat?" },
          { id: 8, objet: "Question technique", expediteur: "David Laurent", typeExpediteur: "fonctionnaire", dateCreation: "10/03/2024", statut: "traitée" as const, priorite: "basse" as const, messageContent: "Comment puis-je réinitialiser mon mot de passe?" },
          { id: 9, objet: "Signalement", expediteur: "Emilie Michel", typeExpediteur: "administre", dateCreation: "05/03/2024", statut: "en cours" as const, priorite: "urgente" as const, messageContent: "Je souhaite signaler un problème dans les locaux." },
          { id: 10, objet: "Information", expediteur: "Lucas Lefebvre", typeExpediteur: "professeur", dateCreation: "01/03/2024", statut: "traitée" as const, priorite: "normale" as const, messageContent: "Quand aura lieu la prochaine réunion?" }
        ];

        setDemandes(mockDemandes);
        setFilteredDemandes(mockDemandes);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filtrer les demandes en fonction des critères de recherche
    if (demandes.length > 0) {
      const filtered = demandes.filter(demande => {
        const matchesSearch = searchTerm === '' ||
          demande.objet.toLowerCase().includes(searchTerm.toLowerCase()) ||
          demande.expediteur.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatut = filterStatut === '' || demande.statut === filterStatut;
        const matchesPriorite = filterPriorite === '' || demande.priorite === filterPriorite;

        return matchesSearch && matchesStatut && matchesPriorite;
      });

      setFilteredDemandes(filtered);
    }
  }, [searchTerm, filterStatut, filterPriorite, demandes]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterStatut = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatut(e.target.value);
  };

  const handleFilterPriorite = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterPriorite(e.target.value);
  };

  const handleLogout = () => {
    // Logique de déconnexion
    navigate('/');
  };

  const handleViewDemande = (id: number) => {
    navigate(`/secretaire/demandes/${id}`);
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
                placeholder="Rechercher par objet ou expéditeur..."
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
                <option value="en attente">En attente</option>
                <option value="en cours">En cours</option>
                <option value="traitée">Traitée</option>
              </select>
            </div>
            <div>
              <select
                value={filterPriorite}
                onChange={handleFilterPriorite}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les priorités</option>
                <option value="basse">Basse</option>
                <option value="normale">Normale</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <a href="/secretaire/demandes/new" className="inline-block px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-medium shadow-lg transform hover:scale-105">
                Nouvelle demande
              </a>
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objet</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expéditeur</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDemandes.map((demande) => (
                  <tr key={demande.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{demande.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{demande.objet}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{demande.expediteur}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        demande.typeExpediteur === 'professeur' ? 'bg-purple-100 text-purple-800' :
                        demande.typeExpediteur === 'fonctionnaire' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {demande.typeExpediteur.charAt(0).toUpperCase() + demande.typeExpediteur.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{demande.dateCreation}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        demande.statut === 'en attente' ? 'bg-yellow-100 text-yellow-800' :
                        demande.statut === 'en cours' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {demande.statut.charAt(0).toUpperCase() + demande.statut.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        demande.priorite === 'urgente' ? 'bg-red-100 text-red-800' :
                        demande.priorite === 'normale' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {demande.priorite.charAt(0).toUpperCase() + demande.priorite.slice(1)}
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
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        Traiter
                      </button>
                      <button
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