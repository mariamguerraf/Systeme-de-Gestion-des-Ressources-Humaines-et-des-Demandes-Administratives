#!/usr/bin/env python3
"""
Script pour vérifier et corriger le mot de passe de mariam@univ.ma
"""
import sqlite3
import hashlib
import requests

def check_mariam_user():
    """Vérifier l'utilisateur mariam@univ.ma"""
    try:
        conn = sqlite3.connect('gestion_db.db')
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE email = 'mariam@univ.ma'")
        user = cursor.fetchone()
        
        if user:
            print("👤 Utilisateur mariam@univ.ma trouvé:")
            print(f"   ID: {user[0]}")
            print(f"   Email: {user[1]}")
            print(f"   Nom: {user[2]}")
            print(f"   Prénom: {user[3]}")
            print(f"   Role: {user[8]}")
            print(f"   Actif: {user[9]}")
            print(f"   Hash actuel: {user[7][:30]}...")
            return user
        else:
            print("❌ Utilisateur mariam@univ.ma non trouvé")
            return None
            
    except Exception as e:
        print(f"Erreur: {e}")
        return None
    finally:
        conn.close()

def update_mariam_password(new_password):
    """Mettre à jour le mot de passe de mariam@univ.ma"""
    try:
        # Générer le hash du nouveau mot de passe
        password_hash = hashlib.sha256(new_password.encode()).hexdigest()
        
        conn = sqlite3.connect('gestion_db.db')
        cursor = conn.cursor()
        
        # Mettre à jour le mot de passe
        cursor.execute(
            "UPDATE users SET hashed_password = ? WHERE email = 'mariam@univ.ma'",
            (password_hash,)
        )
        
        conn.commit()
        
        if cursor.rowcount > 0:
            print(f"✅ Mot de passe mis à jour pour mariam@univ.ma")
            print(f"   Nouveau mot de passe: '{new_password}'")
            print(f"   Hash généré: {password_hash[:30]}...")
            return True
        else:
            print("❌ Aucune ligne mise à jour")
            return False
            
    except Exception as e:
        print(f"Erreur: {e}")
        return False
    finally:
        conn.close()

def test_mariam_login(password):
    """Tester la connexion de mariam@univ.ma via l'API"""
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
        
        print(f"\n🧪 Test connexion API mariam@univ.ma + {password}")
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
        print(f"   💥 Erreur: Backend non accessible sur http://localhost:8000")
        return False
    except Exception as e:
        print(f"   💥 Erreur test: {e}")
        return False

def verify_password_hash(password, stored_hash):
    """Vérifier si le hash du mot de passe correspond"""
    generated_hash = hashlib.sha256(password.encode()).hexdigest()
    print(f"\n🔍 Vérification du hash:")
    print(f"   Mot de passe: '{password}'")
    print(f"   Hash généré:  {generated_hash[:30]}...")
    print(f"   Hash stocké:  {stored_hash[:30]}...")
    print(f"   Correspondance: {'✅ OUI' if generated_hash == stored_hash else '❌ NON'}")
    return generated_hash == stored_hash

def fix_mariam_password():
    """Corriger complètement le mot de passe de mariam"""
    print("🔧 CORRECTION DU MOT DE PASSE MARIAM")
    print("=" * 50)
    
    # 1. Vérifier l'utilisateur actuel
    user = check_mariam_user()
    if not user:
        print("❌ Impossible de continuer sans utilisateur")
        return
    
    # 2. Tester les mots de passe courants
    test_passwords = ['mariam2024', 'password', '123456', 'mariam', 'admin2024']
    
    print(f"\n🧪 Test des mots de passe courants:")
    for pwd in test_passwords:
        if verify_password_hash(pwd, user[7]):
            print(f"✅ Mot de passe trouvé: '{pwd}'")
            # Tester avec l'API
            if test_mariam_login(pwd):
                print(f"🎉 SOLUTION: mariam@univ.ma / {pwd}")
                return
    
    # 3. Si aucun mot de passe ne fonctionne, forcer la mise à jour
    print(f"\n🔧 Aucun mot de passe trouvé, mise à jour forcée...")
    new_password = "mariam2024"
    
    if update_mariam_password(new_password):
        # 4. Vérifier la mise à jour
        user_updated = check_mariam_user()
        if user_updated and verify_password_hash(new_password, user_updated[7]):
            # 5. Test final avec l'API
            if test_mariam_login(new_password):
                print(f"\n🎉 PROBLÈME RÉSOLU!")
                print(f"📧 Email: mariam@univ.ma")
                print(f"🔑 Mot de passe: {new_password}")
                print(f"✅ Connexion API fonctionnelle")
            else:
                print(f"\n⚠️ Mot de passe mis à jour mais API ne répond pas")
                print(f"📧 Email: mariam@univ.ma")
                print(f"🔑 Mot de passe: {new_password}")
                print(f"💡 Vérifiez que le backend est démarré")
        else:
            print(f"❌ Erreur lors de la vérification après mise à jour")
    else:
        print(f"❌ Échec de la mise à jour du mot de passe")

if __name__ == "__main__":
    fix_mariam_password()
