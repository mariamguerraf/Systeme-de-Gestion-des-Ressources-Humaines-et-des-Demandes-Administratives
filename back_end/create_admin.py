#!/usr/bin/env python3
"""
Script simple pour créer un utilisateur admin de test
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import get_password_hash

def create_admin_user():
    """Créer un utilisateur admin simple"""
    db = next(get_db())
    try:
        # Vérifier si l'utilisateur existe déjà
        existing_user = db.query(User).filter(User.email == "admin@test.com").first()
        if existing_user:
            print("✅ L'utilisateur admin@test.com existe déjà")
            return

        # Créer l'utilisateur admin
        hashed_password = get_password_hash("admin123")
        admin_user = User(
            email="admin@test.com",
            nom="Admin",
            prenom="Test",
            role="admin",
            hashed_password=hashed_password,
            is_active=True
        )

        db.add(admin_user)
        db.commit()

        print("✅ Utilisateur admin créé avec succès!")
        print("📧 Email: admin@test.com")
        print("🔑 Mot de passe: admin123")

    except Exception as e:
        print(f"❌ Erreur: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
