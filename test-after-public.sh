#!/bin/bash

echo "🔍 Test de connexion après configuration du port en Public..."
echo "================================================"

echo ""
echo "1️⃣ Test de la racine du backend :"
curl -I https://glorious-halibut-7vpx5rjj4w7g37qv-8001.app.github.dev/ 2>/dev/null | head -3

echo ""
echo "2️⃣ Test de l'endpoint /docs :"
curl -I https://glorious-halibut-7vpx5rjj4w7g37qv-8001.app.github.dev/docs 2>/dev/null | head -3

echo ""
echo "3️⃣ Test de l'endpoint d'authentification :"
curl -I https://glorious-halibut-7vpx5rjj4w7g37qv-8001.app.github.dev/auth/login 2>/dev/null | head -3

echo ""
echo "4️⃣ Test d'un login complet :"
curl -X POST https://glorious-halibut-7vpx5rjj4w7g37qv-8001.app.github.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@gestion.com", "password": "password123"}' 2>/dev/null | jq -r '.access_token' | head -c 50

echo ""
echo ""
echo "✅ Si tu vois des codes 200 au lieu de 401, le problème est résolu !"
echo "❌ Si tu vois encore des codes 401, le port n'est pas encore public."
