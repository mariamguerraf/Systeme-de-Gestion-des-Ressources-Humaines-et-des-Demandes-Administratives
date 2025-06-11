const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
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
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      console.log('[API DEBUG] Tentative de connexion sur:', `${this.baseURL}/auth/login`);
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        body: formData,
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

  async getDemande(demandeId: number) {
    return this.request(`/demandes/${demandeId}`);
  }

  async createDemande(demandeData: any) {
    return this.request('/demandes', {
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
