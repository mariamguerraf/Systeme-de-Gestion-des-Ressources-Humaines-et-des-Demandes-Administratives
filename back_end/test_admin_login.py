import requests
import json

# Test de login avec admin@univ.ma
def test_admin_login():
    print("=== Test de login admin@univ.ma ===")
    
    login_data = {
        "username": "admin@univ.ma",
        "password": "admin2024"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login réussi!")
            print(f"Token: {data.get('access_token')}")
            print(f"Type: {data.get('token_type')}")
            
            # Tester l'accès aux demandes avec ce token
            token = data.get('access_token')
            print(f"\n=== Test accès demandes avec token admin ===")
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Test pour user_id 41 (mariam guerraf)
            demandes_response = requests.get(
                f"http://localhost:8000/users/41/demandes",
                headers=headers,
                timeout=10
            )
            
            print(f"Status demandes: {demandes_response.status_code}")
            if demandes_response.status_code == 200:
                demandes = demandes_response.json()
                print(f"✅ Demandes récupérées: {len(demandes)}")
                for demande in demandes:
                    print(f"  - {demande['titre']} ({demande['statut']})")
            else:
                print(f"❌ Erreur demandes: {demandes_response.text}")
                
        else:
            print(f"❌ Erreur login: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {e}")

if __name__ == "__main__":
    test_admin_login()
