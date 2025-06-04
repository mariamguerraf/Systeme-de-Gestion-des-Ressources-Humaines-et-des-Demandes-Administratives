#!/bin/bash

echo "=== Test d'accessibilité du backend ==="
echo "URL Backend: https://glorious-halibut-7vpx5rjj4w7g37qv-8001.app.github.dev"
echo ""

echo "1. Test de l'endpoint racine..."
curl -s -w "Status: %{http_code}\n" https://glorious-halibut-7vpx5rjj4w7g37qv-8001.app.github.dev/ || echo "ERREUR: Impossible d'accéder à l'endpoint racine"
echo ""

echo "2. Test de l'endpoint docs..."
curl -s -I https://glorious-halibut-7vpx5rjj4w7g37qv-8001.app.github.dev/docs | head -5
echo ""

echo "3. Test de l'endpoint auth/login..."
curl -s -w "Status: %{http_code}\n" https://glorious-halibut-7vpx5rjj4w7g37qv-8001.app.github.dev/auth/login -X POST || echo "ERREUR: Endpoint auth/login inaccessible"
echo ""

echo "=== Instructions pour rendre le port public ==="
echo "1. Ouvrir l'onglet 'Ports' dans VS Code (panneau du bas)"
echo "2. Trouver le port 8001 dans la liste"
echo "3. Clic droit sur le port 8001"
echo "4. Sélectionner 'Port Visibility' → 'Public'"
echo "5. Le port devrait maintenant afficher 'Public' dans la colonne Visibility"
echo ""
echo "Une fois le port rendu public, relancez ce script pour vérifier."
