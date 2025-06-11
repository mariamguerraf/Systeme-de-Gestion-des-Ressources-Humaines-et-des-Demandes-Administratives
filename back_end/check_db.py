#!/usr/bin/env python3
import sqlite3
import os

db_path = 'gestion_db.db'
if not os.path.exists(db_path):
    print(f"Erreur: Le fichier {db_path} n'existe pas")
    exit(1)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Lister les tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print("Tables dans la base SQLite:")
    for table in tables:
        table_name = table[0]
        print(f"- {table_name}")
        
        # Compter les enregistrements
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"  Nombre d'enregistrements: {count}")
        
        # Afficher quelques exemples pour les tables principales
        if table_name in ['users', 'enseignants']:
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 3")
            rows = cursor.fetchall()
            print(f"  Exemples:")
            for row in rows:
                print(f"    {row}")
    
    conn.close()
    print("\nVérification terminée avec succès!")
    
except Exception as e:
    print(f"Erreur: {e}")
