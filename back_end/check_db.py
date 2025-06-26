#!/usr/bin/env python3
import sqlite3

def check_database():
    try:
        conn = sqlite3.connect('gestion_db.db')
        cursor = conn.cursor()
        
        # Vérifier les tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print("Tables:", [t[0] for t in tables])
        
        # Vérifier la structure de demande_documents
        try:
            cursor.execute("PRAGMA table_info(demande_documents)")
            info = cursor.fetchall()
            print("demande_documents structure:", info)
        except Exception as e:
            print("Erreur demande_documents:", e)
        
        # Vérifier quelques demandes avec leurs documents
        try:
            cursor.execute("""
                SELECT d.id, d.titre, d.type_demande, 
                       COUNT(doc.id) as nb_documents
                FROM demandes d
                LEFT JOIN demande_documents doc ON d.id = doc.demande_id
                WHERE d.type_demande = 'ORDRE_MISSION'
                GROUP BY d.id
                ORDER BY d.created_at DESC
                LIMIT 5
            """)
            demandes = cursor.fetchall()
            print("Demandes ordre de mission avec nb documents:", demandes)
        except Exception as e:
            print("Erreur requête demandes:", e)
            
        conn.close()
        
    except Exception as e:
        print("Erreur générale:", e)

if __name__ == "__main__":
    check_database()
