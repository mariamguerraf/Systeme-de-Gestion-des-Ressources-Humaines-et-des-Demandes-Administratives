#!/usr/bin/env python3
import requests
import json

def test_enseignant_access():
    """Tester l'accès d'un enseignant à ses données"""
    
    # Test avec un token d'enseignant (comme mariam)
    token_enseignant = "test_token_41_ENSEIGNANT"
    
    headers = {
        "Authorization": f"Bearer {token_enseignant}",
        "Content-Type": "application/json"
    }
    
    try:
        # Test GET enseignants avec token enseignant
        response = requests.get("http://localhost:8000/users/enseignants", headers=headers)
        print(f"📋 GET enseignants (enseignant) - Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Succès - {len(data)} enseignant(s) retourné(s)")
            if data:
                enseignant = data[0]
                print(f"👤 Données enseignant: {enseignant.get('nom')} {enseignant.get('prenom')} (ID: {enseignant.get('user_id')})")
        else:
            print(f"❌ Erreur: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

def test_admin_access():
    """Tester l'accès admin"""
    
    # Test avec un token admin
    token_admin = "test_token_45_ADMIN"
    
    headers = {
        "Authorization": f"Bearer {token_admin}",
        "Content-Type": "application/json"
    }
    
    try:
        # Test GET enseignants avec token admin
        response = requests.get("http://localhost:8000/users/enseignants", headers=headers)
        print(f"📋 GET enseignants (admin) - Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Succès - {len(data)} enseignant(s) retourné(s)")
        else:
            print(f"❌ Erreur: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    print("🧪 Test accès enseignant:")
    test_enseignant_access()
    print("\n🧪 Test accès admin:")
    test_admin_access()
