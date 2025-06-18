#!/bin/bash

# Script de démarrage rapide pour le développement
echo "🚀 Démarrage de l'environnement de développement..."

# Vérifier si le backend est déjà en cours
if ! pgrep -f "main_minimal.py" > /dev/null; then
    echo "📡 Démarrage du backend..."
    cd /workspaces/front_end/back_end
    python main_minimal.py &
    BACKEND_PID=$!
    echo "Backend démarré avec PID: $BACKEND_PID"
    cd ..
else
    echo "✅ Backend déjà en cours d'exécution"
fi

# Attendre un peu que le backend démarre
sleep 3

# Vérifier si le frontend est déjà en cours
if ! pgrep -f "vite" > /dev/null; then
    echo "🎨 Démarrage du frontend..."
    npm start &
    FRONTEND_PID=$!
    echo "Frontend démarré avec PID: $FRONTEND_PID"
else
    echo "✅ Frontend déjà en cours d'exécution"
fi

echo "✨ Environnement prêt !"
echo "📱 Frontend: https://congenial-halibut-4qgp7jg67v35q-8080.app.github.dev"
echo "🔧 Backend: https://congenial-halibut-4qgp7jg67v35q-8000.app.github.dev"
echo "📚 API Docs: https://congenial-halibut-4qgp7jg67v35q-8000.app.github.dev/docs"
