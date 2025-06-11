#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:8000"

def test_login():
    """Test de connexion admin"""
    print("🔐 Test de connexion admin...")
    login_data = {
        "username": "admin@gestion.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print(f"✅ Connexion réussie ! Token: {token[:50]}...")
            return token
        else:
            print("❌ Erreur de connexion")
            return None
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None

def test_get_enseignants(token=None):
    """Test de récupération des enseignants"""
    print("\n📋 Test de récupération des enseignants...")
    
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        response = requests.get(f"{BASE_URL}/users/enseignants", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            enseignants = response.json()
            print(f"✅ {len(enseignants)} enseignants trouvés")
            for ens in enseignants:
                print(f"  - {ens.get('user', {}).get('nom')} {ens.get('user', {}).get('prenom')}")
        else:
            print("❌ Erreur lors de la récupération")
    except Exception as e:
        print(f"❌ Erreur: {e}")

def test_create_enseignant(token=None):
    """Test de création d'un enseignant"""
    print("\n➕ Test de création d'un nouvel enseignant...")
    
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    enseignant_data = {
        "nom": "TestNom",
        "prenom": "TestPrenom",
        "email": "test@enseignant.com",
        "telephone": "0123456999",
        "adresse": "Adresse Test",
        "cin": "CINTEST",
        "password": "password123",
        "specialite": "Informatique",
        "grade": "Professeur",
        "etablissement": "Test University"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/users/enseignants", 
                               headers=headers, 
                               json=enseignant_data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
          if response.status_code in [200, 201]:
            data = response.json()
            print(f"✅ Enseignant créé avec l'ID: {data.get('id')}")
            return data.get('id')
        else:
            print("❌ Erreur lors de la création")
            return None
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None

def main():
    print("🧪 TESTS SQLite - OPÉRATIONS CRUD")
    print("=" * 50)
    
    # Test de connexion
    token = test_login()
    
    # Test de récupération
    test_get_enseignants(token)
    
    # Test de création
    new_id = test_create_enseignant(token)
    
    # Test de récupération après création
    if new_id:
        print("\n📋 Vérification après création...")
        test_get_enseignants(token)
    
    print("\n🎯 Tests terminés !")

if __name__ == "__main__":
    main()
