#!/bin/bash

echo "=== Test de connexion frontend ==="
echo "URL Frontend: http://localhost:8082"
echo "URL Backend: https://glorious-halibut-7vpx5rjj4w7g37qv-8001.app.github.dev"
echo ""

# Test des variables d'environnement
echo "1. Vérification des variables d'environnement..."
if [ -f .env ]; then
    echo "Fichier .env trouvé:"
    cat .env
else
    echo "ERREUR: Fichier .env introuvable !"
fi
echo ""

# Test de l'accessibilité du backend
echo "2. Test d'accessibilité du backend..."
response=$(curl -s -w "%{http_code}" https://glorious-halibut-7vpx5rjj4w7g37qv-8001.app.github.dev/)
if [ "$response" = "200" ]; then
    echo "✅ Backend accessible (status 200)"
else
    echo "❌ Backend inaccessible (status: $response)"
    echo "   Vérifiez que le port 8001 est configuré comme 'Public' dans l'onglet Ports"
fi
echo ""

# Test de connexion avec les identifiants de test
echo "3. Test de connexion avec les identifiants admin..."
curl -s -X POST https://glorious-halibut-7vpx5rjj4w7g37qv-8001.app.github.dev/auth/login \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=admin@gestion.com&password=password123" \
     -w "Status: %{http_code}\n" || echo "❌ Échec de la connexion"
echo ""

echo "4. Instructions pour tester le frontend:"
echo "   - Ouvrir http://localhost:8082 dans le navigateur"
echo "   - Utiliser les identifiants:"
echo "     * admin@gestion.com / password123"
echo "     * secretaire@gestion.com / password123"
echo "     * enseignant@gestion.com / password123"
echo "     * fonctionnaire@gestion.com / password123"
