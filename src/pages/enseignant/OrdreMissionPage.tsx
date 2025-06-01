import React, { useState } from 'react';
import { MapPin, User, AlertCircle, Calendar, Upload, FileText } from 'lucide-react';

const OrdreMissionPage = () => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Demande d\'ordre de mission soumise:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Système de Gestion</h1>
          <div className="flex items-center space-x-4">
            <span>Bienvenue, Enseignant</span>
            <button className="bg-blue-700 px-3 py-1 rounded">Déconnexion</button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4">
          <div className="flex space-x-6">
            <a href="#" className="hover:underline">Profil</a>
            <a href="#" className="border-b-2 border-white pb-1">Demandes</a>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
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

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Nom:</span>
                      <span className="text-gray-800">Martin Jean</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Fonction:</span>
                      <span className="text-gray-800">Professeur</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Département:</span>
                      <span className="text-gray-800">Informatique</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Grade:</span>
                      <span className="text-gray-800">Professeur Agrégé</span>
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

            {/* Transport et frais */}
            <div className="mt-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Transport et Frais</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moyen de transport *
                  </label>
                  <select
                    name="moyenTransport"
                    value={formData.moyenTransport}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner le transport</option>
                    <option value="train">Train</option>
                    <option value="avion">Avion</option>
                    <option value="voiture_service">Voiture de service</option>
                    <option value="voiture_personnelle">Voiture personnelle</option>
                    <option value="transport_commun">Transport en commun</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frais prévus (€)
                  </label>
                  <input
                    type="number"
                    name="fraisPrevus"
                    value={formData.fraisPrevus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Estimation des frais"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Frais à rembourser */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Frais à rembourser
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="hebergement"
                      checked={formData.hebergement}
                      onChange={handleInputChange}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Hébergement</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="restauration"
                      checked={formData.restauration}
                      onChange={handleInputChange}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Restauration</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="transport"
                      checked={formData.transport}
                      onChange={handleInputChange}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Transport</span>
                  </label>
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
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Documents Justificatifs</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Invitation, programme, réservations...</p>
                <button
                  type="button"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Ajouter des fichiers
                </button>
                <p className="text-xs text-gray-500 mt-2">PDF, JPG, PNG jusqu'à 5MB</p>
              </div>
            </div>

            {/* Note d'information */}
            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium mb-1">Procédure de validation</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Les demandes doivent être soumises au moins 10 jours avant le départ</li>
                    <li>L'ordre de mission doit être approuvé avant tout déplacement</li>
                    <li>Conservez tous les justificatifs pour le remboursement des frais</li>
                    <li>Un rapport de mission pourra être demandé au retour</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Soumettre la Demande
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default OrdreMissionPage;