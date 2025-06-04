import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const DashboardRedirectTest: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const testRoutes = [
    { path: "/cadmin/dashboard", label: "Admin Dashboard", role: "admin" },
    { path: "/dashboard", label: "Secrétaire Dashboard", role: "secretaire" },
    { path: "/enseignant/demandes", label: "Enseignant Demandes", role: "enseignant" },
    { path: "/fonctionnaire/demandes", label: "Fonctionnaire Demandes", role: "fonctionnaire" },
  ];

  const goToRoute = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center">
            🎉 Connexion réussie !
          </CardTitle>
          <div className="text-center text-sm text-gray-600">
            Connecté en tant que: <strong>{user?.email}</strong> ({user?.role})
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold mb-2">
              Choisissez une page à visiter:
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testRoutes.map((route) => (
              <Button
                key={route.path}
                onClick={() => goToRoute(route.path)}
                variant={user?.role === route.role ? "default" : "outline"}
                className="p-4 h-auto flex-col space-y-2"
              >
                <div className="font-medium">{route.label}</div>
                <div className="text-xs opacity-70">{route.path}</div>
              </Button>
            ))}
          </div>

          <div className="flex justify-center pt-4 border-t">
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
            >
              Déconnexion
            </Button>
          </div>

          <div className="text-xs text-center text-gray-500 mt-4">
            Si une page ne se charge pas, vérifiez que le composant existe dans src/pages/
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardRedirectTest;
