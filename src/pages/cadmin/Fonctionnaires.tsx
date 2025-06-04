// Gestion des fonctionnaires administrés par le cadmin
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Plus, Edit3, Trash2, Eye, Search, Filter, FileText, Calendar } from 'lucide-react';

interface Fonctionnaire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  poste: string;
  departement: string;
  statut: 'Actif' | 'Inactif' | 'En congé';
  dateEmbauche: string;
  soldeConge: number;
  derniereConnexion: string;
}

const CadminFonctionnaires = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    navigate('/');
  };

  // Données d'exemple des fonctionnaires
  const [fonctionnaires, setFonctionnaires] = useState<Fonctionnaire[]>([
    {
      id: 1,
      nom: 'Leroy',
      prenom: 'Pierre',
      email: 'pierre.leroy@admin.fr',
      telephone: '0123456789',
      poste: 'Agent Administratif',
      departement: 'Ressources Humaines',
      statut: 'Actif',
      dateEmbauche: '2018-03-15',
      soldeConge: 25,
      derniereConnexion: '2025-01-15'
    },
    {
      id: 2,
      nom: 'Moreau',
      prenom: 'Claire',
      email: 'claire.moreau@admin.fr',
      telephone: '0123456790',
      poste: 'Secrétaire',
      departement: 'Direction',
      statut: 'En congé',
      dateEmbauche: '2020-01-10',
      soldeConge: 18,
      derniereConnexion: '2025-01-10'
    },
    {
      id: 3,
      nom: 'Petit',
      prenom: 'Laurent',
      email: 'laurent.petit@admin.fr',
      telephone: '0123456791',
      poste: 'Comptable',
      departement: 'Finance',
      statut: 'Actif',
      dateEmbauche: '2019-09-01',
      soldeConge: 30,
      derniereConnexion: '2025-01-14'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | 'demandes'>('create');
  const [selectedFonctionnaire, setSelectedFonctionnaire] = useState<Fonctionnaire | null>(null);

  // Liste des départements uniques
  const departments = [...new Set(fonctionnaires.map(f => f.departement))];

  // Filtrage des fonctionnaires
  const filteredFonctionnaires = fonctionnaires.filter(fonctionnaire => {
    const matchesSearch = 
      fonctionnaire.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fonctionnaire.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fonctionnaire.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fonctionnaire.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fonctionnaire.departement.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || fonctionnaire.statut === statusFilter;
    const matchesDepartment = departmentFilter === '' || fonctionnaire.departement === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleCreate = () => {
    setModalType('create');
    setSelectedFonctionnaire(null);
    setShowModal(true);
  };

  const handleEdit = (fonctionnaire: Fonctionnaire) => {
    setModalType('edit');
    setSelectedFonctionnaire(fonctionnaire);
    setShowModal(true);
  };

  const handleView = (fonctionnaire: Fonctionnaire) => {
    setModalType('view');
    setSelectedFonctionnaire(fonctionnaire);
    setShowModal(true);
  };

  const handleViewDemandes = (fonctionnaire: Fonctionnaire) => {
    setModalType('demandes');
    setSelectedFonctionnaire(fonctionnaire);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fonctionnaire ?')) {
      setFonctionnaires(fonctionnaires.filter(f => f.id !== id));
    }
  };

  const handleSaveFonctionnaire = () => {
    if (modalType === 'create') {
      console.log('Création d\'un nouveau fonctionnaire');
      // Ici, on ajouterait la logique pour créer un nouveau fonctionnaire
      alert('Fonctionnalité de création à implémenter');
    } else if (modalType === 'edit') {
      console.log('Modification du fonctionnaire', selectedFonctionnaire?.id);
      // Ici, on ajouterait la logique pour modifier le fonctionnaire existant
      alert('Fonctionnalité de modification à implémenter');
    }
    setShowModal(false);
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Actif': return 'bg-green-100 text-green-800';
      case 'Inactif': return 'bg-red-100 text-red-800';
      case 'En congé': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                className={`px-6 py-3 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm hover:underline font-medium ${window.location.pathname.includes('/enseignants') ? 'bg-opacity-20 border-b-2 border-yellow-300 underline' : ''}`}
              >Enseignants</button>
              <button
                onClick={() => navigate('/cadmin/fonctionnaires')}
                className={`px-6 py-3 bg-white bg-opacity-20 rounded-xl border-b-2 border-yellow-300 backdrop-blur-sm font-medium hover:underline ${window.location.pathname.includes('/fonctionnaires') ? 'underline' : ''}`}
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
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Gestion des Fonctionnaires</h2>
                  <p className="text-purple-100">Administrez les fonctionnaires, leurs demandes et permissions</p>
                </div>
              </div>
              <button
                onClick={handleCreate}
                className="flex items-center space-x-2 bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Ajouter un Fonctionnaire</span>
              </button>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, prénom, email, poste ou département..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                    <option value="En congé">En congé</option>
                  </select>
                </div>
                <div className="relative">
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="pl-4 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">Tous les départements</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des fonctionnaires */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Fonctionnaire</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Poste</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Département</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Congés</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFonctionnaires.map((fonctionnaire) => (
                  <tr key={fonctionnaire.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {fonctionnaire.prenom[0]}{fonctionnaire.nom[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{fonctionnaire.prenom} {fonctionnaire.nom}</div>
                          <div className="text-gray-500 text-sm">ID: {fonctionnaire.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{fonctionnaire.email}</div>
                      <div className="text-gray-500 text-sm">{fonctionnaire.telephone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{fonctionnaire.poste}</div>
                      <div className="text-gray-500 text-sm">Depuis {new Date(fonctionnaire.dateEmbauche).getFullYear()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {fonctionnaire.departement}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(fonctionnaire.statut)}`}>
                        {fonctionnaire.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900 font-medium">{fonctionnaire.soldeConge}</span>
                        <span className="text-gray-500 text-sm">jours</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleView(fonctionnaire)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewDemandes(fonctionnaire)}
                          className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                          title="Voir les demandes"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(fonctionnaire)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(fonctionnaire.id)}
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
          {filteredFonctionnaires.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun fonctionnaire trouvé</h3>
              <p className="text-gray-500">Aucun fonctionnaire ne correspond à vos critères de recherche.</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  {modalType === 'create' && 'Ajouter un Fonctionnaire'}
                  {modalType === 'edit' && 'Modifier le Fonctionnaire'}
                  {modalType === 'view' && 'Détails du Fonctionnaire'}
                  {modalType === 'demandes' && 'Demandes du Fonctionnaire'}
                </h3>
              </div>
              <div className="p-6">
                {modalType === 'view' && selectedFonctionnaire && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{selectedFonctionnaire.prenom}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{selectedFonctionnaire.nom}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{selectedFonctionnaire.email}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{selectedFonctionnaire.telephone}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{selectedFonctionnaire.poste}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{selectedFonctionnaire.departement}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{selectedFonctionnaire.statut}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Solde congés</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{selectedFonctionnaire.soldeConge} jours</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date d'embauche</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{new Date(selectedFonctionnaire.dateEmbauche).toLocaleDateString('fr-FR')}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dernière connexion</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{new Date(selectedFonctionnaire.derniereConnexion).toLocaleDateString('fr-FR')}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {modalType === 'demandes' && selectedFonctionnaire && (
                  <div className="space-y-4">
                    <p className="text-gray-600">Historique des demandes de {selectedFonctionnaire.prenom} {selectedFonctionnaire.nom}</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-500">Fonctionnalité à implémenter : affichage des demandes de congé et ordres de mission avec statuts et dates.</p>
                    </div>
                  </div>
                )}

                {(modalType === 'create' || modalType === 'edit') && (
                  <div className="text-gray-600">
                    <p>Fonctionnalité {modalType} à implémenter avec formulaire complet incluant :</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Informations personnelles (nom, prénom, email, téléphone)</li>
                      <li>Informations professionnelles (poste, département, date d'embauche)</li>
                      <li>Gestion des permissions et statut</li>
                      <li>Configuration du solde de congés</li>
                    </ul>
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
                {(modalType === 'create' || modalType === 'edit') && (
                  <button 
                    onClick={handleSaveFonctionnaire}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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

export default CadminFonctionnaires;
