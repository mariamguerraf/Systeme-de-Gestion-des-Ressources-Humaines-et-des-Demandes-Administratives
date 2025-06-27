#!/usr/bin/env python3
"""
Script pour vérifier et corriger les mots de passe des admins
"""
import sqlite3
import hashlib
import requests

def check_admin_users():
    """Vérifier tous les utilisateurs admin"""
    try:
        conn = sqlite3.connect('gestion_db.db')
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE role = 'ADMIN' AND is_active = 1")
        users = cursor.fetchall()
        
        print("👥 Utilisateurs ADMIN trouvés:")
        print("=" * 50)
        
        admin_list = []
        for user in users:
            print(f"\n📧 Email: {user[1]}")
            print(f"   ID: {user[0]}")
            print(f"   Nom: {user[2]} {user[3]}")
            print(f"   Role: {user[8]}")
            print(f"   Actif: {user[9]}")
            print(f"   Hash: {user[7][:30]}...")
            admin_list.append(user)
        
        conn.close()
        return admin_list
        
    except Exception as e:
        print(f"Erreur: {e}")
        return []

def test_admin_passwords(admin_user):
    """Tester différents mots de passe pour un admin"""
    email = admin_user[1]
    stored_hash = admin_user[7]
    
    print(f"\n🧪 Test mots de passe pour {email}:")
    
    # Mots de passe courants à tester
    test_passwords = [
        'admin2024', 'admin', 'password', '123456', 
        'admin123', 'root', 'test', 'admin2025'
    ]
    
    for pwd in test_passwords:
        generated_hash = hashlib.sha256(pwd.encode()).hexdigest()
        if generated_hash == stored_hash:
            print(f"   ✅ TROUVÉ: '{pwd}'")
            return pwd
        else:
            print(f"   ❌ '{pwd}' - Non")
    
    print(f"   ⚠️ Aucun mot de passe standard trouvé")
    return None

def update_admin_password(email, new_password):
    """Mettre à jour le mot de passe d'un admin"""
    try:
        # Générer le hash du nouveau mot de passe
        password_hash = hashlib.sha256(new_password.encode()).hexdigest()
        
        conn = sqlite3.connect('gestion_db.db')
        cursor = conn.cursor()
        
        # Mettre à jour le mot de passe
        cursor.execute(
            "UPDATE users SET hashed_password = ? WHERE email = ?",
            (password_hash, email)
        )
        
        conn.commit()
        
        if cursor.rowcount > 0:
            print(f"✅ Mot de passe mis à jour pour {email}")
            print(f"   Nouveau mot de passe: '{new_password}'")
            print(f"   Hash: {password_hash[:30]}...")
            return True
        else:
            print(f"❌ Aucune ligne mise à jour pour {email}")
            return False
            
    except Exception as e:
        print(f"Erreur: {e}")
        return False
    finally:
        conn.close()

def test_admin_login(email, password):
    """Tester la connexion admin via l'API"""
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
        
        print(f"🧪 Test API {email} + {password}")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Connexion réussie!")
            print(f"   Token: {result.get('access_token', 'N/A')}")
            return True
        else:
            print(f"   ❌ Connexion échouée: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"   💥 Backend non accessible")
        return False
    except Exception as e:
        print(f"   💥 Erreur: {e}")
        return False

def fix_all_admin_passwords():
    """Corriger tous les mots de passe admin"""
    print("🔧 CORRECTION DES MOTS DE PASSE ADMIN")
    print("=" * 60)
    
    # 1. Récupérer tous les admins
    admins = check_admin_users()
    
    if not admins:
        print("❌ Aucun admin trouvé")
        return
    
    fixed_admins = []
    
    # 2. Pour chaque admin
    for admin in admins:
        email = admin[1]
        print(f"\n" + "="*30)
        print(f"🔧 Traitement de {email}")
        print(f"="*30)
        
        # Tester les mots de passe existants
        found_password = test_admin_passwords(admin)
        
        if found_password:
            # Tester avec l'API
            if test_admin_login(email, found_password):
                print(f"✅ {email} fonctionne avec '{found_password}'")
                fixed_admins.append((email, found_password))
                continue
        
        # Si pas trouvé, forcer la mise à jour
        print(f"\n🔄 Mise à jour forcée pour {email}")
        new_password = "admin2024"
        
        if update_admin_password(email, new_password):
            if test_admin_login(email, new_password):
                print(f"✅ {email} corrigé avec '{new_password}'")
                fixed_admins.append((email, new_password))
            else:
                print(f"⚠️ {email} mis à jour mais API non accessible")
                fixed_admins.append((email, new_password))
        else:
            print(f"❌ Échec mise à jour {email}")
    
    # 3. Résumé final
    print(f"\n" + "="*60)
    print(f"📋 RÉSUMÉ - CREDENTIALS ADMIN FONCTIONNELS")
    print(f"="*60)
    
    for email, password in fixed_admins:
        print(f"📧 {email}")
        print(f"🔑 {password}")
        print(f"👤 Role: ADMIN")
        print("-" * 30)
    
    if fixed_admins:
        print(f"🎉 {len(fixed_admins)} admin(s) avec mots de passe fonctionnels!")
    else:
        print(f"❌ Aucun admin corrigé")

if __name__ == "__main__":
    fix_all_admin_passwords()
