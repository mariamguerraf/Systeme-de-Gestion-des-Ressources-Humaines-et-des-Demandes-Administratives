import sqlite3

def check_users():
    try:
        conn = sqlite3.connect('gestion_db.db')
        cursor = conn.cursor()
        
        print("=== Vérification des utilisateurs ===")
        
        cursor.execute("SELECT id, nom, prenom, email, role FROM users ORDER BY id")
        users = cursor.fetchall()
        
        print(f"Total utilisateurs: {len(users)}")
        for user in users:
            print(f"ID: {user[0]}, Nom: {user[1]} {user[2]}, Email: {user[3]}, Role: {user[4]}")
        
        print("\n=== Enseignants ===")
        cursor.execute("""
            SELECT u.id, u.nom, u.prenom, u.email, e.id as enseignant_id
            FROM users u 
            LEFT JOIN enseignants e ON u.id = e.user_id 
            WHERE u.role = 'enseignant'
            ORDER BY u.id
        """)
        enseignants = cursor.fetchall()
        
        for ens in enseignants:
            print(f"User ID: {ens[0]}, Nom: {ens[1]} {ens[2]}, Enseignant ID: {ens[4]}")
        
        print("\n=== Vérification des demandes ===")
        cursor.execute("SELECT user_id, COUNT(*) FROM demandes GROUP BY user_id")
        demandes_count = cursor.fetchall()
        
        for count in demandes_count:
            print(f"User ID {count[0]}: {count[1]} demandes")
        
        conn.close()
        
    except Exception as e:
        print(f"Erreur: {e}")

if __name__ == "__main__":
    check_users()
