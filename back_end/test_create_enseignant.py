#!/usr/bin/env python3
"""
Script de test pour l'endpoint de création d'enseignant
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
ADMIN_EMAIL = "admin@universite.ma"
ADMIN_PASSWORD = "admin123"

def get_admin_token():
    """Obtenir le token d'authentification pour l'admin"""
    login_data = {
        "username": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    
    if response.status_code == 200:
        token_data = response.json()
        return token_data["access_token"]
    else:
        print(f"Erreur de connexion: {response.status_code}")
        print(response.text)
        return None

def test_create_enseignant():
    """Tester la création d'un enseignant"""
    
    # 1. Obtenir le token admin
    print("1. Connexion en tant qu'admin...")
    token = get_admin_token()
    
    if not token:
        print("❌ Impossible de se connecter en tant qu'admin")
        return
    
    print("✅ Token admin obtenu")
    
    # 2. Données de l'enseignant à créer
    enseignant_data = {
        "email": "mohamed.alami@universite.ma",
        "nom": "Alami",
        "prenom": "Mohamed",
        "telephone": "0612345678",
        "adresse": "123 Rue de l'Université, Rabat",
        "cin": "EE123456",
        "password": "enseignant123",
        "specialite": "Informatique",
        "grade": "Professeur Associé",
        "etablissement": "Faculté des Sciences"
    }
    
    # 3. Headers avec authorization
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 4. Faire la requête POST
    print("\n2. Création de l'enseignant...")
    print(f"Données: {json.dumps(enseignant_data, indent=2)}")
    
    response = requests.post(
        f"{BASE_URL}/users/enseignants",
        headers=headers,
        json=enseignant_data
    )
    
    # 5. Analyser la réponse
    print(f"\nCode de réponse: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ Enseignant créé avec succès!")
        enseignant_created = response.json()
        print(f"Réponse: {json.dumps(enseignant_created, indent=2)}")
        
        # Vérifier que les données sont correctes
        assert enseignant_created["user"]["email"] == enseignant_data["email"]
        assert enseignant_created["user"]["nom"] == enseignant_data["nom"]
        assert enseignant_created["specialite"] == enseignant_data["specialite"]
        print("✅ Toutes les données sont correctes")
        
    else:
        print(f"❌ Erreur lors de la création: {response.status_code}")
        try:
            error_detail = response.json()
            print(f"Détails de l'erreur: {json.dumps(error_detail, indent=2)}")
        except:
            print(f"Réponse brute: {response.text}")

def test_duplicate_email():
    """Tester la création d'un enseignant avec un email déjà existant"""
    
    print("\n3. Test de duplication d'email...")
    
    # Obtenir le token admin
    token = get_admin_token()
    if not token:
        return
    
    # Données avec email existant
    duplicate_data = {
        "email": "admin@universite.ma",  # Email déjà existant
        "nom": "Dupont",
        "prenom": "Jean",
        "password": "test123",
        "specialite": "Mathématiques"
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(
        f"{BASE_URL}/users/enseignants",
        headers=headers,
        json=duplicate_data
    )
    
    if response.status_code == 400:
        print("✅ Duplication d'email correctement rejetée")
        print(f"Message d'erreur: {response.json()}")
    else:
        print(f"❌ La duplication d'email n'a pas été rejetée. Code: {response.status_code}")

if __name__ == "__main__":
    print("=== Test de création d'enseignant ===")
    
    try:
        test_create_enseignant()
        test_duplicate_email()
        print("\n✅ Tests terminés avec succès!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au serveur.")
        print("Assurez-vous que le serveur FastAPI est démarré sur http://localhost:8000")
        
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
