export enum UserRole {
  ADMIN = 'admin',
  ENSEIGNANT = 'enseignant',
  FONCTIONNAIRE = 'fonctionnaire',
  SECRETAIRE = 'secretaire',
}

export enum DemandeStatus {
  EN_ATTENTE = 'en_attente',
  APPROUVEE = 'approuvee',
  REJETEE = 'rejetee',
}

export enum DemandeType {
  CONGE = 'conge',
  ABSENCE = 'absence',
  ATTESTATION = 'attestation',
  ORDRE_MISSION = 'ordre_mission',
  HEURES_SUP = 'heures_sup',
}

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  adresse?: string;
  cin?: string;
  role: string; // Modifié pour accepter string au lieu de UserRole enum
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserCreate {
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  adresse?: string;
  cin?: string;
  role: UserRole;
  password: string;
}

export interface UserUpdate {
  email?: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  adresse?: string;
  cin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Demande {
  id: number;
  user_id: number;
  type_demande: DemandeType;
  titre: string;
  description?: string;
  date_debut?: string;
  date_fin?: string;
  statut: DemandeStatus;
  commentaire_admin?: string;
  created_at: string;
  updated_at?: string;
  user: User;
}

export interface DemandeCreate {
  type_demande: DemandeType;
  titre: string;
  description?: string;
  date_debut?: string;
  date_fin?: string;
}

export interface DemandeUpdate {
  titre?: string;
  description?: string;
  date_debut?: string;
  date_fin?: string;
  statut?: DemandeStatus;
  commentaire_admin?: string;
}

export interface Enseignant {
  id: number;
  user_id: number;
  specialite?: string;
  grade?: string;
  user: User;
}

export interface Fonctionnaire {
  id: number;
  user_id: number;
  service?: string;
  poste?: string;
  grade?: string;
  user: User;
}

export interface ApiError {
  detail: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
