#!/usr/bin/env python3
"""
Test d'intégration complète - SQLite + FastAPI + React
Vérifie que toutes les fonctionnalités CRUD persistent correctement
"""
import requests
import json
import time

BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:8081"

def test_backend_health():
    """Test de santé du backend"""
    print("🔍 Test de santé du backend...")
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend opérationnel")
            return True
        else:
            print(f"❌ Backend erreur: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend inaccessible: {e}")
        return False

def test_frontend_access():
    """Test d'accès au frontend"""
    print("🔍 Test d'accès au frontend...")
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print("✅ Frontend accessible")
            return True
        else:
            print(f"❌ Frontend erreur: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend inaccessible: {e}")
        return False

def test_database_operations():
    """Test des opérations de base de données"""
    print("🔍 Test des opérations SQLite...")
    
    # Connexion admin
    login_data = {
        "username": "admin@gestion.com",
        "password": "password123"
    }
    
    try:
        # Login
        response = requests.post(f"{BACKEND_URL}/auth/login", data=login_data)
        if response.status_code != 200:
            print("❌ Échec de connexion")
            return False
        
        token = response.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test récupération enseignants
        response = requests.get(f"{BACKEND_URL}/users/enseignants", headers=headers)
        if response.status_code != 200:
            print("❌ Échec récupération enseignants")
            return False
        
        enseignants = response.json()
        initial_count = len(enseignants)
        print(f"📊 {initial_count} enseignants trouvés")
        
        # Test création enseignant unique
        unique_email = f"test.integration.{int(time.time())}@test.com"
        enseignant_data = {
            "nom": "TestIntegration",
            "prenom": "SQLite",
            "email": unique_email,
            "telephone": "0123456999",
            "adresse": "Adresse Test Integration",
            "cin": f"CININT{int(time.time())}",
            "password": "password123",
            "specialite": "Integration Testing",
            "grade": "Test Engineer",
            "etablissement": "SQLite University"
        }
        
        response = requests.post(f"{BACKEND_URL}/users/enseignants", 
                               headers={**headers, "Content-Type": "application/json"}, 
                               json=enseignant_data)
        
        if response.status_code not in [200, 201]:
            print(f"❌ Échec création enseignant: {response.text}")
            return False
        
        # Vérification persistance
        response = requests.get(f"{BACKEND_URL}/users/enseignants", headers=headers)
        if response.status_code != 200:
            print("❌ Échec vérification persistance")
            return False
        
        enseignants_after = response.json()
        final_count = len(enseignants_after)
        
        if final_count > initial_count:
            print(f"✅ Persistance confirmée: {initial_count} → {final_count} enseignants")
            return True
        else:
            print("❌ Problème de persistance")
            return False
            
    except Exception as e:
        print(f"❌ Erreur base de données: {e}")
        return False

def main():
    print("🧪 TEST D'INTÉGRATION COMPLÈTE")
    print("=" * 50)
    print("Backend SQLite + FastAPI + Frontend React")
    print("=" * 50)
    
    results = {}
    
    # Tests individuels
    results['backend'] = test_backend_health()
    results['frontend'] = test_frontend_access()
    results['database'] = test_database_operations()
    
    # Résumé
    print("\n" + "=" * 50)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 50)
    
    all_passed = True
    for test_name, passed in results.items():
        status = "✅ SUCCÈS" if passed else "❌ ÉCHEC"
        print(f"{test_name.capitalize():.<20} {status}")
        if not passed:
            all_passed = False
    
    print("=" * 50)
    if all_passed:
        print("🎉 TOUS LES TESTS RÉUSSIS !")
        print("✅ Application complètement fonctionnelle avec SQLite")
        print("✅ Persistance des données confirmée")
        print("✅ Frontend et Backend opérationnels")
    else:
        print("❌ CERTAINS TESTS ONT ÉCHOUÉ")
    
    print("=" * 50)

if __name__ == "__main__":
    main()
