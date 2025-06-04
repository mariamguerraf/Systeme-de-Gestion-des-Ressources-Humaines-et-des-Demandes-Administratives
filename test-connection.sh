#!/bin/bash

echo "🧪 Test de Connexion Frontend/Backend"
echo "====================================="

echo ""
echo "1️⃣ Vérification Backend (Port 8001):"
curl -s http://localhost:8001/ | head -c 100
echo ""

echo ""
echo "2️⃣ Test connexion Admin:"
RESPONSE=$(curl -s -X POST "http://localhost:8001/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@gestion.com&password=password123")

if echo "$RESPONSE" | grep -q "access_token"; then
    echo "✅ Connexion admin réussie"
    TOKEN=$(echo "$RESPONSE" | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"\([^"]*\)"/\1/')
    echo "🎟️ Token reçu (50 premiers caractères): ${TOKEN:0:50}..."

    echo ""
    echo "3️⃣ Test récupération utilisateur:"
    USER_DATA=$(curl -s -X GET "http://localhost:8001/auth/me" \
      -H "Authorization: Bearer $TOKEN")

    if echo "$USER_DATA" | grep -q "admin@gestion.com"; then
        echo "✅ Données utilisateur récupérées avec succès"
        echo "👤 Utilisateur: $(echo "$USER_DATA" | grep -o '"email":"[^"]*"' | sed 's/"email":"\([^"]*\)"/\1/')"
        echo "🎭 Rôle: $(echo "$USER_DATA" | grep -o '"role":"[^"]*"' | sed 's/"role":"\([^"]*\)"/\1/')"
    else
        echo "❌ Erreur récupération données utilisateur"
        echo "Réponse: $USER_DATA"
    fi
else
    echo "❌ Connexion admin échouée"
    echo "Réponse: $RESPONSE"
fi

echo ""
echo "4️⃣ Credentials de test disponibles:"
echo "📧 admin@gestion.com / 🔑 password123"
echo "📧 secretaire@gestion.com / 🔑 password123"
echo "📧 enseignant@gestion.com / 🔑 password123"
echo "📧 fonctionnaire@gestion.com / 🔑 password123"

echo ""
echo "5️⃣ URLs importantes:"
echo "🌐 Frontend: http://localhost:8082"
echo "🔧 Backend: http://localhost:8001"
echo "📖 API Docs: http://localhost:8001/docs"
echo "🔍 Debug Page: file:///workspaces/front_end/debug-login.html"

echo ""
echo "✅ Test terminé !"
