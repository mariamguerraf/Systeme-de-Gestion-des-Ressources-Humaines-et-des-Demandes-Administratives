import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, CheckCircle, XCircle, Clock, UploadCloud, Trash2, User } from "lucide-react";
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Demande as DemandeType, DemandeStatus, DemandeType as DemandeTypeEnum } from '../../types/api';

interface DemandeLocal {
  id: number;
  type: string;
  statut: "En attente" | "Validée" | "Rejetée";
  dateDemande: string;
}

const PageDemandesEnseignant = () => {
  const [demandes, setDemandes] = useState<DemandeType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [nouvelleDemande, setNouvelleDemande] = useState({
    type: "",
    dateDemande: "",
  });

  const navigate = useNavigate();
  const { user } = useAuth();

  // Charger les demandes depuis l'API
  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Essayer d'abord avec getMyDemandes (toutes les demandes filtrées côté serveur)
      const data = await apiService.getMyDemandes();

      setDemandes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Erreur lors du chargement des demandes:', err);

      // Si erreur 403, essayer avec getUserDemandes si on a l'ID utilisateur
      if (err.message.includes('403') || err.message.includes('Accès refusé')) {
        try {
          if (user?.id) {
            const userData = await apiService.getUserDemandes(user.id);
            setDemandes(Array.isArray(userData) ? userData : []);
            setError(null);
            return;
          }
        } catch (secondErr: any) {
          console.error('Erreur avec getUserDemandes:', secondErr);
        }
      }

      setError('Impossible de charger les demandes. Vérifiez vos droits d\'accès.');
      setDemandes([]);
    } finally {
      setLoading(false);
    }
  };

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

      // Reset le form
      setNouvelleDemande({ type: "", dateDemande: "" });
    }
  };

  const handleSupprimerDemande = async (demandeId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      try {
        await apiService.deleteDemande(demandeId);
        alert('Demande supprimée avec succès');
        // Recharger les demandes
        fetchDemandes();
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);
        alert(`Erreur: ${error.message || 'Impossible de supprimer la demande'}`);
      }
    }
  };

  // Fonction pour mapper le statut de l'API vers l'affichage
  const mapStatutToLocal = (statut: DemandeStatus | string): "En attente" | "Validée" | "Rejetée" => {
    switch (statut) {
      case DemandeStatus.EN_ATTENTE:
      case 'EN_ATTENTE':
        return "En attente";
      case DemandeStatus.APPROUVEE:
      case 'APPROUVEE':
        return "Validée";
      case DemandeStatus.REJETEE:
      case 'REJETEE':
        return "Rejetée";
      default:
        return "En attente";
    }
  };

  // Fonction pour mapper le type de demande pour l'affichage
  const mapTypeToDisplay = (type: DemandeTypeEnum | string): string => {
    switch (type) {
      case DemandeTypeEnum.ATTESTATION:
      case 'ATTESTATION':
        return "Attestation de Travail";
      case DemandeTypeEnum.ORDRE_MISSION:
      case 'ORDRE_MISSION':
        return "Ordre de Mission";
      case DemandeTypeEnum.CONGE:
      case 'CONGE':
        return "Congé";
      case DemandeTypeEnum.ABSENCE:
      case 'ABSENCE':
        return "Absence";
      case DemandeTypeEnum.HEURES_SUP:
      case 'HEURES_SUP':
        return "Autorisation d'Heures Supplémentaires";
      default:
        return type.toString();
    }
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
              <Link to="/enseignant/profil" className="px-6 py-3 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm hover:underline">Profil</Link>
              <Link to="/enseignant/demandes" className="px-6 py-3 bg-white bg-opacity-20 rounded-xl border-b-2 border-yellow-300 backdrop-blur-sm font-medium hover:underline">Demandes</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white bg-opacity-10 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Bienvenue, {user?.prenom} {user?.nom}</span>
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
      {/* Formulaire de nouvelle demande */}
      <main className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden p-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center space-x-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <span>Demandes en cours</span>
            </h2>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Message de chargement */}
          {loading && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-600">Chargement des demandes...</p>
            </div>
          )}

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
              {demandes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    {loading ? "Chargement des demandes..." : "Aucune demande trouvée"}
                  </td>
                </tr>
              ) : (
                demandes.map((demande) => {
                  const statutLocal = mapStatutToLocal(demande.statut);
                  const typeDisplay = mapTypeToDisplay(demande.type_demande);
                  const dateCreation = new Date(demande.created_at).toLocaleDateString('fr-FR');

                  return (
                    <tr key={demande.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2">{typeDisplay}</td>
                      <td className="px-4 py-2 flex items-center space-x-2">
                        {statutLocal === "Validée" ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                         statutLocal === "Rejetée" ? <XCircle className="w-5 h-5 text-red-600" /> :
                         <Clock className="w-5 h-5 text-yellow-600" />}
                        <span className={`font-medium ${
                          statutLocal === "Validée" ? "text-green-600" :
                          statutLocal === "Rejetée" ? "text-red-600" :
                          "text-yellow-600"
                        }`}>
                          {statutLocal}
                        </span>
                      </td>
                      <td className="px-4 py-2">{dateCreation}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => handleSupprimerDemande(demande.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                          title="Supprimer la demande"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default PageDemandesEnseignant;