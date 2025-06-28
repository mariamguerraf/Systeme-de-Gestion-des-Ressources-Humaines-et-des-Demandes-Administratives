#!/usr/bin/env python3
import requests
import json

def test_demande_status_update():
    """Tester la mise à jour du statut d'une demande par un secrétaire"""
    
    # Token secrétaire pour la modification
    token_secretaire = "test_token_43_SECRETAIRE"
    
    headers = {
        "Authorization": f"Bearer {token_secretaire}",
        "Content-Type": "application/json"
    }
    
    try:
        # 1. D'abord récupérer la liste des demandes pour avoir un ID
        response = requests.get("http://localhost:8000/demandes/", headers=headers)
        print(f"📋 GET demandes - Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Erreur récupération demandes: {response.text}")
            return
            
        demandes = response.json()
        if not demandes:
            print("❌ Aucune demande trouvée pour le test")
            return
            
        # Prendre la première demande disponible
        demande = demandes[0]
        demande_id = demande['id']
        statut_actuel = demande.get('statut', 'EN_ATTENTE')
        
        print(f"🎯 Test avec demande ID: {demande_id}")
        print(f"   Titre: {demande.get('titre', 'N/A')}")
        print(f"   Statut actuel: {statut_actuel}")
        print(f"   Type: {demande.get('type_demande', 'N/A')}")
        
        # 2. Tester le rejet de la demande
        nouveau_statut = "REJETEE" 
        commentaire = "Demande rejetée pour test - documents incomplets"
        
        update_data = {
            "statut": nouveau_statut,
            "commentaire_admin": commentaire
        }
        
        print(f"\n🔄 Tentative de rejet de la demande {demande_id}...")
        response = requests.patch(
            f"http://localhost:8000/demandes/{demande_id}/status",
            headers=headers,
            json=update_data
        )
        
        print(f"📤 PATCH /demandes/{demande_id}/status - Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Rejet réussi!")
            updated_data = response.json()
            print(f"📄 Nouveau statut: {updated_data.get('statut')}")
            print(f"📝 Commentaire: {updated_data.get('commentaire_admin')}")
            print(f"⏰ Date traitement: {updated_data.get('date_traitement')}")
            
            # 3. Tester l'approbation
            print(f"\n🔄 Tentative d'approbation de la demande {demande_id}...")
            
            approve_data = {
                "statut": "APPROUVEE",
                "commentaire_admin": "Demande approuvée après révision"
            }
            
            response2 = requests.patch(
                f"http://localhost:8000/demandes/{demande_id}/status",
                headers=headers,
                json=approve_data
            )
            
            print(f"📤 PATCH /demandes/{demande_id}/status (approbation) - Status: {response2.status_code}")
            
            if response2.status_code == 200:
                print("✅ Approbation réussie!")
                approved_data = response2.json()
                print(f"📄 Nouveau statut: {approved_data.get('statut')}")
                print(f"📝 Commentaire: {approved_data.get('commentaire_admin')}")
            else:
                print(f"❌ Erreur approbation: {response2.text}")
            
        else:
            print(f"❌ Erreur rejet: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    print("🧪 Test de mise à jour du statut des demandes par secrétaire")
    print("=" * 70)
    test_demande_status_update()
