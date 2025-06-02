// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Link } from 'react-router-dom';
// import { Calendar, User, AlertCircle, Clock, FileText } from 'lucide-react';

// const AbsencePage = () => {
//   const [formData, setFormData] = useState({
// 	dateDebut: '',
// 	dateFin: '',
// 	nombreJours: 0,
// 	motif: '',
//   });

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
// 	const { name, value } = e.target;
// 	setFormData(prev => ({
// 	  ...prev, // Conserve les autres champs du formulaire
// 	  [name]: value // Met à jour le champ spécifique du formulaire
// 	}));

// 	// Calcul automatique du nombre de jours
// 	if (name === 'dateDebut' || name === 'dateFin') {
// 	const debut = new Date(name === 'dateDebut' ? value : formData.dateDebut);
// 	const fin = new Date(name === 'dateFin' ? value : formData.dateFin);

// 	if (debut && fin && fin >= debut) {
// 		const diffTime = Math.abs(fin.getTime() - debut.getTime()); // Calcul de la différence en millisecondes
// 		// Convertir la différence en jours
// 		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; //math.ceil pour arrondir vers le haut et +1 pour inclure le jour de début
// 		setFormData(prev => ({
// 		  ...prev,
// 		  nombreJours: diffDays
// 		}));
// 	  }
// 	}
//   };

//   const handleSubmit = (e: React.FormEvent) => {
// 	e.preventDefault();
// 	console.log('Demande de congé soumise:', formData);
//   };
//   // Logique de déconnexion
//   const navigate = useNavigate();
// 	const handleLogout = () => {
// 	navigate('/');
//   };

//   return (
// 	<div className="min-h-screen bg-gray-50">
// 	  {/* Header */}
// 	  <header className="bg-blue-600 text-white px-6 py-4">
// 		<div className="flex justify-between items-center">
// 		  <h1 className="text-xl font-semibold">Système de Gestion</h1>
// 		  <div className="flex items-center space-x-4">
// 			<span>Bienvenue, Enseignant</span>
// 			<button
// 			  onClick={handleLogout}
// 			  className="px-3 py-1 bg-blue-800 rounded-md hover:bg-blue-900"
// 			>
// 			  Déconnexion
// 			</button>
// 		  </div>
// 		</div>

// 		{/* Navigation */}
// 		<nav className="mt-4">
// 		  <div className="flex space-x-6">
// 			<Link to="/enseignant/profil" className="hover:underline">Profil</Link>
// 			<Link to="/enseignant/demandes" className="border-b-2 border-white pb-1 hover:underline">Demandes</Link>
// 		  </div>
// 		</nav>
// 	  </header>

// 	  {/* Main Content */}
// 	  <main className="container mx-auto px-6 py-8">
// 		<div className="bg-white rounded-lg shadow-sm border">
// 		  <div className="px-6 py-4 border-b flex items-center space-x-3">
// 			<Calendar className="w-6 h-6 text-blue-600" />
// 			<h2 className="text-2xl font-semibold text-gray-800"> Demande une absence </h2>
// 		  </div>

// 		  <form onSubmit={handleSubmit} className="p-6">

// 			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// 			  {/* Informations du demandeur */}
// 			  <div className="space-y-4">
// 				<h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
// 				  <User className="w-5 h-5" />
// 				  <span>Informations du Demandeur</span>
// 				</h3>

// 				<div className="bg-gray-50 p-4 rounded-lg">
// 				  <div className="grid grid-cols-1 gap-3 text-sm">
// 					<div className="flex justify-between">
// 					  <span className="font-medium text-gray-600">Nom:</span>
// 					  <span className="text-gray-800">Martin Jean</span>
// 					</div>
// 					<div className="flex justify-between">
// 					  <span className="font-medium text-gray-600">Type:</span>
// 					  <span className="text-gray-800">Professeur</span>
// 					</div>
// 					<div className="flex justify-between">
// 					  <span className="font-medium text-gray-600">Département:</span>
// 					  <span className="text-gray-800">Informatique</span>
// 					</div>
// 				  </div>
// 				</div>
// 			  </div>
// 			</div>

// 			{/* Période de congé */}
// 			<div className="mt-6 space-y-4">
// 			  <h3 className="text-lg font-semibold text-gray-800">Période d'absence </h3>

// 			  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// 				<div>
// 				  <label className="block text-sm font-medium text-gray-700 mb-2">
// 					Date de début *
// 				  </label>
// 				  <input
// 					type="date"
// 					name="dateDebut"
// 					value={formData.dateDebut}
// 					onChange={handleInputChange}
// 					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 					required
// 				  />
// 				</div>

// 				<div>
// 				  <label className="block text-sm font-medium text-gray-700 mb-2">
// 					Date de fin *
// 				  </label>
// 				  <input
// 					type="date"
// 					name="dateFin"
// 					value={formData.dateFin}
// 					onChange={handleInputChange}
// 					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 					required
// 				  />
// 				</div>

// 				<div>
// 				  <label className="block text-sm font-medium text-gray-700 mb-2">
// 					Nombre de jours
// 				  </label>
// 				  <input
// 					type="number"
// 					name="nombreJours"
// 					value={formData.nombreJours}
// 					readOnly
// 					className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
// 				  />
// 				</div>
// 			  </div>
// 			</div>

// 			{/* Motif */}
// 			<div className="mt-6">
// 			  <label className="block text-sm font-medium text-gray-700 mb-2">
// 				Motif de la demande *
// 			  </label>
// 			  <textarea
// 				name="motif"
// 				value={formData.motif}
// 				onChange={handleInputChange}
// 				rows={4}
// 				className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 				placeholder="Veuillez préciser le motif de votre demande d'absence..."
// 				required
// 			  />
// 			</div>

// 			{/* Note d'information */}
// 			<div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
// 			  <div className="flex items-start space-x-3">
// 				<AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
// 				<div className="text-sm text-blue-800">
// 				  <p className="font-medium mb-1">Procédure de validation</p>
// 				  <ul className="list-disc pl-5 space-y-1">
// 					<li>Votre demande sera examinée par votre responsable direct</li>
// 					<li>Les absences doivent être demandées au moins 15 jours à l'avance</li>
// 					<li>Vous recevrez une notification par email concernant l'approbation</li>
// 				  </ul>
// 				</div>
// 			  </div>
// 			</div>

// 			{/* Boutons d'action */}
// 			<div className="mt-8 flex justify-end space-x-4">
// 			  <button
// 				type="button"
// 				className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
// 			  >
// 				Annuler
// 			  </button>
// 			  <button
// 				type="submit"
// 				className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
// 			  >
// 				Soumettre la Demande
// 			  </button>
// 			</div>
// 		  </form>
// 		</div>
// 	  </main>
// 	</div>
//   );
// };

// export default AbsencePage;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, AlertCircle, Clock, FileText, X, Send } from 'lucide-react';

const AbsencePage = () => {
  const [formData, setFormData] = useState({
	dateDebut: '',
	dateFin: '',
	nombreJours: 0,
	motif: '',
  });

  const handleInputChange = (e) => {
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

  const handleSubmit = (e) => {
	e.preventDefault();
	console.log('Demande de congé soumise:', formData);
  };

  const handleLogout = () => {
	console.log('Déconnexion');
  };

  return (
	<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
	  {/* Header avec dégradé moderne */}
	  <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white px-6 py-6 shadow-xl">
		<div className="flex justify-between items-center">
		  <div className="flex items-center space-x-3">
			<div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
			  <Calendar className="w-6 h-6" />
			</div>
			<h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
			  Système de Gestion
			</h1>
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

		{/* Navigation moderne */}
		<nav className="mt-6">
		  <div className="flex space-x-1">
			<button className="px-6 py-3 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm">
			 <Link to="/enseignant/profil" className="hover:underline"> Profil </Link>
			</button>
			<button className="px-6 py-3 bg-white bg-opacity-20 rounded-xl border-b-2 border-yellow-300 backdrop-blur-sm font-medium">
			  Demandes
			</button>
		  </div>
		</nav>
	  </header>

	  {/* Main Content */}
	  <main className="container mx-auto px-6 py-8">
		<div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
		  {/* Header du formulaire */}
		  <div className="px-8 py-6 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200">
			<div className="flex items-center space-x-4">
			  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
				<Calendar className="w-6 h-6 text-white" />
			  </div>
			  <div>
				<h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
				  Demande d'Absence
				</h2>
				<p className="text-gray-600 mt-1">Remplissez le formulaire pour soumettre votre demande d'absence</p>
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

			  {/* Période d'absence */}
			  <div className="space-y-6">
				<div className="flex items-center space-x-3 mb-6">
				  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
					<Clock className="w-4 h-4 text-white" />
				  </div>
				  <h3 className="text-xl font-bold text-gray-800">Période d'Absence</h3>
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
						className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 shadow-sm"
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
						className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 shadow-sm"
						required
					  />
					</div>
				  </div>

				  <div>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
					  Nombre de jours
					</label>
					<div className="relative">
					  <input
						type="number"
						name="nombreJours"
						value={formData.nombreJours}
						readOnly
						className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-orange-50 border border-gray-300 rounded-xl shadow-sm"
					  />
					  <div className="absolute right-3 top-3">
						<span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
						  Auto-calculé
						</span>
					  </div>
					</div>
				  </div>

				  <div>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
					  Motif de la demande *
					</label>
					<textarea
					  name="motif"
					  value={formData.motif}
					  onChange={handleInputChange}
					  rows={4}
					  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none shadow-sm"
					  placeholder="Veuillez préciser le motif de votre demande d'absence..."
					  required
					/>
				  </div>
				</div>
			  </div>
			</div>

			{/* Note d'information colorée */}
			<div className="mt-8 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6 shadow-sm">
			  <div className="flex items-start space-x-4">
				<div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
				  <AlertCircle className="w-5 h-5 text-white" />
				</div>
				<div className="text-orange-800">
				  <h4 className="font-bold text-lg mb-2">Procédure de validation</h4>
				  <ul className="space-y-2 leading-relaxed">
					<li className="flex items-start space-x-2">
					  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
					  <span>Votre demande sera examinée par votre responsable direct</span>
					</li>
					<li className="flex items-start space-x-2">
					  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
					  <span>Les absences doivent être demandées au moins <span className="font-semibold">15 jours à l'avance</span></span>
					</li>
					<li className="flex items-start space-x-2">
					  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
					  <span>Vous recevrez une notification par email concernant l'approbation</span>
					</li>
				  </ul>
				</div>
			  </div>
			</div>

			{/* Boutons d'action stylisés */}
			<div className="mt-10 flex justify-end space-x-4">
			  <button
				type="button"
				className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium flex items-center space-x-2 shadow-sm"
			  >
				<X className="w-4 h-4" />
				<span>
					<Link to="/enseignant/Demandes"> Annuler </Link>
				</span>
			  </button>
			  <button
				type="button"
				onClick={handleSubmit}
				className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg transform hover:scale-105"
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

export default AbsencePage;