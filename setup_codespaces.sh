#!/bin/bash

# Script pour détecter et configurer automatiquement les URLs Codespaces
echo "🔍 Détection automatique de l'environnement Codespaces..."

# Vérifier si nous sommes dans un Codespace
if [ -z "$CODESPACE_NAME" ]; then
    echo "❌ Erreur: Ce script doit être exécuté dans un GitHub Codespace"
    echo "   Variable CODESPACE_NAME non trouvée"
    exit 1
fi

echo "✅ Codespace détecté: $CODESPACE_NAME"

# Construire les URLs
FRONTEND_URL="https://${CODESPACE_NAME}-8080.app.github.dev"
BACKEND_URL="https://${CODESPACE_NAME}-8000.app.github.dev"

echo ""
echo "🌐 URLs détectées:"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend:  $BACKEND_URL"

# Mettre à jour le fichier api.ts
API_FILE="/workspaces/front_end/src/services/api.ts"

if [ -f "$API_FILE" ]; then
    echo ""
    echo "🔧 Mise à jour de la configuration API..."

    # Créer une sauvegarde
    cp "$API_FILE" "${API_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "💾 Sauvegarde créée: ${API_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

    # Mettre à jour l'URL de l'API
    sed -i "s|const API_BASE_URL = '[^']*';|const API_BASE_URL = '${BACKEND_URL}/';|g" "$API_FILE"

    echo "✅ Fichier api.ts mis à jour avec l'URL: ${BACKEND_URL}/"
else
    echo "❌ Fichier api.ts non trouvé à l'emplacement: $API_FILE"
fi

# Vérifier si le fichier vite.config.ts existe et le mettre à jour si nécessaire
VITE_CONFIG="/workspaces/front_end/vite.config.ts"
if [ -f "$VITE_CONFIG" ]; then
    echo ""
    echo "🔧 Vérification de la configuration Vite..."

    # Vérifier si la configuration du serveur est correcte
    if grep -q "host.*::" "$VITE_CONFIG" && grep -q "port.*8080" "$VITE_CONFIG"; then
        echo "✅ Configuration Vite correcte (host: '::' et port: 8080)"
    else
        echo "⚠️  Configuration Vite à vérifier manuellement"
    fi
fi

echo ""
echo "🎯 Configuration terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Exécutez: ./setup_codespaces_ports.sh (pour rendre les ports publics)"
echo "   2. Démarrez le backend: cd back_end && python main_minimal.py"
echo "   3. Démarrez le frontend: npm run dev"
echo ""
echo "🔗 URLs finales:"
echo "   - Frontend: $FRONTEND_URL"
echo "   - Backend:  $BACKEND_URL"
