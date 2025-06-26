#!/usr/bin/env python3
"""
Test de l'authentification et de la mise à jour de statut
"""
import requests
import json

def test_auth_and_status():
    """Test l'authentification et la mise à jour de statut"""
    print("🎯 === TEST AUTHENTIFICATION ET STATUS ===")
    
    # Test 1: Login avec secrétaire
    print("\n1️⃣ Login secrétaire...")
    try:
        login_data = {
            "username": "secretaire@test.com",
            "password": "secretaire123"
        }
        
        login_response = requests.post(
            "http://localhost:8000/auth/login",
            data=login_data,
            timeout=10
        )
        
        print(f"   📡 Status login: {login_response.status_code}")
        
        if login_response.status_code != 200:
            print(f"❌ Échec login: {login_response.text}")
            return False
            
        token = login_response.json().get("access_token")
        if not token:
            print("❌ Token non reçu")
            return False
            
        print(f"   ✅ Login réussi, token: {token[:20]}...")
        headers = {"Authorization": f"Bearer {token}"}
        
    except Exception as e:
        print(f"❌ Erreur login: {e}")
        return False
    
    # Test 2: Lister les demandes pour voir leurs IDs
    print("\n2️⃣ Récupération des demandes...")
    try:
        list_response = requests.get(
            "http://localhost:8000/demandes/",
            headers=headers,
            timeout=10
        )
        
        if list_response.status_code != 200:
            print(f"❌ Erreur liste: {list_response.text}")
            return False
            
        demandes = list_response.json()
        print(f"   📄 {len(demandes)} demandes trouvées")
        
        # Prendre la première demande
        if not demandes:
            print("❌ Aucune demande à tester")
            return False
            
        test_demande = demandes[0]
        demande_id = test_demande['id']
        current_status = test_demande['statut']
        
        print(f"   🎯 Test avec demande {demande_id} (statut actuel: {current_status})")
        
    except Exception as e:
        print(f"❌ Erreur récupération demandes: {e}")
        return False
    
    # Test 3: Mettre à jour le statut
    print(f"\n3️⃣ Mise à jour statut demande {demande_id}...")
    try:
        # Changer le statut
        new_status = "APPROUVEE" if current_status != "APPROUVEE" else "EN_ATTENTE"
        
        status_data = {
            "statut": new_status,
            "commentaire_admin": "Test automatique de mise à jour"
        }
        
        status_response = requests.patch(
            f"http://localhost:8000/demandes/{demande_id}/status",
            headers={**headers, "Content-Type": "application/json"},
            json=status_data,
            timeout=10
        )
        
        print(f"   📡 Status update: {status_response.status_code}")
        
        if status_response.status_code == 200:
            print(f"   ✅ Statut mis à jour: {current_status} → {new_status}")
            return True
        else:
            print(f"   ❌ Erreur mise à jour: {status_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur mise à jour statut: {e}")
        return False

if __name__ == "__main__":
    success = test_auth_and_status()
    if success:
        print("\n🎉 TOUT FONCTIONNE!")
    else:
        print("\n❌ PROBLÈME DÉTECTÉ")
