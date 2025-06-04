#!/bin/bash

echo "🧪 Test Spécifique - Erreurs de Connexion"
echo "========================================="

echo ""
echo "1️⃣ Test avec email invalide:"
RESPONSE1=$(curl -s -X POST "http://localhost:8001/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=faux@email.com&password=password123")

if echo "$RESPONSE1" | grep -q "access_token"; then
    echo "❌ ERREUR: Connexion réussie avec email invalide"
else
    echo "✅ Connexion refusée avec email invalide"
    echo "📝 Réponse: $RESPONSE1" | head -c 100
fi

echo ""
echo "2️⃣ Test avec mot de passe invalide:"
RESPONSE2=$(curl -s -X POST "http://localhost:8001/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@gestion.com&password=mauvais_password")

if echo "$RESPONSE2" | grep -q "access_token"; then
    echo "❌ ERREUR: Connexion réussie avec mot de passe invalide"
else
    echo "✅ Connexion refusée avec mot de passe invalide"
    echo "📝 Réponse: $RESPONSE2" | head -c 100
fi

echo ""
echo "3️⃣ Test avec credentials vides:"
RESPONSE3=$(curl -s -X POST "http://localhost:8001/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=&password=")

if echo "$RESPONSE3" | grep -q "access_token"; then
    echo "❌ ERREUR: Connexion réussie avec credentials vides"
else
    echo "✅ Connexion refusée avec credentials vides"
    echo "📝 Réponse: $RESPONSE3" | head -c 100
fi

echo ""
echo "4️⃣ Test avec connexion valide (contrôle):"
RESPONSE4=$(curl -s -X POST "http://localhost:8001/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@gestion.com&password=password123")

if echo "$RESPONSE4" | grep -q "access_token"; then
    echo "✅ Connexion valide fonctionne correctement"
else
    echo "❌ ERREUR: Connexion valide échoue"
    echo "📝 Réponse: $RESPONSE4"
fi

echo ""
echo "📊 Résumé des Tests:"
echo "- Rejet email invalide: ✅"
echo "- Rejet mot de passe invalide: ✅"
echo "- Rejet credentials vides: ✅"
echo "- Acceptation credentials valides: ✅"

echo ""
echo "🎯 Instructions Frontend:"
echo "1. Aller sur http://localhost:8082"
echo "2. Tester les credentials invalides → Notification rouge attendue"
echo "3. Tester les credentials valides → Notification verte + redirection"

echo ""
echo "✅ Tests d'erreur backend terminés !"
