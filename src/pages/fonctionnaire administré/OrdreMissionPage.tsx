import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, User, AlertCircle, Calendar, Upload, FileText, Trash2, Send, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

const OrdreMissionFonctionnaire = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  const [formData, setFormData] = useState({
    objetMission: '',
    destination: '',
    adresseDestination: '',
    dateDepart: '',
    dateRetour: '',
    heureDepart: '',
    heureRetour: '',
    moyenTransport: '',
    motif: '',
    fraisPrevus: '',
    hebergement: false,
    restauration: false,
    transport: false,
    observations: ''
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024); // 5MB max
      if (validFiles.length !== files.length) {
        setError('Certains fichiers sont trop volumineux (max 5MB)');
      }
      setSelectedFiles(prev => [...prev, ...validFiles]);
    };
    input.click();
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.objetMission || !formData.destination || !formData.dateDepart || !formData.dateRetour) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const fraisInfo = [];
      if (formData.hebergement) fraisInfo.push('Hébergement');
      if (formData.restauration) fraisInfo.push('Restauration');
      if (formData.transport) fraisInfo.push('Transport');

      const titre = `Ordre de mission - ${formData.objetMission}`;
      const description = `Objet: ${formData.objetMission}\nDestination: ${formData.destination}\nAdresse: ${formData.adresseDestination}\nMotif: ${formData.motif}\nMoyen de transport: ${formData.moyenTransport}\nFrais prévus: ${formData.fraisPrevus}\nFrais inclus: ${fraisInfo.join(', ') || 'Aucun'}\nObservations: ${formData.observations || 'Aucune'}`;

      // Créer la demande
      const demande = await apiService.createDemandeOrdreMission(titre, description, formData.dateDepart, formData.dateRetour);
      
      // Upload des documents si des fichiers sont sélectionnés
      if (selectedFiles.length > 0) {
        setIsUploading(true);
        try {
          await apiService.uploadDemandeDocuments((demande as any).id, selectedFiles);
        } catch (uploadError) {
          console.error('Erreur lors de l\'upload des documents:', uploadError);
          // Ne pas bloquer la création de la demande si l'upload échoue
          setError('Demande créée mais erreur lors de l\'upload des documents');
        }
        setIsUploading(false);
      }
      
      alert('Demande d\'ordre de mission soumise avec succès!');
      navigate('/fonctionnaire/demandes');
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setError('Erreur lors de la soumission de la demande');
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white px-6 py-6 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <MapPin className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Système de Gestion</h1>
            <nav className="ml-8 flex space-x-1">
              <button
                onClick={() => navigate('/fonctionnaire/profil')}
                className={`px-6 py-3 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm hover:underline font-medium ${window.location.pathname.includes('/profil') ? 'border-b-2 border-yellow-300 underline' : ''}`}
              >Profil</button>
              <button
                onClick={() => navigate('/fonctionnaire/demandes')}
                className={`px-6 py-3 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm hover:underline font-medium ${window.location.pathname.includes('/demandes') ? 'border-b-2 border-yellow-300 underline' : ''}`}
              >Demandes</button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white bg-opacity-10 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Bienvenue, {user?.prenom} {user?.nom}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 bg-opacity-20 border border-red-300 border-opacity-30 rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Demande d'Ordre de Mission</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations du demandeur */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Informations du Demandeur</span>
                </h3>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-semibold text-gray-600">Nom complet:</span>
                      <span className="text-gray-800 font-medium">{user?.nom} {user?.prenom}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-semibold text-gray-600">Type:</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Fonctionnaire</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-semibold text-gray-600">Email:</span>
                      <span className="text-gray-800 font-medium">{user?.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-semibold text-gray-600">Téléphone:</span>
                      <span className="text-gray-800 font-medium">{user?.telephone || 'Non renseigné'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Objet de la mission */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Objet de la Mission</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objet de la mission *
                  </label>
                  <select
                    name="objetMission"
                    value={formData.objetMission}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner l'objet</option>
                    <option value="formation">Formation professionnelle</option>
                    <option value="conference">Conférence/Séminaire</option>
                    <option value="reunion">Réunion de travail</option>
                    <option value="inspection">Mission d'inspection</option>
                    <option value="representation">Représentation institutionnelle</option>
                    <option value="recherche">Mission de recherche</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motif détaillé *
                  </label>
                  <textarea
                    name="motif"
                    value={formData.motif}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Décrivez le motif et les objectifs de la mission..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Destination et dates */}
            <div className="mt-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Destination et Planning</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville de destination *
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Paris, Lyon, Marseille..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse précise
                  </label>
                  <input
                    type="text"
                    name="adresseDestination"
                    value={formData.adresseDestination}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Adresse complète du lieu de mission"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date de départ *
                  </label>
                  <input
                    type="date"
                    name="dateDepart"
                    value={formData.dateDepart}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de départ
                  </label>
                  <input
                    type="time"
                    name="heureDepart"
                    value={formData.heureDepart}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date de retour *
                  </label>
                  <input
                    type="date"
                    name="dateRetour"
                    value={formData.dateRetour}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de retour
                  </label>
                  <input
                    type="time"
                    name="heureRetour"
                    value={formData.heureRetour}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Observations */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observations
              </label>
              <textarea
                name="observations"
                value={formData.observations}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Informations complémentaires sur la mission..."
              />
            </div>

            {/* Upload de documents */}
            <div className="mt-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Documents Justificatifs (Optionnel)</h3>
              </div>
              
              <div className="border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-purple-40 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 transition-all duration-200">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-700 font-medium mb-2">Glissez-déposez vos fichiers ici ou</p>
                <button
                  type="button"
                  onClick={handleFileSelect}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg transform hover:scale-105"
                >
                  Parcourir les fichiers
                </button>
                <p className="text-sm text-gray-500 mt-3">PDF, JPG, PNG, DOC, DOCX jusqu'à 5MB par fichier</p>
              </div>

              {/* Liste des fichiers sélectionnés */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold text-gray-700">Fichiers sélectionnés :</h4>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>



            {/* Note d'information colorée */}
            <div className="mt-8 bg-gradient-to-r from-purple-50 to-gray-50 border border-purple-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-purple-800">
                  <h4 className="font-bold text-lg mb-2">Procédure de validation</h4>
                  <ul className="space-y-2 leading-relaxed">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Les demandes doivent être soumises au moins 10 jours avant le départ</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>L'ordre de mission doit être approuvé avant tout déplacement </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                onClick={() => navigate('/fonctionnaire/demandes')}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">
                      <X className="w-5 h-5" />
                    </span>
                    <span>Chargement...</span>
                  </>
                ) : (
                  'Soumettre la Demande'
                )}
              </button>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                    type="button"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default OrdreMissionFonctionnaire;
