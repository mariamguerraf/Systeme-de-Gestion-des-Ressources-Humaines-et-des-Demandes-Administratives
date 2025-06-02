import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, CheckCircle, XCircle, Clock, UploadCloud, Trash2 } from "lucide-react";

interface Demande {
  id: number;
  type: string;
  statut: "En attente" | "Validée" | "Rejetée";
  dateDemande: string;
}

const PageDemandesEnseignant = () => {
  const [demandes, setDemandes] = useState<Demande[]>([
    { id: 1, type: "Attestation de Travail", statut: "En attente", dateDemande: "2025-06-01" },
    { id: 2, type: "Ordre de Mission", statut: "Validée", dateDemande: "2025-05-29" },
    { id: 3, type: "Congé", statut: "Rejetée", dateDemande: "2025-05-25" },
    { id: 4, type: "Absence", statut: "En attente", dateDemande: "2025-05-20" },
    { id: 5, type: "Autorisation d'Heures Supplémentaires", statut: "Validée", dateDemande: "2025-05-18" }
  ]);

  const [nouvelleDemande, setNouvelleDemande] = useState({
    type: "",
    dateDemande: "",
  });

  const navigate = useNavigate();

  const handleNouvelleDemandeChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setNouvelleDemande((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  // Logique de déconnexion
  const handleLogout = () => {
    navigate('/');
  };

  const ajouterNouvelleDemande = () => {
    if (nouvelleDemande.type && nouvelleDemande.dateDemande) {
      switch (nouvelleDemande.type) {
        case "Attestation de Travail":
          navigate("/enseignant/attestation");
          return;
        case "Ordre de Mission":
          navigate("/enseignant/ordre-mission");
          return;
        case "Absence":
          navigate("/enseignant/absence");
          return;
        case "Autorisation d'Heures Supplémentaires":
          navigate("/enseignant/heures-sup");
          return;
        default:
          // Si aucun cas ne correspond, on ajoute la demande normalement
          break;
      }
      setDemandes((prev) => [
        ...prev,
        { id: prev.length + 1, type: nouvelleDemande.type, statut: "En attente", dateDemande: nouvelleDemande.dateDemande },
      ]);
      setNouvelleDemande({ type: "", dateDemande: "" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white px-6 py-6 shadow-xl">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Système de Gestion</h1>
          <div className="flex items-center space-x-4">
            <span>Bienvenue, Enseignant</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 bg-opacity-20 border border-red-300 border-opacity-30 rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>
        {/* Navigation */}
        <nav className="mt-6">
          <div className="flex space-x-1">
            <Link to="/enseignant/profil" className="px-6 py-3 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm hover:underline">
              Profil
            </Link>
            <Link to="/enseignant/demandes" className="px-6 py-3 bg-white bg-opacity-20 rounded-xl border-b-2 border-yellow-300 backdrop-blur-sm font-medium hover:underline">
              Demandes
            </Link>
          </div>
        </nav>
      </header>
      {/* Formulaire de nouvelle demande */}
      <main className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden p-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center space-x-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <span>Demandes en cours</span>
            </h2>
          </div>

          {/* Formulaire de demande */}
          <div className="mt-6 bg-gray-50 border border-gray-300 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Créer une nouvelle demande</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de demande *</label>
                <select
                  name="type"
                  value={nouvelleDemande.type}
                  onChange={handleNouvelleDemandeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Sélectionner un type</option>
                  <option value="Attestation de Travail">Attestation de Travail</option>
                  <option value="Ordre de Mission">Ordre de Mission</option>
                  <option value="Absence">Absence</option>
                  <option value="Autorisation d'Heures Supplémentaires">Autorisation d'Heures Supplémentaires</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de demande *</label>
                <input
                  type="date"
                  name="dateDemande"
                  value={nouvelleDemande.dateDemande}
                  onChange={handleNouvelleDemandeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <button
                onClick={ajouterNouvelleDemande}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-100 font-medium flex items-center space-x-2 shadow-lg transform hover:scale-105"
                style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
              >
                Ajouter la demande
              </button>
            </div>
          </div>

          {/* Liste des demandes */}
          <table className="w-full mt-6 border border-gray-300 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Statut</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((demande) => (
                <tr key={demande.id} className="border-b">
                  <td className="px-4 py-2">{demande.type}</td>
                  <td className="px-4 py-2">
                    {demande.statut === "Validée" ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                     demande.statut === "Rejetée" ? <XCircle className="w-5 h-5 text-red-600" /> :
                     <Clock className="w-5 h-5 text-orange-600" />}
                  </td>
                  <td className="px-4 py-2">{demande.dateDemande}</td>
                  <td className="px-4 py-2 text-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default PageDemandesEnseignant;