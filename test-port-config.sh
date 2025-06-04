#!/bin/bash

echo "=== TEST DE CONFIGURATION DES PORTS CODESPACES ==="
echo "Date: $(date)"
echo ""

echo "1. Test de connexion au backend via URL publique:"
echo "URL: https://glorious-halibut-7vpx5rjj4w7g37qv-8001.app.github.dev"
echo ""

# Test avec curl et affichage des headers complets
echo "Réponse du serveur:"
curl -v -I "https://glorious-halibut-7vpx5rjj4w7g37qv-8001.app.github.dev/" 2>&1 | head -20

echo ""
echo "2. Test de l'endpoint /docs:"
curl -v -I "https://glorious-halibut-7vpx5rjj4w7g37qv-8001.app.github.dev/docs" 2>&1 | head -20

echo ""
echo "3. Vérification des processus backend:"
ps aux | grep uvicorn | grep -v grep

echo ""
echo "4. Vérification des ports en écoute:"
netstat -tlnp | grep 8001

echo ""
echo "=== RÉSULTAT ==="
if curl -s -I "https://glorious-halibut-7vpx5rjj4w7g37qv-8001.app.github.dev/" | grep -q "HTTP/2 200\|HTTP/1.1 200"; then
    echo "✅ Backend accessible via URL publique"
else
    echo "❌ Backend NON accessible - Port probablement pas configuré comme Public"
    echo "    📝 Action requise: Configurer le port 8001 comme 'Public' dans l'onglet Ports de VS Code"
fi
