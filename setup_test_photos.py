#!/usr/bin/env python3
import os
import shutil
from pathlib import Path

# Créer un dossier uploads pour tester l'affichage
backend_dir = Path("/workspaces/front_end/back_end")
uploads_dir = backend_dir / "uploads"
uploads_dir.mkdir(exist_ok=True)

# Créer un fichier de test simple pour simuler une photo
test_image_content = """<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" stroke="purple" stroke-width="4" fill="pink" />
  <text x="50" y="55" text-anchor="middle" font-family="Arial" font-size="16" fill="white">PHOTO</text>
</svg>"""

# Créer quelques fichiers de test pour les fonctionnaires existants
test_photos = [
    "fonctionnaire_1_test.svg",
    "fonctionnaire_5_test.svg", 
    "fonctionnaire_7_test.svg",
    "fonctionnaire_8_test.svg"
]

for photo_name in test_photos:
    photo_path = uploads_dir / photo_name
    with open(photo_path, 'w') as f:
        f.write(test_image_content)
    print(f"✅ Créé: {photo_path}")

print(f"\n📁 Dossier uploads: {uploads_dir}")
print(f"📋 Fichiers créés: {list(uploads_dir.glob('*.svg'))}")

# Mise à jour de la base de données pour ajouter les chemins des photos
print("\n🔄 Mise à jour de la base de données avec les photos de test...")

import sqlite3
import sys

try:
    os.chdir(backend_dir)
    conn = sqlite3.connect('gestion_db.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Mettre à jour quelques fonctionnaires avec des photos de test
    updates = [
        (1, "uploads/fonctionnaire_1_test.svg"),
        (5, "uploads/fonctionnaire_5_test.svg"),
        (7, "uploads/fonctionnaire_7_test.svg"),
        (8, "uploads/fonctionnaire_8_test.svg")
    ]
    
    for fonc_id, photo_path in updates:
        cursor.execute("UPDATE fonctionnaires SET photo = ? WHERE id = ?", (photo_path, fonc_id))
        print(f"   📷 Fonctionnaire ID {fonc_id} -> {photo_path}")
    
    conn.commit()
    
    # Vérifier les mises à jour
    print("\n✅ Vérification des photos dans la base de données:")
    cursor.execute("""
        SELECT 
            f.id, f.photo,
            u.nom, u.prenom
        FROM fonctionnaires f
        JOIN users u ON f.user_id = u.id
        WHERE f.photo IS NOT NULL AND f.photo != ''
    """)
    
    fonctionnaires_avec_photos = cursor.fetchall()
    for f in fonctionnaires_avec_photos:
        print(f"   📸 ID {f['id']}: {f['nom']} {f['prenom']} -> {f['photo']}")
    
    conn.close()
    print("\n🎉 Photos de test configurées avec succès!")
    print("\n💡 Pour tester:")
    print("   1. Ouvrez l'interface web des fonctionnaires")
    print("   2. Les photos doivent apparaître dans la liste")
    print("   3. Cliquez sur 'Voir' pour voir la photo en grand")
    
except Exception as e:
    print(f"\n❌ Erreur: {e}")
    sys.exit(1)
