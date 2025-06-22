#!/usr/bin/env python3
"""
Test des endpoints du dashboard admin
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def get_admin_token():
    """Obtenir un token admin"""
    response = requests.post(f"{BASE_URL}/auth/login-json", json={
        "username": "admin@univ.ma",
        "password": "admin2024"
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def test_dashboard_stats(token):
    """Tester l'endpoint des statistiques"""
    print("📊 Test des statistiques dashboard...")

    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/dashboard/stats", headers=headers)

    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        stats = response.json()
        print("✅ Statistiques récupérées:")
        for key, value in stats.items():
            print(f"  {key}: {value}")
    else:
        print(f"❌ Erreur: {response.text}")

def test_fonctionnaires_list(token):
    """Tester la liste des fonctionnaires"""
    print("\n👩‍💼 Test de la liste des fonctionnaires...")

    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/users/fonctionnaires", headers=headers)

    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        fonctionnaires = response.json()
        print(f"✅ {len(fonctionnaires)} fonctionnaires récupérés:")
        for fonc in fonctionnaires[:3]:  # Afficher les 3 premiers
            user = fonc['user']
            print(f"  📧 {user['email']} - {user['prenom']} {user['nom']}")
            print(f"     🏢 {fonc['service']} - {fonc['poste']}")
    else:
        print(f"❌ Erreur: {response.text}")

def test_enseignants_list(token):
    """Tester la liste des enseignants"""
    print("\n👨‍🏫 Test de la liste des enseignants...")

    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/users/enseignants", headers=headers)

    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        enseignants = response.json()
        print(f"✅ {len(enseignants)} enseignants récupérés:")
        for ens in enseignants[:3]:  # Afficher les 3 premiers
            user = ens['user']
            print(f"  📧 {user['email']} - {user['prenom']} {user['nom']}")
            print(f"     📚 {ens['specialite']} - {ens['grade']}")
    else:
        print(f"❌ Erreur: {response.text}")

if __name__ == "__main__":
    print("🚀 Test des endpoints dashboard admin...")

    # Obtenir le token admin
    token = get_admin_token()
    if not token:
        print("❌ Impossible d'obtenir le token admin")
        exit(1)

    print(f"✅ Token admin obtenu: {token[:30]}...")

    # Tester les endpoints
    test_dashboard_stats(token)
    test_fonctionnaires_list(token)
    test_enseignants_list(token)

    print("\n✅ Tests terminés!")
