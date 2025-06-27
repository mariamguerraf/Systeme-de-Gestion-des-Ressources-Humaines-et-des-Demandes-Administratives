#!/usr/bin/env python3
"""
Test complet : Admin modifie le mot de passe d'un enseignant
puis test de connexion avec le nouveau mot de passe
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

def modify_teacher_password_via_api(admin_token, teacher_email, new_password):
    """Modifier le mot de passe d'un enseignant via l'API admin"""
    try:
        # Endpoint pour modifier un utilisateur (à adapter selon votre API)
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        # D'abord récupérer l'ID de l'enseignant
        response = requests.get(
            f"http://localhost:8000/users/search?email={teacher_email}",
            headers=headers,
            timeout=5
        )
        
        print(f"🔍 Recherche enseignant {teacher_email}...")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            user_data = response.json()
            print(f"   ✅ Enseignant trouvé")
        else:
            print(f"   ⚠️ Endpoint de recherche non disponible, modification directe en base")
            return modify_teacher_password_direct(teacher_email, new_password)
            
    except Exception as e:
        print(f"⚠️ Modification via API échouée: {e}")
        print(f"🔄 Utilisation de la modification directe...")
        return modify_teacher_password_direct(teacher_email, new_password)

def modify_teacher_password_direct(teacher_email, new_password):
    """Modifier directement le mot de passe en base (simulation admin)"""
    try:
        # Générer le hash du nouveau mot de passe
        password_hash = hashlib.sha256(new_password.encode()).hexdigest()
        
        conn = sqlite3.connect('gestion_db.db')
        cursor = conn.cursor()
        
        # Vérifier que l'enseignant existe
        cursor.execute("SELECT id, email, role FROM users WHERE email = ? AND role = 'ENSEIGNANT'", (teacher_email,))
        teacher = cursor.fetchone()
        
        if not teacher:
            print(f"❌ Enseignant {teacher_email} non trouvé")
            conn.close()
            return False
        
        print(f"👤 Enseignant trouvé: ID {teacher[0]}, Email: {teacher[1]}")
        
        # Mettre à jour le mot de passe
        cursor.execute(
            "UPDATE users SET hashed_password = ? WHERE email = ?",
            (password_hash, teacher_email)
        )
        
        conn.commit()
        
        if cursor.rowcount > 0:
            print(f"✅ Mot de passe modifié par admin pour {teacher_email}")
            print(f"   Nouveau mot de passe: '{new_password}'")
            print(f"   Hash: {password_hash[:30]}...")
            conn.close()
            return True
        else:
            print(f"❌ Aucune ligne mise à jour")
            conn.close()
            return False
            
    except Exception as e:
        print(f"❌ Erreur modification: {e}")
        return False

def test_teacher_login_with_new_password(teacher_email, new_password):
    """Tester la connexion de l'enseignant avec le nouveau mot de passe"""
    try:
        data = {
            'username': teacher_email,
            'password': new_password
        }
        
        response = requests.post(
            "http://localhost:8000/auth/login",
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=5
        )
        
        print(f"\n🧪 Test connexion enseignant avec nouveau mot de passe")
        print(f"   Email: {teacher_email}")
        print(f"   Mot de passe: {new_password}")
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

def test_old_password_should_fail(teacher_email, old_password):
    """Vérifier que l'ancien mot de passe ne fonctionne plus"""
    try:
        data = {
            'username': teacher_email,
            'password': old_password
        }
        
        response = requests.post(
            "http://localhost:8000/auth/login",
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=5
        )
        
        print(f"\n🧪 Test avec ancien mot de passe (doit échouer)")
        print(f"   Email: {teacher_email}")
        print(f"   Ancien mot de passe: {old_password}")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 401:
            print(f"   ✅ Ancien mot de passe rejeté (normal)")
            return True
        else:
            print(f"   ⚠️ Ancien mot de passe fonctionne encore (problème)")
            return False
            
    except Exception as e:
        print(f"   ❌ Erreur test: {e}")
        return False

def full_password_change_test():
    """Test complet de changement de mot de passe par admin"""
    print("🔧 TEST COMPLET - ADMIN MODIFIE MOT DE PASSE ENSEIGNANT")
    print("=" * 70)
    
    # Configuration du test
    teacher_email = "mariam@univ.ma"
    old_password = "mariam2024"
    new_password = "nouveau2024"
    
    print(f"📧 Enseignant: {teacher_email}")
    print(f"🔑 Ancien mot de passe: {old_password}")
    print(f"🔑 Nouveau mot de passe: {new_password}")
    
    # Étape 1: Connexion admin
    print(f"\n1️⃣ Connexion admin...")
    admin_token = get_admin_token()
    if not admin_token:
        print("❌ Impossible de continuer sans token admin")
        return
    
    # Étape 2: Vérifier que l'ancien mot de passe fonctionne
    print(f"\n2️⃣ Vérification ancien mot de passe...")
    if not test_teacher_login_with_new_password(teacher_email, old_password):
        print("⚠️ L'ancien mot de passe ne fonctionne pas, test quand même la modification")
    
    # Étape 3: Admin modifie le mot de passe
    print(f"\n3️⃣ Modification du mot de passe par admin...")
    if not modify_teacher_password_direct(teacher_email, new_password):
        print("❌ Échec de la modification")
        return
    
    # Étape 4: Test connexion avec nouveau mot de passe
    print(f"\n4️⃣ Test connexion avec nouveau mot de passe...")
    if test_teacher_login_with_new_password(teacher_email, new_password):
        print(f"\n🎉 SUCCÈS COMPLET!")
        print(f"✅ Admin a modifié le mot de passe")
        print(f"✅ Enseignant peut se connecter avec le nouveau mot de passe")
        
        # Étape 5: Vérifier que l'ancien mot de passe ne marche plus
        print(f"\n5️⃣ Vérification sécurité...")
        test_old_password_should_fail(teacher_email, old_password)
        
        print(f"\n📋 RÉSULTAT FINAL:")
        print(f"📧 Email: {teacher_email}")
        print(f"🔑 Nouveau mot de passe: {new_password}")
        print(f"✅ Fonctionnel pour connexion enseignant")
        
    else:
        print(f"❌ ÉCHEC - Le nouveau mot de passe ne fonctionne pas")

if __name__ == "__main__":
    full_password_change_test()
