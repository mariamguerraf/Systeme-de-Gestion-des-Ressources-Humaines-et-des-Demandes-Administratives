// Gestion des enseignants par le cadmin
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, UserCheck, Plus, Edit3, Trash2, Eye, Search, Filter } from 'lucide-react';

interface Enseignant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  matiere: string;
  statut: 'Actif' | 'Inactif';
  dateEmbauche: string;
}

const CadminEnseignants = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    navigate('/');
  };

  // Données d'exemple des enseignants
  const [enseignants, setEnseignants] = useState<Enseignant[]>([
    {
      id: 1,
      nom: 'Dupont',
      prenom: 'Marie',
      email: 'marie.dupont@edu.fr',
      telephone: '0123456789',
      matiere: 'Mathématiques',
      statut: 'Actif',
      dateEmbauche: '2020-09-01'
    },
    {
      id: 2,
      nom: 'Martin',
      prenom: 'Jean',
      email: 'jean.martin@edu.fr',
      telephone: '0123456790',
      matiere: 'Français',
      statut: 'Actif',
      dateEmbauche: '2019-09-01'
    },
    {
      id: 3,
      nom: 'Bernard',
      prenom: 'Sophie',
      email: 'sophie.bernard@edu.fr',
      telephone: '0123456791',
      matiere: 'Histoire',
      statut: 'Inactif',
      dateEmbauche: '2021-09-01'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedEnseignant, setSelectedEnseignant] = useState<Enseignant | null>(null);

  // Filtrage des enseignants
  const filteredEnseignants = enseignants.filter(enseignant => {
    const matchesSearch = 
      enseignant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enseignant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enseignant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enseignant.matiere.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || enseignant.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreate = () => {
    setModalType('create');
    setSelectedEnseignant(null);
    setShowModal(true);
  };

  const handleEdit = (enseignant: Enseignant) => {
    setModalType('edit');
    setSelectedEnseignant(enseignant);
    setShowModal(true);
  };

  const handleView = (enseignant: Enseignant) => {
    setModalType('view');
    setSelectedEnseignant(enseignant);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) {
      setEnseignants(enseignants.filter(e => e.id !== id));
    }
  };

  const handleSaveEnseignant = () => {
    if (modalType === 'create') {
      console.log('Création d\'un nouvel enseignant');
      // Ici, on ajouterait la logique pour créer un nouvel enseignant
      alert('Fonctionnalité de création à implémenter');
    } else if (modalType === 'edit') {
      console.log('Modification de l\'enseignant', selectedEnseignant?.id);
      // Ici, on ajouterait la logique pour modifier l'enseignant existant
      alert('Fonctionnalité de modification à implémenter');
    }
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white px-6 py-6 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Administration Centrale</h1>
            <nav className="ml-8 flex space-x-1">
              <button
                onClick={() => navigate('/cadmin/dashboard')}
                className={`px-6 py-3 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm hover:underline font-medium ${window.location.pathname.includes('/dashboard') ? 'bg-opacity-20 border-b-2 border-yellow-300 underline' : ''}`}
              >Dashboard</button>
              <button
                onClick={() => navigate('/cadmin/enseignants')}
                className={`px-6 py-3 bg-white bg-opacity-20 rounded-xl border-b-2 border-yellow-300 backdrop-blur-sm font-medium hover:underline ${window.location.pathname.includes('/enseignants') ? 'underline' : ''}`}
              >Enseignants</button>
              <button
                onClick={() => navigate('/cadmin/fonctionnaires')}
                className={`px-6 py-3 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm hover:underline font-medium ${window.location.pathname.includes('/fonctionnaires') ? 'bg-opacity-20 border-b-2 border-yellow-300 underline' : ''}`}
              >Fonctionnaires</button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white bg-opacity-10 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Bienvenue, Administrateur</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 bg-opacity-20 border border-red-300 border-opacity-30 rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm"
            >Déconnexion</button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* En-tête de gestion */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Gestion des Enseignants</h2>
                  <p className="text-blue-100">Gérez les profils, permissions et statuts des enseignants</p>
                </div>
              </div>
              <button
                onClick={handleCreate}
                className="flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Ajouter un Enseignant</span>
              </button>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, prénom, email ou matière..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Tous les statuts</option>
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tableau des enseignants */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Enseignant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Matière</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date d'embauche</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEnseignants.map((enseignant) => (
                  <tr key={enseignant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {enseignant.prenom[0]}{enseignant.nom[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{enseignant.prenom} {enseignant.nom}</div>
                          <div className="text-gray-500 text-sm">ID: {enseignant.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{enseignant.email}</div>
                      <div className="text-gray-500 text-sm">{enseignant.telephone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {enseignant.matiere}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        enseignant.statut === 'Actif' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {enseignant.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {new Date(enseignant.dateEmbauche).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleView(enseignant)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(enseignant)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(enseignant.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Message si aucun résultat */}
          {filteredEnseignants.length === 0 && (
            <div className="text-center py-12">
              <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun enseignant trouvé</h3>
              <p className="text-gray-500">Aucun enseignant ne correspond à vos critères de recherche.</p>
            </div>
          )}
        </div>

        {/* Modal (à implémenter selon le type) */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  {modalType === 'create' && 'Ajouter un Enseignant'}
                  {modalType === 'edit' && 'Modifier l\'Enseignant'}
                  {modalType === 'view' && 'Détails de l\'Enseignant'}
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Fonctionnalité {modalType} à implémenter avec formulaire complet.
                </p>
                {selectedEnseignant && modalType === 'view' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{selectedEnseignant.prenom}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{selectedEnseignant.nom}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{selectedEnseignant.email}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{selectedEnseignant.telephone}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{selectedEnseignant.matiere}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{selectedEnseignant.statut}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
                {modalType !== 'view' && (
                  <button 
                    onClick={handleSaveEnseignant}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {modalType === 'create' ? 'Créer' : 'Sauvegarder'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CadminEnseignants;
