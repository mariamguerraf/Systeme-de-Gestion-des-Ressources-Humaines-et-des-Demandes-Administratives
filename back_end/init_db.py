#!/usr/bin/env python3
"""
Script d'initialisation de la base de données
Crée les tables et insère les utilisateurs de test
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base
from models import User, Enseignant, Fonctionnaire, UserRole
from auth import get_password_hash
from config import settings

def init_database():
    """Initialise la base de données avec les tables et données de test"""

    # Créer le moteur de base de données
    engine = create_engine(settings.database_url)    # Créer toutes les tables
    print("Création des tables...")
    Base.metadata.create_all(bind=engine)
    
    # Créer une session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Créer toutes les tables
        print("Création des tables...")
        Base.metadata.create_all(bind=engine)
        
        # Vérifier si les utilisateurs existent déjà
        existing_admin = db.query(User).filter(User.email == "admin@gestion.com").first()
        if existing_admin:
            print("Les utilisateurs de test existent déjà.")
            return

        # Mot de passe commun pour tous les comptes de test
        test_password = "password123"
        hashed_password = get_password_hash(test_password)

        print("Création des utilisateurs de test...")        # Créer l'administrateur
        admin_user = User(
            email="admin@gestion.com",
            nom="Admin",
            prenom="System",
            telephone="0123456789",
            adresse="Adresse Admin",
            cin="CIN001",
            hashed_password=hashed_password,
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        
        # Créer la secrétaire
        secretaire_user = User(
            email="secretaire@gestion.com",
            nom="Dupont",
            prenom="Marie",
            telephone="0123456790",
            adresse="Adresse Secrétaire",
            cin="CIN002",
            hashed_password=hashed_password,
            role=UserRole.SECRETAIRE,
            is_active=True
        )
        db.add(secretaire_user)
        
        # Créer l'enseignant
        enseignant_user = User(
            email="enseignant@gestion.com",
            nom="Martin",
            prenom="Pierre",
            telephone="0123456791",
            adresse="Adresse Enseignant",
            cin="CIN003",
            hashed_password=hashed_password,
            role=UserRole.ENSEIGNANT,
            is_active=True
        )
        db.add(enseignant_user)
        
        # Créer le fonctionnaire
        fonctionnaire_user = User(
            email="fonctionnaire@gestion.com",
            nom="Durand",
            prenom="Sophie",
            telephone="0123456792",
            adresse="Adresse Fonctionnaire",
            cin="CIN004",
            hashed_password=hashed_password,
            role=UserRole.FONCTIONNAIRE,
            is_active=True
        )
        db.add(fonctionnaire_user)

        # Valider les changements pour obtenir les IDs
        db.commit()

        # Rafraîchir les objets pour obtenir les IDs
        db.refresh(enseignant_user)
        db.refresh(fonctionnaire_user)

        # Créer les profils spécialisés
        print("Création des profils spécialisés...")

        # Profil enseignant
        enseignant_profile = Enseignant(
            user_id=enseignant_user.id,
            specialite="Mathématiques",
            grade="Professeur Certifié",
            etablissement="Lycée Al-Khawarizmi"
        )
        db.add(enseignant_profile)

        # Profil fonctionnaire
        fonctionnaire_profile = Fonctionnaire(
            user_id=fonctionnaire_user.id,
            service="Ressources Humaines",
            poste="Gestionnaire RH",
            grade="Catégorie A"
        )
        db.add(fonctionnaire_profile)

        # Valider tous les changements
        db.commit()

        print("✅ Base de données initialisée avec succès!")
        print("\nComptes de test créés:")
        print("- admin@gestion.com (password123)")
        print("- secretaire@gestion.com (password123)")
        print("- enseignant@gestion.com (password123)")
        print("- fonctionnaire@gestion.com (password123)")

    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
