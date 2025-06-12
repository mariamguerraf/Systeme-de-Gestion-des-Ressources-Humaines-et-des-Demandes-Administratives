// Gestion des fonctionnaires administrés par le cadmin
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Plus, Edit3, Trash2, Eye, Search, Filter, FileText, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

interface Fonctionnaire {
  id: number;
  user_id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  cin?: string;
  service?: string;
  poste?: string;
  grade?: string;
  statut: 'Actif' | 'Inactif';
  user?: {
    id: number;
    email: string;
    nom: string;
    prenom: string;
    role: string;
    created_at?: string;
  };
}

const CadminFonctionnaires = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // État pour la liste des fonctionnaires (récupérée depuis l'API)
  const [fonctionnaires, setFonctionnaires] = useState<Fonctionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load fonctionnaires on component mount
  useEffect(() => {
    const fetchFonctionnaires = async () => {
      try {
        setLoading(true);
        const data = await apiService.getFonctionnaires();
        
        // Transform data to match interface
        const transformedData = Array.isArray(data) ? data.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          nom: item.user?.nom || item.nom || 'N/A',
          prenom: item.user?.prenom || item.prenom || 'N/A',
          email: item.user?.email || item.email || '',
          telephone: item.user?.telephone || item.telephone || '',
          service: item.service || '',
          poste: item.poste || '',
          grade: item.grade || '',
          statut: 'Actif' as const,
          user: item.user
        })) : [];
        
        setFonctionnaires(transformedData);
      } catch (error) {
        console.error('Erreur lors du chargement des fonctionnaires:', error);
        setError('Impossible de charger les fonctionnaires');
        setFonctionnaires([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFonctionnaires();
  }, []);  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | 'demandes'>('create');
  const [selectedFonctionnaire, setSelectedFonctionnaire] = useState<Fonctionnaire | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userDemandes, setUserDemandes] = useState<any[]>([]);
  const [demandesLoading, setDemandesLoading] = useState(false);
  
  // État pour le formulaire de création/modification
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    cin: '',
    password: '',
    service: '',
    poste: '',
    grade: ''
  });

  // Filtrage des fonctionnaires
  const filteredFonctionnaires = fonctionnaires.filter(fonctionnaire => {
    const matchesSearch = 
      fonctionnaire.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fonctionnaire.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fonctionnaire.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fonctionnaire.poste || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fonctionnaire.service || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === '' || fonctionnaire.statut === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreate = () => {
    setModalType('create');
    setSelectedFonctionnaire(null);
    // Réinitialiser le formulaire
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      cin: '',
      password: '',
      service: '',
      poste: '',
      grade: ''
    });
    setShowModal(true);
  };

  const handleEdit = (fonctionnaire: Fonctionnaire) => {
    setModalType('edit');
    setSelectedFonctionnaire(fonctionnaire);
    // Pré-remplir le formulaire avec les données existantes
    setFormData({
      nom: fonctionnaire.nom,
      prenom: fonctionnaire.prenom,
      email: fonctionnaire.email,
      telephone: fonctionnaire.telephone || '',
      adresse: fonctionnaire.adresse || '',
      cin: fonctionnaire.cin || '',
      password: '', // Laisser vide pour modification
      service: fonctionnaire.service || '',
      poste: fonctionnaire.poste || '',
      grade: fonctionnaire.grade || ''
    });
    setShowModal(true);
  };

  const handleView = (fonctionnaire: Fonctionnaire) => {
    setModalType('view');
    setSelectedFonctionnaire(fonctionnaire);
    setShowModal(true);
  };

  const handleViewDemandes = async (fonctionnaire: Fonctionnaire) => {
    setModalType('demandes');
    setSelectedFonctionnaire(fonctionnaire);
    setShowModal(true);
    
    // Charger les demandes du fonctionnaire
    setDemandesLoading(true);
    setUserDemandes([]);
    try {
      const demandes = await apiService.getUserDemandes(fonctionnaire.user_id);
      setUserDemandes(Array.isArray(demandes) ? demandes : []);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
      setUserDemandes([]);
    } finally {
      setDemandesLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fonctionnaire ?')) {
      try {
        await apiService.deleteFonctionnaire(id);
        alert('Fonctionnaire supprimé avec succès !');
        // Retirer le fonctionnaire de la liste locale
        setFonctionnaires(fonctionnaires.filter(f => f.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du fonctionnaire');
      }
    }
  };

  const handleSaveFonctionnaire = async () => {
    if (modalType === 'create') {
      setIsLoading(true);
      try {
        // Valider les champs requis
        if (!formData.nom || !formData.prenom || !formData.email || !formData.password) {
          alert('Veuillez remplir tous les champs obligatoires');
          return;
        }

        const nouveauFonctionnaire = await apiService.createFonctionnaire(formData) as any;
        alert('Fonctionnaire créé avec succès !');
        
        // Ajouter le nouveau fonctionnaire à la liste (mapping vers l'interface locale)
        const fonctionnaireLocal: Fonctionnaire = {
          id: nouveauFonctionnaire.id,
          user_id: nouveauFonctionnaire.user_id,
          nom: nouveauFonctionnaire.user.nom,
          prenom: nouveauFonctionnaire.user.prenom,
          email: nouveauFonctionnaire.user.email,
          telephone: nouveauFonctionnaire.user.telephone || '',
          service: nouveauFonctionnaire.service || '',
          poste: nouveauFonctionnaire.poste || '',
          grade: nouveauFonctionnaire.grade || '',
          statut: 'Actif',
          user: nouveauFonctionnaire.user
        };
        
        setFonctionnaires([...fonctionnaires, fonctionnaireLocal]);
        setShowModal(false);
      } catch (error) {
        console.error('Erreur lors de la création:', error);
        alert('Erreur lors de la création du fonctionnaire');
      } finally {
        setIsLoading(false);
      }
    } else if (modalType === 'edit' && selectedFonctionnaire) {
      setIsLoading(true);
      try {
        // Valider les champs requis (mot de passe optionnel en modification)
        if (!formData.nom || !formData.prenom || !formData.email) {
          alert('Veuillez remplir tous les champs obligatoires');
          return;
        }

        // Si le mot de passe est vide, on utilise 'unchanged'
        const dataToSend = {
          ...formData,
          password: formData.password || 'unchanged'
        };

        const fonctionnaireModifie = await apiService.updateFonctionnaire(selectedFonctionnaire.id, dataToSend) as any;
        alert('Fonctionnaire modifié avec succès !');
        
        // Mettre à jour le fonctionnaire dans la liste locale
        const fonctionnaireLocal: Fonctionnaire = {
          id: fonctionnaireModifie.id,
          user_id: fonctionnaireModifie.user_id,
          nom: fonctionnaireModifie.user.nom,
          prenom: fonctionnaireModifie.user.prenom,
          email: fonctionnaireModifie.user.email,
          telephone: fonctionnaireModifie.user.telephone || '',
          service: fonctionnaireModifie.service || '',
          poste: fonctionnaireModifie.poste || '',
          grade: fonctionnaireModifie.grade || '',
          statut: 'Actif',
          user: fonctionnaireModifie.user
        };
        
        // Remplacer le fonctionnaire modifié dans la liste
        setFonctionnaires(fonctionnaires.map(func => 
          func.id === selectedFonctionnaire.id ? fonctionnaireLocal : func
        ));
        setShowModal(false);
      } catch (error: any) {
        console.error('Erreur lors de la modification:', error);
        alert(`Erreur: ${error.message || 'Impossible de modifier le fonctionnaire'}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Service</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Statut</th>
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
                      <div className="text-gray-900 font-medium">{fonctionnaire.poste || 'N/A'}</div>
                      <div className="text-gray-500 text-sm">{fonctionnaire.grade || 'Aucun grade'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {fonctionnaire.service || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(fonctionnaire.statut)}`}>
                        {fonctionnaire.statut}
                      </span>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{selectedFonctionnaire.service || 'N/A'}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{selectedFonctionnaire.grade || 'N/A'}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{selectedFonctionnaire.statut}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de création</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{selectedFonctionnaire.user?.created_at ? new Date(selectedFonctionnaire.user.created_at).toLocaleDateString('fr-FR') : 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {modalType === 'demandes' && selectedFonctionnaire && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <h4 className="text-lg font-semibold text-gray-800">
                        Historique des demandes de {selectedFonctionnaire.prenom} {selectedFonctionnaire.nom}
                      </h4>
                    </div>
                    
                    {demandesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        <span className="ml-2 text-gray-600">Chargement des demandes...</span>
                      </div>
                    ) : userDemandes.length > 0 ? (
                      <div className="space-y-3">
                        {userDemandes.map((demande: any) => (
                          <div key={demande.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-medium text-gray-900">{demande.titre}</h5>
                                <p className="text-sm text-gray-600">{demande.type_demande}</p>
                              </div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                demande.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                                demande.statut === 'APPROUVEE' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {demande.statut === 'EN_ATTENTE' ? 'En attente' :
                                 demande.statut === 'APPROUVEE' ? 'Approuvée' : 'Rejetée'}
                              </span>
                            </div>
                            {demande.description && (
                              <p className="text-sm text-gray-700 mb-2">{demande.description}</p>
                            )}
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>Créée le: {new Date(demande.created_at).toLocaleDateString('fr-FR')}</span>
                              {demande.date_debut && demande.date_fin && (
                                <span>Du {new Date(demande.date_debut).toLocaleDateString('fr-FR')} au {new Date(demande.date_fin).toLocaleDateString('fr-FR')}</span>
                              )}
                            </div>
                            {demande.commentaire_admin && (
                              <div className="mt-2 p-2 bg-gray-50 rounded border-l-4 border-purple-500">
                                <p className="text-sm font-medium text-gray-700">Commentaire administrateur:</p>
                                <p className="text-sm text-gray-600">{demande.commentaire_admin}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Aucune demande trouvée pour ce fonctionnaire.</p>
                      </div>
                    )}
                  </div>
                )}

                {(modalType === 'create' || modalType === 'edit') && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                        <input
                          type="text"
                          name="prenom"
                          value={formData.prenom}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Prénom du fonctionnaire"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                        <input
                          type="text"
                          name="nom"
                          value={formData.nom}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Nom du fonctionnaire"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="email@univ.ma"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <input
                          type="tel"
                          name="telephone"
                          value={formData.telephone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0X XX XX XX XX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                        <input
                          type="text"
                          name="adresse"
                          value={formData.adresse}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Adresse complète"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CIN</label>
                        <input
                          type="text"
                          name="cin"
                          value={formData.cin}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Numéro CIN"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mot de passe {modalType === 'edit' ? '(laisser vide pour ne pas changer)' : '*'}
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder={modalType === 'edit' ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
                          required={modalType === 'create'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                        <input
                          type="text"
                          name="service"
                          value={formData.service}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Service/Département"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                        <input
                          type="text"
                          name="poste"
                          value={formData.poste}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Poste occupé"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                        <select
                          name="grade"
                          value={formData.grade}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Sélectionner un grade</option>
                          <option value="Agent">Agent</option>
                          <option value="Agent Principal">Agent Principal</option>
                          <option value="Cadre">Cadre</option>
                          <option value="Cadre Supérieur">Cadre Supérieur</option>
                          <option value="Chef de Service">Chef de Service</option>
                          <option value="Directeur">Directeur</option>
                        </select>
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
                {(modalType === 'create' || modalType === 'edit') && (
                  <button 
                    onClick={handleSaveFonctionnaire}
                    disabled={isLoading}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {modalType === 'create' ? 'Création...' : 'Modification...'}
                      </>
                    ) : (
                      modalType === 'create' ? 'Créer' : 'Sauvegarder'
                    )}
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
