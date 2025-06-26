#!/usr/bin/env python3
"""
Debug du endpoint GET /demandes/{id}
"""
import sys
import os
import traceback
import sqlite3

# Ajouter le répertoire actuel au path
sys.path.insert(0, os.path.dirname(__file__))

def debug_endpoint():
    """Debug l'endpoint problématique"""
    print("🔍 Debug endpoint GET /demandes/{id}")
    
    try:
        # Test 1: Import du module
        print("\n1️⃣ Test import du router...")
        from routers.demandes import router
        print("   ✅ Import router OK")
        
        # Test 2: Vérifier qu'on a bien une demande avec documents
        print("\n2️⃣ Vérification données test...")
        conn = sqlite3.connect('gestion_db.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT d.id, d.type_demande, d.titre, COUNT(dd.id) as nb_docs
            FROM demandes d
            INNER JOIN demande_documents dd ON d.id = dd.demande_id
            GROUP BY d.id
            LIMIT 1
        """)
        
        result = cursor.fetchone()
        if not result:
            print("   ❌ Aucune demande avec documents!")
            return False
        
        demande_id = result["id"]
        print(f"   ✅ Demande test: {demande_id} avec {result['nb_docs']} documents")
        
        # Test 3: Simulation de la requête de base
        print("\n3️⃣ Test requête principale...")
        cursor.execute('''
            SELECT d.*, u.nom, u.prenom, u.email, u.role, u.is_active, u.created_at, u.updated_at
            FROM demandes d
            JOIN users u ON d.user_id = u.id
            WHERE d.id = ?
        ''', (demande_id,))
        
        demande_data = cursor.fetchone()
        if not demande_data:
            print("   ❌ Demande non trouvée!")
            return False
        
        print(f"   ✅ Demande trouvée: {demande_data['titre']}")
        
        # Test 4: Requête documents
        print("\n4️⃣ Test requête documents...")
        cursor.execute('''
            SELECT id, demande_id, filename, original_filename, file_path, file_size, content_type, uploaded_at
            FROM demande_documents 
            WHERE demande_id = ?
            ORDER BY uploaded_at DESC
        ''', (demande_id,))
        
        documents_data = cursor.fetchall()
        print(f"   ✅ {len(documents_data)} documents trouvés")
        
        for doc in documents_data:
            print(f"      📄 {doc['original_filename']} ({doc['content_type']})")
        
        # Test 5: Construction de la réponse
        print("\n5️⃣ Test construction réponse...")
        
        documents_list = []
        for doc in documents_data:
            documents_list.append({
                "id": doc["id"],
                "demande_id": doc["demande_id"],
                "filename": doc["filename"],
                "original_filename": doc["original_filename"],
                "file_path": doc["file_path"],
                "file_size": doc["file_size"],
                "content_type": doc["content_type"],
                "uploaded_at": doc["uploaded_at"]
            })
        
        response_data = {
            "id": demande_data["id"],
            "user_id": demande_data["user_id"],
            "type_demande": demande_data["type_demande"],
            "titre": demande_data["titre"],
            "description": demande_data["description"],
            "date_debut": demande_data["date_debut"],
            "date_fin": demande_data["date_fin"],
            "statut": demande_data["statut"],
            "commentaire_admin": demande_data["commentaire_admin"],
            "created_at": demande_data["created_at"],
            "updated_at": demande_data["updated_at"],
            "documents": documents_list,
            "user": {
                "id": demande_data["user_id"],
                "nom": demande_data["nom"],
                "prenom": demande_data["prenom"],
                "email": demande_data["email"],
                "role": demande_data["role"],
                "is_active": demande_data["is_active"],
                "created_at": demande_data["created_at"],
                "updated_at": demande_data["updated_at"]
            }
        }
        
        print("   ✅ Réponse construite avec succès")
        print(f"   📄 Titre: {response_data['titre']}")
        print(f"   📎 Documents: {len(response_data['documents'])}")
        
        conn.close()
        
        # Test 6: Validation avec schema Pydantic
        print("\n6️⃣ Test validation Pydantic...")
        try:
            from schemas import Demande as DemandeSchema
            
            # Essayer de valider avec le schema
            validated = DemandeSchema(**response_data)
            print("   ✅ Validation Pydantic OK")
            
        except Exception as e:
            print(f"   ❌ Erreur validation Pydantic: {e}")
            print(f"   🔍 Type erreur: {type(e).__name__}")
            traceback.print_exc()
            return False
        
        print("\n✅ TOUS LES TESTS PASSENT - Le problème est ailleurs!")
        return True
        
    except Exception as e:
        print(f"\n❌ ERREUR: {e}")
        print(f"Type erreur: {type(e).__name__}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    debug_endpoint()
