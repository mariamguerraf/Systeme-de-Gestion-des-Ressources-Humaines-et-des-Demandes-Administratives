import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TEST_CREDENTIALS } from '../test-credentials';

const TestLoginPage: React.FC = () => {
  const { login, user, logout, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await login({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    }
  };

  const useTestCredentials = (role: 'admin' | 'secretaire' | 'enseignant' | 'fonctionnaire') => {
    const creds = TEST_CREDENTIALS[role];
    setEmail(creds.email);
    setPassword(creds.password);
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">
              ✅ Connexion Réussie !
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600">Bienvenue,</p>
              <p className="text-xl font-semibold text-blue-900">{user.email}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Informations utilisateur :</h3>
              <div className="space-y-1 text-sm">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Rôle:</strong> {user.role}</p>
                <p><strong>Nom:</strong> {user.nom}</p>
                <p><strong>Prénom:</strong> {user.prenom}</p>
                <p><strong>Téléphone:</strong> {user.telephone}</p>
              </div>
            </div>

            <Button onClick={logout} variant="outline" className="w-full">
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-900">
            🔐 Test de Connexion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@gestion.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="space-y-2">
            <p className="text-sm text-gray-600 text-center">Comptes de test :</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => useTestCredentials('admin')}
              >
                Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => useTestCredentials('secretaire')}
              >
                Secrétaire
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => useTestCredentials('enseignant')}
              >
                Enseignant
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => useTestCredentials('fonctionnaire')}
              >
                Fonctionnaire
              </Button>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Backend: {import.meta.env.VITE_API_URL || 'http://localhost:8001'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestLoginPage;
