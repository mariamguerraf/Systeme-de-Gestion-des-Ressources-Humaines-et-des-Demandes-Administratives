#!/usr/bin/env python3
"""
Script pour supprimer l'utilisateur admin@test.com
"""
import sqlite3
from database import get_sqlite_connection

def check_admin_test():
    """Vérifier si admin@test.com existe dans la base de données"""
    try:
        conn = get_sqlite_connection()
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
            
            # Vérifier s'il a des entrées liées
            user_id = user['id']
            
            # Vérifier dans les enseignants
            cursor.execute("SELECT * FROM enseignants WHERE user_id = ?", (user_id,))
            enseignant = cursor.fetchone()
            if enseignant:
                print(f"📚 Lié à un enseignant (ID: {enseignant['id']})")
            
            # Vérifier dans les fonctionnaires
            cursor.execute("SELECT * FROM fonctionnaires WHERE user_id = ?", (user_id,))
            fonctionnaire = cursor.fetchone()
            if fonctionnaire:
                print(f"🏢 Lié à un fonctionnaire (ID: {fonctionnaire['id']})")
                
        else:
            print("❌ Utilisateur admin@test.com non trouvé")
            
        conn.close()
        return user
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None

def delete_admin_test():
    """Supprimer l'utilisateur admin@test.com et toutes ses données liées"""
    try:
        # D'abord vérifier qu'il existe
        user = check_admin_test()
        if not user:
            return
            
        user_id = user['id']
        email = user['email']
        
        print(f"\n🗑️ Suppression de l'utilisateur {email} (ID: {user_id})...")
        
        conn = get_sqlite_connection()
        cursor = conn.cursor()
        
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
            print(f"✅ Utilisateur {email} supprimé avec succès")
            conn.commit()
        else:
            print(f"❌ Erreur lors de la suppression de l'utilisateur")
            
        # Vérifier les admins restants
        cursor.execute("SELECT id, email, role FROM users WHERE role = 'ADMIN' AND is_active = 1")
        remaining_admins = cursor.fetchall()
        
        print(f"\n📋 Admins restants:")
        for admin in remaining_admins:
            print(f"   ID: {admin[0]}, Email: {admin[1]}, Role: {admin[2]}")
            
        conn.close()
        
    except Exception as e:
        print(f"❌ Erreur lors de la suppression: {e}")

if __name__ == "__main__":
    print("� Recherche de admin@test.com...")
    print("=" * 50)
    delete_admin_test()
