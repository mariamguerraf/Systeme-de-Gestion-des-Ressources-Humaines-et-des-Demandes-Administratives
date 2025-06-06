#!/bin/bash

echo "🚀 Démarrage de l'application FastAPI avec Ubuntu/WSL"
echo "=================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Aller dans le dossier backend
cd back_end

print_info "1. Vérification de Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_status "Python détecté: $PYTHON_VERSION"
else
    print_error "Python3 n'est pas installé"
    exit 1
fi

print_info "2. Création/Activation de l'environnement virtuel..."
if [ ! -d "venv" ]; then
    print_info "Création de l'environnement virtuel..."
    python3 -m venv venv
fi

source venv/bin/activate
print_status "Environnement virtuel activé"

print_info "3. Installation des dépendances..."
pip install --upgrade pip
pip install fastapi "uvicorn[standard]" python-multipart

print_info "4. Démarrage du serveur..."
print_status "🌐 Serveur disponible sur http://localhost:8000"
print_status "📚 Documentation: http://localhost:8000/docs"
echo ""

if [ -f "main_minimal.py" ]; then
    python3 -m uvicorn main_minimal:app --host 0.0.0.0 --port 8000 --reload
else
    python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
fi
