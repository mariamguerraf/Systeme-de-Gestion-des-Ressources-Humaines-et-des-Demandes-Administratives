#!/bin/bash
# Script de nettoyage des fichiers de test et debug temporaires

echo "🧹 Nettoyage des fichiers temporaires et de test..."

cd /workspaces/front_end

# Créer un dossier pour sauvegarder les tests importants avant suppression
mkdir -p backup_tests_final

# Lister les fichiers qui vont être supprimés (pour information)
echo "📋 Fichiers qui seront supprimés :"
echo "- Fichiers de test HTML temporaires"
echo "- Scripts de diagnostic temporaires"
echo "- Fichiers de validation temporaires"

# Sauvegarder les tests vraiment importants
echo "💾 Sauvegarde des tests importants..."
cp test_upload_photo.html backup_tests_final/ 2>/dev/null || echo "test_upload_photo.html non trouvé"
cp diagnostic_upload.html backup_tests_final/ 2>/dev/null || echo "diagnostic_upload.html non trouvé"

# Supprimer les fichiers de test temporaires du dossier racine
echo "🗑️ Suppression des fichiers temporaires..."

# Fichiers HTML de test
rm -f test_api_config.html
rm -f test_backend.html
rm -f test_direct_api.html
rm -f test_frontend_backend.html
rm -f test_login_direct.html
rm -f test_port_frontend.html

# Scripts de test temporaires
rm -f test_and_start.bat
rm -f test_backend.ps1
rm -f test_codespaces_urls.sh
rm -f test_connectivity.ps1
rm -f test_solution_complete.sh
rm -f test_update_enseignant.sh

# Fichiers Python de test temporaires
rm -f check_admin.py
rm -f diagnostic_backend.py
rm -f quick_test.py
rm -f test_backend_simple.py
rm -f test_connection.py

# Scripts de validation temporaires
rm -f validation_correction.ps1
rm -f fix_token_validation.sh

# Scripts de diagnostic temporaires
rm -f diagnostic_codespaces.sh

# Laisser les fichiers importants :
# - diagnostic_upload.html (utile pour debug upload)
# - test_upload_photo.html (test spécifique upload)
# - backup_tests/ (dossier de sauvegarde)
# - backup_docs/ (documentation)

echo "✅ Nettoyage terminé !"
echo "📁 Tests importants sauvegardés dans backup_tests_final/"
echo "🔧 Les outils de diagnostic et upload sont conservés"

# Afficher ce qui reste
echo ""
echo "📋 Fichiers conservés :"
ls -la | grep -E "(test|Test|diagnostic)" | head -5
