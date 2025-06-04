import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SuccessPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
	<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
	  <Card className="w-full max-w-md">
		<CardHeader className="text-center">
		  <CardTitle className="text-2xl font-bold text-green-600">
			✅ Connexion Réussie !
		  </CardTitle>
		</CardHeader>
		<CardContent className="space-y-4">
		  <div className="text-center">
			<p className="text-gray-600">Bienvenue,</p>
			<p className="text-xl font-semibold text-blue-900">{user?.email}</p>
		  </div>          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Informations utilisateur :</h3>
            <div className="space-y-1 text-sm">
              <p><strong>ID:</strong> {user?.id}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Rôle:</strong> {user?.role}</p>
              <p><strong>Nom:</strong> {user?.nom || 'Non défini'}</p>
              <p><strong>Prénom:</strong> {user?.prenom || 'Non défini'}</p>
              <p><strong>Téléphone:</strong> {user?.telephone || 'Non défini'}</p>
            </div>
          </div>

		  <div className="space-y-2">
			<p className="text-center text-sm text-gray-600">
			  Vous devriez maintenant être redirigé vers votre tableau de bord selon votre rôle.
			</p>

			<div className="text-center text-xs text-gray-500">
			  Rôle détecté: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{user?.role}</span>
			</div>
		  </div>

		  <Button
			onClick={logout}
			variant="outline"
			className="w-full"
		  >
			Se déconnecter
		  </Button>
		</CardContent>
	  </Card>
	</div>
  );
};

export default SuccessPage;
