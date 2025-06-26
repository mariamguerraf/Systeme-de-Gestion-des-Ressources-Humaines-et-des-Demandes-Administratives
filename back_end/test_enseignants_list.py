import requests
import json

# Configuration
base_url = "http://localhost:8000"
token = "test_token_1_ADMIN"

def test_enseignants():
    print("=== Test de l'endpoint /users/enseignants ===")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(
            f"{base_url}/users/enseignants",
            headers=headers,
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Nombre d'enseignants: {len(data)}")
            for enseignant in data:
                print(f"   - ID: {enseignant.get('id')}, User ID: {enseignant.get('user_id')}")
                print(f"     Nom: {enseignant.get('nom')} {enseignant.get('prenom')}")
                if 'user' in enseignant:
                    user = enseignant['user']
                    print(f"     User: {user.get('nom')} {user.get('prenom')} - {user.get('email')}")
                print(f"     Spécialité: {enseignant.get('specialite')}")
                print("")
        else:
            print(f"❌ Erreur: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {e}")

if __name__ == "__main__":
    test_enseignants()
