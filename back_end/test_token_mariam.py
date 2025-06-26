import requests

# Test avec le token de mariam
base_url = "http://localhost:8000"

print("=== Test du token de mariam guerraf ===")

headers = {
    "Authorization": "Bearer test_token_41_ENSEIGNANT",
    "Content-Type": "application/json"
}

try:
    response = requests.get(f"{base_url}/users/41/demandes", headers=headers, timeout=10)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Nombre de demandes: {len(data)}")
        for demande in data:
            print(f"   - ID: {demande['id']}, Titre: {demande['titre']}, Statut: {demande['statut']}")
    else:
        print(f"❌ Erreur: {response.text}")
except Exception as e:
    print(f"❌ Erreur: {e}")
