#!/usr/bin/env python3
"""
Test simple de l'endpoint users
"""

import requests
import json

# Test simple
base_url = "http://localhost:8002"

print("=== TEST SIMPLE ENDPOINT ===")

# Test 1: Vérifier que le serveur répond
try:
    response = requests.get(f"{base_url}/docs")
    print(f"✅ Serveur accessible: {response.status_code}")
except Exception as e:
    print(f"❌ Serveur non accessible: {e}")
    exit(1)

# Test 2: Vérifier les routes disponibles
try:
    response = requests.get(f"{base_url}/openapi.json")
    if response.status_code == 200:
        data = response.json()
        paths = data.get("paths", {})
        user_paths = [path for path in paths.keys() if "users" in path]
        print(f"🔍 Routes contenant 'users': {user_paths}")
    else:
        print(f"❌ Impossible de récupérer OpenAPI: {response.status_code}")
except Exception as e:
    print(f"❌ Erreur OpenAPI: {e}")

# Test 3: Test direct de connexion
try:
    print("\n=== TEST CONNEXION ===")
    login_data = {
        "username": "admin@test.com", 
        "password": "admin123"
    }
    response = requests.post(f"{base_url}/auth/login", data=login_data)
    print(f"Login Status: {response.status_code}")
    if response.status_code == 200:
        token_data = response.json()
        print(f"Token reçu: {json.dumps(token_data, indent=2)}")
        
        # Tester l'endpoint users maintenant
        access_token = token_data.get("access_token")
        if access_token:
            headers = {"Authorization": f"Bearer {access_token}"}
            
            # Test différentes variations de l'endpoint
            test_endpoints = [
                "/users/41/demandes",
                "/users/demandes/41",  
                "/api/users/41/demandes"
            ]
            
            for endpoint in test_endpoints:
                try:
                    print(f"\nTest {endpoint}:")
                    resp = requests.get(f"{base_url}{endpoint}", headers=headers)
                    print(f"  Status: {resp.status_code}")
                    if resp.status_code != 404:
                        print(f"  Response: {resp.text[:200]}")
                except Exception as e:
                    print(f"  Erreur: {e}")
    else:
        print(f"Erreur login: {response.text}")
        
except Exception as e:
    print(f"❌ Erreur test connexion: {e}")
