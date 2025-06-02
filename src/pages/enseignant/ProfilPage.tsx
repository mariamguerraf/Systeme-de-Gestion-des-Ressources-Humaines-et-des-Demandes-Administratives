import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Calendar, MapPin } from 'lucide-react';

const ProfilPage = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
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
			  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg transform hover:scale-105"
			>
			  Déconnexion
			</button>
		  </div>
		</div>
		{/* Navigation */}
		<nav className="mt-6">
		  <div className="flex space-x-1">
			<Link to="/enseignant/profil" className="px-6 py-3 bg-white bg-opacity-20 rounded-xl border-b-2 border-yellow-300 backdrop-blur-sm font-medium hover:underline">
			  Profil
			</Link>
			<Link to="/enseignant/demandes" className="px-6 py-3 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm hover:underline">
			  Demandes
			</Link>
		  </div>
		</nav>
	  </header>
	  {/* Main Content */}
	  <main className="container mx-auto px-6 py-8">
		<div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
		  <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
			<h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Mon Profil</h2>
		  </div>
		  <div className="p-8">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
			  {/* Photo et informations principales */}
			  <div className="space-y-6">
				<div className="flex items-center space-x-4">
				  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
					<User className="w-12 h-12 text-blue-600" />
				  </div>
				  <div>
					<h3 className="text-xl font-semibold text-gray-800">Martin Jean</h3>
					<p className="text-blue-600 font-medium">Professeur</p>
					<p className="text-gray-500">ID: 001</p>
				  </div>
				</div>
				{/* Informations de contact */}
				<div className="space-y-4">
				  <h4 className="text-lg font-semibold text-gray-800">Informations de Contact</h4>
				  <div className="flex items-center space-x-3">
					<Mail className="w-5 h-5 text-gray-400" />
					<span className="text-gray-700">jean.martin@edu.fr</span>
				  </div>
				  <div className="flex items-center space-x-3">
					<Phone className="w-5 h-5 text-gray-400" />
					<span className="text-gray-700">06 12 34 56 78</span>
				  </div>
				  <div className="flex items-center space-x-3">
					<Calendar className="w-5 h-5 text-gray-400" />
					<span className="text-gray-700">Inscrit le: 01/02/2024</span>
				  </div>
				  <div className="flex items-center space-x-3">
					<MapPin className="w-5 h-5 text-gray-400" />
					<span className="text-gray-700">Département: Informatique</span>
				  </div>
				</div>
			  </div>
			  {/* Informations professionnelles */}
			  <div className="space-y-6">
				<h4 className="text-lg font-semibold text-gray-800">Informations Professionnelles</h4>
				<div className="space-y-4">
				  <div>
					<label className="block text-sm font-medium text-gray-600 mb-1">Statut</label>
					<p className="text-gray-800">Fonctionnaire</p>
				  </div>
				  <div>
					<label className="block text-sm font-medium text-gray-600 mb-1">Grade</label>
					<p className="text-gray-800">Professeur Agrégé</p>
				  </div>
				  <div>
					<label className="block text-sm font-medium text-gray-600 mb-1">Spécialité</label>
					<p className="text-gray-800">Informatique et Sciences du Numérique</p>
				  </div>
				  <div>
					<label className="block text-sm font-medium text-gray-600 mb-1">Date de recrutement</label>
					<p className="text-gray-800">15/09/2020</p>
				  </div>
				</div>
			  </div>
			</div>
		  </div>
		</div>
	  </main>
	</div>
  );
};

export default ProfilPage;
