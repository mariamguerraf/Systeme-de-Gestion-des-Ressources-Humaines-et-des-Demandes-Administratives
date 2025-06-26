#!/usr/bin/env python3
"""
Script pour créer un utilisateur secrétaire de test avec des permissions correctes
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import get_password_hash

def create_secretaire_user():
    """Créer un utilisateur secrétaire simple"""
    db = next(get_db())
    try:
        # Vérifier si l'utilisateur existe déjà
        existing_user = db.query(User).filter(User.email == "secretaire@test.com").first()
        if existing_user:
            print("✅ L'utilisateur secretaire@test.com existe déjà")
            # Mettre à jour le mot de passe
            existing_user.hashed_password = get_password_hash("secretaire123")
            existing_user.role = "SECRETAIRE"
            db.commit()
            print("✅ Mot de passe mis à jour: secretaire123")
            return

        # Créer l'utilisateur secrétaire
        hashed_password = get_password_hash("secretaire123")
        secretaire_user = User(
            email="secretaire@test.com",
            nom="Secrétaire",
            prenom="Test",
            hashed_password=hashed_password,
            role="SECRETAIRE",
            is_active=True
        )
        
        db.add(secretaire_user)
        db.commit()
        print("✅ Utilisateur secrétaire créé:")
        print(f"   Email: secretaire@test.com")
        print(f"   Mot de passe: secretaire123")
        print(f"   Rôle: SECRETAIRE")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_secretaire_user()
