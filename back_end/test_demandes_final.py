import requests
import json

# Configuration
base_url = "http://localhost:8000"
token = "test_token_1_ADMIN"

# Test de l'endpoint /users/{user_id}/demandes
def test_user_demandes():
    print("=== Test de l'endpoint /users/{user_id}/demandes ===")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test pour différents utilisateurs (vrais user_id d'enseignants)
    user_ids = [3, 41, 42]  # IDs d'utilisateurs enseignants existants
    
    for user_id in user_ids:
        print(f"\n--- Test pour user_id: {user_id} ---")
        
        try:
            response = requests.get(
                f"{base_url}/users/{user_id}/demandes",
                headers=headers,
                timeout=10
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Nombre de demandes: {len(data)}")
                if data:
                    print("   Première demande:")
                    first = data[0]
                    print(f"   - ID: {first.get('id')}")
                    print(f"   - Type: {first.get('type_demande')}")
                    print(f"   - Titre: {first.get('titre')}")
                    print(f"   - Statut: {first.get('statut')}")
                else:
                    print("   Aucune demande trouvée")
            else:
                print(f"❌ Erreur: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Erreur de connexion: {e}")

if __name__ == "__main__":
    test_user_demandes()
