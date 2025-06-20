#!/usr/bin/env python3
import requests
import json
import sys

BASE_URL = "http://localhost:8000"
TOKEN = "test_token_admin"

def test_api_endpoint(method, endpoint, data=None, files=None):
    """Test un endpoint API"""
    headers = {
        "Authorization": f"Bearer {TOKEN}",
    }
    
    if data and not files:
        headers["Content-Type"] = "application/json"
    
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            if files:
                response = requests.post(url, headers={"Authorization": f"Bearer {TOKEN}"}, files=files, data=data)
            else:
                response = requests.post(url, headers=headers, json=data)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=data)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        else:
            print(f"❌ Méthode non supportée: {method}")
            return False
            
        print(f"🔍 {method} {endpoint}")
        print(f"   Status: {response.status_code}")
        
        if response.status_code < 400:
            print(f"   ✅ Succès")
            try:
                result = response.json()
                if isinstance(result, list):
                    print(f"   📋 Résultat: {len(result)} éléments")
                    if result and len(result) > 0:
                        print(f"   📄 Premier élément: {json.dumps(result[0], indent=2)[:200]}...")
                else:
                    print(f"   📄 Résultat: {json.dumps(result, indent=2)[:200]}...")
            except:
                print(f"   📄 Réponse: {response.text[:100]}...")
        else:
            print(f"   ❌ Erreur")
            try:
                error = response.json()
                print(f"   📄 Erreur: {error}")
            except:
                print(f"   📄 Erreur: {response.text}")
        
        print("")
        return response.status_code < 400
        
    except requests.exceptions.ConnectionError:
        print(f"❌ Impossible de se connecter au serveur {BASE_URL}")
        print("   Le serveur backend n'est peut-être pas démarré")
        return False
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
        return False

def main():
    print("🧪 Test des endpoints de fonctionnaires")
    print("=" * 50)
    
    # Test 1: Lister tous les fonctionnaires
    print("Test 1: Récupérer tous les fonctionnaires")
    success = test_api_endpoint("GET", "/users/fonctionnaires")
    if not success:
        print("⚠️ Impossible de continuer les tests")
        return
    
    # Test 2: Créer un nouveau fonctionnaire
    print("Test 2: Créer un nouveau fonctionnaire")
    new_fonctionnaire = {
        "nom": "TestAPI",
        "prenom": "Utilisateur",
        "email": "test.api@univ.ma",
        "cin": f"API{int(__import__('time').time())}",
        "password": "test123",
        "service": "Test API",
        "poste": "Testeur",
        "grade": "Catégorie Test"
    }
    test_api_endpoint("POST", "/users/fonctionnaires", data=new_fonctionnaire)
    
    # Test 3: Tester erreur 404 sur fonctionnaire inexistant
    print("Test 3: Modifier un fonctionnaire inexistant (test erreur 404)")
    test_api_endpoint("PUT", "/users/fonctionnaires/999", data={"nom": "Test"})
    
    # Test 4: Tester erreur 404 sur suppression fonctionnaire inexistant
    print("Test 4: Supprimer un fonctionnaire inexistant (test erreur 404)")
    test_api_endpoint("DELETE", "/users/fonctionnaires/999")
    
    # Test 5: Tester erreur 400 sur email dupliqué
    print("Test 5: Créer un fonctionnaire avec email existant (test erreur 400)")
    duplicate_fonctionnaire = {
        "nom": "Duplicate",
        "prenom": "Test",
        "email": "fonctionnaire1@test.com",  # Email déjà existant
        "cin": f"DUP{int(__import__('time').time())}",
        "password": "test123"
    }
    test_api_endpoint("POST", "/users/fonctionnaires", data=duplicate_fonctionnaire)
    
    # Test 6: Tester erreur 400 sur CIN vide
    print("Test 6: Créer un fonctionnaire sans CIN (test erreur 400)")
    no_cin_fonctionnaire = {
        "nom": "NoCIN",
        "prenom": "Test",
        "email": "no.cin@univ.ma",
        "cin": "",  # CIN vide
        "password": "test123"
    }
    test_api_endpoint("POST", "/users/fonctionnaires", data=no_cin_fonctionnaire)
    
    print("🏁 Tests terminés")

if __name__ == "__main__":
    main()
