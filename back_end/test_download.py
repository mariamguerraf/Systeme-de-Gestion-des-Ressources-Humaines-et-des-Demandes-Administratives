#!/usr/bin/env python3
"""
Script pour tester le téléchargement de documents
"""
import sqlite3
import requests
import os

def test_download_document():
    """Tester le téléchargement d'un document"""
    
    # Connexion à la base de données
    conn = sqlite3.connect('gestion_db.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("=== TEST: Téléchargement de documents ===")
    
    # Récupérer un document existant
    cursor.execute("""
        SELECT d.id as demande_id, d.titre, 
               doc.id as doc_id, doc.original_filename, doc.filename, doc.file_path
        FROM demandes d
        JOIN demande_documents doc ON d.id = doc.demande_id
        LIMIT 1
    """)
    
    result = cursor.fetchone()
    conn.close()
    
    if not result:
        print("❌ Aucun document trouvé dans la base de données")
        return
    
    demande_id = result['demande_id']
    doc_id = result['doc_id']
    original_filename = result['original_filename']
    file_path = result['file_path']
    
    print(f"Document trouvé:")
    print(f"  Demande ID: {demande_id}")
    print(f"  Document ID: {doc_id}")
    print(f"  Nom original: {original_filename}")
    print(f"  Chemin: {file_path}")
    
    # Vérifier que le fichier existe physiquement
    if os.path.exists(file_path):
        file_size = os.path.getsize(file_path)
        print(f"  Taille: {file_size} bytes")
        print("  ✅ Fichier physique existe")
    else:
        print("  ❌ Fichier physique n'existe pas")
        return
    
    # Test de l'endpoint de téléchargement
    print(f"\n=== TEST: Téléchargement via HTTP ===")
    try:
        # Utiliser un token de test admin
        headers = {
            "Authorization": "Bearer test_token_1_admin"
        }
        
        url = f"http://localhost:8000/demandes/{demande_id}/documents/{doc_id}/download"
        print(f"URL: {url}")
        
        # Faire un appel à l'endpoint
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            print("✅ Téléchargement réussi")
            print(f"  Content-Type: {response.headers.get('content-type')}")
            print(f"  Content-Length: {response.headers.get('content-length')}")
            print(f"  Content-Disposition: {response.headers.get('content-disposition')}")
            
            # Sauvegarder le fichier téléchargé pour vérification
            download_path = f"test_download_{original_filename}"
            with open(download_path, 'wb') as f:
                f.write(response.content)
            
            download_size = os.path.getsize(download_path)
            print(f"  Taille téléchargée: {download_size} bytes")
            
            if download_size == file_size:
                print("  ✅ Taille correcte")
            else:
                print("  ❌ Taille différente")
            
            # Nettoyer le fichier de test
            os.remove(download_path)
            
        else:
            print(f"❌ Erreur HTTP {response.status_code}: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("⚠️ Serveur non démarré - impossible de tester l'endpoint HTTP")
    except Exception as e:
        print(f"❌ Erreur lors du test HTTP: {e}")

if __name__ == "__main__":
    test_download_document()
