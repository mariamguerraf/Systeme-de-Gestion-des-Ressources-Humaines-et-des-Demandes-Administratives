import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, MapPin, ArrowLeftRight } from 'lucide-react';

const ProfilFonctionnaire = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();
  const handleLogout = () => {
    navigate('/');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
                className={`px-6 py-3 bg-white bg-opacity-20 rounded-xl border-b-2 border-yellow-300 backdrop-blur-sm font-medium hover:underline ${window.location.pathname.includes('/profil') ? 'underline' : ''}`}
              >Profil</button>
              <button
                onClick={() => navigate('/fonctionnaire/demandes')}
                className={`px-6 py-3 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm hover:underline font-medium ${window.location.pathname.includes('/demandes') ? 'underline' : ''}`}
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
            >Déconnexion</button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Mon Profil</h2>
          </div>
          <div className="p-8">
            <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-8 cursor-pointer hover:shadow-xl transition-shadow duration-300 overflow-hidden min-h-[500px]"
              onClick={() => setIsFlipped(!isFlipped)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setIsFlipped(!isFlipped)}
              aria-label="Cliquez pour voir les informations professionnelles"
            >
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800">Dupont Marie</h3>
                <p className="text-blue-600 font-semibold">Fonctionnaire administratif</p>
                <p className="text-gray-500">ID: 002</p>
              </div>
              <div className="relative h-96">
                <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${isFlipped ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'} ${isFlipped ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                  <div className="h-full">
                    <div className="max-w-2xl mx-auto">
                      <h4 className="text-lg font-semibold text-gray-800 mb-6 text-center">Informations de Contact</h4>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <Mail className="w-5 h-5 text-blue-500" />
                          <span className="text-gray-700 font-medium">marie.dupont@fonction.fr</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <Phone className="w-5 h-5 text-green-500" />
                          <span className="text-gray-700 font-medium">06 12 34 56 78</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <Calendar className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-700 font-medium">Entrée : 01/09/2015</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <MapPin className="w-5 h-5 text-red-500" />
                          <span className="text-gray-700 font-medium">Département : Administration</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${isFlipped ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'} ${isFlipped ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                  <div className="h-full">
                    <div className="max-w-2xl mx-auto">
                      <h4 className="text-lg font-semibold text-gray-800 mb-6 text-center">Informations Professionnelles</h4>
                      <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-blue-50 border-l-4 border-blue-500">
                          <label className="block text-sm font-semibold text-blue-600 mb-1">Statut</label>
                          <p className="text-gray-800 font-medium">Fonctionnaire</p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-50 border-l-4 border-green-500">
                          <label className="block text-sm font-semibold text-green-600 mb-1">Grade</label>
                          <p className="text-gray-800 font-medium">Attaché principal</p>
                        </div>
                        <div className="p-3 rounded-lg bg-purple-50 border-l-4 border-purple-500">
                          <label className="block text-sm font-semibold text-purple-600 mb-1">Fonction</label>
                          <p className="text-gray-800 font-medium">Fonctionnaire administratif</p>
                        </div>
                        <div className="p-3 rounded-lg bg-indigo-50 border-l-4 border-indigo-500">
                          <label className="block text-sm font-semibold text-indigo-600 mb-1">Date de recrutement</label>
                          <p className="text-gray-800 font-medium">01/09/2015</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 flex items-center space-x-2 text-xs text-gray-400 opacity-60 hover:opacity-80 transition-opacity">
                <ArrowLeftRight className="w-4 h-4" />
                <span>{isFlipped ? 'Contacts' : 'Infos pro'}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilFonctionnaire;
