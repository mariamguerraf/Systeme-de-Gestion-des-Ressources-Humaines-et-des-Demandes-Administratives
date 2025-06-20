#!/usr/bin/env python3
import sqlite3
import os

# Aller dans le bon répertoire
os.chdir('/workspaces/front_end/back_end')

# Créer/modifier directement la base de données SQLite
conn = sqlite3.connect('gestion_db.db')
cursor = conn.cursor()

print("🔍 Vérification de la structure actuelle de la base de données...")

# Vérifier si la table enseignants existe
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='enseignants'")
if not cursor.fetchone():
    print("❌ Table enseignants n'existe pas")
    conn.close()
    exit(1)

# Vérifier si la table enseignants existe et si elle a la colonne photo
cursor.execute('PRAGMA table_info(enseignants)')
columns = cursor.fetchall()
column_names = [col[1] for col in columns]
print(f"📋 Colonnes actuelles: {column_names}")

# Ajouter la colonne photo si elle n'existe pas
if 'photo' not in column_names:
    try:
        cursor.execute('ALTER TABLE enseignants ADD COLUMN photo TEXT')
        print("✅ Colonne photo ajoutée avec succès")
    except Exception as e:
        print(f"❌ Erreur lors de l'ajout de la colonne photo: {e}")
else:
    print("ℹ️ Colonne photo existe déjà")

# Vérifier la nouvelle structure
cursor.execute('PRAGMA table_info(enseignants)')
columns = cursor.fetchall()
new_column_names = [col[1] for col in columns]
print(f"📋 Nouvelles colonnes: {new_column_names}")

conn.commit()
conn.close()
print("🎉 Base de données mise à jour!")
