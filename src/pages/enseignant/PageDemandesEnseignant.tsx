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

  const ajouterNouvelleDemande = () => {
    if (nouvelleDemande.type && nouvelleDemande.dateDemande) {
      switch (nouvelleDemande.type) {
        case "Attestation de Travail":
          navigate("/enseignant/attestation");
          return;
        case "Ordre de Mission":
          navigate("/enseignant/ordre-mission");
          return;
        case "Congé":
          navigate("/enseignant/conge");
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
      {/* Formulaire de nouvelle demande */}
      <main className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
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
                  <option value="Congé">Congé</option>
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

            <button
              onClick={ajouterNouvelleDemande}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Ajouter la demande
            </button>
          </div>

          {/* Liste des demandes */}
          <table className="w-full mt-6 border border-gray-300 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Statut</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-center">Actions</th>
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
                    <UploadCloud className="w-5 h-5 text-blue-600" />
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