#!/usr/bin/env python3
"""
Test simple de connexion au backend
"""
import requests
import json

def test_connection():
    backend_url = "http://localhost:8000"
    
    print("🔍 Test de connexion au backend FastAPI")
    print(f"URL: {backend_url}")
    print("=" * 50)
    
    # Test 1: Basic connectivity
    try:
        response = requests.get(f"{backend_url}/health", timeout=10)
        print(f"✅ Backend accessible: {response.status_code}")
        print(f"   Response: {response.json()}")
    except requests.exceptions.ConnectionError:
        print("❌ Backend non accessible - Assurez-vous qu'il est démarré")
        return False
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
        return False
    
    # Test 2: CORS preflight
    try:
        response = requests.options(
            f"{backend_url}/auth/login",
            headers={
                'Origin': 'http://localhost:5173',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            },
            timeout=5
        )
        print(f"✅ CORS preflight: {response.status_code}")
        cors_origin = response.headers.get('Access-Control-Allow-Origin', 'Non défini')
        print(f"   CORS Origin: {cors_origin}")
    except Exception as e:
        print(f"⚠️ CORS test échoué: {e}")
    
    # Test 3: Login endpoint availability
    try:
        response = requests.post(
            f"{backend_url}/auth/login",
            json={"email": "test", "password": "test"},
            timeout=5
        )
        print(f"✅ Login endpoint accessible: {response.status_code}")
        if response.status_code == 422:
            print("   (422 = validation error, c'est normal)")
        elif response.status_code == 401:
            print("   (401 = unauthorized, endpoint fonctionne)")
    except Exception as e:
        print(f"❌ Login endpoint test échoué: {e}")
    
    return True

if __name__ == "__main__":
    if test_connection():
        print("\n✅ Tests terminés - Backend semble accessible")
    else:
        print("\n❌ Tests échoués - Vérifiez que le backend est démarré")
