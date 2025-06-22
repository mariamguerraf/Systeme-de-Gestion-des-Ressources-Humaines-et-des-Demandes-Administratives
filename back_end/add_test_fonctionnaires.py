#!/usr/bin/env python3
import sqlite3
import os
from pathlib import Path

def add_test_fonctionnaires():
    """Ajouter des fonctionnaires de test avec photos"""

    # Connexion à la base de données
    conn = sqlite3.connect('gestion_db.db')
    cursor = conn.cursor()

    try:
        # Créer l'utilisateur fonctionnaire s'il n'existe pas
        cursor.execute('''
            INSERT OR IGNORE INTO users (email, hashed_password, nom, prenom, role, is_active, telephone, adresse, cin)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            'fonctionnaire1@univ.ma',
            'hashed_password',
            'Alami',
            'Fatima',
            'FONCTIONNAIRE',
            1,
            '0661234567',
            '123 Rue Mohammed V, Rabat',
            'BK123456'
        ))

        cursor.execute('''
            INSERT OR IGNORE INTO users (email, hashed_password, nom, prenom, role, is_active, telephone, adresse, cin)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            'fonctionnaire2@univ.ma',
            'hashed_password',
            'Bennani',
            'Omar',
            'FONCTIONNAIRE',
            1,
            '0667890123',
            '456 Avenue Hassan II, Casablanca',
            'AB789012'
        ))

        # Récupérer les IDs des utilisateurs créés
        cursor.execute('SELECT id FROM users WHERE email = ?', ('fonctionnaire1@univ.ma',))
        user1_id = cursor.fetchone()[0]

        cursor.execute('SELECT id FROM users WHERE email = ?', ('fonctionnaire2@univ.ma',))
        user2_id = cursor.fetchone()[0]

        # Créer les fonctionnaires
        cursor.execute('''
            INSERT OR IGNORE INTO fonctionnaires (user_id, service, poste, grade, photo)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            user1_id,
            'Ressources Humaines',
            'Gestionnaire RH',
            'Administrateur Principal',
            '/uploads/images/fonctionnaire1.svg'
        ))

        cursor.execute('''
            INSERT OR IGNORE INTO fonctionnaires (user_id, service, poste, grade, photo)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            user2_id,
            'Services Financiers',
            'Comptable',
            'Administrateur',
            '/uploads/images/fonctionnaire2.svg'
        ))

        conn.commit()
        print("✅ Fonctionnaires de test ajoutés avec succès!")

        # Créer des images de test
        create_test_images()

    except Exception as e:
        print(f"❌ Erreur: {e}")
        conn.rollback()
    finally:
        conn.close()

def create_test_images():
    """Créer des images de test pour les fonctionnaires"""

    upload_dir = Path("uploads/images")
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Créer des images SVG simples pour les tests
    svg_content1 = '''<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="70" r="30" fill="#e91e63"/>
        <circle cx="100" cy="140" r="50" fill="#e91e63"/>
        <text x="100" y="180" text-anchor="middle" font-family="Arial" font-size="16" fill="white">FA</text>
    </svg>'''

    svg_content2 = '''<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="70" r="30" fill="#2196f3"/>
        <circle cx="100" cy="140" r="50" fill="#2196f3"/>
        <text x="100" y="180" text-anchor="middle" font-family="Arial" font-size="16" fill="white">OB</text>
    </svg>'''

    with open(upload_dir / "fonctionnaire1.svg", "w") as f:
        f.write(svg_content1)

    with open(upload_dir / "fonctionnaire2.svg", "w") as f:
        f.write(svg_content2)

    print("✅ Images de test créées!")

if __name__ == "__main__":
    add_test_fonctionnaires()
