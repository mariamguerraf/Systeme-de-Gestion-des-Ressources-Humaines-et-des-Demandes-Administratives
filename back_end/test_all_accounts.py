#!/usr/bin/env python3
import requests
import json

def test_all_credentials():
    """Test tous les comptes utilisateurs"""
    url = "http://localhost:8000/auth/login"

    # Credentials de test
    test_accounts = [
        {"email": "admin@gestion.com", "password": "password123", "role": "Admin"},
        {"email": "secretaire@gestion.com", "password": "password123", "role": "Secrétaire"},
        {"email": "enseignant@gestion.com", "password": "password123", "role": "Enseignant"},
        {"email": "fonctionnaire@gestion.com", "password": "password123", "role": "Fonctionnaire"}
    ]

    print("🔐 Test de tous les comptes utilisateurs")
    print("=" * 50)

    success_count = 0

    for account in test_accounts:
        print(f"\n🧪 Test du compte {account['role']}")
        print(f"   Email: {account['email']}")

        try:
            # Préparer les données comme le frontend
            formData = {
                "username": account["email"],
                "password": account["password"]
            }

            response = requests.post(url, data=formData)

            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Connexion réussie!")
                print(f"   🎫 Token: {data.get('access_token', 'N/A')[:50]}...")
                print(f"   🔑 Type: {data.get('token_type', 'N/A')}")
                success_count += 1

                # Test de récupération du profil utilisateur
                if data.get('access_token'):
                    try:
                        profile_response = requests.get(
                            "http://localhost:8000/auth/me",
                            headers={"Authorization": f"Bearer {data['access_token']}"}
                        )
                        if profile_response.status_code == 200:
                            profile = profile_response.json()
                            print(f"   👤 Profil: {profile.get('nom', 'N/A')} {profile.get('prenom', 'N/A')}")
                            print(f"   🎭 Rôle: {profile.get('role', 'N/A')}")
                        else:
                            print(f"   ⚠️  Impossible de récupérer le profil: {profile_response.status_code}")
                    except Exception as e:
                        print(f"   ⚠️  Erreur profil: {e}")

            else:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                print(f"   ❌ Échec de connexion: {response.status_code}")
                print(f"   📝 Erreur: {error_data.get('detail', 'Erreur inconnue')}")

        except Exception as e:
            print(f"   💥 Erreur: {e}")

    print("\n" + "=" * 50)
    print(f"📊 Résumé: {success_count}/{len(test_accounts)} comptes fonctionnels")

    if success_count == len(test_accounts):
        print("🎉 Tous les comptes fonctionnent parfaitement!")
        return True
    else:
        print("⚠️  Certains comptes ont des problèmes.")
        return False

def test_api_health():
    """Test de santé de l'API"""
    print("\n🏥 Test de santé de l'API")
    print("-" * 30)

    try:
        # Test de l'endpoint root
        response = requests.get("http://localhost:8000/")
        if response.status_code == 200:
            print("✅ API Root accessible")
        else:
            print(f"❌ API Root: {response.status_code}")

        # Test de l'endpoint health
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health Check: {data}")
        else:
            print(f"❌ Health Check: {response.status_code}")

        # Test de l'endpoint docs
        response = requests.get("http://localhost:8000/docs")
        if response.status_code == 200:
            print("✅ Documentation API accessible")
        else:
            print(f"❌ Documentation: {response.status_code}")

    except Exception as e:
        print(f"💥 Erreur de santé API: {e}")

if __name__ == "__main__":
    test_api_health()
    test_all_credentials()
