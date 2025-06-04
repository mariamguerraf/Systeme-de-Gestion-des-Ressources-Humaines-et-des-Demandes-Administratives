#!/bin/bash

echo "🔍 Diagnostic complet de l'application"
echo "======================================"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}1. Vérification des serveurs...${NC}"

# Backend
if curl -s http://localhost:8001/ > /dev/null; then
    echo -e "${GREEN}✅ Backend disponible (port 8001)${NC}"
else
    echo -e "${RED}❌ Backend non disponible${NC}"
fi

# Frontend
if curl -s http://localhost:8082/ > /dev/null; then
    echo -e "${GREEN}✅ Frontend disponible (port 8082)${NC}"
else
    echo -e "${RED}❌ Frontend non disponible${NC}"
fi

echo ""
echo -e "${BLUE}2. Test des routes frontend...${NC}"

# Test de la page d'accueil
HOME_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/)
echo "Page d'accueil: $HOME_STATUS"

# Test de la route de test
TEST_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/test-admin)
echo "Route de test: $TEST_STATUS"

echo ""
echo -e "${BLUE}3. Test de l'API d'authentification...${NC}"

# Test de connexion
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@test.com&password=admin123")

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✅ API de connexion fonctionne${NC}"
    
    # Test du profil
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    USER_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8001/auth/me)
    
    if echo "$USER_RESPONSE" | grep -q '"role":"admin"'; then
        echo -e "${GREEN}✅ API de profil fonctionne${NC}"
    else
        echo -e "${RED}❌ API de profil en erreur${NC}"
    fi
else
    echo -e "${RED}❌ API de connexion en erreur${NC}"
fi

echo ""
echo -e "${YELLOW}📋 Instructions de test manuel :${NC}"
echo "1. Ouvrez http://localhost:8082 dans votre navigateur"
echo "2. Ouvrez la console du navigateur (F12)"
echo "3. Testez les boutons dans l'ordre :"
echo "   a) 'Aller à /test-admin' (test de navigation simple)"
echo "   b) 'Se connecter (Test)' (test de connexion + navigation)"
echo "   c) 'Se connecter' (formulaire principal)"
echo "4. Observez les logs dans la console pour identifier le problème"

echo ""
echo -e "${BLUE}🔑 Comptes de test :${NC}"
echo "• admin@test.com / admin123"
echo "• secretaire@test.com / secret123"
echo "• enseignant@test.com / enseign123"
echo "• fonctionnaire@test.com / fonct123"
