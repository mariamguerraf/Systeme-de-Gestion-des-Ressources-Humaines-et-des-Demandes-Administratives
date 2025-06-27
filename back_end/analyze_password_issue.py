#!/usr/bin/env python3
"""
Analyse du problème : Modification mot de passe admin vs connexion enseignant
"""
import sqlite3
import hashlib
import requests

def analyze_password_modification_issue():
    """Analyser le problème de modification de mot de passe"""
    print("🔍 ANALYSE DU PROBLÈME DE MODIFICATION MOT DE PASSE")
    print("=" * 60)
    
    # 1. Vérifier l'état actuel de Mariam
    print("1️⃣ État actuel de mariam@univ.ma:")
    try:
        conn = sqlite3.connect('gestion_db.db')
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = 'mariam@univ.ma'")
        user = cursor.fetchone()
        
        if user:
            print(f"   ID: {user[0]}")
            print(f"   Email: {user[1]}")
            print(f"   Hash: {user[7]}")
            stored_hash = user[7]
        else:
            print("   ❌ Utilisateur non trouvé")
            return
        
        conn.close()
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return
    
    # 2. Tester les mots de passe possibles
    print(f"\n2️⃣ Test des mots de passe possibles:")
    test_passwords = ['nouveau2024', 'mariam2024', 'password', 'test123']
    
    working_password = None
    for pwd in test_passwords:
        sha256_hash = hashlib.sha256(pwd.encode()).hexdigest()
        if sha256_hash == stored_hash:
            print(f"   ✅ '{pwd}' correspond au hash stocké")
            working_password = pwd
        else:
            print(f"   ❌ '{pwd}' ne correspond pas")
    
    if not working_password:
        print("   ⚠️ Aucun mot de passe ne correspond au hash")
        return
    
    # 3. Tester la connexion API
    print(f"\n3️⃣ Test connexion API avec '{working_password}':")
    try:
        data = {
            'username': 'mariam@univ.ma',
            'password': working_password
        }
        
        response = requests.post(
            "http://localhost:8000/auth/login",
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=5
        )
        
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Connexion réussie!")
            print(f"   Token: {result.get('access_token')}")
        else:
            print(f"   ❌ Connexion échouée: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Erreur API: {e}")
    
    # 4. Analyser l'endpoint de modification admin
    print(f"\n4️⃣ Analyse de l'endpoint de modification admin:")
    print(f"   Problème possible: L'interface admin utilise PUT /users/enseignants/1")
    print(f"   Cet endpoint pourrait utiliser un format de hash différent")
    
    return working_password

def check_admin_endpoint_format():
    """Vérifier comment l'endpoint admin traite les mots de passe"""
    print(f"\n🔍 VÉRIFICATION ENDPOINT ADMIN")
    print("=" * 40)
    
    # Chercher l'endpoint PUT dans main.py
    try:
        with open('main.py', 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Chercher les endpoints PUT pour enseignants
        lines = content.split('\n')
        in_put_endpoint = False
        put_endpoint_lines = []
        
        for i, line in enumerate(lines):
            if 'PUT' in line and 'enseignant' in line.lower():
                print(f"   Trouvé endpoint PUT à la ligne {i+1}:")
                print(f"   {line.strip()}")
                in_put_endpoint = True
                
            if in_put_endpoint and ('password' in line.lower() or 'hash' in line.lower()):
                print(f"   Ligne {i+1}: {line.strip()}")
                
            if in_put_endpoint and line.strip().startswith('def ') and 'enseignant' not in line.lower():
                break
                
    except Exception as e:
        print(f"   ❌ Erreur lecture main.py: {e}")

def simulate_admin_password_change():
    """Simuler une modification de mot de passe par admin avec le bon format"""
    print(f"\n🔧 SIMULATION MODIFICATION ADMIN CORRECTE")
    print("=" * 50)
    
    # Nouveau mot de passe de test
    new_password = "test2024"
    
    print(f"   Nouveau mot de passe: '{new_password}'")
    
    # Format SHA256 (comme l'endpoint login)
    password_hash = hashlib.sha256(new_password.encode()).hexdigest()
    print(f"   Hash SHA256: {password_hash[:30]}...")
    
    try:
        conn = sqlite3.connect('gestion_db.db')
        cursor = conn.cursor()
        
        cursor.execute(
            "UPDATE users SET hashed_password = ? WHERE email = 'mariam@univ.ma'",
            (password_hash,)
        )
        
        conn.commit()
        
        if cursor.rowcount > 0:
            print(f"   ✅ Mot de passe mis à jour")
            
            # Test immédiat
            data = {
                'username': 'mariam@univ.ma',
                'password': new_password
            }
            
            response = requests.post(
                "http://localhost:8000/auth/login",
                data=data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=5
            )
            
            print(f"   Test connexion: Status {response.status_code}")
            if response.status_code == 200:
                print(f"   ✅ Connexion fonctionne immédiatement!")
                result = response.json()
                print(f"   Token: {result.get('access_token')}")
                
                print(f"\n🎉 SOLUTION TROUVÉE!")
                print(f"📧 Email: mariam@univ.ma")
                print(f"🔑 Mot de passe: {new_password}")
                print(f"✅ Connexion fonctionnelle")
                
            else:
                print(f"   ❌ Connexion échoue: {response.text}")
        else:
            print(f"   ❌ Aucune ligne mise à jour")
            
        conn.close()
        
    except Exception as e:
        print(f"   ❌ Erreur: {e}")

if __name__ == "__main__":
    # 1. Analyser le problème actuel
    current_password = analyze_password_modification_issue()
    
    # 2. Vérifier l'endpoint admin
    check_admin_endpoint_format()
    
    # 3. Simuler une modification correcte
    simulate_admin_password_change()
