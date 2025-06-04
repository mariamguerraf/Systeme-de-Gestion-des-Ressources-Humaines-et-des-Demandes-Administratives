import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SimpleTestPage: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>❌ Non Authentifié</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Vous devez être connecté pour accéder à cette page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>✅ Connexion Réussie !</CardTitle>
          <CardDescription>Test de la connexion et des données utilisateur</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Données utilisateur :</h3>
            <div className="mt-2 space-y-1 text-sm">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Nom:</strong> {user?.nom}</p>
              <p><strong>Prénom:</strong> {user?.prenom}</p>
              <p><strong>Rôle:</strong> {user?.role}</p>
              <p><strong>ID:</strong> {user?.id}</p>
              <p><strong>Actif:</strong> {user?.is_active ? 'Oui' : 'Non'}</p>
            </div>
          </div>
          
          <div className="pt-4">
            <h3 className="font-semibold mb-2">Actions :</h3>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.href = '/dashboard-router'} 
                className="w-full"
                variant="default"
              >
                Aller au Dashboard
              </Button>
              <Button 
                onClick={logout} 
                className="w-full"
                variant="outline"
              >
                Se Déconnecter
              </Button>
            </div>
          </div>

          <div className="pt-4 text-xs text-gray-500">
            <p>🔍 Debug Info:</p>
            <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleTestPage;
