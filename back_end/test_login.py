#!/usr/bin/env python3
import requests
import json

def test_login():
    url = "http://localhost:8000/auth/login"
    data = {
        "username": "admin@gestion.com",
        "password": "password123"
    }

    print("🔑 Test de connexion...")
    print(f"URL: {url}")
    print(f"Data: {data}")

    try:
        response = requests.post(url, data=data)
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Response Text: {response.text}")

        if response.status_code == 200:
            token_data = response.json()
            print(f"✅ Connexion réussie!")
            print(f"Access Token: {token_data.get('access_token', 'N/A')}")
            print(f"Token Type: {token_data.get('token_type', 'N/A')}")
            return token_data
        else:
            print(f"❌ Échec de connexion: {response.status_code}")
            return None

    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None

if __name__ == "__main__":
    test_login()
