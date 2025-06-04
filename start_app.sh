#!/bin/bash

echo "🚀 Démarrage complet de l'application de gestion administrative"
echo "=============================================================="

# Fonction pour vérifier si un port est utilisé
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        return 0
    else
        return 1
    fi
}

# Fonction pour attendre qu'un service soit prêt
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Attente de $name..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo "✅ $name est prêt !"
            return 0
        fi
        echo "   Tentative $attempt/$max_attempts..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $name n'a pas démarré dans les temps"
    return 1
}

echo "🐘 Étape 1: Démarrage de PostgreSQL..."
cd /workspaces/backend
if ! docker-compose ps | grep -q gestion_postgres.*Up; then
    docker-compose up -d
    echo "   PostgreSQL démarré"
else
    echo "   PostgreSQL déjà en cours d'exécution"
fi

echo "🗃️ Étape 2: Vérification de la base de données..."
if ! python init_db.py 2>/dev/null | grep -q "Les utilisateurs de test existent déjà"; then
    echo "   Initialisation de la base de données..."
    source venv/bin/activate && python init_db.py
else
    echo "   Base de données déjà initialisée"
fi

echo "🌐 Étape 3: Démarrage du backend FastAPI..."
if check_port 8001; then
    echo "   Backend déjà en cours d'exécution sur le port 8001"
else
    source venv/bin/activate
    nohup python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001 > backend.log 2>&1 &
    wait_for_service "http://localhost:8001/" "Backend API"
fi

echo "⚛️ Étape 4: Démarrage du frontend React..."
cd /workspaces/front_end
if check_port 5173; then
    echo "   Frontend déjà en cours d'exécution sur le port 5173"
else
    nohup npm run dev -- --port 5173 --host 0.0.0.0 > frontend.log 2>&1 &
    wait_for_service "http://localhost:5173/" "Frontend React"
fi

echo ""
echo "🎉 Application démarrée avec succès !"
echo "======================================"
echo ""
echo "🌐 Services disponibles:"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:8001"
echo "   API Docs:  http://localhost:8001/docs"
echo "   Adminer:   http://localhost:8081"
echo ""
echo "👤 Comptes de test:"
echo "   Admin:        admin@gestion.com (password123)"
echo "   Secrétaire:   secretaire@gestion.com (password123)"
echo "   Enseignant:   enseignant@gestion.com (password123)"
echo "   Fonctionnaire: fonctionnaire@gestion.com (password123)"
echo ""
echo "📋 Commandes utiles:"
echo "   - Arrêter tout: pkill -f 'uvicorn\\|vite' && docker-compose down"
echo "   - Logs backend: tail -f /workspaces/backend/backend.log"
echo "   - Logs frontend: tail -f /workspaces/front_end/frontend.log"
echo ""
echo "🧪 Test rapide de l'authentification:"
TOKEN=$(curl -s -X POST "http://localhost:8001/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=admin@gestion.com&password=password123" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
    echo "✅ Authentification testée avec succès"
    echo "   Token généré: ${TOKEN:0:50}..."
else
    echo "❌ Problème avec l'authentification"
fi
