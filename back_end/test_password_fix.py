
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
    