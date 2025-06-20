// Gestion des fonctionnaires administrés par le cadmin
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Plus, Edit3, Trash2, Eye, Search, Filter, FileText, Calendar, User, Lock, Phone, Mail, MapPin, CreditCard, Building, Briefcase, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { getApiBaseUrl } from '../../utils/config';
import { useDashboardRefresh } from '../../hooks/useDashboardRefresh';

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
  photo?: string;
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
  const { triggerRefresh } = useDashboardRefresh();

  // Fonction utilitaire pour construire l'URL de la photo
  const getPhotoUrl = (photoPath: string | null) => {
    if (!photoPath) return null;

    // Si le chemin commence déjà par http, le retourner tel quel
    if (photoPath.startsWith('http')) {
      return photoPath;
    }

    // Construire l'URL complète
    const baseUrl = getApiBaseUrl();

    // Si c'est juste un nom de fichier (comme "fonctionnaire_5_1750446462.jpg"),
    // ajouter le préfixe /uploads/
    let cleanPath = photoPath;
    if (!photoPath.startsWith('/')) {
      cleanPath = `/uploads/${photoPath}`;
    }

    console.log('🖼️ Construction URL photo:', { photoPath, baseUrl, cleanPath, finalUrl: `${baseUrl}${cleanPath}` });

    return `${baseUrl}${cleanPath}`;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Fonction pour gérer l'upload de photo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        alert('Format non supporté. Utilisez JPG, PNG, GIF ou WebP');
        return;
      }

      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier est trop volumineux (maximum 5MB)');
        return;
      }

      setSelectedFile(file);

      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fonction pour uploader la photo
  const uploadPhoto = async (fonctionnaireId: number): Promise<string | null> => {
    if (!selectedFile) return null;

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', selectedFile);

      // Utiliser le bon nom de clé pour le token
      const token = localStorage.getItem('access_token');
      console.log('🔄 Upload photo - Token:', token ? `${token.substring(0, 30)}...` : 'Absent');
      console.log('🔄 Upload photo - Fonctionnaire ID:', fonctionnaireId);
      console.log('🔄 Upload photo - Fichier:', selectedFile.name, selectedFile.type, selectedFile.size);

      if (!token) {
        throw new Error('Token d\'authentification manquant. Veuillez vous reconnecter.');
      }

      console.log('🔄 Upload photo - URL:', `${getApiBaseUrl()}/users/fonctionnaires/${fonctionnaireId}/upload-photo`);

      // Utiliser l'URL correcte de l'API
      const response = await fetch(`${getApiBaseUrl()}/users/fonctionnaires/${fonctionnaireId}/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      console.log('🔄 Upload photo - Réponse status:', response.status);
      console.log('🔄 Upload photo - Réponse headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔄 Upload photo - Erreur réponse:', errorText);

        // Messages d'erreur plus spécifiques
        if (response.status === 401) {
          throw new Error('Authentification expirée. Veuillez vous reconnecter.');
        } else if (response.status === 403) {
          throw new Error('Permissions insuffisantes pour uploader une photo.');
        } else if (response.status === 413) {
          throw new Error('Fichier trop volumineux (maximum 5MB).');
        } else if (response.status === 415) {
          throw new Error('Format de fichier non supporté. Utilisez JPG, PNG ou GIF.');
        } else if (response.status === 404) {
          throw new Error('Fonctionnaire non trouvé ou endpoint non disponible.');
        } else {
          throw new Error(`Erreur serveur (${response.status}): ${errorText}`);
        }
      }

      const result = await response.json();
      console.log('✅ Upload photo - Succès:', result);
      return result.photo_url;
    } catch (error) {
      console.error('❌ Erreur upload photo:', error);
      throw error; // Re-throw pour que l'appelant puisse gérer
    }
  };

  const resetPhotoState = () => {
    setSelectedFile(null);
    setPhotoPreview(null);
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
          adresse: item.user?.adresse || item.adresse || '',
          cin: item.user?.cin || item.cin || '',
          service: item.service || '',
          poste: item.poste || '',
          grade: item.grade || '',
          photo: item.photo || null,
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

  // États pour l'upload de photo
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

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
    // Réinitialiser l'état de photo
    resetPhotoState();
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
    // Réinitialiser l'état de photo (on affichera l'actuelle séparément)
    resetPhotoState();
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
        // Déclencher le rafraîchissement du dashboard
        triggerRefresh();
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);

        // Gestion spécifique des erreurs
        if (error.message) {
          if (error.message.includes('404') || error.message.includes('non trouvé')) {
            alert(`Fonctionnaire introuvable. Il a peut-être déjà été supprimé.`);
            // Retirer quand même de la liste locale pour éviter l'incohérence
            setFonctionnaires(fonctionnaires.filter(f => f.id !== id));
            // Déclencher le rafraîchissement du dashboard même en cas d'erreur 404
            triggerRefresh();
          } else {
            alert(`Erreur lors de la suppression: ${error.message}`);
          }
        } else {
          alert('Erreur lors de la suppression du fonctionnaire. Veuillez réessayer.');
        }
      }
    }
  };

  const handleSaveFonctionnaire = async () => {
    if (modalType === 'create') {
      setIsLoading(true);
      try {
        // Valider les champs requis
        if (!formData.nom || !formData.prenom || !formData.email || !formData.password) {
          alert('Veuillez remplir tous les champs obligatoires (Nom, Prénom, Email, Mot de passe)');
          return;
        }

        // Valider le CIN obligatoire
        if (!formData.cin || formData.cin.trim() === '') {
          alert('Le CIN est obligatoire. Veuillez saisir un numéro CIN valide.');
          return;
        }

        // Préparer les données à envoyer
        let dataToSend = { ...formData };

        const nouveauFonctionnaire = await apiService.createFonctionnaire(dataToSend) as any;

        if (!nouveauFonctionnaire || !nouveauFonctionnaire.id) {
          throw new Error('Erreur lors de la création du fonctionnaire');
        }

        alert('Fonctionnaire créé avec succès !');

        // Upload de la photo si sélectionnée
        if (selectedFile && nouveauFonctionnaire.id) {
          try {
            const photoUrl = await uploadPhoto(nouveauFonctionnaire.id);
            if (photoUrl) {
              nouveauFonctionnaire.photo = photoUrl;
              alert('Fonctionnaire et photo créés avec succès !');
            } else {
              alert('Fonctionnaire créé avec succès !');
            }
          } catch (photoError) {
            console.warn('Erreur upload photo:', photoError);
            // Proposer de réessayer l'upload
            const retry = confirm('Fonctionnaire créé, mais erreur lors de l\'upload de la photo. Voulez-vous réessayer l\'upload maintenant ?');
            if (retry) {
              try {
                const photoUrl = await uploadPhoto(nouveauFonctionnaire.id);
                if (photoUrl) {
                  nouveauFonctionnaire.photo = photoUrl;
                  alert('Photo uploadée avec succès !');
                }
              } catch (retryError) {
                console.error('Erreur lors du retry:', retryError);
                alert('Échec de l\'upload. Vous pourrez ajouter la photo plus tard depuis la liste des fonctionnaires.');
              }
            }
          }
        } else {
          alert('Fonctionnaire créé avec succès !');
        }

        // Ajouter le nouveau fonctionnaire à la liste (mapping vers l'interface locale)
        const fonctionnaireLocal: Fonctionnaire = {
          id: nouveauFonctionnaire.id,
          user_id: nouveauFonctionnaire.user_id,
          nom: nouveauFonctionnaire.user.nom,
          prenom: nouveauFonctionnaire.user.prenom,
          email: nouveauFonctionnaire.user.email,
          telephone: nouveauFonctionnaire.user.telephone || '',
          adresse: nouveauFonctionnaire.user.adresse || '',
          cin: nouveauFonctionnaire.user.cin || '',
          service: nouveauFonctionnaire.service || '',
          poste: nouveauFonctionnaire.poste || '',
          grade: nouveauFonctionnaire.grade || '',
          photo: nouveauFonctionnaire.photo || null,
          statut: 'Actif',
          user: nouveauFonctionnaire.user
        };

        setFonctionnaires([...fonctionnaires, fonctionnaireLocal]);
        setShowModal(false);

        // Déclencher le rafraîchissement du dashboard
        triggerRefresh();

        // Réinitialiser l'état de photo
        resetPhotoState();

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
      } catch (error: any) {
        console.error('Erreur lors de la création:', error);

        // Gestion spécifique des erreurs courantes
        if (error.message) {
          if (error.message.includes('email') && error.message.includes('existe déjà')) {
            alert(`L'adresse email "${formData.email}" est déjà utilisée par un autre utilisateur. Veuillez utiliser une autre adresse email.`);
          } else if (error.message.includes('CIN') && error.message.includes('existe déjà')) {
            alert(`Le CIN "${formData.cin}" est déjà utilisé par un autre utilisateur. Veuillez saisir un CIN différent.`);
          } else if (error.message.includes('CIN') && error.message.includes('obligatoire')) {
            alert('Le CIN est obligatoire et ne peut pas être vide. Veuillez saisir un numéro CIN valide.');
          } else {
            alert(`Erreur lors de la création: ${error.message}`);
          }
        } else {
          alert('Erreur lors de la création du fonctionnaire. Veuillez réessayer.');
        }
      } finally {
        setIsLoading(false);
      }
    } else if (modalType === 'edit' && selectedFonctionnaire) {
      setIsLoading(true);
      try {
        // Valider les champs requis (mot de passe optionnel en modification)
        if (!formData.nom || !formData.prenom || !formData.email || !formData.cin) {
          alert('Veuillez remplir tous les champs obligatoires (Nom, Prénom, Email, CIN)');
          return;
        }

        // Si le mot de passe est vide, on utilise 'unchanged'
        const dataToSend = {
          ...formData,
          password: formData.password || 'unchanged'
        };

        const fonctionnaireModifie = await apiService.updateFonctionnaire(selectedFonctionnaire.id, dataToSend) as any;

        // Upload de la photo si sélectionnée
        if (selectedFile && selectedFonctionnaire.id) {
          try {
            const photoUrl = await uploadPhoto(selectedFonctionnaire.id);
            if (photoUrl) {
              fonctionnaireModifie.photo = photoUrl;
              alert('Fonctionnaire et photo modifiés avec succès !');
            } else {
              alert('Fonctionnaire modifié avec succès !');
            }
          } catch (photoError) {
            console.warn('Erreur upload photo:', photoError);
            alert('Fonctionnaire modifié avec succès, mais erreur lors de l\'upload de la photo.');
          }
        } else {
          alert('Fonctionnaire modifié avec succès !');
        }

        // Mettre à jour le fonctionnaire dans la liste locale
        const fonctionnaireLocal: Fonctionnaire = {
          id: fonctionnaireModifie.id,
          user_id: fonctionnaireModifie.user_id,
          nom: fonctionnaireModifie.user.nom,
          prenom: fonctionnaireModifie.user.prenom,
          email: fonctionnaireModifie.user.email,
          telephone: fonctionnaireModifie.user.telephone || '',
          adresse: fonctionnaireModifie.user.adresse || '',
          cin: fonctionnaireModifie.user.cin || '',
          service: fonctionnaireModifie.service || '',
          poste: fonctionnaireModifie.poste || '',
          grade: fonctionnaireModifie.grade || '',
          photo: fonctionnaireModifie.photo || null,
          statut: 'Actif',
          user: fonctionnaireModifie.user
        };

        // Remplacer le fonctionnaire modifié dans la liste
        setFonctionnaires(fonctionnaires.map(func =>
          func.id === selectedFonctionnaire.id ? fonctionnaireLocal : func
        ));
        setShowModal(false);

        // Déclencher le rafraîchissement du dashboard
        triggerRefresh();

        // Réinitialiser l'état de photo
        resetPhotoState();
      } catch (error: any) {
        console.error('Erreur lors de la modification:', error);

        // Gestion spécifique des erreurs courantes
        if (error.message) {
          if (error.message.includes('404') || error.message.includes('non trouvé')) {
            alert(`Fonctionnaire introuvable. Il a peut-être été supprimé par un autre utilisateur.`);
          } else if (error.message.includes('email') && error.message.includes('existe déjà')) {
            alert(`L'adresse email "${formData.email}" est déjà utilisée par un autre utilisateur. Veuillez utiliser une autre adresse email.`);
          } else if (error.message.includes('CIN') && error.message.includes('existe déjà')) {
            alert(`Le CIN "${formData.cin}" est déjà utilisé par un autre utilisateur. Veuillez saisir un CIN différent.`);
          } else if (error.message.includes('CIN') && error.message.includes('obligatoire')) {
            alert('Le CIN est obligatoire et ne peut pas être vide. Veuillez saisir un numéro CIN valide.');
          } else {
            alert(`Erreur lors de la modification: ${error.message}`);
          }
        } else {
          alert('Erreur lors de la modification du fonctionnaire. Veuillez réessayer.');
        }
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
                        {fonctionnaire.photo ? (
                          <img
                            src={getPhotoUrl(fonctionnaire.photo)}
                            alt={`${fonctionnaire.prenom} ${fonctionnaire.nom}`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                            onError={(e) => {
                              console.error('Erreur chargement image:', fonctionnaire.photo);
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center ${fonctionnaire.photo ? 'hidden' : ''}`}>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">CIN</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{selectedFonctionnaire.cin || 'N/A'}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                        <div className="p-3 bg-gray-50 rounded-lg">{selectedFonctionnaire.adresse || 'N/A'}</div>
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

                    {/* Photo du fonctionnaire */}
                    <div className="border-t pt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-4">Photo de profil</label>
                      <div className="flex items-center space-x-6">
                        {selectedFonctionnaire.photo ? (
                          <img
                            src={getPhotoUrl(selectedFonctionnaire.photo)}
                            alt={`Photo de ${selectedFonctionnaire.prenom} ${selectedFonctionnaire.nom}`}
                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                            onError={(e) => {
                              console.error('Erreur chargement image dans modal:', selectedFonctionnaire.photo);
                            }}
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">
                              {selectedFonctionnaire.prenom[0]}{selectedFonctionnaire.nom[0]}
                            </span>
                          </div>
                        )}
                        <div className="text-sm text-gray-600">
                          {selectedFonctionnaire.photo ? (
                            <div>
                              <p className="font-medium text-green-600">✓ Photo disponible</p>
                              <p>Vous pouvez modifier la photo via le mode édition</p>
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium text-gray-500">Aucune photo</p>
                              <p>Vous pouvez ajouter une photo via le mode édition</p>
                            </div>
                          )}
                        </div>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">CIN *</label>
                        <input
                          type="text"
                          name="cin"
                          value={formData.cin}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Numéro CIN (obligatoire)"
                          required
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

                    {/* Section Upload Photo */}
                    {(modalType === 'create' || modalType === 'edit') && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">📸 Photo du Fonctionnaire</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Sélectionner une photo (optionnel)
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                              Formats acceptés: JPG, PNG, GIF, WebP. Taille max: 5MB
                            </p>
                          </div>

                          {selectedFile && (
                            <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                              {photoPreview && (
                                <img
                                  src={photoPreview}
                                  alt="Aperçu"
                                  className="w-16 h-16 rounded-lg object-cover border-2 border-blue-200"
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900">
                                  Fichier sélectionné: {selectedFile.name}
                                </p>
                                <p className="text-sm text-blue-700">
                                  Taille: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={resetPhotoState}
                                className="px-3 py-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              >
                                Annuler
                              </button>
                            </div>
                          )}

                          {isUploading && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                          )}

                          {modalType === 'edit' && selectedFonctionnaire?.photo && (
                            <div className="p-3 bg-green-50 rounded-lg">
                              <p className="text-sm font-medium text-green-900">
                                📁 Photo actuelle: {selectedFonctionnaire.photo}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
