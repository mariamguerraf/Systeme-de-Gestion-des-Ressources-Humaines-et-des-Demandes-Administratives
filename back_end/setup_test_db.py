                                #!/usr/bin/env python3

import sqlite3
import os

# Créer la base de données avec la structure correcte
def setup_database():
    # Supprimer l'ancienne base si elle existe
    if os.path.exists('gestion_db.db'):
        os.remove('gestion_db.db')
        print('Ancienne base de données supprimée')

    # Créer la nouvelle base de données
    conn = sqlite3.connect('gestion_db.db')
    cursor = conn.cursor()

    # Créer la table users
    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            nom TEXT NOT NULL,
            prenom TEXT NOT NULL,
            telephone TEXT,
            adresse TEXT,
            cin TEXT UNIQUE,
            hashed_password TEXT NOT NULL,
            role TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP
        )
    ''')

    # Créer la table enseignants
    cursor.execute('''
        CREATE TABLE enseignants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            specialite TEXT,
            grade TEXT,
            etablissement TEXT,
            photo TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    # Créer la table fonctionnaires
    cursor.execute('''
        CREATE TABLE fonctionnaires (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            service TEXT,
            poste TEXT,
            grade TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    # Créer la table demandes
    cursor.execute('''
        CREATE TABLE demandes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type_demande TEXT NOT NULL,
            titre TEXT NOT NULL,
            description TEXT,
            date_debut TIMESTAMP,
            date_fin TIMESTAMP,
            statut TEXT DEFAULT 'EN_ATTENTE',
            commentaire_admin TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    # Créer des données de test
    # Admin
    cursor.execute('''
        INSERT INTO users (email, nom, prenom, hashed_password, role)
        VALUES ('admin@test.com', 'Admin', 'System', 'hashed_admin_password', 'ADMIN')
    ''')

    # Enseignants de test
    cursor.execute('''
        INSERT INTO users (email, nom, prenom, telephone, hashed_password, role)
        VALUES ('enseignant1@test.com', 'Dupont', 'Jean', '0123456789', 'hashed_password1', 'ENSEIGNANT')
    ''')
    user1_id = cursor.lastrowid

    cursor.execute('''
        INSERT INTO enseignants (user_id, specialite, grade, etablissement)
        VALUES (?, 'Informatique', 'Professeur', 'Lycée Victor Hugo')
    ''', (user1_id,))

    cursor.execute('''
        INSERT INTO users (email, nom, prenom, telephone, hashed_password, role)
        VALUES ('enseignant2@test.com', 'Martin', 'Marie', '0987654321', 'hashed_password2', 'ENSEIGNANT')
    ''')
    user2_id = cursor.lastrowid

    cursor.execute('''
        INSERT INTO enseignants (user_id, specialite, grade, etablissement)
        VALUES (?, 'Mathématiques', 'Maître de conférences', 'Université Paris VII')
    ''', (user2_id,))

    # Fonctionnaires de test
    cursor.execute('''
        INSERT INTO users (email, nom, prenom, hashed_password, role)
        VALUES ('fonctionnaire1@test.com', 'Leroy', 'Pierre', 'hashed_password3', 'FONCTIONNAIRE')
    ''')
    user3_id = cursor.lastrowid

    cursor.execute('''
        INSERT INTO fonctionnaires (user_id, service, poste, grade)
        VALUES (?, 'Ressources Humaines', 'Gestionnaire', 'Catégorie B')
    ''', (user3_id,))

    conn.commit()
    conn.close()

    print('Base de données créée avec succès!')
    print('Données de test ajoutées:')
    print('- 1 Admin')
    print('- 2 Enseignants')
    print('- 1 Fonctionnaire')

if __name__ == "__main__":
    setup_database()
