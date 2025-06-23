import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Calendar, Send, X, User, Upload, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/use-toast';
import { apiService } from '../../services/api';

const HeuresSup = () => {
  const [formData, setFormData] = useState({
    dateDebut: '',
    dateFin: '',
    heures: '',
    motif: '',
    description: '',
    observations: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Traitement des fichiers ici
      console.log('Fichiers sélectionnés:', files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const titre = `Demande d'heures supplémentaires - ${formData.heures}h`;
      const description = `${formData.description}\nNombre d'heures: ${formData.heures}h\nMotif: ${formData.motif}`;

      await apiService.createDemandeHeuresSup(titre, description, formData.dateDebut, formData.dateFin);

      toast({
        title: "Succès",
        description: "Votre demande d'heures supplémentaires a été soumise avec succès",
      });

      navigate('/enseignant/demandes');
    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la soumission de la demande",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/enseignant/demandes');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Système de Gestion</h1>
          <span>Demande d'Heures Supplémentaires</span>
        </div>
        <nav className="mt-4">
          <div className="flex space-x-6">
            <Link to="/enseignant/profil" className="hover:underline">Profil</Link>
            <Link to="/enseignant/demandes" className="border-b-2 border-white pb-1 hover:underline">Demandes</Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <span>Demande d'Heures Supplémentaires</span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début *
                    </label>
                    <input
                      type="date"
                      name="dateDebut"
                      value={formData.dateDebut}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin *
                    </label>
                    <input
                      type="date"
                      name="dateFin"
                      value={formData.dateFin}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre d'heures *
                    </label>
                    <input
                      type="number"
                      name="heures"
                      value={formData.heures}
                      onChange={handleInputChange}
                      required
                      min="1"
                      max="40"
                      placeholder="Ex: 5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motif *
                    </label>
                    <select
                      name="motif"
                      value={formData.motif}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner un motif</option>
                      <option value="Remplacement d'un collègue">Remplacement d'un collègue</option>
                      <option value="Cours de soutien">Cours de soutien</option>
                      <option value="Activités parascolaires">Activités parascolaires</option>
                      <option value="Formation">Formation</option>
                      <option value="Examens">Surveillance d'examens</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description détaillée
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Décrivez en détail les raisons de votre demande d'heures supplémentaires..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? 'Envoi...' : 'Soumettre la demande'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

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
				  Autorisation d'Heures Supplémentaires
				</h2>
				<p className="text-gray-600 mt-1">Demandez l'autorisation pour effectuer des heures supplémentaires</p>
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

				<div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200 shadow-sm">
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
					  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-600 rounded-lg flex items-center justify-center">
						<Calendar className="w-4 h-4 text-white" />
					  </div>
				  <h3 className="text-xl font-bold text-gray-800">Période Demandée</h3>
				</div>

				<div className="space-y-4">
				  <div className="grid grid-cols-2 gap-4">
					<div>
					  <label className="block text-sm font-semibold text-gray-700 mb-2">
						Date de début
					  </label>
					  <input
						type="date"
						name="dateDebut"
						value={formData.dateDebut}
						onChange={handleInputChange}
						className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
					  />
					</div>

					<div>
					  <label className="block text-sm font-semibold text-gray-700 mb-2">
						Date de fin
					  </label>
					  <input
						type="date"
						name="dateFin"
						value={formData.dateFin}
						onChange={handleInputChange}
						className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
					  />
					</div>
				  </div>

				  <div>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
					  Observations (optionnel)
					</label>
					<textarea
					  name="observations"
					  value={formData.observations}
					  onChange={handleInputChange}
					  rows={4}
					  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none shadow-sm"
					  placeholder="Observations ou informations complémentaires..."
					/>
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
				<h3 className="text-xl font-bold text-gray-800">Documents Justificatifs</h3>
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
				<p className="text-sm text-gray-500 mt-3">PDF, JPG, PNG jusqu'à 5MB</p>
			  </div>
			</div>

			{/* Note d'information colorée */}
			<div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
			  <div className="flex items-start space-x-4">
				<div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
				  <AlertCircle className="w-5 h-5 text-white" />
				</div>
				<div className="text-blue-800">
				  <h4 className="font-bold text-lg mb-2">Information importante</h4>
				  <p className="leading-relaxed">
					Les demandes d'heures supplémentaires doivent être soumises <span className="font-semibold text-blue-900">avant</span> l'exécution des heures.
					L'approbation est requise pour la validation de votre rémunération supplémentaire.
				  </p>
				</div>
			  </div>
			</div>

			{/* Boutons d'action stylisés */}
			<div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-8">
			  <button
				type="button"
				onClick={handleCancel}
				className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium flex items-center space-x-2 shadow-sm"
			  >
				<X className="w-4 h-4" />
				<span>Annuler</span>
			  </button>
			  <button
				type="button"
				onClick={handleSubmit}
				className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg transform hover:scale-105"
			  >
				<Send className="w-4 h-4" />
				<span>Soumettre la Demande</span>
			  </button>
			</div>
		  </div>
		</div>
	  </main>
	</div>
  );
};

export default HeuresSup;
