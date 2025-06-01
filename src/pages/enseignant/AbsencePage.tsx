import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, AlertCircle, Clock, FileText } from 'lucide-react';

const AbsencePage = () => {
  const [formData, setFormData] = useState({
	typeConge: '',
	dateDebut: '',
	dateFin: '',
	nombreJours: 0,
	motif: '',
	remplacant: '',
	contactUrgence: ''
  });

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

  const handleSubmit = (e: React.FormEvent) => {
	e.preventDefault();
	console.log('Demande de congé soumise:', formData);
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
			<Link to="/enseignant/profil" className="hover:underline">Profil</Link>
			<Link to="/enseignant/demandes" className="border-b-2 border-white pb-1 hover:underline">Demandes</Link>
		  </div>
		</nav>
	  </header>

	  {/* Main Content */}
	  <main className="container mx-auto px-6 py-8">
		<div className="bg-white rounded-lg shadow-sm border">
		  <div className="px-6 py-4 border-b flex items-center space-x-3">
			<Calendar className="w-6 h-6 text-blue-600" />
			<h2 className="text-2xl font-semibold text-gray-800"> Demande une absence </h2>
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
			</div>

			{/* Période de congé */}
			<div className="mt-6 space-y-4">
			  <h3 className="text-lg font-semibold text-gray-800">Période d'absence </h3>

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
				placeholder="Veuillez préciser le motif de votre demande d'absence..."
				required
			  />
			</div>

			{/* Note d'information */}
			<div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
			  <div className="flex items-start space-x-3">
				<AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
				<div className="text-sm text-blue-800">
				  <p className="font-medium mb-1">Procédure de validation</p>
				  <ul className="list-disc pl-5 space-y-1">
					<li>Votre demande sera examinée par votre responsable direct</li>
					<li>Les absences doivent être demandées au moins 15 jours à l'avance</li>
					<li>Vous recevrez une notification par email concernant l'approbation</li>
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

export default AbsencePage;