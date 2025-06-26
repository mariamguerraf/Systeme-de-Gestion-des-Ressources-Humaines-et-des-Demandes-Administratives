// src/pages/secretaire/DemandeDetail.tsx
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, FileText, Download, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

interface DemandeDetailProps {
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
  updated_at?: string;
  documents?: string[];
  user?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    role: string;
  };
}

const DemandeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [demande, setDemande] = useState<DemandeDetailProps | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchDemande = async () => {
      if (!id) {
        setError('ID de demande manquant');
        setLoading(false);
        return;
      }      try {
        setLoading(true);
        setError(null);
        console.log(`🔄 [DEBUG] Chargement de la demande ${id}`);
        
        let data;
        try {
          // Essayer d'abord l'endpoint principal
          data = await apiService.getDemande(parseInt(id)) as any;
        } catch (error) {
          console.log('📋 [DEBUG] Endpoint principal échoué, utilisation de l\'endpoint de test');
          // En cas d'échec, utiliser l'endpoint de test
          data = await apiService.getTestDemande(parseInt(id)) as any;
        }
        
        console.log('📋 [DEBUG] Détails de la demande reçus:', data);
        
        if (data) {
          setDemande({
            id: data.id || parseInt(id),
            user_id: data.user_id || 0,
            type_demande: data.type_demande || 'ATTESTATION',
            titre: data.titre || 'Sans titre',
            description: data.description || '',
            date_debut: data.date_debut || null,
            date_fin: data.date_fin || null,
            statut: data.statut || 'EN_ATTENTE',
            commentaire_admin: data.commentaire_admin || '',
            created_at: data.created_at || new Date().toISOString(),
            updated_at: data.updated_at || null,
            documents: data.documents || [],
            user: data.user ? {
              id: data.user.id || 0,
              nom: data.user.nom || 'Inconnu',
              prenom: data.user.prenom || 'Inconnu',
              email: data.user.email || '',
              telephone: data.user.telephone || '',
              role: data.user.role || 'user'
            } : {
              id: 0,
              nom: 'Utilisateur',
              prenom: 'Inconnu',
              email: '',
              telephone: '',
              role: 'user'
            }
          });        } else {
          setError('Demande non trouvée');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la demande:', error);
        if (error instanceof Error && error.message.includes('404')) {
          setError(`La demande #${id} n'existe pas. Elle a peut-être été supprimée.`);
        } else {
          setError('Impossible de charger les détails de la demande');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDemande();
  }, [id]);

  const handleApprouver = async () => {
    if (!demande) return;
    
    try {
      setActionLoading('approve');
      console.log(`🔄 [DEBUG] Approbation de la demande ${demande.id}`);
      
      await apiService.approuverDemande(demande.id, 'Demande approuvée par le secrétaire');
      
      setDemande(prev => prev ? {
        ...prev,
        statut: 'APPROUVEE',
        commentaire_admin: 'Demande approuvée par le secrétaire',
        updated_at: new Date().toISOString()
      } : null);
      
      setNotification({type: 'success', message: 'Demande approuvée avec succès!'});
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      setNotification({type: 'error', message: 'Erreur lors de l\'approbation de la demande'});
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejeter = async () => {
    if (!demande) return;
    
    try {
      setActionLoading('reject');
      console.log(`🔄 [DEBUG] Rejet de la demande ${demande.id}`);
      
      await apiService.rejeterDemande(demande.id, 'Demande rejetée par le secrétaire');
      
      setDemande(prev => prev ? {
        ...prev,
        statut: 'REJETEE',
        commentaire_admin: 'Demande rejetée par le secrétaire',
        updated_at: new Date().toISOString()
      } : null);
      
      setNotification({type: 'success', message: 'Demande rejetée avec succès!'});
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      setNotification({type: 'error', message: 'Erreur lors du rejet de la demande'});
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadDocument = (filename: string) => {
    const baseUrl = 'http://localhost:8000';
    const downloadUrl = `${baseUrl}/uploads/${filename}`;
    
    // Ouvrir le document dans un nouvel onglet
    window.open(downloadUrl, '_blank');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-2xl text-gray-600">Chargement des détails...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-2xl text-red-600 mb-4">❌ Erreur</div>
          <div className="text-lg text-gray-600 mb-4">{error}</div>
          <button 
            onClick={() => navigate('/secretaire/demandes')} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour aux demandes
          </button>
        </div>
      </div>
    );
  }

  if (!demande) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-2xl text-gray-600 mb-4">Demande non trouvée</div>
          <button 
            onClick={() => navigate('/secretaire/demandes')} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour aux demandes
          </button>
        </div>
      </div>
    );
  }

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'APPROUVEE':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'REJETEE':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Clock className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getStatutStyle = (statut: string) => {
    switch (statut) {
      case 'APPROUVEE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJETEE':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'CONGE':
        return 'bg-purple-100 text-purple-800';
      case 'ABSENCE':
        return 'bg-blue-100 text-blue-800';
      case 'ATTESTATION':
        return 'bg-green-100 text-green-800';
      case 'ORDRE_MISSION':
        return 'bg-yellow-100 text-yellow-800';
      case 'HEURES_SUP':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
          <button className="ml-4 text-white font-bold" onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Système de Gestion</h1>
            <div className="ml-10 hidden md:flex space-x-4">
              <Link to="/secretaire/dashboard" className="px-4 py-2 rounded-xl bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm font-medium">Dashboard</Link>
              <Link to="/secretaire/users" className="px-4 py-2 rounded-xl bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 backdrop-blur-sm font-medium">Utilisateurs</Link>
              <Link to="/secretaire/demandes" className="px-4 py-2 rounded-xl bg-white bg-opacity-20 border-b-2 border-yellow-300 backdrop-blur-sm font-medium underline">Demandes</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-medium">Bienvenue, Secrétaire</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 bg-opacity-20 border border-red-300 border-opacity-30 rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* En-tête avec bouton retour */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/secretaire/demandes')}
              className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 text-gray-700 border border-gray-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour aux demandes</span>
            </button>
            <h2 className="text-2xl font-semibold text-gray-800">Détail de la demande #{demande.id}</h2>
          </div>
          
          {/* Actions selon le statut */}
          {demande.statut === 'EN_ATTENTE' && (
            <div className="flex space-x-3">
              <button
                onClick={handleApprouver}
                disabled={actionLoading === 'approve'}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold disabled:opacity-50"
              >
                {actionLoading === 'approve' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span>Approuver</span>
              </button>
              <button
                onClick={handleRejeter}
                disabled={actionLoading === 'reject'}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold disabled:opacity-50"
              >
                {actionLoading === 'reject' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span>Rejeter</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carte principale de la demande */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{demande.titre}</h3>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatutStyle(demande.statut)}`}>
                      <div className="flex items-center space-x-1">
                        {getStatutIcon(demande.statut)}
                        <span>
                          {demande.statut === 'EN_ATTENTE' ? 'En attente' :
                           demande.statut === 'APPROUVEE' ? 'Approuvée' : 'Rejetée'}
                        </span>
                      </div>
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTypeStyle(demande.type_demande)}`}>
                      {demande.type_demande.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {demande.description && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{demande.description}</p>
                </div>
              )}

              {/* Dates */}
              {(demande.date_debut || demande.date_fin) && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Période</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {demande.date_debut && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Début: {new Date(demande.date_debut).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    {demande.date_fin && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Fin: {new Date(demande.date_fin).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Commentaire administratif */}
              {demande.commentaire_admin && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Commentaire administratif</h4>
                  <p className="text-gray-600 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">{demande.commentaire_admin}</p>
                </div>
              )}

              {/* Documents */}
              {demande.documents && demande.documents.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Documents joints ({demande.documents.length})</h4>
                  <div className="space-y-2">
                    {demande.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">{doc}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDownloadDocument(doc)}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Voir</span>
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(doc)}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                          >
                            <Download className="w-4 h-4" />
                            <span>Télécharger</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar avec informations utilisateur */}
          <div className="space-y-6">
            {/* Informations du demandeur */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Demandeur</span>
              </h4>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Nom complet</span>
                  <p className="font-medium text-gray-900">{demande.user?.prenom} {demande.user?.nom}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Email</span>
                  <p className="font-medium text-gray-900">{demande.user?.email || 'Non renseigné'}</p>
                </div>
                
                {demande.user?.telephone && (
                  <div>
                    <span className="text-sm text-gray-500">Téléphone</span>
                    <p className="font-medium text-gray-900">{demande.user.telephone}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm text-gray-500">Rôle</span>
                  <p className="font-medium text-gray-900 capitalize">{demande.user?.role || 'Utilisateur'}</p>
                </div>
              </div>
            </div>

            {/* Informations temporelles */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Chronologie</span>
              </h4>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Date de création</span>
                  <p className="font-medium text-gray-900">
                    {new Date(demande.created_at).toLocaleDateString('fr-FR')} à {new Date(demande.created_at).toLocaleTimeString('fr-FR')}
                  </p>
                </div>
                
                {demande.updated_at && (
                  <div>
                    <span className="text-sm text-gray-500">Dernière modification</span>
                    <p className="font-medium text-gray-900">
                      {new Date(demande.updated_at).toLocaleDateString('fr-FR')} à {new Date(demande.updated_at).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DemandeDetailPage;
