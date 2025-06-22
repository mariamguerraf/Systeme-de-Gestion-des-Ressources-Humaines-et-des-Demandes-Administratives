#!/usr/bin/env python3
"""
Script pour supprimer toutes les références à 'etablissement' du fichier main_minimal.py
"""

import re

def clean_main_minimal():
    file_path = "main_minimal.py"

    print("🔧 Nettoyage des références 'etablissement' dans main_minimal.py...")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Remplacements dans les requêtes SELECT
        content = re.sub(
            r'e\.id, e\.user_id, e\.specialite, e\.grade, e\.etablissement, e\.photo,',
            'e.id, e.user_id, e.specialite, e.grade, e.photo,',
            content
        )

        # Remplacements dans les dictionnaires de réponse
        content = re.sub(
            r'"etablissement": row\[\'etablissement\'\],',
            '',
            content
        )

        # Remplacements dans les requêtes UPDATE
        content = re.sub(
            r'SET specialite = \?, grade = \?, etablissement = \?',
            'SET specialite = ?, grade = ?',
            content
        )

        # Remplacements dans les paramètres UPDATE
        content = re.sub(
            r'enseignant_data\.get\(\'etablissement\'\),\s*enseignant_id',
            'enseignant_id',
            content
        )

        # Remplacements dans les autres dictionnaires
        content = re.sub(
            r'"etablissement": enseignant\.etablissement or "",',
            '',
            content
        )

        content = re.sub(
            r'"etablissement": "",',
            '',
            content
        )

        # Nettoyer les virgules en trop
        content = re.sub(r',\s*\n\s*}', '\n    }', content)
        content = re.sub(r',\s*\n\s*\)', '\n        )', content)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print("✅ Nettoyage terminé !")
        return True

    except Exception as e:
        print(f"❌ Erreur : {e}")
        return False

if __name__ == "__main__":
    success = clean_main_minimal()
    if success:
        print("🎉 Script de nettoyage exécuté avec succès !")
    else:
        print("💥 Échec du nettoyage !")
