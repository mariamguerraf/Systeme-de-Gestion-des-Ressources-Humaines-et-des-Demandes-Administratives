#!/bin/bash

# Script de démarrage du backend

echo "🚀 Démarrage du backend FastAPI..."

# Créer un environnement virtuel si il n'existe pas
if [ ! -d "venv" ]; then
    echo "📦 Création de l'environnement virtuel..."
    python3 -m venv venv
fi

# Activer l'environnement virtuel
echo "🔧 Activation de l'environnement virtuel..."
source venv/bin/activate

# Installer les dépendances
echo "📥 Installation des dépendances..."
pip install -r requirements.txt

# Démarrer l'application
echo "🎯 Démarrage de l'API sur http://localhost:8000"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
