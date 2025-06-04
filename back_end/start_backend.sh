#!/bin/bash

# Script de démarrage pour l'application
echo "🚀 Démarrage de l'application de gestion administrative..."

# Se déplacer dans le dossier backend
cd /workspaces/front_end/back_end

# Activer l'environnement virtuel
echo "📦 Activation de l'environnement virtuel..."
source venv/bin/activate

# Vérifier si PostgreSQL fonctionne
echo "🐘 Vérification de PostgreSQL..."
docker-compose ps

# Démarrer le serveur FastAPI
echo "🌐 Démarrage du serveur FastAPI sur http://localhost:8000..."
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
