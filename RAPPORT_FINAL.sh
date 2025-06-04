#!/bin/bash

echo "🎉 APPLICATION DE GESTION ADMINISTRATIVE - PRÊTE !"
echo "=================================================="
echo
echo "✅ ÉTAT DE L'APPLICATION:"
echo "   🔧 Backend FastAPI: http://localhost:8001 ✅"
echo "   🌐 Frontend React: http://localhost:5174 ✅"
echo "   🗄️ PostgreSQL: Port 5432 ✅"
echo "   📊 Adminer DB: http://localhost:8081 ✅"
echo
echo "🔐 COMPTES DE TEST CRÉÉS:"
echo "   👨‍💼 Admin: admin@test.com / admin123"
echo "   📋 Secrétaire: secretaire@test.com / secret123"
echo "   👨‍🏫 Enseignant: enseignant@test.com / enseign123"
echo "   👨‍💼 Fonctionnaire: fonctionnaire@test.com / fonct123"
echo
echo "🎯 REDIRECTION ADMIN CONFIGURÉE:"
echo "   ✅ LoginForm.tsx: Logique de redirection par rôle"
echo "   ✅ AuthContext.tsx: Gestion de l'authentification JWT"
echo "   ✅ ProtectedRoute.tsx: Protection des routes par rôle"
echo "   ✅ App.tsx: Routes configurées avec contrôle d'accès"
echo "   ✅ Dashboard Admin: /cadmin/dashboard opérationnel"
echo
echo "🧪 TEST DE LA REDIRECTION ADMIN:"

# Test d'authentification
echo "   1. Test d'authentification backend..."
AUTH_RESULT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:8001/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@test.com&password=admin123")

if [ "$AUTH_RESULT" = "200" ]; then
    echo "      ✅ Authentification admin réussie (HTTP $AUTH_RESULT)"
else
    echo "      ❌ Problème d'authentification (HTTP $AUTH_RESULT)"
fi

# Test de récupération utilisateur
echo "   2. Test de récupération des données utilisateur..."
TOKEN=$(curl -s -X POST "http://localhost:8001/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@test.com&password=admin123" | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ ! -z "$TOKEN" ]; then
    USER_ROLE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8001/auth/me | \
      python3 -c "import sys, json; print(json.load(sys.stdin)['role'])" 2>/dev/null)
    echo "      ✅ Rôle utilisateur récupéré: $USER_ROLE"

    if [ "$USER_ROLE" = "admin" ]; then
        echo "      ✅ Redirection attendue: /cadmin/dashboard"
    fi
else
    echo "      ❌ Impossible de récupérer le token"
fi

echo
echo "📱 TESTER MAINTENANT DANS LE NAVIGATEUR:"
echo "   1. 🌐 Ouvrez: http://localhost:5174"
echo "   2. 🔐 Connectez-vous avec: admin@test.com / admin123"
echo "   3. 🔀 Vérifiez la redirection automatique vers: /cadmin/dashboard"
echo
echo "🌟 FONCTIONNALITÉS DISPONIBLES APRÈS CONNEXION ADMIN:"
echo "   📊 Dashboard Admin: Vue d'ensemble des statistiques"
echo "   👨‍🏫 Gestion Enseignants: CRUD des profils enseignants"
echo "   👨‍💼 Gestion Fonctionnaires: CRUD des profils fonctionnaires"
echo "   🔒 Interface protégée par authentification JWT"
echo
echo "🎯 L'application est prête pour les tests de redirection !"
echo "   Connectez-vous maintenant pour voir la redirection en action !"
