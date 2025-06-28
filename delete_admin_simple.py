#!/usr/bin/env python3
"""
Script simple pour supprimer l'utilisateur admin@test.com
"""
import sqlite3
import os

def delete_admin_test():
    """Supprimer l'utilisateur admin@test.com directement via SQLite"""
    try:
        # Chemin vers la base de données
        db_path = "back_end/gestion_db.db"
        if not os.path.exists(db_path):
            print(f"❌ Base de données non trouvée: {db_path}")
            return
            
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Chercher l'utilisateur admin@test.com
        cursor.execute("SELECT * FROM users WHERE email = ?", ("admin@test.com",))
        user = cursor.fetchone()
        
        if user:
            print(f"👤 Utilisateur trouvé:")
            print(f"   ID: {user['id']}")
            print(f"   Email: {user['email']}")
            print(f"   Nom: {user['nom']}")
            print(f"   Prénom: {user['prenom']}")
            print(f"   Rôle: {user['role']}")
            print(f"   Actif: {user['is_active']}")
            
            user_id = user['id']
            
            print(f"\n🗑️ Suppression de l'utilisateur {user['email']} (ID: {user_id})...")
            
            # Supprimer dans l'ordre pour respecter les contraintes
            
            # 1. Supprimer des enseignants si présent
            cursor.execute("DELETE FROM enseignants WHERE user_id = ?", (user_id,))
            deleted_enseignant = cursor.rowcount
            if deleted_enseignant > 0:
                print(f"✅ Supprimé de la table enseignants ({deleted_enseignant} ligne)")
                
            # 2. Supprimer des fonctionnaires si présent
            cursor.execute("DELETE FROM fonctionnaires WHERE user_id = ?", (user_id,))
            deleted_fonctionnaire = cursor.rowcount
            if deleted_fonctionnaire > 0:
                print(f"✅ Supprimé de la table fonctionnaires ({deleted_fonctionnaire} ligne)")
                
            # 3. Supprimer l'utilisateur principal
            cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
            deleted_user = cursor.rowcount
            
            if deleted_user > 0:
                print(f"✅ Utilisateur {user['email']} supprimé avec succès")
                conn.commit()
            else:
                print(f"❌ Erreur lors de la suppression de l'utilisateur")
                
            # Vérifier les admins restants
            cursor.execute("SELECT id, email, role FROM users WHERE role = 'ADMIN' AND is_active = 1")
            remaining_admins = cursor.fetchall()
            
            print(f"\n📋 Admins restants ({len(remaining_admins)}):")
            for admin in remaining_admins:
                print(f"   ID: {admin[0]}, Email: {admin[1]}, Role: {admin[2]}")
                
        else:
            print("❌ Utilisateur admin@test.com non trouvé")
            
        conn.close()
        
    except Exception as e:
        print(f"❌ Erreur lors de la suppression: {e}")

if __name__ == "__main__":
    print("🔍 Recherche et suppression de admin@test.com...")
    print("=" * 60)
    delete_admin_test()
