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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Système de Gestion</h1>
            <div className="ml-10 hidden md:flex space-x-4">
			  <Link to="/secretaire/dashboard" className="px-3 py-2 rounded-md bg-blue-700"> Dashboard </Link>
			  <Link to="/secretaire/users" className="px-3 py-2 rounded-md hover:bg-blue-700">Utilisateurs</Link>
			  <Link to="/secretaire/demandes" className="px-3 py-2 rounded-md hover:bg-blue-700">Demandes</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span>Bienvenue, Secrétaire</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-blue-800 rounded-md hover:bg-blue-900"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-semibold mb-6">Tableau de bord</h2>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg text-gray-500">Total Utilisateurs</h3>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg text-gray-500">Professeurs</h3>
            <p className="text-3xl font-bold">{stats.professeurs}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg text-gray-500">Fonctionnaires</h3>
            <p className="text-3xl font-bold">{stats.fonctionnaires}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg text-gray-500">Administrés</h3>
            <p className="text-3xl font-bold">{stats.administres}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg text-gray-500">Demandes en attente</h3>
            <p className="text-3xl font-bold text-orange-500">{stats.demandesEnAttente}</p>
          </div>
        </div>

        {/* Dernières demandes */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Demandes récentes</h3>
            <a href="/secretaire/demandes" className="text-blue-600 hover:underline">Voir toutes</a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-green-600 hover:text-green-900 mr-3">Accepter</button>
                      <button className="text-red-600 hover:text-red-900">Refuser</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recherche d'utilisateur */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Rechercher un utilisateur</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Nom, prénom ou identifiant..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Tous les types</option>
                <option value="professeur">Professeur</option>
                <option value="fonctionnaire">Fonctionnaire</option>
                <option value="administre">Administré</option>
              </select>
            </div>
            <div>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
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