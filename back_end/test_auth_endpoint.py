#!/usr/bin/env python3
import requests
import json

def test_auth_endpoint():
    base_url = "http://localhost:8000"
    
    # Test de connexion
    login_data = {
        "email": "admin@test.com",
        "password": "admin123"
    }
    
    print("🔍 Test de l'endpoint de connexion...")
    print(f"URL: {base_url}/auth/login")
    print(f"Données: {login_data}")
    
    try:
        # Test login
        response = requests.post(
            f"{base_url}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('access_token')
            print(f"✅ Token reçu: {token[:50]}...")
            
            # Test /auth/me
            print("\n🔍 Test de l'endpoint /auth/me...")
            me_response = requests.get(
                f"{base_url}/auth/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            print(f"Status Code: {me_response.status_code}")
            print(f"Response: {me_response.text}")
            
            if me_response.status_code == 200:
                user_data = me_response.json()
                print(f"✅ Utilisateur: {user_data.get('email')} - Rôle: {user_data.get('role')}")
            else:
                print("❌ Erreur lors de la récupération de l'utilisateur")
                
        else:
            print("❌ Erreur de connexion")
            
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur le port 8000.")
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_auth_endpoint()
