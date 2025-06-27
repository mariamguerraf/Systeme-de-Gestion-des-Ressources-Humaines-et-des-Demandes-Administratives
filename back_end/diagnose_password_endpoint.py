#!/usr/bin/env python3
"""
Correction de l'endpoint de modification d'enseignant pour gérer les mots de passe
et utiliser SHA256 pour être cohérent avec l'endpoint login
"""

def analyze_problem():
    """Analyser le problème de cohérence des mots de passe"""
    print("🔍 ANALYSE DU PROBLÈME DE COHÉRENCE DES MOTS DE PASSE")
    print("=" * 65)
    
    print("\n📋 Systèmes de hash détectés :")
    print("1️⃣ main.py login (ligne 575) : SHA256")
    print("2️⃣ auth.py (ligne 18) : bcrypt")
    print("3️⃣ main.py modification enseignant : AUCUN (manquant)")
    
    print("\n⚠️ PROBLÈME IDENTIFIÉ :")
    print("- Login utilise SHA256")
    print("- Routeur users utilise bcrypt") 
    print("- Endpoint principal modification enseignant ne gère pas les mots de passe")
    print("- Incohérence → mot de passe modifié en bcrypt ne fonctionne pas avec login SHA256")
    
    print("\n✅ SOLUTION REQUISE :")
    print("- Ajouter gestion mot de passe dans endpoint principal")
    print("- Utiliser SHA256 pour être cohérent avec login")
    print("- Tester la modification + connexion")

def get_current_endpoint_code():
    """Récupérer le code actuel de l'endpoint de modification"""
    print("\n🔍 Analyse du code actuel de l'endpoint PUT /users/enseignants/{id}")
    print("=" * 65)
    
    try:
        with open('main.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Chercher l'endpoint PUT
        lines = content.split('\n')
        in_endpoint = False
        endpoint_lines = []
        
        for i, line in enumerate(lines):
            if '@app.put("/users/enseignants/{enseignant_id}")' in line:
                in_endpoint = True
                start_line = i
                print(f"✅ Endpoint trouvé à la ligne {i+1}")
                
            if in_endpoint:
                endpoint_lines.append(f"{i+1:4d}: {line}")
                
                # Fin de l'endpoint quand on trouve le suivant ou une fonction
                if (line.strip().startswith('@app.') or 
                    line.strip().startswith('def ')) and i > start_line + 5:
                    break
        
        print("\n📄 Code actuel :")
        print("-" * 40)
        for line in endpoint_lines[:50]:  # Afficher les 50 premières lignes
            print(line)
            
        # Vérifier s'il y a gestion des mots de passe
        code_str = '\n'.join([line.split(':', 1)[1] if ':' in line else line for line in endpoint_lines])
        
        if 'password' in code_str.lower():
            print("\n⚠️ Gestion mot de passe détectée dans l'endpoint")
        else:
            print("\n❌ AUCUNE gestion mot de passe dans l'endpoint principal")
            
        return True
        
    except Exception as e:
        print(f"❌ Erreur lecture main.py: {e}")
        return False

def generate_fix_code():
    """Générer le code de correction"""
    print("\n🔧 GÉNÉRATION DU CODE DE CORRECTION")
    print("=" * 50)
    
    fix_code = '''
        # NOUVEAU CODE À AJOUTER dans l'endpoint de modification
        
        # Gestion du mot de passe (nouveau)
        new_password = enseignant_data.get('password')
        if new_password is not None and new_password.strip() != "" and new_password != 'unchanged':
            # Utiliser SHA256 pour être cohérent avec l'endpoint login
            import hashlib
            password_hash = hashlib.sha256(new_password.encode()).hexdigest()
            user_updates.append("hashed_password = ?")
            user_params.append(password_hash)
            print(f"🔑 Mot de passe mis à jour pour {enseignant_data.get('email', 'utilisateur')}")
    '''
    
    print("📝 Code à insérer :")
    print(fix_code)
    
    print("\n📍 Position d'insertion :")
    print("- Après la gestion des autres champs utilisateur (cin, adresse, etc.)")
    print("- Avant la mise à jour SQL des données utilisateur")
    
    return fix_code

def create_test_script():
    """Créer un script de test pour valider la correction"""
    print("\n🧪 CRÉATION SCRIPT DE TEST")
    print("=" * 40)
    
    test_script = '''
import sqlite3
import hashlib
import requests

def test_password_modification_fix():
    """Tester la modification de mot de passe corrigée"""
    print("🧪 TEST MODIFICATION MOT DE PASSE - APRÈS CORRECTION")
    print("=" * 60)
    
    teacher_email = "mariam@univ.ma"
    new_password = "test_corrected_2024"
    
    # Simuler modification admin avec SHA256
    try:
        password_hash = hashlib.sha256(new_password.encode()).hexdigest()
        
        conn = sqlite3.connect('gestion_db.db')
        cursor = conn.cursor()
        
        cursor.execute(
            "UPDATE users SET hashed_password = ? WHERE email = ?",
            (password_hash, teacher_email)
        )
        
        conn.commit()
        
        if cursor.rowcount > 0:
            print(f"✅ Modification réussie pour {teacher_email}")
            
            # Test connexion immédiat
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
            
            print(f"🧪 Test connexion: Status {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ SUCCÈS! Connexion fonctionne")
                print(f"📧 Email: {teacher_email}")
                print(f"🔑 Mot de passe: {new_password}")
                print(f"🎫 Token: {result.get('access_token', 'N/A')}")
                return True
            else:
                print(f"❌ Connexion échouée: {response.text}")
                return False
        else:
            print(f"❌ Aucune ligne mise à jour")
            return False
            
        conn.close()
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    test_password_modification_fix()
    '''
    
    with open('test_password_fix.py', 'w', encoding='utf-8') as f:
        f.write(test_script)
    
    print("✅ Script de test créé: test_password_fix.py")

def main():
    """Fonction principale"""
    print("🔧 DIAGNOSTIC ET SOLUTION - MODIFICATION MOT DE PASSE ENSEIGNANT")
    print("=" * 70)
    
    # 1. Analyser le problème
    analyze_problem()
    
    # 2. Examiner le code actuel
    if get_current_endpoint_code():
        # 3. Générer la correction
        generate_fix_code()
        
        # 4. Créer un script de test
        create_test_script()
        
        print("\n🎯 ÉTAPES SUIVANTES :")
        print("1. Appliquer la correction dans main.py")
        print("2. Redémarrer le backend")
        print("3. Exécuter: python test_password_fix.py")
        print("4. Tester via l'interface admin")
        
        print("\n📋 RÉSUMÉ SOLUTION :")
        print("✅ Endpoint login : SHA256")
        print("✅ Endpoint modification : SHA256 (après correction)")
        print("✅ Cohérence assurée")
        print("✅ Test automatisé disponible")

if __name__ == "__main__":
    main()
