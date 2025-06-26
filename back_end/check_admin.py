import sqlite3
import hashlib

def check_admin_user():
    try:
        conn = sqlite3.connect('gestion_db.db')
        cursor = conn.cursor()
        
        print("=== Vérification des admins existants ===")
        cursor.execute("SELECT id, nom, prenom, email, role FROM users WHERE role = 'ADMIN'")
        admins = cursor.fetchall()
        
        for admin in admins:
            print(f"ID: {admin[0]}, Nom: {admin[1]} {admin[2]}, Email: {admin[3]}, Role: {admin[4]}")
        
        # Vérifier si admin@univ.ma existe
        cursor.execute("SELECT id, email, password FROM users WHERE email = 'admin@univ.ma'")
        admin_univ = cursor.fetchone()
        
        if admin_univ:
            print(f"\n✅ admin@univ.ma existe - ID: {admin_univ[0]}")
            print(f"Password hash: {admin_univ[2][:50]}...")
        else:
            print("\n❌ admin@univ.ma n'existe pas")
        
        conn.close()
        
    except Exception as e:
        print(f"Erreur: {e}")

if __name__ == "__main__":
    check_admin_user()
