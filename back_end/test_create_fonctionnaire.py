#!/usr/bin/env python3

import sqlite3
import sys
import os

# Ajouter le répertoire parent au PATH pour importer les modules
sys.path.append('/workspaces/front_end/back_end')

def get_sqlite_connection():
    """Connexion à SQLite avec timeout et WAL mode"""
    db_path = os.path.join('/workspaces/front_end/back_end', 'gestion_db.db')
    conn = sqlite3.connect(db_path, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    return conn

def test_create_fonctionnaire():
    print("Testing create fonctionnaire...")
    
    fonctionnaire_data = {
        'nom': 'Martin',
        'prenom': 'Sophie',
        'email': 'sophie.martin@test.com',
        'telephone': '0123456789',
        'adresse': '123 Rue de la Paix',
        'cin': 'SM654321',
        'password': 'test123',
        'service': 'Finance',
        'poste': 'Comptable',
        'grade': 'Catégorie A'
    }
    
    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()
        
        # Extraire les données utilisateur
        user_data = {
            'email': fonctionnaire_data.get('email'),
            'nom': fonctionnaire_data.get('nom'),
            'prenom': fonctionnaire_data.get('prenom'),
            'telephone': fonctionnaire_data.get('telephone'),
            'adresse': fonctionnaire_data.get('adresse'),
            'cin': fonctionnaire_data.get('cin'),
            'password': fonctionnaire_data.get('password', 'default_password')
        }
        
        print(f"Checking if email exists: {user_data['email']}")
        
        # Vérifier que l'email n'existe pas déjà dans SQLite
        cursor.execute("SELECT id FROM users WHERE email = ?", (user_data['email'],))
        existing_user = cursor.fetchone()
        if existing_user:
            print(f"User already exists with ID: {existing_user['id']}")
            return
        
        print("Inserting user...")
        # Insérer l'utilisateur
        cursor.execute('''
            INSERT INTO users (email, nom, prenom, telephone, adresse, cin, hashed_password, role)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'FONCTIONNAIRE')
        ''', (
            user_data['email'],
            user_data['nom'],
            user_data['prenom'],
            user_data['telephone'],
            user_data['adresse'],
            user_data['cin'],
            f"hashed_{user_data['password']}"
        ))
        
        user_id = cursor.lastrowid
        print(f"User created with ID: {user_id}")
        
        # Insérer les données fonctionnaire
        fonctionnaire_info = {
            'service': fonctionnaire_data.get('service'),
            'poste': fonctionnaire_data.get('poste'),
            'grade': fonctionnaire_data.get('grade')
        }
        
        print("Inserting fonctionnaire...")
        cursor.execute('''
            INSERT INTO fonctionnaires (user_id, service, poste, grade)
            VALUES (?, ?, ?, ?)
        ''', (
            user_id,
            fonctionnaire_info['service'],
            fonctionnaire_info['poste'],
            fonctionnaire_info['grade']
        ))
        
        fonctionnaire_id = cursor.lastrowid
        print(f"Fonctionnaire created with ID: {fonctionnaire_id}")
        
        conn.commit()
        
        # Récupérer le fonctionnaire créé avec toutes les données pour le retourner
        print("Fetching created fonctionnaire...")
        cursor.execute('''
            SELECT 
                f.id, f.user_id, f.service, f.poste, f.grade,
                u.nom, u.prenom, u.email, u.telephone, u.adresse, u.cin, u.is_active
            FROM fonctionnaires f
            JOIN users u ON f.user_id = u.id
            WHERE f.id = ?
        ''', (fonctionnaire_id,))
        
        row = cursor.fetchone()
        if row:
            print("Created fonctionnaire:")
            print(f"  ID: {row['id']}")
            print(f"  Name: {row['prenom']} {row['nom']}")
            print(f"  Email: {row['email']}")
            print(f"  Service: {row['service']}")
            print(f"  Poste: {row['poste']}")
            print(f"  Grade: {row['grade']}")
        else:
            print("ERROR: Could not fetch created fonctionnaire")
        
        conn.close()
        print("SUCCESS: Fonctionnaire created successfully")
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_create_fonctionnaire()
