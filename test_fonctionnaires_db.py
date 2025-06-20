#!/usr/bin/env python3
import sqlite3
import sys
import os

# Aller au répertoire du backend
os.chdir('/workspaces/front_end/back_end')

print("🔍 Test de la base de données des fonctionnaires")

try:
    # Connexion à la base de données
    conn = sqlite3.connect('gestion_db.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Lister toutes les tables
    print("\n📋 Tables dans la base de données:")
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    for table in tables:
        print(f"  - {table[0]}")
    
    # Compter les fonctionnaires
    print("\n👥 Utilisateurs avec rôle FONCTIONNAIRE:")
    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'FONCTIONNAIRE'")
    count = cursor.fetchone()[0]
    print(f"  Total: {count}")
    
    # Lister les fonctionnaires avec détails
    print("\n📝 Détails des fonctionnaires:")
    cursor.execute('''
        SELECT 
            u.id, u.nom, u.prenom, u.email, u.cin, u.role,
            f.id as fonc_id, f.service, f.poste, f.grade, f.photo
        FROM users u 
        LEFT JOIN fonctionnaires f ON u.id = f.user_id 
        WHERE u.role = 'FONCTIONNAIRE'
    ''')
    
    fonctionnaires = cursor.fetchall()
    if fonctionnaires:
        for f in fonctionnaires:
            print(f"  ID User: {f['id']}, Nom: {f['nom']} {f['prenom']}")
            print(f"    Email: {f['email']}, CIN: {f['cin']}")
            print(f"    Fonc ID: {f['fonc_id']}, Service: {f['service']}, Poste: {f['poste']}")
            print(f"    Grade: {f['grade']}, Photo: {f['photo']}")
            print("    ---")
    else:
        print("  Aucun fonctionnaire trouvé")
    
    # Test d'erreur 404
    print("\n🔍 Test de recherche d'un fonctionnaire inexistant (ID: 999):")
    cursor.execute("SELECT user_id FROM fonctionnaires WHERE id = ?", (999,))
    result = cursor.fetchone()
    if not result:
        print("  ✅ Erreur 404 correctement détectée - fonctionnaire inexistant")
    else:
        print(f"  ❌ Fonctionnaire trouvé: {result}")
    
    conn.close()
    print("\n✅ Test terminé avec succès")
    
except Exception as e:
    print(f"\n❌ Erreur: {e}")
    sys.exit(1)
