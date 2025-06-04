#!/bin/bash

echo "🧪 TEST COMPLET - Gestion des Erreurs de Connexion"
echo "================================================="

echo ""
echo "📋 ÉTAPES DE TEST :"
echo "1. Test avec backend éteint (Failed to fetch)"
echo "2. Test avec backend démarré + credentials invalides"
echo "3. Test avec credentials valides"

echo ""
echo "🔍 1️⃣ Vérification de l'état des serveurs..."

# Vérifier le backend
echo -n "Backend (port 8001): "
if curl -s http://localhost:8001/ > /dev/null 2>&1; then
    echo "✅ EN LIGNE"
    BACKEND_STATUS="online"
else
    echo "❌ HORS LIGNE"
    BACKEND_STATUS="offline"
fi

# Vérifier le frontend
echo -n "Frontend (port 8083): "
if curl -s http://localhost:8083/ > /dev/null 2>&1; then
    echo "✅ EN LIGNE"
    FRONTEND_STATUS="online"
else
    echo "❌ HORS LIGNE"
    FRONTEND_STATUS="offline"
fi

echo ""
echo "🎯 2️⃣ Instructions de test selon l'état des serveurs:"

if [ "$BACKEND_STATUS" = "offline" ]; then
    echo ""
    echo "🔴 TEST DU CAS 'Failed to fetch' :"
    echo "┌─────────────────────────────────────────────────────────────┐"
    echo "│ 1. Aller sur http://localhost:8083 (ou le port frontend)   │"
    echo "│ 2. Entrer n'importe quels credentials                      │"
    echo "│ 3. RÉSULTAT ATTENDU:                                       │"
    echo "│    🔴 Notification rouge:                                  │"
    echo "│    'Impossible de se connecter au serveur.                 │"
    echo "│     Vérifiez que le backend est démarré.'                  │"
    echo "└─────────────────────────────────────────────────────────────┘"
    echo ""
    echo "💡 Pour tester les autres cas, démarrez le backend :"
    echo "   cd /workspaces/front_end/back_end && python main.py"
else
    echo ""
    echo "✅ BACKEND EN LIGNE - Tests des erreurs de credentials :"
    echo "┌─────────────────────────────────────────────────────────────┐"
    echo "│ 1. Aller sur http://localhost:8083                         │"
    echo "│ 2. Tester credentials INVALIDES:                           │"
    echo "│    📧 wrong@email.com / 🔑 wrongpassword                   │"
    echo "│    RÉSULTAT ATTENDU:                                       │"
    echo "│    🔴 'Email ou mot de passe incorrect'                    │"
    echo "│                                                            │"
    echo "│ 3. Tester credentials VALIDES:                             │"
    echo "│    📧 admin@gestion.com / 🔑 password123                   │"
    echo "│    RÉSULTAT ATTENDU:                                       │"
    echo "│    🟢 'Connexion réussie ! Redirection en cours...'        │"
    echo "│    ➡️  Redirection vers dashboard admin                     │"
    echo "└─────────────────────────────────────────────────────────────┘"
fi

echo ""
echo "🛠️ 3️⃣ Commandes utiles :"
echo "• Démarrer backend : cd /workspaces/front_end/back_end && python main.py"
echo "• Démarrer frontend: cd /workspaces/front_end && npm run dev"
echo "• Tuer processus    : pkill -f 'uvicorn|vite'"

echo ""
echo "📊 4️⃣ Credentials de test disponibles :"
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ ✅ admin@gestion.com / password123        → Dashboard Admin │"
echo "│ ✅ secretaire@gestion.com / password123   → Dashboard Secr  │"
echo "│ ✅ enseignant@gestion.com / password123   → Profil Enseign  │"
echo "│ ✅ fonctionnaire@gestion.com / password123 → Profil Fonct   │"
echo "│ ❌ wrong@email.com / wrongpass             → Erreur         │"
echo "└─────────────────────────────────────────────────────────────┘"

echo ""
echo "🎯 5️⃣ Types d'erreurs à vérifier :"
echo "• 🔴 'Failed to fetch' → Backend éteint"
echo "• 🔴 'Email ou mot de passe incorrect' → Credentials invalides"
echo "• 🔴 'Veuillez remplir tous les champs' → Champs vides"
echo "• 🟢 'Connexion réussie !' → Credentials valides"

echo ""
echo "✅ Guide de test terminé !"
echo "🌐 Frontend: http://localhost:8083"
echo "🔧 Backend: http://localhost:8001"
