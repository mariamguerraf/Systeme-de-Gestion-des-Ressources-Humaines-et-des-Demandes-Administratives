import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SimpleTestPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔍 Page de test chargée");
    console.log("👤 Utilisateur:", user);
  }, [user]);

  const goToDashboard = () => {
    if (!user) {
      console.log("❌ Aucun utilisateur connecté");
      return;
    }

    console.log(`🔄 Redirection vers dashboard pour rôle: ${user.role}`);
    
    switch (user.role) {
      case 'admin':
        navigate("/cadmin/dashboard", { replace: true });
        break;
      case 'secretaire':
        navigate("/dashboard", { replace: true });
        break;
      case 'enseignant':
        navigate("/enseignant/demandes", { replace: true });
        break;
      case 'fonctionnaire':
        navigate("/fonctionnaire/demandes", { replace: true });
        break;
      default:
        console.log("⚠️ Rôle non reconnu, redirection vers dashboard par défaut");
        navigate("/dashboard", { replace: true });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-green-600">
            ✅ Connexion Réussie !
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">
              Bienvenue, {user?.prenom} {user?.nom} !
            </h2>
            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h3 className="font-medium mb-2">Informations de connexion:</h3>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Rôle:</strong> {user?.role}</p>
              <p><strong>Actif:</strong> {user?.is_active ? 'Oui' : 'Non'}</p>
              <p><strong>ID:</strong> {user?.id}</p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={goToDashboard}
              className="w-full"
              size="lg"
            >
              Aller au Dashboard ({user?.role})
            </Button>
            
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              Se Déconnecter
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Cette page de test confirme que la connexion fonctionne. 
            Cliquez sur "Aller au Dashboard" pour être redirigé vers votre interface.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleTestPage;
