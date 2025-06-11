import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, CheckCircle, XCircle, Clock, UploadCloud, Trash2, User } from "lucide-react";
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

interface Demande {
  id: number;
  user_id: number;
  type_demande: string;
  titre: string;
  description?: string;
  date_debut?: string;
  date_fin?: string;
  statut: 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE';
  commentaire_admin?: string;
  created_at: string;
  user?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };
}

const PageDemandesEnseignant = () => {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [nouvelleDemande, setNouvelleDemande] = useState({
    type: "",
    titre: "",
    description: "",
    dateDemande: "",
  });

  // Load user's demandes on component mount
  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        setLoading(true);
        const data = await apiService.getDemandes();
        
        // Filter demandes for current user
        const userDemandes = Array.isArray(data) ? 
          data.filter((demande: any) => demande.user_id === user?.id) : [];
        
        setDemandes(userDemandes);
      } catch (error) {
        console.error('Erreur lors du chargement des demandes:', error);
        setError('Impossible de charger les demandes');
        setDemandes([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDemandes();
    }
  }, [user]);

  const handleNouvelleDemandeChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    setNouvelleDemande((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  // Logique de déconnexion
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const ajouterNouvelleDemande = async () => {
    if (!nouvelleDemande.type || !nouvelleDemande.titre) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      // Map frontend types to backend enum values
      const typeMapping: { [key: string]: string } = {
        "Attestation de Travail": "ATTESTATION",
        "Ordre de Mission": "ORDRE_MISSION", 
        "Absence": "ABSENCE",
        "Congé": "CONGE",
        "Autorisation d'Heures Supplémentaires": "HEURES_SUP"
      };

      const demandeData = {
        type_demande: typeMapping[nouvelleDemande.type] || nouvelleDemande.type,
        titre: nouvelleDemande.titre,
        description: nouvelleDemande.description,
        date_debut: nouvelleDemande.dateDemande || undefined,
        date_fin: undefined
      };

      const newDemande = await apiService.createDemande(demandeData);
      
      // Add the new demande to the list
      setDemandes(prev => [newDemande as Demande, ...prev]);
      setNouvelleDemande({ type: "", titre: "", description: "", dateDemande: "" });
      
      alert('Demande créée avec succès');

      // Navigate to specific pages for certain types
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
          break;
      }
    } catch (error) {
      console.error('Erreur lors de la création de la demande:', error);
      alert('Erreur lors de la création de la demande');
    }
  };

  const handleSupprimerDemande = (demandeId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      setDemandes(demandes.filter(demande => demande.id !== demandeId));
      alert('Demande supprimée avec succès');
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
            <span className="font-medium">Bienvenue, Enseignant</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre de la demande *</label>
                <input
                  type="text"
                  name="titre"
                  value={nouvelleDemande.titre}
                  onChange={handleNouvelleDemandeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Entrez le titre de votre demande"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de demande</label>
                <input
                  type="date"
                  name="dateDemande"
                  value={nouvelleDemande.dateDemande}
                  onChange={handleNouvelleDemandeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={nouvelleDemande.description}
                  onChange={handleNouvelleDemandeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Ajoutez une description (optionnel)"
                  rows={3}
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
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-lg text-gray-600">Chargement des demandes...</div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 mt-6">
              <div className="text-red-700">{error}</div>
            </div>
          ) : (
            <table className="w-full mt-6 border border-gray-300 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Titre</th>
                  <th className="px-4 py-2 text-left">Statut</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {demandes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Aucune demande trouvée. Créez votre première demande ci-dessus.
                    </td>
                  </tr>
                ) : (
                  demandes.map((demande) => (
                    <tr key={demande.id} className="border-b">
                      <td className="px-4 py-2">{demande.type_demande.replace('_', ' ')}</td>
                      <td className="px-4 py-2">{demande.titre}</td>
                      <td className="px-4 py-2">
                        {demande.statut === "APPROUVEE" ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                         demande.statut === "REJETEE" ? <XCircle className="w-5 h-5 text-red-600" /> :
                         <Clock className="w-5 h-5 text-orange-600" />}
                      </td>
                      <td className="px-4 py-2">{new Date(demande.created_at).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-2 text-center">
                        <button onClick={() => handleSupprimerDemande(demande.id)}>
                          <Trash2 className="w-5 h-5 text-red-600 hover:text-red-800 cursor-pointer transition-colors" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default PageDemandesEnseignant;