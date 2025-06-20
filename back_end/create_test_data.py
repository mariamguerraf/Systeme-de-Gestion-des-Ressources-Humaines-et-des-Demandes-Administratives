#!/usr/bin/env python3
import sqlite3
import os
from datetime import datetime

# Aller dans le bon répertoire
os.chdir('/workspaces/front_end/back_end')

# Se connecter à la base de données
conn = sqlite3.connect('gestion_db.db')
cursor = conn.cursor()

print("🔍 Création de données de test pour vérifier l'upload de photo...")

# Créer un utilisateur enseignant de test s'il n'existe pas
cursor.execute("SELECT * FROM users WHERE email = 'enseignant.test@exemple.com'")
if not cursor.fetchone():
    # Créer l'utilisateur
    cursor.execute("""
        INSERT INTO users (email, nom, prenom, telephone, adresse, cin, hashed_password, role, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        'enseignant.test@exemple.com',
        'Dupont',
        'Jean',
        '0123456789',
        '123 Rue de la Paix',
        'AB123456',
        'hashed_password_here',  # Mot de passe haché
        'ENSEIGNANT',
        True,
        datetime.now().isoformat()
    ))
    
    user_id = cursor.lastrowid
    print(f"✅ Utilisateur enseignant créé avec ID: {user_id}")
    
    # Créer l'entrée enseignant correspondante
    cursor.execute("""
        INSERT INTO enseignants (user_id, specialite, grade, etablissement, photo)
        VALUES (?, ?, ?, ?, ?)
    """, (
        user_id,
        'Informatique',
        'Professeur',
        'Lycée Victor Hugo',
        None  # Pas de photo pour l'instant
    ))
    
    enseignant_id = cursor.lastrowid
    print(f"✅ Enseignant créé avec ID: {enseignant_id}")
else:
    print("ℹ️ Utilisateur enseignant de test existe déjà")

# Vérifier les données créées
cursor.execute("""
    SELECT u.id, u.email, u.nom, u.prenom, e.id as enseignant_id, e.specialite, e.photo
    FROM users u
    LEFT JOIN enseignants e ON u.id = e.user_id
    WHERE u.role = 'ENSEIGNANT'
""")

enseignants = cursor.fetchall()
print("\n📋 Enseignants dans la base de données:")
for ens in enseignants:
    print(f"  - User ID: {ens[0]}, Email: {ens[1]}, Nom: {ens[2]} {ens[3]}")
    print(f"    Enseignant ID: {ens[4]}, Spécialité: {ens[5]}, Photo: {ens[6] or 'Pas de photo'}")

conn.commit()
conn.close()
print("\n🎉 Données de test créées!")
