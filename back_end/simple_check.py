#!/usr/bin/env python3
import sqlite3

def check_database():
    # Connexion à la base
    conn = sqlite3.connect('gestion_db.db')
    cursor = conn.cursor()
    
    # Vérifier les utilisateurs admin
    cursor.execute("SELECT id, email, role, is_active FROM users WHERE role = 'admin'")
    admins = cursor.fetchall()
    
    print("=== ADMINISTRATEURS DANS LA BASE ===")
    if not admins:
        print("❌ AUCUN ADMINISTRATEUR TROUVÉ!")
    else:
        for admin in admins:
            id_user, email, role, is_active = admin
            print(f"ID: {id_user}")
            print(f"Email: {email}")
            print(f"Rôle: {role}")
            print(f"Actif: {is_active}")
            print("-" * 40)
    
    # Vérifier spécifiquement admin@test.com
    cursor.execute("SELECT id, email, role, is_active FROM users WHERE email = ?", ("admin@test.com",))
    admin_test = cursor.fetchone()
    
    print("\n=== VÉRIFICATION admin@test.com ===")
    if admin_test:
        print("✅ admin@test.com EXISTE dans la base")
        print(f"ID: {admin_test[0]}, Email: {admin_test[1]}, Rôle: {admin_test[2]}, Actif: {admin_test[3]}")
    else:
        print("❌ admin@test.com N'EXISTE PAS dans la base")
    
    conn.close()

if __name__ == "__main__":
    check_database()
