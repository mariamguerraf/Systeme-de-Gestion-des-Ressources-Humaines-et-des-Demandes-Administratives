#!/usr/bin/env python3
"""
Test simple pour vérifier que le système de documents fonctionne
"""
import requests
import json

def test_router_demandes():
    """Test que le router demandes fonctionne avec les documents"""
    
    print("🧪 === TEST ROUTER DEMANDES AVEC DOCUMENTS ===")
    
    # Token de test pour admin
    headers = {"Authorization": "Bearer test_token_2_secretaire"}
    
    try:
        # Test 1: Récupérer toutes les demandes via le router
        print("\n1️⃣ Test GET /demandes/ via router...")
        response = requests.get("http://localhost:8000/demandes/", headers=headers)
        
        if response.status_code == 200:
            demandes = response.json()
            print(f"   ✅ {len(demandes)} demandes récupérées")
            
            # Compter les demandes avec documents
            avec_docs = [d for d in demandes if d.get('documents') and len(d['documents']) > 0]
            print(f"   📎 {len(avec_docs)} demandes avec documents")
            
            if avec_docs:
                sample = avec_docs[0]
                print(f"   📝 Exemple: Demande {sample['id']} - {len(sample['documents'])} documents")
                for doc in sample['documents']:
                    print(f"      - {doc['original_filename']} ({doc['file_size']} bytes)")
                
                # Test 2: Téléchargement d'un document
                print("\n2️⃣ Test téléchargement document...")
                doc_id = sample['documents'][0]['id']
                demande_id = sample['id']
                
                download_url = f"http://localhost:8000/demandes/{demande_id}/documents/{doc_id}/download"
                download_response = requests.get(download_url, headers=headers)
                
                if download_response.status_code == 200:
                    print("   ✅ Téléchargement réussi")
                    print(f"   📏 Taille: {len(download_response.content)} bytes")
                    print(f"   📋 Type: {download_response.headers.get('content-type')}")
                    
                    # Vérifier le nom du fichier dans l'en-tête
                    content_disp = download_response.headers.get('content-disposition', '')
                    if 'filename' in content_disp:
                        print(f"   📄 Disposition: {content_disp}")
                    
                else:
                    print(f"   ❌ Erreur téléchargement: {download_response.status_code}")
                    print(f"   📝 Réponse: {download_response.text[:200]}")
            
            # Test 3: Récupérer une demande spécifique
            print("\n3️⃣ Test GET /demandes/{id} via router...")
            if demandes:
                demande_id = demandes[0]['id']
                response = requests.get(f"http://localhost:8000/demandes/{demande_id}", headers=headers)
                
                if response.status_code == 200:
                    demande = response.json()
                    print(f"   ✅ Demande {demande_id} récupérée")
                    print(f"   📎 {len(demande.get('documents', []))} documents inclus")
                else:
                    print(f"   ❌ Erreur: {response.status_code} - {response.text[:100]}")
        
        else:
            print(f"   ❌ Erreur: {response.status_code}")
            print(f"   📝 Réponse: {response.text[:200]}")
    
    except requests.exceptions.ConnectionError:
        print("   ⚠️ Serveur non démarré - Démarrez le serveur avec: python -m uvicorn main:app --reload")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")

def test_endpoints_disponibles():
    """Test de base pour voir quels endpoints sont disponibles"""
    print("\n📡 === TEST ENDPOINTS DISPONIBLES ===")
    
    try:
        # Test endpoint racine
        response = requests.get("http://localhost:8000/")
        if response.status_code == 200:
            print("   ✅ Serveur en ligne")
        
        # Test endpoint OpenAPI docs
        response = requests.get("http://localhost:8000/docs")
        if response.status_code == 200:
            print("   ✅ Documentation API disponible: http://localhost:8000/docs")
            
    except requests.exceptions.ConnectionError:
        print("   ❌ Serveur non démarré")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")

if __name__ == "__main__":
    test_endpoints_disponibles()
    test_router_demandes()
    
    print("\n🎯 === CONCLUSION ===")
    print("Si tous les tests passent, votre système de documents est FONCTIONNEL !")
    print("L'interface secrétaire peut maintenant :")
    print("  1. Voir la liste des demandes avec leurs documents")
    print("  2. Télécharger les documents uploadés")
    print("  3. Voir les détails d'une demande avec ses documents")
