#!/usr/bin/env python3
import requests
import json
import hashlib

def test_fonctionnaire_password_change():
    """Tester le changement de mot de passe d'un fonctionnaire par un admin"""
    
    # Token admin pour la modification
    token_admin = "test_token_45_ADMIN"
    
    headers = {
        "Authorization": f"Bearer {token_admin}",
        "Content-Type": "application/json"
    }
    
    try:
        # 1. D'abord récupérer la liste des fonctionnaires pour avoir un ID
        response = requests.get("http://localhost:8000/users/fonctionnaires", headers=headers)
        print(f"📋 GET fonctionnaires - Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Erreur récupération fonctionnaires: {response.text}")
            return
            
        fonctionnaires = response.json()
        if not fonctionnaires:
            print("❌ Aucun fonctionnaire trouvé pour le test")
            return
            
        fonctionnaire = fonctionnaires[0]
        fonctionnaire_id = fonctionnaire['id']
        original_email = fonctionnaire['user']['email']
        
        print(f"🎯 Test avec fonctionnaire ID: {fonctionnaire_id}, Email: {original_email}")
        
        # 2. Changer le mot de passe du fonctionnaire
        new_password = "nouveaumotdepasse123"
        update_data = {
            "nom": fonctionnaire['user']['nom'],
            "prenom": fonctionnaire['user']['prenom'],
            "email": original_email,
            "password": new_password  # Nouveau mot de passe
        }
        
        response = requests.put(
            f"http://localhost:8000/users/fonctionnaires/{fonctionnaire_id}",
            headers=headers,
            json=update_data
        )
        
        print(f"🔄 PUT fonctionnaire (changement mot de passe) - Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Modification réussie")
            updated_data = response.json()
            print(f"📄 Données mises à jour: {updated_data['user']['email']}")
            
            # 3. Tester la connexion avec le nouveau mot de passe
            print("\n🔐 Test de connexion avec le nouveau mot de passe...")
            
            login_data = {
                "username": original_email,
                "password": new_password
            }
            
            login_response = requests.post(
                "http://localhost:8000/auth/login",
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                data=login_data
            )
            
            print(f"🔑 Login test - Status: {login_response.status_code}")
            
            if login_response.status_code == 200:
                login_result = login_response.json()
                print(f"✅ Connexion réussie avec le nouveau mot de passe!")
                print(f"🎫 Token reçu: {login_result.get('access_token', 'N/A')[:50]}...")
            else:
                print(f"❌ Échec de la connexion: {login_response.text}")
                
        else:
            print(f"❌ Erreur modification: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_fonctionnaire_password_change()
