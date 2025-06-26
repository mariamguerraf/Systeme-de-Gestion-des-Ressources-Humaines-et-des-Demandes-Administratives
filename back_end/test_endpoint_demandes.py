#!/usr/bin/env python3
"""
Test direct de l'endpoint getUserDemandes
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import requests
import json

def test_get_user_demandes():
    """Test de l'endpoint GET /users/{user_id}/demandes"""
    print("🎯 === TEST ENDPOINT getUserDemandes ===")
    
    # Configuration
    base_url = "http://localhost:8000"
    user_id = 41  # mariam
    
    try:
        # 1. Se connecter en tant qu'admin
        print("1️⃣ Connexion en tant qu'admin...")
        login_data = {
            "username": "admin@test.com",
            "password": "admin123"
        }
        
        login_response = requests.post(f"{base_url}/auth/login", data=login_data)
        
        if login_response.status_code != 200:
            print(f"❌ Échec de connexion: {login_response.status_code}")
            print(f"Réponse: {login_response.text}")
            return False
            
        token_data = login_response.json()
        access_token = token_data.get("access_token")
        if not access_token:
            print(f"❌ Token non trouvé dans la réponse: {token_data}")
            return False
        print(f"✅ Connexion réussie, token: {access_token[:30]}...")
        
        # 2. Tester l'endpoint des demandes
        print(f"2️⃣ Test endpoint /users/{user_id}/demandes...")
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        demandes_response = requests.get(f"{base_url}/users/{user_id}/demandes", headers=headers)
        
        print(f"Status: {demandes_response.status_code}")
        print(f"Headers: {dict(demandes_response.headers)}")
        
        if demandes_response.status_code == 200:
            demandes = demandes_response.json()
            print(f"✅ Demandes récupérées: {len(demandes)}")
            for i, demande in enumerate(demandes):
                print(f"   [{i+1}] ID: {demande.get('id')}, Type: {demande.get('type_demande')}, Titre: {demande.get('titre')}, Statut: {demande.get('statut')}")
            return True
        else:
            print(f"❌ Erreur: {demandes_response.status_code}")
            print(f"Réponse: {demandes_response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au backend. Assurez-vous qu'il est démarré sur le port 8000")
        return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    success = test_get_user_demandes()
    sys.exit(0 if success else 1)
