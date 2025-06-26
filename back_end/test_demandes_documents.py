#!/usr/bin/env python3
"""
Script pour tester les endpoints de demandes avec documents
"""
import sqlite3
import requests
import json

def test_demandes_with_documents():
    """Tester que les demandes incluent bien les documents"""
    
    # Connexion à la base de données
    conn = sqlite3.connect('gestion_db.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("=== TEST: Vérification des demandes avec documents ===")
    
    # Récupérer quelques demandes avec leurs documents
    cursor.execute("""
        SELECT d.id, d.titre, d.type_demande, d.statut,
               COUNT(doc.id) as nb_documents,
               GROUP_CONCAT(doc.original_filename) as fichiers
        FROM demandes d
        LEFT JOIN demande_documents doc ON d.id = doc.demande_id
        GROUP BY d.id
        ORDER BY d.created_at DESC
        LIMIT 5
    """)
    
    demandes = cursor.fetchall()
    
    print(f"Trouvé {len(demandes)} demandes:")
    for demande in demandes:
        print(f"  ID: {demande['id']}")
        print(f"  Titre: {demande['titre']}")
        print(f"  Type: {demande['type_demande']}")
        print(f"  Statut: {demande['statut']}")
        print(f"  Nb documents: {demande['nb_documents']}")
        if demande['fichiers']:
            print(f"  Fichiers: {demande['fichiers']}")
        print("  ---")
    
    # Test de l'endpoint via HTTP
    print("\n=== TEST: Appel HTTP endpoint /demandes/ ===")
    try:
        # Utiliser un token de test admin
        headers = {
            "Authorization": "Bearer test_token_1_admin"
        }
        
        # Faire un appel à l'endpoint
        response = requests.get("http://localhost:8000/demandes/", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Endpoint réussi - {len(data)} demandes retournées")
            
            # Vérifier si les documents sont inclus
            for demande in data[:3]:  # Regarder les 3 premières
                print(f"  Demande {demande['id']}: {len(demande.get('documents', []))} documents")
                if demande.get('documents'):
                    for doc in demande['documents']:
                        print(f"    - {doc['original_filename']}")
        else:
            print(f"❌ Erreur HTTP {response.status_code}: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("⚠️ Serveur non démarré - impossible de tester l'endpoint HTTP")
    except Exception as e:
        print(f"❌ Erreur lors du test HTTP: {e}")
    
    conn.close()

if __name__ == "__main__":
    test_demandes_with_documents()
