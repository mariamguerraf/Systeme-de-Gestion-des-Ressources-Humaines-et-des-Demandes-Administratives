#!/bin/bash

# Script pour configurer les ports Codespaces comme publics
echo "🔧 Configuration des ports Codespaces..."

# Fonction pour rendre un port public
make_port_public() {
    local port=$1
    local label=$2

    echo "📡 Configuration du port $port ($label) comme public..."

    # Utiliser l'API GitHub Codespaces pour rendre le port public
    curl -X PATCH \
        -H "Accept: application/vnd.github+json" \
        -H "Authorization: Bearer $GITHUB_TOKEN" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "https://api.github.com/user/codespaces/$CODESPACE_NAME/ports/$port" \
        -d "{\"visibility\":\"public\"}" 2>/dev/null

    # Alternative: utiliser gh CLI si disponible
    if command -v gh &> /dev/null; then
        echo "🔄 Utilisation de gh CLI pour le port $port..."
        gh codespace ports visibility $port:public --codespace $CODESPACE_NAME 2>/dev/null || true
    fi

    echo "✅ Port $port configuré comme public"
}

# Configuration des ports
echo "🚀 Démarrage de la configuration des ports..."

# Port 8080 pour le frontend (Vite/React)
make_port_public 8080 "Frontend"

# Port 8000 pour le backend (FastAPI)
make_port_public 8000 "Backend"

# Port 3000 (au cas où)
make_port_public 3000 "Development"

# Port 5173 (port par défaut de Vite)
make_port_public 5173 "Vite Dev Server"

echo ""
echo "🎉 Configuration terminée!"
echo ""
echo "📋 Ports configurés comme publics:"
echo "   - 8080: Frontend (React/Vite)"
echo "   - 8000: Backend (FastAPI)"
echo "   - 3000: Development"
echo "   - 5173: Vite Dev Server"
echo ""
echo "🔗 URLs d'accès:"
echo "   - Frontend: https://$CODESPACE_NAME-8080.app.github.dev"
echo "   - Backend:  https://$CODESPACE_NAME-8000.app.github.dev"
echo ""
echo "⚠️  Note: Il peut y avoir un délai de quelques secondes avant que les changements prennent effet."
echo ""
echo "🔄 Pour vérifier l'état des ports, utilisez: gh codespace ports"
