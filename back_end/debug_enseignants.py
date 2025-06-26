import sqlite3

def check_enseignants_query():
    try:
        conn = sqlite3.connect('gestion_db.db')
        conn.row_factory = sqlite3.Row  # Pour accéder aux colonnes par nom
        cursor = conn.cursor()
        
        print("=== Test de la requête enseignants ===")
        
        # Test 1: Requête actuelle (qui ne marche pas)
        print("\n1. Requête actuelle avec u.role = 'ENSEIGNANT':")
        cursor.execute('''
            SELECT
                e.id, e.user_id, e.specialite, e.grade, e.photo,
                u.nom, u.prenom, u.email, u.telephone, u.adresse, u.cin, u.is_active, u.role
            FROM enseignants e
            JOIN users u ON e.user_id = u.id
            WHERE u.role = 'ENSEIGNANT'
            ORDER BY u.nom, u.prenom
        ''')
        
        results = cursor.fetchall()
        print(f"Résultats: {len(results)}")
        for row in results:
            print(f"  ID: {row['id']}, User: {row['nom']} {row['prenom']}, Role: {row['role']}")
        
        # Test 2: Vérifier les rôles des enseignants
        print("\n2. Enseignants et leurs rôles:")
        cursor.execute('''
            SELECT
                e.id, e.user_id, e.specialite,
                u.nom, u.prenom, u.email, u.role
            FROM enseignants e
            JOIN users u ON e.user_id = u.id
            ORDER BY u.nom, u.prenom
        ''')
        
        results = cursor.fetchall()
        print(f"Résultats: {len(results)}")
        for row in results:
            print(f"  Enseignant ID: {row['id']}, User ID: {row['user_id']}, User: {row['nom']} {row['prenom']}, Role: '{row['role']}'")
        
        conn.close()
        
    except Exception as e:
        print(f"Erreur: {e}")

if __name__ == "__main__":
    check_enseignants_query()
