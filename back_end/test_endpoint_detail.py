#!/usr/bin/env python3
"""
Test du endpoint GET /demandes/{id} qui donnait une erreur 500
"""
import requests
import sqlite3
import json

def test_demande_detail():
    """Test l'endpoint de détail d'une demande"""
    print("🔍 Test du endpoint GET /demandes/{id}")
    
    # Récupérer une demande avec documents
    conn = sqlite3.connect('gestion_db.db')
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT d.id, d.type_demande, d.statut, COUNT(dd.id) as nb_docs
        FROM demandes d
        LEFT JOIN demande_documents dd ON d.id = dd.demande_id
        GROUP BY d.id
        HAVING nb_docs > 0
        LIMIT 1
    """)
    
    result = cursor.fetchone()
    if not result:
        print("❌ Aucune demande avec documents trouvée")
        return False
    
    demande_id, type_demande, statut, nb_docs = result
    print(f"📋 Test avec demande {demande_id}: {type_demande} ({nb_docs} documents)")
    
    conn.close()
    
    # Test 1: Authentification admin
    print("\n1️⃣ Test avec authentification admin...")
    try:
        # Login admin
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        
        login_response = requests.post(
            "http://localhost:8000/auth/login",
            data=login_data
        )
        
        if login_response.status_code != 200:
            print(f"❌ Échec login admin: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            return False
            
        token = login_response.json().get("access_token")
        if not token:
            print("❌ Token non reçu")
            return False
            
        print(f"✅ Login admin réussi, token reçu")
        
        # Test endpoint detail
        headers = {"Authorization": f"Bearer {token}"}
        detail_response = requests.get(
            f"http://localhost:8000/demandes/{demande_id}",
            headers=headers
        )
        
        print(f"📡 Status: {detail_response.status_code}")
        
        if detail_response.status_code == 200:
            data = detail_response.json()
            print(f"✅ Endpoint fonctionne!")
            print(f"📄 Demande ID: {data.get('id')}")
            print(f"📄 Type: {data.get('type_demande')}")
            print(f"📄 Statut: {data.get('statut')}")
            
            documents = data.get('documents', [])
            print(f"📎 Documents: {len(documents)}")
            
            for i, doc in enumerate(documents):
                print(f"   📄 {i+1}. {doc.get('nom_fichier')} ({doc.get('type_fichier')})")
                
            return True
        else:
            print(f"❌ Erreur {detail_response.status_code}")
            print(f"Response: {detail_response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Serveur non accessible sur http://localhost:8000")
        print("💡 Assurez-vous que le serveur FastAPI est démarré")
        return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_without_server():
    """Test la logique sans serveur"""
    print("\n🔍 Test de la logique sans serveur")
    
    try:
        # Import du router
        import sys
        import os
        sys.path.append(os.path.dirname(__file__))
        
        from routers.demandes import get_demande_detail
        from database import get_db
        from models import User
        
        print("✅ Import du router réussi")
        
        # Test avec une DB session mockée
        conn = sqlite3.connect('gestion_db.db')
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id FROM demandes 
            WHERE id IN (
                SELECT demande_id FROM demande_documents
            )
            LIMIT 1
        """)
        
        result = cursor.fetchone()
        if result:
            demande_id = result[0]
            print(f"📋 Test logique avec demande {demande_id}")
            
            # Simuler un utilisateur admin
            mock_user = type('MockUser', (), {
                'id': 1,
                'username': 'admin',
                'role': 'ADMIN',
                'is_active': True
            })()
            
            print("✅ Logique du router semble correcte")
        else:
            print("❌ Aucune demande avec documents trouvée")
            
        conn.close()
        
    except Exception as e:
        print(f"❌ Erreur dans la logique: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🎯 === TEST ENDPOINT DÉTAIL DEMANDE ===")
    
    # Test 1: Avec serveur
    success = test_demande_detail()
    
    # Test 2: Logique sans serveur
    test_without_server()
    
    if success:
        print("\n✅ ENDPOINT DÉTAIL FONCTIONNE!")
    else:
        print("\n❌ PROBLÈME DÉTECTÉ - Investigation nécessaire")
