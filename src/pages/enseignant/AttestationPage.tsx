import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Upload, Calendar, User, AlertCircle, Send, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

const AttestationPage = () => {
  const [formData, setFormData] = useState({
    typeAttestation: '',
    dateDebut: '',
    dateFin: '',
    observations: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.typeAttestation) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const titre = `Demande d'attestation - ${formData.typeAttestation}`;
      const description = `Type d'attestation: ${formData.typeAttestation}\nObservations: ${formData.observations || 'Aucune'}${formData.dateDebut ? `\nPériode: ${formData.dateDebut}${formData.dateFin ? ` au ${formData.dateFin}` : ''}` : ''}`;

      await apiService.createDemandeAttestation(titre, description);
      
      alert('Demande d\'attestation soumise avec succès!');
      navigate('/enseignant/demandes');
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setError('Erreur lors de la soumission de la demande');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header avec dégradé moderne */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white px-6 py-6 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FileText className="w-6 h-6" />
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
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Demande d'Attestation de Travail
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
                      <span className="text-gray-800 font-medium">Martin Jean</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-semibold text-gray-600">Type:</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Professeur</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-semibold text-gray-600">Département:</span>
                      <span className="text-gray-800 font-medium">Informatique</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails de la demande */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Détails de la Demande</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Type d'Attestation *
                    </label>
                    <select
                      name="typeAttestation"
                      value={formData.typeAttestation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      required
                    >
                      <option value="">Sélectionnez le type</option>
                      <option value="travail">Attestation de Travail</option>
                      <option value="salaire">Attestation de Salaire</option>
                      <option value="emploi">Attestation d'Emploi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Observations (Optionnel)
                    </label>
                    <textarea
                      name="observations"
                      value={formData.observations}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Informations complémentaires..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none shadow-sm"
                    ></textarea>
                  </div>
                </div>
              </div>
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
                    Votre demande sera traitée dans un délai de <span className="font-semibold text-blue-900">3 à 5 jours ouvrables</span>.
                    Vous recevrez une notification par email une fois l'attestation prête pour téléchargement.
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
                disabled={loading}
                className={`px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg transform hover:scale-105 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Envoi en cours...' : 'Soumettre la Demande'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttestationPage;