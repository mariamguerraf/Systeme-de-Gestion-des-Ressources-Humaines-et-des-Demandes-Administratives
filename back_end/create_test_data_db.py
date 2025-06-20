#!/usr/bin/env python3
"""
Script pour créer des données de test dans la base de données SQLite
"""

from database import SessionLocal, engine
from models import Base, User, UserRole, Enseignant, Fonctionnaire
from sqlalchemy.orm import Session
import hashlib

# Créer les tables
Base.metadata.create_all(bind=engine)

def hash_password(password: str) -> str:
    """Hash simple pour les mots de passe de test"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_test_data():
    db = SessionLocal()
    try:
        # Vérifier si les données existent déjà
        if db.query(User).count() > 0:
            print("Des données existent déjà dans la base.")
            return

        # Créer un admin
        admin_user = User(
            email="admin@test.com",
            nom="Admin",
            prenom="Super",
            telephone="1234567890",
            adresse="123 Admin Street",
            cin="ADMIN123",
            hashed_password=hash_password("admin123"),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        # Créer des enseignants
        for i in range(1, 4):
            # Créer l'utilisateur
            user = User(
                email=f"enseignant{i}@test.com",
                nom=f"Enseignant{i}",
                prenom=f"Prof{i}",
                telephone=f"123456789{i}",
                adresse=f"123 Teacher Street {i}",
                cin=f"ENS{i:03d}",
                hashed_password=hash_password(f"enseignant{i}"),
                role=UserRole.ENSEIGNANT,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Créer le profil enseignant
            enseignant = Enseignant(
                user_id=user.id,
                specialite=["Informatique", "Mathématiques", "Physique"][i-1],
                grade=["Assistant", "Maître Assistant", "Professeur"][i-1],
                etablissement="Université de Test",
                photo=None  # Pas de photo initialement
            )
            db.add(enseignant)

        # Créer des fonctionnaires
        for i in range(1, 3):
            # Créer l'utilisateur
            user = User(
                email=f"fonctionnaire{i}@test.com",
                nom=f"Fonctionnaire{i}",
                prenom=f"Agent{i}",
                telephone=f"987654321{i}",
                adresse=f"456 Admin Street {i}",
                cin=f"FONC{i:03d}",
                hashed_password=hash_password(f"fonctionnaire{i}"),
                role=UserRole.FONCTIONNAIRE,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Créer le profil fonctionnaire
            fonctionnaire = Fonctionnaire(
                user_id=user.id,
                service=["RH", "Comptabilité"][i-1],
                poste=["Gestionnaire RH", "Comptable"][i-1],
                grade=["Grade A", "Grade B"][i-1]
            )
            db.add(fonctionnaire)

        db.commit()
        print("Données de test créées avec succès!")
        
        # Afficher un résumé
        print(f"Utilisateurs créés: {db.query(User).count()}")
        print(f"Enseignants créés: {db.query(Enseignant).count()}")
        print(f"Fonctionnaires créés: {db.query(Fonctionnaire).count()}")

    except Exception as e:
        print(f"Erreur lors de la création des données: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_data()
