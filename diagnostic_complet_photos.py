#!/usr/bin/env python3
import sqlite3
import os

os.chdir('/workspaces/front_end/back_end')

print("🔍 DIAGNOSTIC COMPLET - PHOTOS FONCTIONNAIRES")
print("=" * 50)

try:
    conn = sqlite3.connect('gestion_db.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # 1. Vérifier les derniers fonctionnaires
    print("1️⃣ DERNIERS FONCTIONNAIRES AJOUTÉS:")
    cursor.execute('''
        SELECT 
            f.id, f.user_id, f.service, f.poste, f.grade, f.photo,
            u.nom, u.prenom, u.email, u.cin, u.created_at
        FROM fonctionnaires f
        JOIN users u ON f.user_id = u.id
        ORDER BY u.created_at DESC
        LIMIT 5
    ''')
    
    recent_fonc = cursor.fetchall()
    for f in recent_fonc:
        print(f"   ID: {f['id']} | {f['nom']} {f['prenom']}")
        print(f"      Email: {f['email']} | CIN: {f['cin']}")
        print(f"      Photo: {f['photo']} | Créé: {f['created_at']}")
        print("      ---")
    
    # 2. Vérifier les photos existantes
    print("\n2️⃣ FONCTIONNAIRES AVEC PHOTOS:")
    cursor.execute('''
        SELECT f.id, u.nom, u.prenom, f.photo
        FROM fonctionnaires f
        JOIN users u ON f.user_id = u.id
        WHERE f.photo IS NOT NULL AND f.photo != ''
    ''')
    
    with_photos = cursor.fetchall()
    if with_photos:
        for f in with_photos:
            print(f"   ID: {f['id']} | {f['nom']} {f['prenom']} → {f['photo']}")
    else:
        print("   ❌ Aucun fonctionnaire avec photo trouvé")
    
    # 3. Vérifier les fichiers physiques
    print("\n3️⃣ FICHIERS PHOTOS PHYSIQUES:")
    uploads_dir = os.path.join(os.getcwd(), 'uploads')
    if os.path.exists(uploads_dir):
        files = [f for f in os.listdir(uploads_dir) if f.startswith('fonctionnaire')]
        if files:
            for file in files:
                file_path = os.path.join(uploads_dir, file)
                size = os.path.getsize(file_path)
                print(f"   📁 {file} ({size} bytes)")
        else:
            print("   ❌ Aucun fichier photo de fonctionnaire trouvé")
    else:
        print("   ❌ Dossier uploads introuvable")
    
    # 4. Tester une création complète
    print("\n4️⃣ TEST CRÉATION FONCTIONNAIRE:")
    test_data = {
        'nom': 'TestPhoto',
        'prenom': 'Utilisateur',
        'email': 'test.photo.diagnostic@univ.ma',
        'cin': f'DIAG{int(__import__("time").time())}',
        'service': 'Test Diagnostic',
        'poste': 'Testeur Photo'
    }
    
    # Vérifier si l'email existe déjà
    cursor.execute("SELECT id FROM users WHERE email = ?", (test_data['email'],))
    if cursor.fetchone():
        print("   ⚠️ Utilisateur test existe déjà")
    else:
        print(f"   ✅ Prêt pour création: {test_data['nom']} {test_data['prenom']}")
        print(f"      Email: {test_data['email']}")
        print(f"      CIN: {test_data['cin']}")
    
    conn.close()
    
except Exception as e:
    print(f"❌ Erreur: {e}")
