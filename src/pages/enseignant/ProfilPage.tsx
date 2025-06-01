import React from 'react';
import { Link } from 'react-router-dom'; // Ajoute cette ligne
// ...existing code...
import { User, Mail, Phone, Calendar, MapPin, FileText } from 'lucide-react';

const ProfilPage = () => {
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
            <Link to="/enseignant/profil" className="border-b-2 border-white pb-1 hover:underline">Profil</Link>
           <Link to="/enseignant/demandes" className="hover:underline" >	Demandes </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-2xl font-semibold text-gray-800">Mon Profil</h2>
          </div>

          <div className="p-6">
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

                {/* Actions rapides */}
                {/* <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                      <FileText className="w-4 h-4" />
                      <span>Attestation</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                      <Calendar className="w-4 h-4" />
                      <span>Congé</span>
                    </button>
                  </div> */}
                {/* </div> */}
              </div>
            </div>

            {/* Bouton de modification */}
            {/* <div className="mt-8 pt-6 border-t">
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors">
                Modifier le Profil
              </button>
            </div> */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilPage;