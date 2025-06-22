#!/usr/bin/env python3
"""
Script pour supprimer la colonne 'etablissement' de la table 'enseignants'
"""

import sqlite3
import os
import sys

def remove_etablissement_column():
    """Supprime la colonne etablissement de la table enseignants"""

    # Chemin vers la base de données
    db_path = os.path.join(os.path.dirname(__file__), 'gestion_db.db')

    if not os.path.exists(db_path):
        print(f"❌ Base de données non trouvée: {db_path}")
        return False

    try:
        # Connexion à la base de données
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        print("🔍 Vérification de la structure actuelle de la table enseignants...")

        # Obtenir la structure de la table
        cursor.execute("PRAGMA table_info(enseignants)")
        columns = cursor.fetchall()

        print("📋 Colonnes actuelles:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")

        # Vérifier si la colonne etablissement existe
        etablissement_exists = any(col[1] == 'etablissement' for col in columns)

        if not etablissement_exists:
            print("✅ La colonne 'etablissement' n'existe déjà pas dans la table.")
            conn.close()
            return True

        print("🔄 Suppression de la colonne 'etablissement'...")

        # Sauvegarder les données existantes (sans la colonne etablissement)
        cursor.execute("""
            CREATE TABLE enseignants_new (
                id INTEGER PRIMARY KEY,
                user_id INTEGER UNIQUE,
                specialite TEXT,
                grade TEXT,
                photo TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)

        # Copier les données (sans etablissement)
        cursor.execute("""
            INSERT INTO enseignants_new (id, user_id, specialite, grade, photo)
            SELECT id, user_id, specialite, grade, photo
            FROM enseignants
        """)

        # Supprimer l'ancienne table
        cursor.execute("DROP TABLE enseignants")

        # Renommer la nouvelle table
        cursor.execute("ALTER TABLE enseignants_new RENAME TO enseignants")

        # Valider les changements
        conn.commit()

        print("✅ Colonne 'etablissement' supprimée avec succès!")

        # Vérifier la nouvelle structure
        cursor.execute("PRAGMA table_info(enseignants)")
        new_columns = cursor.fetchall()

        print("📋 Nouvelle structure de la table enseignants:")
        for col in new_columns:
            print(f"  - {col[1]} ({col[2]})")

        conn.close()
        return True

    except Exception as e:
        print(f"❌ Erreur lors de la suppression de la colonne: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def main():
    """Fonction principale"""
    print("🚀 Début de la migration - Suppression du champ 'etablissement'")
    print("=" * 60)

    success = remove_etablissement_column()

    print("=" * 60)
    if success:
        print("✅ Migration terminée avec succès!")
        print("ℹ️  Le champ 'etablissement' a été supprimé de la table 'enseignants'")
    else:
        print("❌ Échec de la migration!")
        sys.exit(1)

if __name__ == "__main__":
    main()
