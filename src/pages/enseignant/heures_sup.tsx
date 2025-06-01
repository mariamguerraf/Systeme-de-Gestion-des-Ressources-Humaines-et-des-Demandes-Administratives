import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FileText, Upload, Calendar, User, AlertCircle } from 'lucide-react';

const Heures_sup = () => {
  const [formData, setFormData] = useState({
	typeAttestation: '',
	motif: '',
	dateDebut: '',
	dateFin: '',
	observations: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
	const { name, value } = e.target;
	setFormData(prev => ({
	  ...prev,
	  [name]: value
	}));
  };

  const handleSubmit = (e: React.FormEvent) => {
	e.preventDefault();
	console.log('Demande d\'attestation soumise:', formData);
  };

  // Logique de déconnexion
  const navigate = useNavigate();
  const handleLogout = () => {
	navigate('/');
  };

  return (
	<div className="min-h-screen bg-gray-50">
	  {/* Header */}
	  <header className="bg-blue-600 text-white px-6 py-4">
		<div className="flex justify-between items-center">
		  <h1 className="text-xl font-semibold">Système de Gestion</h1>
		  <div className="flex items-center space-x-4">
			<span>Bienvenue, Enseignant</span>
			<button
			  onClick={handleLogout}
			  className="px-3 py-1 bg-blue-800 rounded-md hover:bg-blue-900"
			>
			  Déconnexion
			</button>
		  </div>
		</div>

		{/* Navigation */}
		<nav className="mt-4">
		  <div className="flex space-x-6">
			<Link to="/enseignant/profil" className="hover:underline">Profil</Link>
			<Link to="/enseignant/demandes" className="border-b-2 border-white pb-1 hover:underline">Demandes</Link>
		  </div>
		</nav>
	  </header>

	  {/* Main Content */}
	  <main className="container mx-auto px-6 py-8">
		<div className="bg-white rounded-lg shadow-sm border">
		  <div className="px-6 py-4 border-b flex items-center space-x-3">
			<FileText className="w-6 h-6 text-blue-600" />
			<h2 className="text-2xl font-semibold text-gray-800">demander une autorisation d'heures supplémentaires</h2>
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
				  <div className="grid grid-cols-2 gap-4 text-sm">
					<div>
					  <span className="font-medium text-gray-600">Nom:</span>
					  <p className="text-gray-800">Martin Jean</p>
					</div>
					<div>
					  <span className="font-medium text-gray-600">Type:</span>
					  <p className="text-gray-800">Professeur</p>
					</div>
					<div>
					  <span className="font-medium text-gray-600">Email:</span>
					  <p className="text-gray-800">jean.martin@edu.fr</p>
					</div>
					<div>
					  <span className="font-medium text-gray-600">Téléphone:</span>
					  <p className="text-gray-800">06 12 34 56 78</p>
					</div>
				  </div>
				</div>
			  </div>
			</div>

			{/* Motif et période */}
			<div className="mt-6 space-y-6">
			  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
				  <label className="block text-sm font-medium text-gray-700 mb-2">
					<Calendar className="w-4 h-4 inline mr-1" />
					Période - Date de début
				  </label>
				  <input
					type="date"
					name="dateDebut"
					value={formData.dateDebut}
					onChange={handleInputChange}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				  />
				</div>
				<div>
				  <label className="block text-sm font-medium text-gray-700 mb-2">
					<Calendar className="w-4 h-4 inline mr-1" />
					Période - Date de fin
				  </label>
				  <input
					type="date"
					name="dateFin"
					value={formData.dateFin}
					onChange={handleInputChange}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				  />
				</div>
			  </div>

			  <div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
				  Observations (optionnel)
				</label>
				<textarea
				  name="observations"
				  value={formData.observations}
				  onChange={handleInputChange}
				  rows={3}
				  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				  placeholder="Observations ou informations complémentaires..."
				/>
			  </div>
			</div>

			{/* Upload de documents */}
			<div className="mt-6">
			  <h3 className="text-lg font-semibold text-gray-800 mb-4">Documents Justificatifs</h3>
			  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
				<Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
				<p className="text-gray-600 mb-2">Glissez-déposez vos fichiers ici ou</p>
				<button
				  type="button"
				  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
				>
				  Parcourir les fichiers
				</button>
				<p className="text-xs text-gray-500 mt-2">PDF, JPG, PNG jusqu'à 5MB</p>
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

export default Heures_sup;