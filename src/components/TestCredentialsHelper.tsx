import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Copy, Users } from "lucide-react";
import { TEST_CREDENTIALS } from "../test-credentials";
import { useToast } from "@/components/ui/use-toast";

interface TestCredentialsHelperProps {
  onSelectCredentials: (email: string, password: string) => void;
}

const TestCredentialsHelper: React.FC<TestCredentialsHelperProps> = ({ onSelectCredentials }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: `${type} copié dans le presse-papiers`,
    });
  };

  const useCredentials = (email: string, password: string, role: string) => {
    onSelectCredentials(email, password);
    toast({
      title: "Credentials utilisés",
      description: `Connexion en tant que ${role}`,
    });
  };

  if (!isVisible) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="mt-4 text-xs"
      >
        <Users className="h-4 w-4 mr-2" />
        Voir les comptes de test
      </Button>
    );
  }

  return (
    <Card className="mt-4 border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-amber-800 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Comptes de test disponibles
          </CardTitle>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPasswords(!showPasswords)}
            >
              {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              ✕
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {Object.entries(TEST_CREDENTIALS).map(([role, creds]) => (
            <div key={role} className="p-3 bg-white rounded-lg border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm capitalize text-amber-900">
                  {role === 'admin' ? 'Administrateur' :
                   role === 'secretaire' ? 'Secrétaire' :
                   role === 'enseignant' ? 'Enseignant' : 'Fonctionnaire'}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => useCredentials(creds.email, creds.password, role)}
                  className="text-xs px-3 py-1 h-7"
                >
                  Utiliser
                </Button>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Email:</span>
                  <div className="flex items-center gap-1">
                    <code className="text-blue-600">{creds.email}</code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(creds.email, 'Email')}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Mot de passe:</span>
                  <div className="flex items-center gap-1">
                    <code className="text-green-600">
                      {showPasswords ? creds.password : '••••••••'}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(creds.password, 'Mot de passe')}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 p-2 bg-amber-100 rounded text-xs text-amber-800">
          ⚠️ Ces credentials sont uniquement pour le développement et les tests
        </div>

        {/* Bouton de test d'erreur */}
        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-800">🧪 Test d'erreur de connexion</span>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => useCredentials("test@erreur.com", "mauvais_password", "test erreur")}
              className="text-xs px-3 py-1 h-7"
            >
              Tester Erreur
            </Button>
          </div>
          <p className="text-xs text-red-600 mt-1">
            Utilise des credentials invalides pour tester l'affichage d'erreur
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestCredentialsHelper;
