#!/bin/bash

echo "🧪 Test complet de modification d'enseignant"
echo "=========================================="

# 1. Vérifier que le backend fonctionne
echo "1. Test connectivité backend..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ "$response" = "200" ]; then
    echo "✅ Backend accessible"
else
    echo "❌ Backend non accessible (code: $response)"
    exit 1
fi

# 2. Se connecter comme admin
echo "2. Test authentification admin..."
token_response=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@univ.ma&password=admin2024")

token=$(echo $token_response | jq -r '.access_token')
if [ "$token" != "null" ] && [ "$token" != "" ]; then
    echo "✅ Authentification réussie: $token"
else
    echo "❌ Échec authentification: $token_response"
    exit 1
fi

# 3. Créer un enseignant de test
echo "3. Création d'un enseignant de test..."
create_response=$(curl -s -X POST http://localhost:8000/users/enseignants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@test.com",
    "password": "test123",
    "telephone": "0123456789",
    "specialite": "Informatique",
    "grade": "Professeur",
    "etablissement": "FSTS",
    "adresse": "123 rue Test",
    "cin": "ABC123456",
    "photo": ""
  }')

enseignant_id=$(echo $create_response | jq -r '.id')
if [ "$enseignant_id" != "null" ] && [ "$enseignant_id" != "" ]; then
    echo "✅ Enseignant créé avec ID: $enseignant_id"
else
    echo "❌ Échec création: $create_response"
    exit 1
fi

# 4. Modifier l'enseignant
echo "4. Modification de l'enseignant..."
update_response=$(curl -s -X PUT http://localhost:8000/users/enseignants/$enseignant_id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "nom": "Dupont-Martin",
    "prenom": "Jean-Claude",
    "email": "jean.dupont@test.com",
    "password": "test123",
    "telephone": "0987654321",
    "specialite": "Mathématiques",
    "grade": "Professeur Associé",
    "etablissement": "FSTS",
    "adresse": "456 avenue Nouvelle",
    "cin": "ABC123456",
    "photo": "photo_updated.jpg"
  }')

updated_nom=$(echo $update_response | jq -r '.user.nom')
updated_specialite=$(echo $update_response | jq -r '.specialite')

if [ "$updated_nom" = "Dupont-Martin" ] && [ "$updated_specialite" = "Mathématiques" ]; then
    echo "✅ Modification réussie!"
    echo "   Nom: $updated_nom"
    echo "   Spécialité: $updated_specialite"
else
    echo "❌ Échec modification: $update_response"
    exit 1
fi

echo ""
echo "🎉 TOUS LES TESTS SONT PASSÉS!"
echo "✅ Backend fonctionnel"
echo "✅ Authentification admin OK"
echo "✅ Création d'enseignant OK"
echo "✅ Modification d'enseignant OK"
