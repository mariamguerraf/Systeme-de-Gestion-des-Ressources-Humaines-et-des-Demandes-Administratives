#!/usr/bin/env python3
"""
Script pour vérifier les utilisateurs existants et tester la connexion
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from database import get_db, engine
from models import User
from auth import get_password_hash, verify_password
import requests

def check_existing_users():
    """Vérifier les utilisateurs existants"""
    print("🔍 Vérification des utilisateurs existants...")

    db = next(get_db())
    try:
        users = db.query(User).all()
        if not users:
            print("❌ Aucun utilisateur trouvé dans la base de données")
            return []

        print(f"✅ {len(users)} utilisateur(s) trouvé(s):")
        for user in users:
            print(f"  - {user.email} ({user.role}) - Active: {user.is_active}")

        return users
    finally:
        db.close()

def test_login(email: str, password: str):
    """Tester la connexion avec des credentials"""
    print(f"\n🔐 Test de connexion avec {email}...")

    try:
        response = requests.post(
            "http://localhost:8000/auth/login",
            data={"username": email, "password": password},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Connexion réussie!")
            print(f"   Token: {data.get('access_token', 'N/A')[:50]}...")
            return True
        else:
            print(f"❌ Connexion échouée: {response.status_code}")
            print(f"   Erreur: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return False

def create_test_user_if_not_exists():
    """Créer un utilisateur de test simple si aucun n'existe"""
    print("\n🏗️ Création d'un utilisateur de test...")

    db = next(get_db())
    try:
        # Vérifier si l'utilisateur existe déjà
        existing_user = db.query(User).filter(User.email == "admin@test.com").first()
        if existing_user:
            print("✅ L'utilisateur admin@test.com existe déjà")
            return existing_user

        # Créer un nouvel utilisateur
        hashed_password = get_password_hash("admin123")
        test_user = User(
            email="admin@test.com",
            nom="Admin",
            prenom="Test",
            role="admin",
            hashed_password=hashed_password,
            is_active=True
        )

        db.add(test_user)
        db.commit()
        db.refresh(test_user)

        print("✅ Utilisateur de test créé avec succès!")
        print(f"   Email: admin@test.com")
        print(f"   Mot de passe: admin123")

        return test_user
    except Exception as e:
        print(f"❌ Erreur lors de la création: {e}")
        db.rollback()
        return None
    finally:
        db.close()

def main():
    print("🎯 Vérification et test du système d'authentification\n")

    # 1. Vérifier les utilisateurs existants
    users = check_existing_users()

    # 2. Si aucun utilisateur, en créer un
    if not users:
        create_test_user_if_not_exists()
        users = check_existing_users()

    # 3. Tester la connexion avec les credentials disponibles
    test_credentials = [
        ("admin@test.com", "admin123"),
        ("secretaire@test.com", "secretaire123"),
        ("enseignant@test.com", "enseignant123"),
        ("fonctionnaire@test.com", "fonctionnaire123"),
    ]

    print("\n🧪 Tests de connexion:")
    successful_logins = []

    for email, password in test_credentials:
        if test_login(email, password):
            successful_logins.append((email, password))

    # 4. Résumé
    print(f"\n📊 Résumé:")
    print(f"   Utilisateurs en base: {len(users)}")
    print(f"   Connexions réussies: {len(successful_logins)}")

    if successful_logins:
        print(f"\n✅ Credentials valides pour la connexion:")
        for email, password in successful_logins:
            print(f"   📧 {email} / 🔑 {password}")
    else:
        print(f"\n❌ Aucune connexion réussie. Vérifiez la configuration.")

if __name__ == "__main__":
    main()
