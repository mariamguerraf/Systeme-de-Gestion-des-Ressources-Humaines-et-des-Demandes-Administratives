#!/usr/bin/env python3
import sqlite3
import os

# Aller au répertoire du backend
os.chdir('/workspaces/front_end/back_end')

print("🔄 Correction des chemins de photos des fonctionnaires...")

try:
    conn = sqlite3.connect('gestion_db.db')
    cursor = conn.cursor()

    # Vérifier les chemins actuels
    cursor.execute('SELECT id, photo FROM fonctionnaires WHERE photo IS NOT NULL AND photo != ""')
    results_avant = cursor.fetchall()
    
    print("📋 Chemins avant correction:")
    for row in results_avant:
        print(f"   ID {row[0]}: {row[1]}")

    # Mettre à jour les chemins pour ajouter le / au début
    cursor.execute('''
        UPDATE fonctionnaires 
        SET photo = '/' || photo 
        WHERE photo IS NOT NULL 
          AND photo != '' 
          AND photo NOT LIKE '/%'
    ''')

    conn.commit()
    changes = cursor.rowcount

    # Vérifier les chemins après correction
    cursor.execute('SELECT id, photo FROM fonctionnaires WHERE photo IS NOT NULL AND photo != ""')
    results_apres = cursor.fetchall()

    print(f"\n✅ {changes} chemins modifiés")
    print("📋 Chemins après correction:")
    for row in results_apres:
        print(f"   ID {row[0]}: {row[1]}")

    conn.close()
    print("\n🎉 Chemins corrigés avec succès!")
    
    # Test d'URL complète
    print("\n🔍 Test des URLs complètes:")
    base_url = "http://localhost:8000"
    for row in results_apres:
        full_url = f"{base_url}{row[1]}"
        print(f"   ID {row[0]}: {full_url}")

except Exception as e:
    print(f"❌ Erreur: {e}")
