#!/usr/bin/env python3
"""
Test rapide pour vérifier la modification des fonctionnaires
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_quick_modification():
    print("Test rapide modification fonctionnaires...")
    
    # Login admin
    login_data = {"username": "admin@univ.ma", "password": "admin2024"}
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return False
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login successful")
    
    # Test modification du fonctionnaire existant (ID 1)
    update_data = {
        "nom": "Karam",
        "prenom": "Aicha",
        "email": "fonctionnaire@univ.ma", 
        "password": "unchanged",
        "telephone": "0123456789",
        "adresse": "Test Address",
        "cin": "AB123456",
        "service": "Ressources Humaines Modifiées",
        "poste": "Gestionnaire RH Senior",
        "grade": "Administrateur Principal"
    }
    
    response = requests.put(f"{BASE_URL}/users/fonctionnaires/1", json=update_data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Modification réussie!")
        return True
    else:
        print("❌ Modification échouée!")
        return False

if __name__ == "__main__":
    success = test_quick_modification()
    print(f"\nRésultat: {'SUCCESS' if success else 'FAILED'}")
