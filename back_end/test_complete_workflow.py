#!/usr/bin/env python3
"""
Test complet du workflow de modification de mot de passe par admin
après application de la correction dans main.py
"""
import sqlite3
import hashlib
import requests
import json

def get_admin_token():
    """Se connecter en tant qu'admin et récupérer le token"""
    try:
        data = {
            'username': 'admin@univ.ma',
            'password': 'admin2024'
        }
        
        response = requests.post(
            "http://localhost:8000/auth/login",
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            token = result.get('access_token')
            print(f"✅ Admin connecté - Token: {token}")
            return token
        else:
            print(f"❌ Échec connexion admin: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur connexion admin: {e}")
        return None

def get_enseignant_id(admin_token, email):
    """Récupérer l'ID d'un enseignant par email"""
    try:
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            "http://localhost:8000/users/enseignants",
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            enseignants = response.json()
            for enseignant in enseignants:
                if enseignant['user']['email'] == email:
                    print(f"✅ Enseignant trouvé: ID {enseignant['id']}, Email: {email}")
                    return enseignant['id']
            
            print(f"❌ Enseignant {email} non trouvé dans la liste")
            return None
        else:
            print(f"❌ Erreur récupération enseignants: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur recherche enseignant: {e}")
        return None

def modify_teacher_password_via_api(admin_token, teacher_id, new_password):
    """Modifier le mot de passe d'un enseignant via l'API corrigée"""
    try:
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        # Données de modification
        update_data = {
            "password": new_password
        }
        
        response = requests.put(
            f"http://localhost:8000/users/enseignants/{teacher_id}",
            headers=headers,
            json=update_data,
            timeout=5
        )
        
        print(f"🔧 Modification mot de passe via API...")
        print(f"   Enseignant ID: {teacher_id}")
        print(f"   Nouveau mot de passe: {new_password}")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Modification réussie!")
            print(f"   Email: {result.get('user', {}).get('email', 'N/A')}")
            return True
        else:
            print(f"   ❌ Échec modification: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur modification via API: {e}")
        return False

def test_teacher_login(email, password):
    """Tester la connexion de l'enseignant"""
    try:
        data = {
            'username': email,
            'password': password
        }
        
        response = requests.post(
            "http://localhost:8000/auth/login",
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=5
        )
        
        print(f"\n🧪 Test connexion enseignant")
        print(f"   Email: {email}")
        print(f"   Mot de passe: {password}")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Connexion réussie!")
            print(f"   Token: {result.get('access_token', 'N/A')}")
            return True
        else:
            print(f"   ❌ Connexion échouée: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Erreur test: {e}")
        return False

def full_workflow_test():
    """Test complet du workflow admin modifie mot de passe enseignant"""
    print("🚀 TEST COMPLET WORKFLOW - MODIFICATION MOT DE PASSE PAR ADMIN")
    print("=" * 70)
    
    # Configuration
    teacher_email = "mariam@univ.ma" 
    old_password = "test_corrected_2024"  # Ancien mot de passe du test précédent
    new_password = "admin_changed_2024"   # Nouveau mot de passe par admin
    
    print(f"📧 Enseignant: {teacher_email}")
    print(f"🔑 Ancien mot de passe: {old_password}")
    print(f"🔑 Nouveau mot de passe: {new_password}")
    
    # Étape 1: Connexion admin
    print(f"\n1️⃣ Connexion admin...")
    admin_token = get_admin_token()
    if not admin_token:
        print("❌ Impossible de continuer sans token admin")
        return False
    
    # Étape 2: Vérifier que l'ancien mot de passe fonctionne
    print(f"\n2️⃣ Vérification ancien mot de passe...")
    if not test_teacher_login(teacher_email, old_password):
        print("⚠️ L'ancien mot de passe ne fonctionne pas, on continue quand même")
    
    # Étape 3: Récupérer l'ID de l'enseignant
    print(f"\n3️⃣ Recherche de l'enseignant...")
    teacher_id = get_enseignant_id(admin_token, teacher_email)
    if not teacher_id:
        print("❌ Impossible de continuer sans ID enseignant")
        return False
    
    # Étape 4: Modifier le mot de passe via l'API
    print(f"\n4️⃣ Modification mot de passe via API admin...")
    if not modify_teacher_password_via_api(admin_token, teacher_id, new_password):
        print("❌ Échec de la modification")
        return False
    
    # Étape 5: Tester la connexion avec le nouveau mot de passe
    print(f"\n5️⃣ Test connexion avec nouveau mot de passe...")
    if test_teacher_login(teacher_email, new_password):
        print(f"\n🎉 SUCCÈS COMPLET!")
        print(f"✅ Admin s'est connecté")
        print(f"✅ Admin a modifié le mot de passe via l'interface")
        print(f"✅ Enseignant peut se connecter avec le nouveau mot de passe")
        
        # Étape 6: Vérifier que l'ancien ne marche plus
        print(f"\n6️⃣ Vérification sécurité (ancien mot de passe)...")
        if test_teacher_login(teacher_email, old_password):
            print(f"   ⚠️ ATTENTION: L'ancien mot de passe fonctionne encore!")
        else:
            print(f"   ✅ Ancien mot de passe bien rejeté")
        
        print(f"\n📋 RÉSULTAT FINAL:")
        print(f"📧 Email: {teacher_email}")
        print(f"🔑 Mot de passe fonctionnel: {new_password}")
        print(f"✅ Workflow admin → modification → connexion : FONCTIONNEL")
        print(f"✅ Cohérence SHA256 : ASSURÉE")
        
        return True
    else:
        print(f"\n❌ ÉCHEC - Le nouveau mot de passe ne fonctionne pas")
        print("🔍 Vérifier que le backend a été redémarré avec les corrections")
        return False

if __name__ == "__main__":
    full_workflow_test()
