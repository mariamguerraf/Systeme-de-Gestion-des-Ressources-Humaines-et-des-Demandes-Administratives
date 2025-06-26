import requests
import json

# Test direct pour voir quelle est la réponse pour user_id 41 avec différents tokens
base_url = "http://localhost:8000"

def test_user_41_demandes():
    print("=== Test de l'endpoint /users/41/demandes avec différents tokens ===")
    
    # Test 1: Token admin
    print("\n1. Test avec test_token_1_ADMIN:")
    headers = {
        "Authorization": "Bearer test_token_1_ADMIN",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{base_url}/users/41/demandes", headers=headers, timeout=10)
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Nombre de demandes: {len(data)}")
            for demande in data:
                print(f"      - ID: {demande['id']}, Titre: {demande['titre']}, Statut: {demande['statut']}")
        else:
            print(f"   ❌ Erreur: {response.text}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # Test 2: Token user 41
    print("\n2. Test avec test_token_41_USER:")
    headers = {
        "Authorization": "Bearer test_token_41_USER",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{base_url}/users/41/demandes", headers=headers, timeout=10)
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Nombre de demandes: {len(data)}")
            for demande in data:
                print(f"      - ID: {demande['id']}, Titre: {demande['titre']}, Statut: {demande['statut']}")
        else:
            print(f"   ❌ Erreur: {response.text}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # Test 3: Token classique admin
    print("\n3. Test avec admin_token:")
    headers = {
        "Authorization": "Bearer admin_token",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{base_url}/users/41/demandes", headers=headers, timeout=10)
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Nombre de demandes: {len(data)}")
            for demande in data:
                print(f"      - ID: {demande['id']}, Titre: {demande['titre']}, Statut: {demande['statut']}")
        else:
            print(f"   ❌ Erreur: {response.text}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")

if __name__ == "__main__":
    test_user_41_demandes()
