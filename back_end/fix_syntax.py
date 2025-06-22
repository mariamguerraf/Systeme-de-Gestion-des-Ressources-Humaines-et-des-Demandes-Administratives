#!/usr/bin/env python3
"""
Script pour corriger les problèmes de syntaxe après nettoyage
"""

def fix_syntax_issues():
    file_path = "main_minimal.py"

    print("🔧 Correction des problèmes de syntaxe...")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Corriger les lignes vides dans les dictionnaires
        import re

        # Supprimer les lignes vides dans les dictionnaires
        content = re.sub(r'",\s*\n\s*\n\s*"', '",\n                "', content)

        # Corriger les virgules orphelines
        content = re.sub(r',\s*\n\s*}', '\n            }', content)
        content = re.sub(r',\s*\n\s*\)', '\n        )', content)

        # Corriger les doubles espaces
        content = re.sub(r'\n\n\n+', '\n\n', content)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print("✅ Correction terminée !")
        return True

    except Exception as e:
        print(f"❌ Erreur : {e}")
        return False

if __name__ == "__main__":
    success = fix_syntax_issues()
    if success:
        print("🎉 Correction réussie !")
    else:
        print("💥 Échec de la correction !")
