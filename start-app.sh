#!/bin/bash

echo "🚀 Démarrage complet de l'application Gestion Administrative"

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose."
    exit 1
fi

echo "📦 Démarrage de la base de données PostgreSQL..."
cd /workspaces/backend
docker-compose up -d

echo "⏳ Attente du démarrage de PostgreSQL..."
sleep 10

echo "🔧 Installation des dépendances du backend..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

echo "🎯 Démarrage du backend FastAPI..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "⏳ Attente du démarrage du backend..."
sleep 5

echo "🎨 Démarrage du frontend React..."
cd /workspaces/front_end
npm install
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Application démarrée avec succès !"
echo ""
echo "🌐 URLs d'accès :"
echo "   Frontend React:     http://localhost:5173"
echo "   Backend FastAPI:    http://localhost:8000"
echo "   API Documentation:  http://localhost:8000/docs"
echo "   Base de données:    http://localhost:8080 (Adminer)"
echo ""
echo "👤 Comptes de test :"
echo "   Admin:        admin@gestion.com / password123"
echo "   Secrétaire:   secretaire@gestion.com / password123"
echo "   Enseignant:   enseignant@gestion.com / password123"
echo "   Fonctionnaire: fonctionnaire@gestion.com / password123"
echo ""
echo "🛑 Pour arrêter l'application : Ctrl+C"

# Attendre et nettoyer à la fin
wait $BACKEND_PID $FRONTEND_PID
