// src/pages/secretaire/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

interface StatProps {
  totalUsers: number;
  professeurs: number;
  fonctionnaires: number;
  administres: number;
  demandesEnAttente: number;
}

interface DemandeProps {
  id: number;
  utilisateur: string;
  type: string;
  date: string;
  statut: string;
}

const SecretaireDashboard = () => {
  const [stats, setStats] = useState<StatProps>({
    totalUsers: 0,
    professeurs: 0,
    fonctionnaires: 0,
    administres: 0,
    demandesEnAttente: 0
  });
  const [recentesDemandes, setRecentesDemandes] = useState<DemandeProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchType, setSearchType] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Simulation de chargement de données
    const fetchData = async () => {
      try {
        // Dans un cas réel, ces données viendraient d'une API
        setStats({
          totalUsers: 145,
          professeurs: 42,
          fonctionnaires: 68,
          administres: 35,
          demandesEnAttente: 12
        });

        setRecentesDemandes([
          { id: 1, utilisateur: "Prof. Martin", type: "Congé", date: "05/04/2025", statut: "En attente" },
          { id: 2, utilisateur: "Mme Dubois", type: "Document", date: "04/04/2025", statut: "En attente" },
          { id: 3, utilisateur: "M. Bernard", type: "Attestation", date: "03/04/2025", statut: "En attente" },
          { id: 4, utilisateur: "Prof. Petit", type: "Congé", date: "02/04/2025", statut: "En attente" },
          { id: 5, utilisateur: "Mme Richard", type: "Document", date: "01/04/2025", statut: "En attente" }
        ]);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    // Logique de déconnexion
    navigate('/');
  };

  const handleAccepterDemande = (demandeId: number) => {
    setRecentesDemandes(prevDemandes => 
      prevDemandes.map(demande => 
        demande.id === demandeId 
          ? { ...demande, statut: 'Acceptée' }
          : demande
      )
    );
    // Optionnel: afficher une notification de succès
    console.log(`Demande ${demandeId} acceptée`);
  };

  const handleRefuserDemande = (demandeId: number) => {
    setRecentesDemandes(prevDemandes => 
      prevDemandes.map(demande => 
        demande.id === demandeId 
          ? { ...demande, statut: 'Refusée' }
          : demande
      )
    );
    // Optionnel: afficher une notification de succès
    console.log(`Demande ${demandeId} refusée`);
  };

  const handleRechercher = () => {
    // Rediriger vers la page des utilisateurs avec les paramètres de recherche
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.set('search', searchTerm);
    if (searchType) queryParams.set('type', searchType);
    
    navigate(`/secretaire/users?${queryParams.toString()}`);
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
              <Link to="/secretaire/dashboard" className="px-4 py-2 rounded-xl bg-white bg-opacity-20 border-b-2 border-yellow-300 backdrop-blur-sm font-medium underline">Dashboard</Link>
              <Link to="/secretaire/users" className="px-4 py-2 rounded-xl bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm font-medium">Utilisateurs</Link>
              <Link to="/secretaire/demandes" className="px-4 py-2 rounded-xl bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm font-medium">Demandes</Link>
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
          <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl shadow-2xl border border-yellow-200 p-4">
            <h3 className="text-lg text-yellow-700">Demandes en attente</h3>
            <p className="text-3xl font-bold text-orange-500">{stats.demandesEnAttente}</p>
          </div>
        </div>

        {/* Dernières demandes */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Demandes récentes</h3>
            <a href="/secretaire/demandes" className="text-blue-600 hover:underline font-medium">Voir toutes</a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentesDemandes.map((demande) => (
                  <tr key={demande.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{demande.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{demande.utilisateur}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{demande.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{demande.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {demande.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex flex-col md:flex-row gap-2 md:gap-0 md:space-x-2">
                      <button 
                        onClick={() => handleAccepterDemande(demande.id)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        Accepter
                      </button>
                      <button 
                        onClick={() => handleRefuserDemande(demande.id)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg shadow hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
                      >
                        Refuser
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recherche d'utilisateur */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Rechercher un utilisateur</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Nom, prénom ou identifiant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select 
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                <option value="professeur">Professeur</option>
                <option value="fonctionnaire">Fonctionnaire</option>
                <option value="administre">Administré</option>
              </select>
            </div>
            <div>
              <button 
                onClick={handleRechercher}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg transform hover:scale-105"
              >
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecretaireDashboard;