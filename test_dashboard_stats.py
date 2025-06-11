#!/usr/bin/env python3
"""
Test rapide pour vérifier les statistiques du dashboard
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_dashboard_stats():
    print("🧪 Test des statistiques du dashboard")
    print("=" * 50)
    
    # Step 1: Login as admin
    print("1. 🔐 Connexion admin...")
    login_data = {
        "username": "admin@univ.ma",
        "password": "admin2024"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    if response.status_code != 200:
        print(f"❌ Échec connexion: {response.text}")
        return False
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Connexion réussie")
    
    # Step 2: Test dashboard stats endpoint
    print("\n2. 📊 Test endpoint dashboard stats...")
    response = requests.get(f"{BASE_URL}/dashboard/stats", headers=headers)
    if response.status_code != 200:
        print(f"❌ Échec stats: {response.text}")
        return False
    
    stats = response.json()
    print("✅ Statistiques récupérées:")
    print(f"   👥 Total utilisateurs: {stats['totalUsers']}")
    print(f"   👨‍🏫 Enseignants: {stats['enseignants']}")
    print(f"   👨‍💼 Fonctionnaires: {stats['fonctionnaires']}")
    print(f"   👩‍💻 Secrétaires: {stats['secretaires']}")
    print(f"   👑 Admins: {stats['admins']}")
    print(f"   ⏳ Demandes en attente: {stats['demandesEnAttente']}")
    print(f"   ✅ Demandes traitées: {stats['demandesTraitees']}")
    print(f"   📋 Total demandes: {stats['totalDemandes']}")
    
    # Step 3: Test with secrétaire role
    print("\n3. 🔐 Test avec rôle secrétaire...")
    login_data_sec = {
        "username": "secretaire@univ.ma",
        "password": "secretaire2024"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data_sec)
    if response.status_code == 200:
        token_sec = response.json()["access_token"]
        headers_sec = {"Authorization": f"Bearer {token_sec}"}
        
        response = requests.get(f"{BASE_URL}/dashboard/stats", headers=headers_sec)
        if response.status_code == 200:
            print("✅ Secrétaire peut accéder aux stats")
        else:
            print(f"❌ Secrétaire ne peut pas accéder: {response.text}")
    
    print("\n🎉 Test terminé avec succès!")
    return True

if __name__ == "__main__":
    try:
        test_dashboard_stats()
    except Exception as e:
        print(f"\n💥 ERREUR: {e}")
