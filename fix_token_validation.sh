#!/bin/bash
# Script pour corriger toutes les validations de token admin

echo "🔧 Correction des validations de token admin..."

cd /workspaces/front_end/back_end

# Créer une sauvegarde
cp main_minimal.py main_minimal_backup_$(date +%Y%m%d_%H%M%S).py

# Remplacer toutes les occurrences de la validation incorrecte
sed -i 's/if len(parts) >= 4 and parts\[3\] == "admin":/if len(parts) >= 4 and (parts[3] == "admin" or (len(parts) >= 5 and parts[4] == "admin")):/' main_minimal.py

echo "✅ Toutes les validations de token admin corrigées"
echo "📁 Sauvegarde créée: main_minimal_backup_$(date +%Y%m%d_%H%M%S).py"

# Vérifier les changements
echo "🔍 Nouvelles validations:"
grep -n "parts\[3\] == \"admin\" or" main_minimal.py | head -3
