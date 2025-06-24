import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, User, AlertCircle, Send, X, Upload, FileText, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

const HeuresSup = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    dateDebut: '',
    dateFin: '',
    heures: '',
    motif: '',
    description: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    
    if (!formData.dateDebut || !formData.dateFin || !formData.heures || !formData.motif) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const titre = `Demande d'heures supplémentaires - ${formData.heures}h`;
      const description = `Période: ${formData.dateDebut} au ${formData.dateFin}\nNombre d'heures: ${formData.heures}h\nMotif: ${formData.motif}\nDescription: ${formData.description || 'Aucune description fournie'}`;

      // Créer la demande
      const demande = await apiService.createDemandeHeuresSup(titre, description);
      
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
      
      alert('Demande d\'heures supplémentaires soumise avec succès!');
      navigate('/enseignant/demandes');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
  <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white px-6 py-6 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Calendar className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Système de Gestion
            </h1>
            <nav className="ml-8 flex space-x-1">
              <Link to="/enseignant/profil" className="px-6 py-3 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm hover:underline">Profil</Link>
              <Link to="/enseignant/demandes" className="px-6 py-3 bg-white bg-opacity-20 rounded-xl border-b-2 border-yellow-300 backdrop-blur-sm font-medium hover:underline">Demandes</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white bg-opacity-10 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Bienvenue, Enseignant</span>
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
          {/* Header du formulaire */}
          <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Demande d'Heures Supplémentaires
                </h2>
                <p className="text-gray-600 mt-1">Remplissez le formulaire ci-dessous pour soumettre votre demande</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Informations du demandeur */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Informations du Demandeur</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-semibold text-gray-600">Nom complet:</span>
                      <span className="text-gray-800 font-medium">{user?.nom} {user?.prenom}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-semibold text-gray-600">Type:</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Enseignant</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-semibold text-gray-600">Email:</span>
                      <span className="text-gray-800 font-medium">{user?.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails de la demande */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Détails des Heures Supplémentaires</h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date de début *
                      </label>
                      <input
                        type="date"
                        name="dateDebut"
                        value={formData.dateDebut}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date de fin *
                      </label>
                      <input
                        type="date"
                        name="dateFin"
                        value={formData.dateFin}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre d'heures *
                    </label>
                    <input
                      type="number"
                      name="heures"
                      value={formData.heures}
                      onChange={handleInputChange}
                      min="1"
                      max="40"
                      placeholder="Ex: 5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Motif des heures supplémentaires *
                    </label>
                    <select
                      name="motif"
                      value={formData.motif}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      required
                    >
                      <option value="">Sélectionnez le motif</option>
                      <option value="Remplacement d'un collègue">Remplacement d'un collègue</option>
                      <option value="Cours de soutien">Cours de soutien</option>
                      <option value="Activités parascolaires">Activités parascolaires</option>
                      <option value="Formation">Formation</option>
                      <option value="Surveillance d'examens">Surveillance d'examens</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description détaillée (Optionnel)
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Décrivez en détail les raisons de votre demande..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none shadow-sm"
                    ></textarea>
                  </div>
                </div>
              </div>
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

            {/* Error display */}
            {error && (
              <div className="mt-6 bg-red-50 border border-red-300 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Note d'information colorée */}
            <div className="mt-8 bg-gradient-to-r from-purple-50 to-gray-50 border border-purple-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-blue-800">
                  <h4 className="font-bold text-lg mb-2">Information importante</h4>
                  <p className="leading-relaxed">
                    Les demandes d'heures supplémentaires doivent être soumises <span className="font-semibold text-blue-900">avant</span> l'exécution des heures.
                    L'approbation est requise pour la validation de votre rémunération supplémentaire. Délai de traitement: 3 à 5 jours ouvrables.
                  </p>
                </div>
              </div>
            </div>

            {/* Boutons d'action stylisés */}
            <div className="mt-10 flex justify-end space-x-4">
              <Link
                to="/enseignant/demandes"
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium flex items-center space-x-2 shadow-sm"
              >
                <X className="w-4 h-4" />
                <span>Annuler</span>
              </Link>
              <button
                onClick={handleSubmit}
                disabled={loading || isUploading}
                className={`px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg transform hover:scale-105 ${(loading || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Send className="w-4 h-4" />
                <span>
                  {loading ? 'Création en cours...' : 
                   isUploading ? 'Upload des documents...' : 
                   'Soumettre la Demande'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HeuresSup;
