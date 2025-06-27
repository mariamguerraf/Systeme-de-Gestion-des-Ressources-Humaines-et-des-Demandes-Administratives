#!/usr/bin/env python3
"""
Script pour supprimer l'utilisateur admin@test.com
"""
import sqlite3

def delete_admin_test():
    """Supprimer l'utilisateur admin@test.com"""
    try:
        conn = sqlite3.connect('gestion_db.db')
        cursor = conn.cursor()
        
        # Vérifier d'abord si l'utilisateur existe
        cursor.execute("SELECT id, email, role FROM users WHERE email = 'admin@test.com'")
        user = cursor.fetchone()
        
        if user:
            print(f"👤 Utilisateur trouvé: ID {user[0]}, Email: {user[1]}, Role: {user[2]}")
            
            # Supprimer l'utilisateur
            cursor.execute("DELETE FROM users WHERE email = 'admin@test.com'")
            conn.commit()
            
            if cursor.rowcount > 0:
                print(f"✅ Utilisateur admin@test.com supprimé avec succès")
                print(f"   {cursor.rowcount} ligne(s) supprimée(s)")
            else:
                print(f"❌ Aucune ligne supprimée")
        else:
            print(f"⚠️ Utilisateur admin@test.com non trouvé")
        
        # Vérifier les admins restants
        cursor.execute("SELECT id, email, role FROM users WHERE role = 'ADMIN' AND is_active = 1")
        remaining_admins = cursor.fetchall()
        
        print(f"\n📋 Admins restants:")
        for admin in remaining_admins:
            print(f"   ID: {admin[0]}, Email: {admin[1]}, Role: {admin[2]}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    print("🗑️ SUPPRESSION DE admin@test.com")
    print("=" * 40)
    delete_admin_test()
