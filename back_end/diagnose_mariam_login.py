#!/usr/bin/env python3
"""
Diagnostic du problème de connexion après modification par admin
"""
import sqlite3
import hashlib
import requests

def check_mariam_current_state():
    """Vérifier l'état actuel de mariam@univ.ma"""
    try:
        conn = sqlite3.connect('gestion_db.db')
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE email = 'mariam@univ.ma'")
        user = cursor.fetchone()
        
        if user:
            print("👤 État actuel de mariam@univ.ma:")
            print(f"   ID: {user[0]}")
            print(f"   Email: {user[1]}")
            print(f"   Role: {user[8]}")
            print(f"   Actif: {user[9]}")
            print(f"   Hash actuel: {user[7]}")
            return user
        else:
            print("❌ Utilisateur mariam@univ.ma non trouvé")
            return None
            
    except Exception as e:
        print(f"Erreur: {e}")
        return None
    finally:
        conn.close()

def test_different_password_formats(stored_hash):
    """Tester différents formats de mots de passe"""
    print(f"\n🧪 Test de différents mots de passe possibles:")
    
    # Mots de passe à tester
    test_passwords = [
        'nouveau2024',    # Le dernier qu'on a testé
        'mariam2024',     # L'ancien
        'password',       # Générique
        'mariam',         # Simple
        '123456',         # Numérique
        'admin2024',      # Admin
        'test2024'        # Test
    ]
    
    print(f"Hash stocké: {stored_hash}")
    print("-" * 50)
    
    found_password = None
    for pwd in test_passwords:
        # Test SHA256 (format actuel)
        sha256_hash = hashlib.sha256(pwd.encode()).hexdigest()
        print(f"'{pwd}' -> SHA256: {sha256_hash[:30]}...")
        
        if sha256_hash == stored_hash:
            print(f"   ✅ CORRESPONDANCE SHA256!")
            found_password = pwd
            break
        else:
            print(f"   ❌ Pas de correspondance")
    
    return found_password

def fix_mariam_password_format():
    """Corriger le format du mot de passe de Mariam"""
    print("\n🔧 Correction du format de mot de passe...")
    
    # Forcer un mot de passe simple avec SHA256
    new_password = "mariam2024"
    password_hash = hashlib.sha256(new_password.encode()).hexdigest()
    
    try:
        conn = sqlite3.connect('gestion_db.db')
        cursor = conn.cursor()
        
        cursor.execute(
            "UPDATE users SET hashed_password = ? WHERE email = 'mariam@univ.ma'",
            (password_hash,)
        )
        
        conn.commit()
        
        if cursor.rowcount > 0:
            print(f"✅ Mot de passe corrigé pour mariam@univ.ma")
            print(f"   Mot de passe: '{new_password}'")
            print(f"   Hash SHA256: {password_hash}")
            return new_password
        else:
            print(f"❌ Aucune ligne mise à jour")
            return None
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None
    finally:
        conn.close()

def test_login_after_fix(password):
    """Tester la connexion après correction"""
    try:
        data = {
            'username': 'mariam@univ.ma',
            'password': password
        }
        
        response = requests.post(
            "http://localhost:8000/auth/login",
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=5
        )
        
        print(f"\n🧪 Test connexion après correction:")
        print(f"   Email: mariam@univ.ma")
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
        print(f"   ❌ Erreur: {e}")
        return False

def diagnose_and_fix():
    """Diagnostic complet et correction"""
    print("🔍 DIAGNOSTIC PROBLÈME CONNEXION MARIAM")
    print("=" * 50)
    
    # 1. Vérifier l'état actuel
    user = check_mariam_current_state()
    if not user:
        return
    
    # 2. Tester les mots de passe possibles
    found_password = test_different_password_formats(user[7])
    
    if found_password:
        print(f"\n✅ Mot de passe trouvé: '{found_password}'")
        if test_login_after_fix(found_password):
            print(f"\n🎉 PROBLÈME RÉSOLU!")
            print(f"📧 Email: mariam@univ.ma")
            print(f"🔑 Mot de passe: {found_password}")
            return
    
    # 3. Si pas trouvé, forcer la correction
    print(f"\n🔧 Aucun mot de passe trouvé, correction forcée...")
    fixed_password = fix_mariam_password_format()
    
    if fixed_password:
        if test_login_after_fix(fixed_password):
            print(f"\n🎉 PROBLÈME RÉSOLU APRÈS CORRECTION!")
            print(f"📧 Email: mariam@univ.ma")
            print(f"🔑 Mot de passe: {fixed_password}")
        else:
            print(f"\n⚠️ Mot de passe corrigé mais connexion échoue encore")
            print(f"💡 Vérifiez que le backend est bien démarré")
    else:
        print(f"\n❌ Impossible de corriger le mot de passe")

if __name__ == "__main__":
    diagnose_and_fix()
