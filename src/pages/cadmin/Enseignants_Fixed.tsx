// Gestion des enseignants par le cadmin
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, UserCheck, Plus, Edit3, Trash2, Eye, Search, Filter, User, Lock, Phone, Mail, MapPin, CreditCard, Building, GraduationCap, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // État pour la liste des enseignants (récupérée depuis l'API)
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedEnseignant, setSelectedEnseignant] = useState<Enseignant | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour charger tous les enseignants depuis l'API
  const loadEnseignants = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('Token manquant');
        return;
      }

      const response = await fetch('http://localhost:8080/users/enseignants', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const enseignantsData = await response.json();
        console.log('Enseignants récupérés:', enseignantsData);
        
        // Convertir les données de l'API vers le format de l'interface locale
        const enseignantsFormatted = enseignantsData.map((ens: any) => ({
          id: ens.user.id,
          nom: ens.user.nom,
          prenom: ens.user.prenom,
          email: ens.user.email,
          telephone: ens.user.telephone || '',
          matiere: ens.specialite || '',
          statut: 'Actif' as const,
          dateEmbauche: new Date().toISOString().split('T')[0]
        }));
        
        setEnseignants(enseignantsFormatted);
      } else {
        console.error('Erreur lors du chargement des enseignants:', response.status);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des enseignants:', error);
    }
  };

  // Charger les enseignants au démarrage du composant
  React.useEffect(() => {
    loadEnseignants();
  }, []);
  
  // État pour le formulaire de création
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    cin: '',
    password: '',
    specialite: '',
    grade: '',
    etablissement: ''
  });

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
    // Réinitialiser le formulaire
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      cin: '',
      password: '',
      specialite: '',
      grade: '',
      etablissement: ''
    });
    setShowModal(true);
  };

  const handleEdit = (enseignant: Enseignant) => {
    setModalType('edit');
    setSelectedEnseignant(enseignant);
    // Pré-remplir le formulaire avec les données existantes
    setFormData({
      nom: enseignant.nom,
      prenom: enseignant.prenom,
      email: enseignant.email,
      telephone: enseignant.telephone,
      adresse: '', // Ces champs ne sont pas disponibles dans l'interface Enseignant
      cin: '',
      password: '', // Laisser vide pour modification
      specialite: enseignant.matiere,
      grade: '',
      etablissement: ''
    });
    setShowModal(true);
  };

  const handleView = (enseignant: Enseignant) => {
    setModalType('view');
    setSelectedEnseignant(enseignant);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          alert('Vous devez être connecté pour effectuer cette action');
          return;
        }

        const response = await fetch(`http://localhost:8000/users/enseignants/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          alert(result.message || 'Enseignant supprimé avec succès !');
          
          // Retirer l'enseignant de la liste locale
          setEnseignants(enseignants.filter(e => e.id !== id));
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.detail || 'Impossible de supprimer l\'enseignant'}`);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur de connexion au serveur');
      }
    }
  };

  const handleSaveEnseignant = async () => {
    if (modalType === 'create') {
      setIsLoading(true);
      try {
        // Valider les champs requis
        if (!formData.nom || !formData.prenom || !formData.email || !formData.password) {
          alert('Veuillez remplir tous les champs obligatoires');
          return;
        }

        // Obtenir le token depuis localStorage
        const token = localStorage.getItem('access_token');
        if (!token) {
          alert('Vous devez être connecté pour effectuer cette action');
          return;
        }

        // Faire l'appel API
        const response = await fetch('http://localhost:8080/users/enseignants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const nouvelEnseignant = await response.json();
          alert('Enseignant créé avec succès !');
          
          // Ajouter le nouvel enseignant à la liste (mapping vers l'interface locale)
          const enseignantLocal: Enseignant = {
            id: nouvelEnseignant.user.id,
            nom: nouvelEnseignant.user.nom,
            prenom: nouvelEnseignant.user.prenom,
            email: nouvelEnseignant.user.email,
            telephone: nouvelEnseignant.user.telephone || '',
            matiere: nouvelEnseignant.specialite || '',
            statut: 'Actif',
            dateEmbauche: new Date().toISOString().split('T')[0]
          };
          
          setEnseignants([...enseignants, enseignantLocal]);
          setShowModal(false);
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.detail || 'Impossible de créer l\'enseignant'}`);
        }
      } catch (error) {
        console.error('Erreur lors de la création:', error);
        alert('Erreur de connexion au serveur');
      } finally {
        setIsLoading(false);
      }
    } else if (modalType === 'edit' && selectedEnseignant) {
      setIsLoading(true);
      try {
        // Valider les champs requis (mot de passe optionnel en modification)
        if (!formData.nom || !formData.prenom || !formData.email) {
          alert('Veuillez remplir tous les champs obligatoires');
          return;
        }

        // Obtenir le token depuis localStorage
        const token = localStorage.getItem('access_token');
        if (!token) {
          alert('Vous devez être connecté pour effectuer cette action');
          return;
        }

        // Si le mot de passe est vide, garder l'ancien (on peut améliorer cela)
        const dataToSend = {
          ...formData,
          password: formData.password || 'unchanged' // Placeholder - dans un vrai système, on ne changerait le mot de passe que s'il est fourni
        };

        // Faire l'appel API pour la modification
        const response = await fetch(`http://localhost:8000/users/enseignants/${selectedEnseignant.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
          const enseignantModifie = await response.json();
          alert('Enseignant modifié avec succès !');
          
          // Mettre à jour l'enseignant dans la liste locale
          const enseignantLocal: Enseignant = {
            id: enseignantModifie.user.id,
            nom: enseignantModifie.user.nom,
            prenom: enseignantModifie.user.prenom,
            email: enseignantModifie.user.email,
            telephone: enseignantModifie.user.telephone || '',
            matiere: enseignantModifie.specialite || '',
            statut: 'Actif',
            dateEmbauche: new Date().toISOString().split('T')[0]
          };
          
          // Remplacer l'enseignant modifié dans la liste
          setEnseignants(enseignants.map(ens => 
            ens.id === selectedEnseignant.id ? enseignantLocal : ens
          ));
          setShowModal(false);
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.detail || 'Impossible de modifier l\'enseignant'}`);
        }
      } catch (error) {
        console.error('Erreur lors de la modification:', error);
        alert('Erreur de connexion au serveur');
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

        {/* Modal pour création, modification et affichage */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  {modalType === 'create' && 'Ajouter un Enseignant'}
                  {modalType === 'edit' && 'Modifier l\'Enseignant'}
                  {modalType === 'view' && 'Détails de l\'Enseignant'}
                </h3>
              </div>
              
              <div className="p-6">
                {/* Formulaire de création */}
                {modalType === 'create' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Informations personnelles */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                          <User className="w-5 h-5 mr-2 text-blue-600" />
                          Informations personnelles
                        </h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prénom *
                          </label>
                          <input
                            type="text"
                            name="prenom"
                            value={formData.prenom}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Prénom de l'enseignant"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom *
                          </label>
                          <input
                            type="text"
                            name="nom"
                            value={formData.nom}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nom de famille"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Mail className="w-4 h-4 inline mr-1" />
                            Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="email@universite.ma"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Phone className="w-4 h-4 inline mr-1" />
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0612345678"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Adresse
                          </label>
                          <input
                            type="text"
                            name="adresse"
                            value={formData.adresse}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Adresse complète"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <CreditCard className="w-4 h-4 inline mr-1" />
                            CIN
                          </label>
                          <input
                            type="text"
                            name="cin"
                            value={formData.cin}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="EE123456"
                          />
                        </div>
                      </div>

                      {/* Informations professionnelles et sécurité */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                          <GraduationCap className="w-5 h-5 mr-2 text-green-600" />
                          Informations professionnelles
                        </h4>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Lock className="w-4 h-4 inline mr-1" />
                            Mot de passe *
                          </label>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Mot de passe temporaire"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            L'enseignant pourra changer ce mot de passe lors de sa première connexion
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Spécialité
                          </label>
                          <select
                            name="specialite"
                            value={formData.specialite}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Sélectionner une spécialité</option>
                            <option value="Informatique">Informatique</option>
                            <option value="Mathématiques">Mathématiques</option>
                            <option value="Physique">Physique</option>
                            <option value="Chimie">Chimie</option>
                            <option value="Biologie">Biologie</option>
                            <option value="Français">Français</option>
                            <option value="Histoire">Histoire</option>
                            <option value="Géographie">Géographie</option>
                            <option value="Anglais">Anglais</option>
                            <option value="Arabe">Arabe</option>
                            <option value="Économie">Économie</option>
                            <option value="Gestion">Gestion</option>
                            <option value="Droit">Droit</option>
                            <option value="Autre">Autre</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Award className="w-4 h-4 inline mr-1" />
                            Grade
                          </label>
                          <select
                            name="grade"
                            value={formData.grade}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Sélectionner un grade</option>
                            <option value="Professeur">Professeur</option>
                            <option value="Professeur Associé">Professeur Associé</option>
                            <option value="Professeur Assistant">Professeur Assistant</option>
                            <option value="Maître de Conférences">Maître de Conférences</option>
                            <option value="Chargé de Cours">Chargé de Cours</option>
                            <option value="Vacataire">Vacataire</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Building className="w-4 h-4 inline mr-1" />
                            Établissement
                          </label>
                          <input
                            type="text"
                            name="etablissement"
                            value={formData.etablissement}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nom de l'établissement"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Note d'information */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Information de sécurité</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Un compte utilisateur sera automatiquement créé avec le rôle "Enseignant"</li>
                            <li>L'enseignant recevra ses identifiants par email</li>
                            <li>Il devra changer son mot de passe lors de sa première connexion</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Affichage des détails */}
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

                {/* Formulaire de modification */}
                {modalType === 'edit' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Informations personnelles */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                          <User className="w-5 h-5 mr-2 text-blue-600" />
                          Informations personnelles
                        </h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prénom *
                          </label>
                          <input
                            type="text"
                            name="prenom"
                            value={formData.prenom}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Prénom de l'enseignant"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom *
                          </label>
                          <input
                            type="text"
                            name="nom"
                            value={formData.nom}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nom de famille"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Mail className="w-4 h-4 inline mr-1" />
                            Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="email@universite.ma"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Phone className="w-4 h-4 inline mr-1" />
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0612345678"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Adresse
                          </label>
                          <input
                            type="text"
                            name="adresse"
                            value={formData.adresse}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Adresse complète"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <CreditCard className="w-4 h-4 inline mr-1" />
                            CIN
                          </label>
                          <input
                            type="text"
                            name="cin"
                            value={formData.cin}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="EE123456"
                          />
                        </div>
                      </div>

                      {/* Informations professionnelles et sécurité */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                          <GraduationCap className="w-5 h-5 mr-2 text-green-600" />
                          Informations professionnelles
                        </h4>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Lock className="w-4 h-4 inline mr-1" />
                            Nouveau mot de passe (optionnel)
                          </label>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Laisser vide pour conserver l'ancien"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Laissez vide pour conserver le mot de passe actuel
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <GraduationCap className="w-4 h-4 inline mr-1" />
                            Spécialité
                          </label>
                          <select
                            name="specialite"
                            value={formData.specialite}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Sélectionner une spécialité</option>
                            <option value="Informatique">Informatique</option>
                            <option value="Mathématiques">Mathématiques</option>
                            <option value="Physique">Physique</option>
                            <option value="Chimie">Chimie</option>
                            <option value="Biologie">Biologie</option>
                            <option value="Français">Français</option>
                            <option value="Histoire">Histoire</option>
                            <option value="Géographie">Géographie</option>
                            <option value="Anglais">Anglais</option>
                            <option value="Arabe">Arabe</option>
                            <option value="Économie">Économie</option>
                            <option value="Gestion">Gestion</option>
                            <option value="Droit">Droit</option>
                            <option value="Autre">Autre</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Award className="w-4 h-4 inline mr-1" />
                            Grade
                          </label>
                          <select
                            name="grade"
                            value={formData.grade}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Sélectionner un grade</option>
                            <option value="Professeur">Professeur</option>
                            <option value="Professeur Associé">Professeur Associé</option>
                            <option value="Professeur Assistant">Professeur Assistant</option>
                            <option value="Maître de Conférences">Maître de Conférences</option>
                            <option value="Chargé de Cours">Chargé de Cours</option>
                            <option value="Vacataire">Vacataire</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Building className="w-4 h-4 inline mr-1" />
                            Établissement
                          </label>
                          <input
                            type="text"
                            name="etablissement"
                            value={formData.etablissement}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nom de l'établissement"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Note d'information pour la modification */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium">Modification de l'enseignant</p>
                          <p>Modifiez uniquement les champs nécessaires. Le mot de passe peut être laissé vide pour conserver l'ancien.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Fermer
                </button>
                {modalType !== 'view' && (
                  <button 
                    onClick={handleSaveEnseignant}
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isLoading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span>
                      {modalType === 'create' ? 'Créer l\'Enseignant' : 'Sauvegarder les modifications'}
                    </span>
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
