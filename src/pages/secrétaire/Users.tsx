// src/pages/secretaire/Users.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface UserProps {
  id: number;
  nom: string;
  prenom: string;
  type: string;
  email: string;
  telephone: string;
  dateInscription: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<UserProps[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProps[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Récupérer les paramètres de recherche depuis l'URL
    const urlSearchTerm = searchParams.get('search') || '';
    const urlFilterType = searchParams.get('type') || '';
    
    setSearchTerm(urlSearchTerm);
    setFilterType(urlFilterType);
  }, [searchParams]);

  useEffect(() => {
    // Simulation de chargement de données
    const fetchData = async () => {
      try {
        // Dans un cas réel, ces données viendraient d'une API
        const mockUsers = [
          { id: 1, nom: "Martin", prenom: "Jean", type: "professeur", email: "jean.martin@edu.fr", telephone: "06 12 34 56 78", dateInscription: "01/02/2024" },
          { id: 2, nom: "Dubois", prenom: "Marie", type: "fonctionnaire", email: "marie.dubois@admin.fr", telephone: "06 23 45 67 89", dateInscription: "15/01/2024" },
          { id: 3, nom: "Bernard", prenom: "Pierre", type: "administre", email: "pierre.bernard@gmail.com", telephone: "06 34 56 78 90", dateInscription: "20/03/2024" },
          { id: 4, nom: "Petit", prenom: "Sophie", type: "professeur", email: "sophie.petit@edu.fr", telephone: "06 45 67 89 01", dateInscription: "05/12/2023" },
          { id: 5, nom: "Richard", prenom: "Julie", type: "fonctionnaire", email: "julie.richard@admin.fr", telephone: "06 56 78 90 12", dateInscription: "10/02/2024" },
          { id: 6, nom: "Moreau", prenom: "Thomas", type: "administre", email: "thomas.moreau@gmail.com", telephone: "06 67 89 01 23", dateInscription: "25/03/2024" },
          { id: 7, nom: "Simon", prenom: "Laura", type: "professeur", email: "laura.simon@edu.fr", telephone: "06 78 90 12 34", dateInscription: "03/01/2024" },
          { id: 8, nom: "Laurent", prenom: "David", type: "fonctionnaire", email: "david.laurent@admin.fr", telephone: "06 89 01 23 45", dateInscription: "18/02/2024" },
          { id: 9, nom: "Michel", prenom: "Emilie", type: "administre", email: "emilie.michel@gmail.com", telephone: "06 90 12 34 56", dateInscription: "22/03/2024" },
          { id: 10, nom: "Lefebvre", prenom: "Lucas", type: "professeur", email: "lucas.lefebvre@edu.fr", telephone: "06 01 23 45 67", dateInscription: "07/12/2023" }
        ];

        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filtrer les utilisateurs en fonction des critères de recherche
    if (users.length > 0) {
      const filtered = users.filter(user => {
        const matchesSearch = searchTerm === '' ||
          user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = filterType === '' || user.type === filterType;

        return matchesSearch && matchesType;
      });

      setFilteredUsers(filtered);
    }
  }, [searchTerm, filterType, users]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
  };

  const handleLogout = () => {
    // Logique de déconnexion
    logout();
    navigate('/');
  };



  const handlePaginationPrevious = () => {
    console.log('Page précédente');
    // Logique de pagination - à implémenter avec state de page actuelle
  };

  const handlePaginationNext = () => {
    console.log('Page suivante');
    // Logique de pagination - à implémenter avec state de page actuelle
  };

  const handlePageNumber = (pageNumber: number) => {
    console.log(`Aller à la page ${pageNumber}`);
    // Logique de pagination - à implémenter avec state de page actuelle
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
              <Link to="/secretaire/users" className="px-4 py-2 rounded-xl bg-white bg-opacity-20 border-b-2 border-yellow-300 backdrop-blur-sm font-medium underline">Utilisateurs</Link>
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
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Gestion des Utilisateurs</h2>

        {/* Filtres de recherche */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou email..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={filterType}
                onChange={handleFilterType}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                <option value="professeur">Professeur</option>
                <option value="fonctionnaire">Fonctionnaire</option>
                <option value="administre">Administré</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inscription</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.nom}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.prenom}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.type === 'professeur' ? 'bg-purple-100 text-purple-800' :
                        user.type === 'fonctionnaire' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.telephone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.dateInscription}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              Aucun utilisateur trouvé avec ces critères de recherche.
            </div>
          )}

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button 
                onClick={handlePaginationPrevious}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Précédent
              </button>
              <button 
                onClick={handlePaginationNext}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredUsers.length}</span> sur <span className="font-medium">{users.length}</span> résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button 
                    onClick={handlePaginationPrevious}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    &laquo; Précédent
                  </button>
                  <button 
                    onClick={() => handlePageNumber(1)}
                    className="bg-blue-50 border-blue-500 z-10 relative inline-flex items-center px-4 py-2 border text-sm font-medium text-blue-600 hover:bg-blue-100"
                  >
                    1
                  </button>
                  <button 
                    onClick={() => handlePageNumber(2)}
                    className="bg-white border-gray-300 relative inline-flex items-center px-4 py-2 border text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    2
                  </button>
                  <button 
                    onClick={() => handlePageNumber(3)}
                    className="bg-white border-gray-300 relative inline-flex items-center px-4 py-2 border text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    3
                  </button>
                  <button 
                    onClick={handlePaginationNext}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
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

export default UsersPage;