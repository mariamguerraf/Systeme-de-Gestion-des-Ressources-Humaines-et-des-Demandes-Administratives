#!/usr/bin/env python3
"""
Script simple pour créer les utilisateurs de test
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
import sys
import os

# Ajouter le répertoire parent au path
sys.path.append('/workspaces/backend')

from database import Base, SessionLocal
from models import User

def create_test_users():
    """Crée les utilisateurs de test"""

    # Contexte de hachage des mots de passe
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    # Ouvrir une session
    db = SessionLocal()

    try:
        # Créer les tables
        Base.metadata.create_all(bind=db.bind)

        # Supprimer les anciens utilisateurs
        db.query(User).delete()

        # Données des utilisateurs de test
        test_users = [
            {
                "email": "admin@test.com",
                "password": "admin123",
                "nom": "Admin",
                "prenom": "System",
                "role": "admin",
                "telephone": "0123456789",
                "adresse": "Admin Address",
                "cin": "CIN001"
            },
            {
                "email": "secretaire@test.com",
                "password": "secret123",
                "nom": "Martin",
                "prenom": "Sophie",
                "role": "secretaire",
                "telephone": "0123456790",
                "adresse": "Secretaire Address",
                "cin": "CIN002"
            },
            {
                "email": "enseignant@test.com",
                "password": "enseign123",
                "nom": "Dupont",
                "prenom": "Jean",
                "role": "enseignant",
                "telephone": "0123456791",
                "adresse": "Enseignant Address",
                "cin": "CIN003"
            },
            {
                "email": "fonctionnaire@test.com",
                "password": "fonct123",
                "nom": "Bernard",
                "prenom": "Marie",
                "role": "fonctionnaire",
                "telephone": "0123456792",
                "adresse": "Fonctionnaire Address",
                "cin": "CIN004"
            }
        ]

        # Créer les utilisateurs
        for user_data in test_users:
            user = User(
                email=user_data["email"],
                hashed_password=pwd_context.hash(user_data["password"]),
                nom=user_data["nom"],
                prenom=user_data["prenom"],
                role=user_data["role"],
                telephone=user_data["telephone"],
                adresse=user_data["adresse"],
                cin=user_data["cin"],
                is_active=True
            )
            db.add(user)
            print(f"Utilisateur créé: {user_data['email']} ({user_data['role']})")

        # Sauvegarder
        db.commit()
        print("\n✅ Tous les utilisateurs ont été créés avec succès!")

        # Vérifier
        users = db.query(User).all()
        print(f"\nNombre d'utilisateurs dans la base: {len(users)}")
        for user in users:
            print(f"- {user.email} ({user.role})")

    except Exception as e:
        print(f"❌ Erreur: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_users()
