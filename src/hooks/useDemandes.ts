import { useState, useEffect } from 'react';
import { Demande, DemandeCreate, DemandeUpdate, DemandeStatus } from '../types/api';
import { apiService } from '../services/api';

export const useDemandes = () => {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDemandes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getDemandes();
      setDemandes(data as Demande[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const createDemande = async (demandeData: DemandeCreate) => {
    try {
      const newDemande = await apiService.createDemande(demandeData) as Demande;
      setDemandes(prev => [...prev, newDemande]);
      return newDemande;
    } catch (err) {
      throw err;
    }
  };

  const updateDemande = async (id: number, updateData: DemandeUpdate) => {
    try {
      const updatedDemande = await apiService.updateDemande(id, updateData) as Demande;
      setDemandes(prev =>
        prev.map(demande =>
          demande.id === id ? updatedDemande : demande
        )
      );
      return updatedDemande;
    } catch (err) {
      throw err;
    }
  };

  const deleteDemande = async (id: number) => {
    try {
      await apiService.deleteDemande(id);
      setDemandes(prev => prev.filter(demande => demande.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const approuverDemande = async (id: number, commentaire?: string) => {
    return updateDemande(id, {
      statut: DemandeStatus.APPROUVEE,
      commentaire_admin: commentaire
    });
  };

  const rejeterDemande = async (id: number, commentaire?: string) => {
    return updateDemande(id, {
      statut: DemandeStatus.REJETEE,
      commentaire_admin: commentaire
    });
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  return {
    demandes,
    loading,
    error,
    fetchDemandes,
    createDemande,
    updateDemande,
    deleteDemande,
    approuverDemande,
    rejeterDemande,
  };
};
