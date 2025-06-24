import { getApiBaseUrl } from '../utils/config';

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('access_token');
  }

  private buildUrl(endpoint: string): string {
    // Assure qu'il n'y a qu'une seule barre oblique entre baseURL et endpoint
    const cleanBaseUrl = this.baseURL.replace(/\/$/, '');
    const cleanEndpoint = endpoint.replace(/^\//, '');
    return `${cleanBaseUrl}/${cleanEndpoint}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint);

    // Construire les headers de base
    const baseHeaders: Record<string, string> = {};

    // Ajouter Content-Type seulement si ce n'est pas FormData
    if (!(options.body instanceof FormData)) {
      baseHeaders['Content-Type'] = 'application/json';
    }

    // Ajouter le token d'auth
    const token = this.token || localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token) {
      baseHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      headers: {
        ...baseHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    try {
      console.log('[API DEBUG] Tentative de connexion sur:', this.buildUrl('auth/login'));
      const response = await fetch(this.buildUrl('auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Erreur de connexion (${response.status})`);
      }

      const data = await response.json();
      this.token = data.access_token;
      localStorage.setItem('access_token', data.access_token);
      return data;
    } catch (error: any) {
      console.error('🔴 Erreur de connexion:', error);
      // Gestion spécifique pour "Failed to fetch" ou erreur réseau
      if (error instanceof TypeError || (error.message && error.message.includes('fetch'))) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez que le backend est démarré et que l\'URL est correcte : ' + this.baseURL);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur de connexion inattendue');
    }
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  logout() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  // Users methods
  async getUsers(skip = 0, limit = 100) {
    return this.request(`/users/?skip=${skip}&limit=${limit}`);
  }

  async getUser(userId: number) {
    return this.request(`/users/${userId}`);
  }

  async updateUser(userId: number, userData: any) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: number) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getUsersByRole(role: string) {
    return this.request(`/users/role/${role}`);
  }

  // Enseignants methods
  async getEnseignants() {
    return this.request('/users/enseignants');
  }

  async createEnseignant(enseignantData: any) {
    return this.request('/users/enseignants', {
      method: 'POST',
      body: JSON.stringify(enseignantData),
    });
  }

  async updateEnseignant(enseignantId: number, enseignantData: any) {
    return this.request(`/users/enseignants/${enseignantId}`, {
      method: 'PUT',
      body: JSON.stringify(enseignantData),
    });
  }

  async deleteEnseignant(enseignantId: number) {
    return this.request(`/users/enseignants/${enseignantId}`, {
      method: 'DELETE',
    });
  }

  // Fonctionnaires methods
  async getFonctionnaires() {
    return this.request('/users/fonctionnaires');
  }

  async createFonctionnaire(fonctionnaireData: any) {
    return this.request('/users/fonctionnaires', {
      method: 'POST',
      body: JSON.stringify(fonctionnaireData),
    });
  }

  async updateFonctionnaire(fonctionnaireId: number, fonctionnaireData: any) {
    return this.request(`/users/fonctionnaires/${fonctionnaireId}`, {
      method: 'PUT',
      body: JSON.stringify(fonctionnaireData),
    });
  }

  async deleteFonctionnaire(fonctionnaireId: number) {
    return this.request(`/users/fonctionnaires/${fonctionnaireId}`, {
      method: 'DELETE',
    });
  }

  async uploadFonctionnairePhoto(fonctionnaireId: number, formData: FormData) {
    return this.request(`/users/fonctionnaires/${fonctionnaireId}/upload-photo`, {
      method: 'POST',
      body: formData,
    });
  }

  // Test users method
  async getTestUsers() {
    return this.request('/test/users');
  }

  // Dashboard statistics methods
  async getDashboardStats() {
    try {
      // Utiliser le nouvel endpoint dédié aux statistiques
      const stats = await this.request('/dashboard/stats');
      return stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);

      // Fallback: essayer de calculer manuellement les statistiques
      try {
        const enseignants = await this.getEnseignants();
        const fonctionnaires = await this.getFonctionnaires();
        const testUsers = await this.getTestUsers();
        const demandes = await this.getDemandes();

        const enseignantsArray = Array.isArray(enseignants) ? enseignants : [];
        const fonctionnairesArray = Array.isArray(fonctionnaires) ? fonctionnaires : [];
        const testUsersData = testUsers as any;
        const usersArray = Array.isArray(testUsersData?.users) ? testUsersData.users : [];
        const demandesArray = Array.isArray(demandes) ? demandes : [];

        // Calculate real statistics from multiple endpoints
        const demandesEnAttente = demandesArray.filter((d: any) => d.statut === 'EN_ATTENTE').length;
        const demandesTraitees = demandesArray.filter((d: any) => d.statut === 'APPROUVEE' || d.statut === 'REJETEE').length;

        return {
          totalUsers: usersArray.length,
          enseignants: enseignantsArray.length,
          fonctionnaires: fonctionnairesArray.length,
          secretaires: usersArray.filter((u: any) => u.role === 'secretaire').length,
          admins: usersArray.filter((u: any) => u.role === 'admin').length,
          demandesEnAttente: demandesEnAttente,
          demandesTraitees: demandesTraitees,
          totalDemandes: demandesArray.length
        };
      } catch (fallbackError) {
        console.error('Error with fallback stats calculation:', fallbackError);
        // Return zero values if everything fails
        return {
          totalUsers: 0,
          enseignants: 0,
          fonctionnaires: 0,
          secretaires: 0,
          admins: 0,
          demandesEnAttente: 0,
          demandesTraitees: 0,
          totalDemandes: 0
        };
      }
    }
  }

  // Demandes methods
  async getDemandes(skip = 0, limit = 100) {
    return this.request(`/demandes/?skip=${skip}&limit=${limit}`);
  }

  async getMyDemandes(skip = 0, limit = 100) {
    // Récupérer les demandes de l'utilisateur connecté
    return this.request(`/demandes/user/me?skip=${skip}&limit=${limit}`);
  }

  async getUserDemandes(userId: number) {
    return this.request(`/users/${userId}/demandes`);
  }

  async getDemande(demandeId: number) {
    return this.request(`/demandes/${demandeId}`);
  }

  async createDemande(demandeData: any) {
    return this.request('/demandes-direct', {
      method: 'POST',
      body: JSON.stringify(demandeData),
    });
  }

  async updateDemande(demandeId: number, demandeData: any) {
    return this.request(`/demandes/${demandeId}`, {
      method: 'PUT',
      body: JSON.stringify(demandeData),
    });
  }

  async deleteDemande(demandeId: number) {
    return this.request(`/demandes/${demandeId}`, {
      method: 'DELETE',
    });
  }

  async updateDemandeStatus(demandeId: number, status: string, commentaire?: string) {
    return this.request(`/demandes/${demandeId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ statut: status, commentaire_admin: commentaire }),
    });
  }

  // Endpoints spécialisés pour les demandes
  async createDemandeAttestation(titre: string, description?: string) {
    return this.request('/demandes-direct', {
      method: 'POST',
      body: JSON.stringify({
        type_demande: 'ATTESTATION',
        titre,
        description
      }),
    });
  }

  async createDemandeOrdreMission(titre: string, description?: string, date_debut?: string, date_fin?: string) {
    return this.request('/demandes-direct', {
      method: 'POST',
      body: JSON.stringify({
        type_demande: 'ORDRE_MISSION',
        titre,
        description,
        date_debut,
        date_fin
      }),
    });
  }

  async createDemandeHeuresSup(titre: string, description?: string, date_debut?: string, date_fin?: string) {
    return this.request('/demandes-direct', {
      method: 'POST',
      body: JSON.stringify({
        type_demande: 'HEURES_SUP',
        titre,
        description,
        date_debut,
        date_fin
      }),
    });
  }

  async createDemandeAbsence(titre: string, description?: string, date_debut?: string, date_fin?: string) {
    return this.request('/demandes-direct', {
      method: 'POST',
      body: JSON.stringify({
        type_demande: 'ABSENCE',
        titre,
        description,
        date_debut,
        date_fin
      }),
    });
  }

  // Documents methods for demandes
  async uploadDemandeDocuments(demandeId: number, files: FileList | File[]) {
    const formData = new FormData();
    
    // Ajouter les fichiers au FormData
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    return this.request(`/demandes/${demandeId}/upload-documents`, {
      method: 'POST',
      body: formData,
    });
  }

  async getDemandeDocuments(demandeId: number) {
    return this.request(`/demandes/${demandeId}/documents`);
  }

  async deleteDemandeDocument(demandeId: number, documentId: number) {
    return this.request(`/demandes/${demandeId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  async downloadDemandeDocument(demandeId: number, documentId: number) {
    const url = this.buildUrl(`/demandes/${demandeId}/documents/${documentId}/download`);
    const token = this.token || localStorage.getItem('access_token');
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement du document');
    }

    return response.blob();
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Utility method to refresh token
  refreshToken() {
    this.token = localStorage.getItem('access_token');
  }
}

export const apiService = new ApiService();
export default apiService;
