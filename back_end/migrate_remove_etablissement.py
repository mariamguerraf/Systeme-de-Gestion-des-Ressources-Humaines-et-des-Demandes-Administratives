#!/usr/bin/env python3
"""
Migration pour supprimer la colonne 'etablissement' de la table 'enseignants'
"""

import sqlite3
import os
import sys

def migrate_database():
    """Supprime la colonne etablissement de la table enseignants"""
    db_path = os.path.join(os.path.dirname(__file__), "gestion_db.db")

    if not os.path.exists(db_path):
        print(f"❌ Base de données non trouvée: {db_path}")
        return False

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        print("🔍 Vérification de la structure actuelle de la table enseignants...")

        # Vérifier si la colonne etablissement existe
        cursor.execute("PRAGMA table_info(enseignants)")
        columns = cursor.fetchall()

        print("📋 Colonnes actuelles:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")

        # Vérifier si la colonne etablissement existe
        has_etablissement = any(col[1] == 'etablissement' for col in columns)

        if not has_etablissement:
            print("✅ La colonne 'etablissement' n'existe pas. Aucune migration nécessaire.")
            return True

        print("\n🚀 Début de la migration...")

        # Créer une nouvelle table sans la colonne etablissement
        cursor.execute("""
            CREATE TABLE enseignants_new (
                id INTEGER PRIMARY KEY,
                user_id INTEGER UNIQUE,
                specialite VARCHAR,
                grade VARCHAR,
                photo VARCHAR,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)

        print("✅ Nouvelle table créée")

        # Copier les données (sans la colonne etablissement)
        cursor.execute("""
            INSERT INTO enseignants_new (id, user_id, specialite, grade, photo)
            SELECT id, user_id, specialite, grade, photo
            FROM enseignants
        """)

        print("✅ Données copiées")

        # Supprimer l'ancienne table
        cursor.execute("DROP TABLE enseignants")
        print("✅ Ancienne table supprimée")

        # Renommer la nouvelle table
        cursor.execute("ALTER TABLE enseignants_new RENAME TO enseignants")
        print("✅ Nouvelle table renommée")

        # Valider les changements
        conn.commit()

        # Vérifier la nouvelle structure
        cursor.execute("PRAGMA table_info(enseignants)")
        new_columns = cursor.fetchall()

        print("\n📋 Nouvelle structure de la table enseignants:")
        for col in new_columns:
            print(f"  - {col[1]} ({col[2]})")

        print("\n✅ Migration terminée avec succès!")

        return True

    except Exception as e:
        print(f"❌ Erreur lors de la migration: {e}")
        conn.rollback()
        return False

    finally:
        conn.close()

if __name__ == "__main__":
    print("🔄 Migration: Suppression de la colonne 'etablissement'")
    print("=" * 50)

    success = migrate_database()

    if success:
        print("\n🎉 Migration réussie!")
        sys.exit(0)
    else:
        print("\n💥 Migration échouée!")
        sys.exit(1)
