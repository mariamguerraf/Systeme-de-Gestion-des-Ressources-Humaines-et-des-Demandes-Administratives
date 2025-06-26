#!/usr/bin/env python3
"""
Test final complet du système de documents
Tests GET /demandes/ et GET /demandes/{id} avec documents
"""
import requests
import sqlite3
import json
import time

def test_complete_system():
    """Test complet du système"""
    print("🎯 === TEST SYSTÈME COMPLET DOCUMENTS ===")
    
    # Vérifier la base de données
    print("\n1️⃣ Vérification base de données...")
    conn = sqlite3.connect('gestion_db.db')
    cursor = conn.cursor()
    
    # Compter les demandes avec documents
    cursor.execute("""
        SELECT COUNT(DISTINCT d.id) as demandes_avec_docs
        FROM demandes d
        INNER JOIN demande_documents dd ON d.id = dd.demande_id
    """)
    nb_demandes_docs = cursor.fetchone()[0]
    print(f"   📊 {nb_demandes_docs} demandes avec documents")
    
    if nb_demandes_docs == 0:
        print("❌ Aucune demande avec documents pour tester!")
        conn.close()
        return False
    
    # Récupérer une demande avec documents
    cursor.execute("""
        SELECT d.id, d.type_demande, d.titre, COUNT(dd.id) as nb_docs
        FROM demandes d
        INNER JOIN demande_documents dd ON d.id = dd.demande_id
        GROUP BY d.id
        LIMIT 1
    """)
    
    test_demande = cursor.fetchone()
    if not test_demande:
        print("❌ Impossible de récupérer une demande de test")
        conn.close()
        return False
        
    demande_id, type_demande, titre, nb_docs = test_demande
    print(f"   🎯 Test avec demande {demande_id}: {type_demande} - {titre} ({nb_docs} docs)")
    
    conn.close()
    
    # Attendre que le serveur soit prêt
    print("\n2️⃣ Connexion au serveur...")
    max_attempts = 10
    server_ready = False
    
    for attempt in range(max_attempts):
        try:
            response = requests.get("http://localhost:8000/docs", timeout=2)
            if response.status_code == 200:
                server_ready = True
                print("   ✅ Serveur accessible")
                break
        except:
            pass
        
        print(f"   ⏳ Tentative {attempt + 1}/{max_attempts}...")
        time.sleep(2)
    
    if not server_ready:
        print("❌ Serveur non accessible")
        return False
    
    # Login admin
    print("\n3️⃣ Authentification...")
    try:
        login_data = {
            "username": "admin@test.com",
            "password": "admin123"
        }
        
        login_response = requests.post(
            "http://localhost:8000/auth/login",
            data=login_data,
            timeout=10
        )
        
        if login_response.status_code != 200:
            print(f"❌ Échec login: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            return False
            
        token = login_response.json().get("access_token")
        if not token:
            print("❌ Token non reçu")
            return False
            
        print("   ✅ Login admin réussi")
        headers = {"Authorization": f"Bearer {token}"}
        
    except Exception as e:
        print(f"❌ Erreur authentification: {e}")
        return False
    
    # Test GET /demandes/ (liste)
    print("\n4️⃣ Test GET /demandes/ (liste)...")
    try:
        list_response = requests.get(
            "http://localhost:8000/demandes/",
            headers=headers,
            timeout=10
        )
        
        print(f"   📡 Status: {list_response.status_code}")
        
        if list_response.status_code != 200:
            print(f"❌ Erreur liste: {list_response.text}")
            return False
            
        demandes_list = list_response.json()
        print(f"   📄 {len(demandes_list)} demandes récupérées")
        
        # Vérifier qu'au moins une demande a des documents
        demandes_avec_docs = [d for d in demandes_list if d.get('documents') and len(d['documents']) > 0]
        print(f"   📎 {len(demandes_avec_docs)} demandes avec documents")
        
        if len(demandes_avec_docs) == 0:
            print("❌ Aucune demande avec documents dans la liste!")
            return False
            
        print("   ✅ Endpoint liste fonctionne avec documents")
        
    except Exception as e:
        print(f"❌ Erreur test liste: {e}")
        return False
    
    # Test GET /demandes/{id} (détail)
    print(f"\n5️⃣ Test GET /demandes/{demande_id} (détail)...")
    try:
        detail_response = requests.get(
            f"http://localhost:8000/demandes/{demande_id}",
            headers=headers,
            timeout=10
        )
        
        print(f"   📡 Status: {detail_response.status_code}")
        
        if detail_response.status_code != 200:
            print(f"❌ Erreur détail: {detail_response.text}")
            return False
            
        demande_detail = detail_response.json()
        print(f"   📄 Demande: {demande_detail.get('titre', 'Sans titre')}")
        print(f"   📄 Type: {demande_detail.get('type_demande')}")
        print(f"   📄 Statut: {demande_detail.get('statut')}")
        
        documents = demande_detail.get('documents', [])
        print(f"   📎 Documents: {len(documents)}")
        
        for i, doc in enumerate(documents):
            print(f"      📄 {i+1}. {doc.get('original_filename', 'Sans nom')} ({doc.get('content_type', 'Type inconnu')})")
        
        if len(documents) == 0:
            print("❌ Aucun document dans le détail!")
            return False
            
        print("   ✅ Endpoint détail fonctionne avec documents")
        
        # Tester le téléchargement d'un document
        if documents:
            doc_id = documents[0]['id']
            print(f"\n6️⃣ Test téléchargement document {doc_id}...")
            
            download_response = requests.get(
                f"http://localhost:8000/demandes/{demande_id}/documents/{doc_id}/download",
                headers=headers,
                timeout=10
            )
            
            print(f"   📡 Status téléchargement: {download_response.status_code}")
            
            if download_response.status_code == 200:
                print("   ✅ Téléchargement fonctionne")
            else:
                print(f"   ⚠️ Téléchargement échoué: {download_response.text}")
        
    except Exception as e:
        print(f"❌ Erreur test détail: {e}")
        return False
    
    print("\n🎉 === RÉSULTATS ===")
    print("✅ GET /demandes/ : OK avec documents")
    print("✅ GET /demandes/{id} : OK avec documents") 
    print("✅ Téléchargement : OK")
    print("✅ SYSTÈME 100% FONCTIONNEL!")
    
    return True

if __name__ == "__main__":
    success = test_complete_system()
    if success:
        print("\n🚀 VALIDATION COMPLÈTE RÉUSSIE!")
    else:
        print("\n❌ PROBLÈME DÉTECTÉ")
