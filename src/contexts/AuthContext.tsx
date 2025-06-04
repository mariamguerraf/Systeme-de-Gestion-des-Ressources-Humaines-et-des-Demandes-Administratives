import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials } from '../types/api';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isLoading: boolean; // Alias pour compatibilité
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const currentUser = await apiService.getCurrentUser();
          setUser(currentUser as User);
        } catch (error) {
          console.error('Failed to get current user:', error);
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('🔑 Tentative de connexion avec:', credentials.email);
      await apiService.login(credentials.email, credentials.password);
      console.log('✅ Connexion API réussie');
      
      const currentUser = await apiService.getCurrentUser();
      console.log('👤 Utilisateur récupéré:', currentUser);
      
      setUser(currentUser as User);
      console.log('🔄 Utilisateur mis à jour dans le contexte');
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      throw error;
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    isLoading: loading, // Alias pour compatibilité
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
