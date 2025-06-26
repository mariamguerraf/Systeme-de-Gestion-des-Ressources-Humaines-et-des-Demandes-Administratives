import sqlite3

def check_users_table():
    try:
        conn = sqlite3.connect('gestion_db.db')
        cursor = conn.cursor()
        
        print("=== Structure de la table users ===")
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        
        for col in columns:
            print(f"Colonne: {col[1]}, Type: {col[2]}")
        
        print("\n=== Admins existants ===")
        cursor.execute("SELECT * FROM users WHERE role = 'ADMIN'")
        admins = cursor.fetchall()
        
        for admin in admins:
            print(f"Admin: {admin}")
        
        print("\n=== Recherche admin@univ.ma ===")
        cursor.execute("SELECT * FROM users WHERE email = 'admin@univ.ma'")
        admin_univ = cursor.fetchone()
        
        if admin_univ:
            print(f"Trouvé: {admin_univ}")
        else:
            print("admin@univ.ma n'existe pas")
        
        conn.close()
        
    except Exception as e:
        print(f"Erreur: {e}")

if __name__ == "__main__":
    check_users_table()
