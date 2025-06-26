import sqlite3
import hashlib
from datetime import datetime

def create_admin_univ():
    try:
        conn = sqlite3.connect('gestion_db.db')
        cursor = conn.cursor()
        
        # Hasher le mot de passe admin2024
        password = "admin2024"
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        print(f"Création admin avec password: {password}")
        print(f"Hash: {hashed_password}")
        
        # Vérifier s'il existe déjà
        cursor.execute("SELECT id FROM users WHERE email = 'admin@univ.ma'")
        existing = cursor.fetchone()
        
        if existing:
            print("❌ admin@univ.ma existe déjà")
            return
        
        # Créer l'admin
        cursor.execute("""
            INSERT INTO users (email, nom, prenom, hashed_password, role, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            'admin@univ.ma',
            'Admin',
            'Universitaire', 
            hashed_password,
            'ADMIN',
            True,
            datetime.now().isoformat()
        ))
        
        admin_id = cursor.lastrowid
        conn.commit()
        
        print(f"✅ Admin créé avec ID: {admin_id}")
        
        # Vérifier la création
        cursor.execute("SELECT id, email, nom, prenom, role FROM users WHERE email = 'admin@univ.ma'")
        admin = cursor.fetchone()
        print(f"Vérification: {admin}")
        
        conn.close()
        
    except Exception as e:
        print(f"Erreur: {e}")

if __name__ == "__main__":
    create_admin_univ()
