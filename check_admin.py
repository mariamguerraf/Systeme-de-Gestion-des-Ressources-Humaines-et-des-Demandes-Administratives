#!/usr/bin/env python3
"""
Script pour vérifier et créer l'utilisateur admin dans la base de données
"""
import sys
import os

# Ajouter le répertoire du backend au path
backend_dir = os.path.join(os.path.dirname(__file__), 'back_end')
sys.path.append(backend_dir)

from database import SessionLocal, engine
from models import Base, User, UserRole
from auth import get_password_hash

def check_and_create_admin():
    # Créer les tables si elles n'existent pas
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Vérifier si l'admin existe déjà
        admin_user = db.query(User).filter(User.email == "admin@example.com").first()
        
        if admin_user:
            print("✅ Utilisateur admin existe déjà:")
            print(f"   Email: {admin_user.email}")
            print(f"   Nom: {admin_user.nom}")
            print(f"   Rôle: {admin_user.role}")
            print(f"   Actif: {admin_user.is_active}")
        else:
            print("❌ Utilisateur admin n'existe pas, création...")
            
            # Créer l'utilisateur admin
            hashed_password = get_password_hash("admin123")
            admin_user = User(
                email="admin@example.com",
                nom="Administrateur",
                prenom="Système",
                telephone="0000000000",
                role=UserRole.admin,
                hashed_password=hashed_password,
                is_active=True
            )
            
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            
            print("✅ Utilisateur admin créé avec succès:")
            print(f"   Email: admin@example.com")
            print(f"   Mot de passe: admin123")
            print(f"   ID: {admin_user.id}")
        
        # Lister tous les utilisateurs
        all_users = db.query(User).all()
        print(f"\n📊 Total utilisateurs dans la base: {len(all_users)}")
        for user in all_users:
            print(f"   - {user.email} ({user.role}) - {'Actif' if user.is_active else 'Inactif'}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    check_and_create_admin()
