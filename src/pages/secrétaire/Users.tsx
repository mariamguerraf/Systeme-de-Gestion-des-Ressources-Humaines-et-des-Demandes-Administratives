// src/pages/secretaire/Users.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

interface UserProps {
  id: number;
  nom: string;
  prenom: string;
  type: string;
  email: string;
  telephone: string;
  adresse?: string;
  cin?: string;
  role: string;
  is_active: boolean;
  created_at?: string;
  specialite?: string;
  grade?: string;
  service?: string;
  poste?: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<UserProps[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProps[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);
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
    // Fetch real data from API
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer tous les utilisateurs depuis la base de données
        const response = await apiService.getAllUsers() as any;
        console.log('📊 [DEBUG] Données utilisateurs reçues:', response);
        
        // Extraire les utilisateurs de la réponse
        const usersArray = Array.isArray(response?.users) ? response.users : 
                           Array.isArray(response) ? response : [];
        
        // Transformer les données pour correspondre à l'interface
        const transformedUsers = usersArray.map((user: any) => ({
          id: user.id || Math.random(),
          nom: user.nom || 'N/A',
          prenom: user.prenom || 'N/A', 
          type: user.role === 'enseignant' ? 'professeur' : 
                user.role === 'fonctionnaire' ? 'fonctionnaire' : 
                user.role === 'admin' ? 'administrateur' :
                user.role === 'secretaire' ? 'secrétaire' : 'administré',
          email: user.email || '',
          telephone: user.telephone || 'Non renseigné',
          adresse: user.adresse || 'Non renseigné',
          cin: user.cin || 'Non renseigné',
          role: user.role || 'user',
          is_active: user.is_active !== false,
          created_at: user.created_at,
          specialite: user.specialite,
          grade: user.grade,
          service: user.service,
          poste: user.poste
        }));

        console.log('📝 [DEBUG] Utilisateurs transformés:', transformedUsers);
        setUsers(transformedUsers);
        setTotalUsers(response?.total || transformedUsers.length);

      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        setError('Impossible de charger les utilisateurs');
        setUsers([]);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-2xl text-gray-600">Chargement des utilisateurs...</div>
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Détails</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.type === 'professeur' && user.specialite && (
                        <span className="text-purple-600">Spécialité: {user.specialite}</span>
                      )}
                      {user.type === 'fonctionnaire' && user.service && (
                        <span className="text-blue-600">Service: {user.service}</span>
                      )}
                      {user.type === 'fonctionnaire' && user.poste && (
                        <span className="text-blue-600 block">Poste: {user.poste}</span>
                      )}
                      {user.grade && (
                        <span className="text-indigo-600 block">Grade: {user.grade}</span>
                      )}
                      {!user.specialite && !user.service && !user.poste && !user.grade && (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>
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
        </div>
      </main>
    </div>
  );
};

export default UsersPage;