#!/usr/bin/env python3
import requests
import json

def test_fonctionnaire_access():
    """Tester l'accès d'un fonctionnaire à ses données"""
    
    # Test avec un token de fonctionnaire (simulé)
    token_fonctionnaire = "test_token_42_FONCTIONNAIRE"
    
    headers = {
        "Authorization": f"Bearer {token_fonctionnaire}",
        "Content-Type": "application/json"
    }
    
    try:
        # Test GET fonctionnaires avec token fonctionnaire
        response = requests.get("http://localhost:8000/users/fonctionnaires", headers=headers)
        print(f"📋 GET fonctionnaires (fonctionnaire) - Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Succès - {len(data)} fonctionnaire(s) retourné(s)")
            if data:
                fonctionnaire = data[0]
                print(f"👤 Données fonctionnaire: {fonctionnaire.get('user', {}).get('nom')} {fonctionnaire.get('user', {}).get('prenom')} (ID: {fonctionnaire.get('user_id')})")
        else:
            print(f"❌ Erreur: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

def test_admin_access_fonctionnaires():
    """Tester l'accès admin aux fonctionnaires"""
    
    # Test avec un token admin
    token_admin = "test_token_45_ADMIN"
    
    headers = {
        "Authorization": f"Bearer {token_admin}",
        "Content-Type": "application/json"
    }
    
    try:
        # Test GET fonctionnaires avec token admin
        response = requests.get("http://localhost:8000/users/fonctionnaires", headers=headers)
        print(f"📋 GET fonctionnaires (admin) - Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Succès - {len(data)} fonctionnaire(s) retourné(s)")
        else:
            print(f"❌ Erreur: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    print("🧪 Test accès fonctionnaire:")
    test_fonctionnaire_access()
    print("\n🧪 Test accès admin fonctionnaires:")
    test_admin_access_fonctionnaires()
