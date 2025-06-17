#!/bin/bash

# Script de démarrage complet pour l'application
echo "🚀 Démarrage de l'application front-end + back-end..."

# Vérifier que nous sommes dans un Codespace
if [ -z "$CODESPACE_NAME" ]; then
    echo "❌ Erreur: Ce script doit être exécuté dans un GitHub Codespace"
    exit 1
fi

echo "✅ Codespace détecté: $CODESPACE_NAME"

# Étape 1: Configuration des ports
echo ""
echo "📡 Étape 1: Configuration des ports comme publics..."
./setup_codespaces_ports.sh

# Étape 2: Configuration des URLs
echo ""
echo "🔧 Étape 2: Configuration des URLs..."
./setup_codespaces.sh

# Étape 3: Démarrage du backend
echo ""
echo "🔙 Étape 3: Démarrage du backend FastAPI..."
cd back_end

# Vérifier si les dépendances Python sont installées
if ! /opt/conda/bin/conda run -p /opt/conda python -c "import fastapi" 2>/dev/null; then
    echo "📦 Installation des dépendances Python..."
    /opt/conda/bin/conda run -p /opt/conda pip install -r requirements.txt
fi

echo "🔙 Lancement du serveur backend sur le port 8000..."
/opt/conda/bin/conda run -p /opt/conda python main_minimal.py &
BACKEND_PID=$!

echo "✅ Backend démarré avec PID: $BACKEND_PID"

# Attendre un peu que le backend se lance
sleep 3

# Étape 4: Démarrage du frontend
echo ""
echo "🔝 Étape 4: Démarrage du frontend React/Vite..."
cd ..

# Vérifier si les dépendances Node.js sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances Node.js..."
    npm install
fi

echo "🔝 Lancement du serveur frontend sur le port 8080..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Frontend démarré avec PID: $FRONTEND_PID"

echo ""
echo "🎉 Application démarrée avec succès!"
echo ""
echo "🔗 URLs d'accès:"
echo "   - Frontend: https://${CODESPACE_NAME}-8080.app.github.dev"
echo "   - Backend:  https://${CODESPACE_NAME}-8000.app.github.dev"
echo ""
echo "📋 Processus en cours:"
echo "   - Backend PID: $BACKEND_PID"
echo "   - Frontend PID: $FRONTEND_PID"
echo ""
echo "⚠️  Pour arrêter l'application:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   ou utilisez Ctrl+C dans les terminaux respectifs"
echo ""
echo "📊 Surveillez les logs dans les terminaux pour diagnostiquer d'éventuels problèmes."

# Fonction de nettoyage à la sortie
cleanup() {
    echo ""
    echo "🛑 Arrêt de l'application..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Application arrêtée"
}

# Configurer le signal de sortie
trap cleanup EXIT

# Attendre que l'utilisateur arrête le script
echo ""
echo "👀 Appuyez sur Ctrl+C pour arrêter l'application..."
wait
