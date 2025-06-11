import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User, AlertCircle, Clock, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

const CongePage = () => {
  const [formData, setFormData] = useState({
	typeConge: '',
	dateDebut: '',
	dateFin: '',
	nombreJours: 0,
	motif: '',
	remplacant: '',
	contactUrgence: ''
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

	// Calcul automatique du nombre de jours
	if (name === 'dateDebut' || name === 'dateFin') {
	  const debut = new Date(name === 'dateDebut' ? value : formData.dateDebut);
	  const fin = new Date(name === 'dateFin' ? value : formData.dateFin);

	  if (debut && fin && fin >= debut) {
		const diffTime = Math.abs(fin.getTime() - debut.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
		setFormData(prev => ({
		  ...prev,
		  nombreJours: diffDays
		}));
	  }
	}
  };

  const handleSubmit = async (e: React.FormEvent) => {
	e.preventDefault();
	
	if (!formData.typeConge || !formData.dateDebut || !formData.dateFin || !formData.motif) {
	  setError('Veuillez remplir tous les champs obligatoires');
	  return;
	}

	try {
	  setLoading(true);
	  setError(null);

	  const demandeData = {
		type_demande: 'CONGE',
		titre: `Demande de ${formData.typeConge}`,
		description: `Motif: ${formData.motif}\nNombre de jours: ${formData.nombreJours}\nRemplaçant: ${formData.remplacant || 'Non spécifié'}\nContact d'urgence: ${formData.contactUrgence || 'Non spécifié'}`,
		date_debut: formData.dateDebut,
		date_fin: formData.dateFin
	  };

	  await apiService.createDemande(demandeData);
	  
	  alert('Demande de congé soumise avec succès!');
	  navigate('/fonctionnaire/demandes');
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
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white px-6 py-6 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <User className="w-6 h-6" />
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
              <span className="font-medium">Bienvenue, Fonctionnaire</span>
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
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Demande de Congé</h2>
          </div>
          
          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-300 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div className="text-red-700">{error}</div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="p-6">
            {/* Solde de congés */}
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Solde de vos Congés</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
				<div className="text-center">
				  <p className="font-medium text-gray-600">Congés Annuels</p>
				  <p className="text-2xl font-bold text-green-600">25</p>
				  <p className="text-gray-500">jours restants</p>
				</div>
				<div className="text-center">
				  <p className="font-medium text-gray-600">RTT</p>
				  <p className="text-2xl font-bold text-blue-600">8</p>
				  <p className="text-gray-500">jours restants</p>
				</div>
				<div className="text-center">
				  <p className="font-medium text-gray-600">Maladie</p>
				  <p className="text-2xl font-bold text-orange-600">15</p>
				  <p className="text-gray-500">jours restants</p>
				</div>
				<div className="text-center">
				  <p className="font-medium text-gray-600">Formation</p>
				  <p className="text-2xl font-bold text-purple-600">10</p>
				  <p className="text-gray-500">jours restants</p>
				</div>
			  </div>
            </div>
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
					  <span className="font-medium text-gray-600">Type:</span>
					  <span className="text-gray-800">Professeur</span>
					</div>
					<div className="flex justify-between">
					  <span className="font-medium text-gray-600">Département:</span>
					  <span className="text-gray-800">Informatique</span>
					</div>
				  </div>
				</div>
			  </div>

			  {/* Type de congé */}
			  <div className="space-y-4">
				<h3 className="text-lg font-semibold text-gray-800">Type de Congé</h3>

				<div>
				  <label className="block text-sm font-medium text-gray-700 mb-2">
					Type de congé *
				  </label>
				  <select
					name="typeConge"
					value={formData.typeConge}
					onChange={handleInputChange}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					required
				  >
					<option value="">Sélectionner un type</option>
					<option value="annuel">Congé Annuel</option>
					<option value="rtt">RTT</option>
					<option value="maladie">Congé Maladie</option>
					<option value="maternite">Congé Maternité</option>
					<option value="paternite">Congé Paternité</option>
					<option value="formation">Congé Formation</option>
					<option value="exceptionnel">Congé Exceptionnel</option>
				  </select>
				</div>
			  </div>
			</div>
            {/* Période de congé */}
            <div className="mt-6 space-y-4">
			  <h3 className="text-lg font-semibold text-gray-800">Période de Congé</h3>

			  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
				  <label className="block text-sm font-medium text-gray-700 mb-2">
					Date de début *
				  </label>
				  <input
					type="date"
					name="dateDebut"
					value={formData.dateDebut}
					onChange={handleInputChange}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					required
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
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					required
				  />
				</div>

				<div>
				  <label className="block text-sm font-medium text-gray-700 mb-2">
					Nombre de jours
				  </label>
				  <input
					type="number"
					name="nombreJours"
					value={formData.nombreJours}
					readOnly
					className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
				  />
				</div>
			  </div>
			</div>
            {/* Motif */}
            <div className="mt-6">
			  <label className="block text-sm font-medium text-gray-700 mb-2">
				Motif de la demande *
			  </label>
			  <textarea
				name="motif"
				value={formData.motif}
				onChange={handleInputChange}
				rows={4}
				className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="Veuillez préciser le motif de votre demande de congé..."
				required
			  />
			</div>
            {/* Informations de remplacement */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
			  <div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
				  Remplaçant proposé
				</label>
				<input
				  type="text"
				  name="remplacant"
				  value={formData.remplacant}
				  onChange={handleInputChange}
				  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				  placeholder="Nom du remplaçant"
				/>
			  </div>

			  <div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
				  Contact d'urgence
				</label>
				<input
				  type="text"
				  name="contactUrgence"
				  value={formData.contactUrgence}
				  onChange={handleInputChange}
				  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				  placeholder="Téléphone ou email"
				/>
			  </div>
			</div>
            {/* Note d'information */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
			  <div className="flex items-start space-x-3">
				<AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
				<div className="text-sm text-blue-800">
				  <p className="font-medium mb-1">Procédure de validation</p>
				  <ul className="list-disc pl-5 space-y-1">
					<li>Votre demande sera examinée par votre responsable direct</li>
					<li>Les congés doivent être demandés au moins 15 jours à l'avance</li>
					<li>Vous recevrez une notification par email concernant l'approbation</li>
					<li>En cas d'urgence, contactez directement votre responsable</li>
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
                Soumettre la Demande
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CongePage;