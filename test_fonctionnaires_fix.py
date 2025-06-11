#!/usr/bin/env python3
"""
Test script to verify fonctionnaires modification functionality
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_fonctionnaires_flow():
    print("🧪 Testing Fonctionnaires Modification Flow")
    print("=" * 50)    # Step 1: Login as admin
    print("1. 🔐 Logging in as admin...")
    login_data = {
        "username": "admin@univ.ma",
        "password": "admin2024"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return False
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login successful")
      # Step 2: Create a test fonctionnaire
    print("\n2. 👤 Creating test fonctionnaire...")
    fonctionnaire_data = {
        "nom": "TestFonc",
        "prenom": "Modification",
        "email": "testfonc.modification@univ.dz",
        "password": "test123",
        "telephone": "0123456789",
        "adresse": "Test Address",
        "cin": "AB123456",
        "service": "Administration",
        "poste": "Secrétaire",
        "grade": "Échelle 10"
    }
      response = requests.post(f"{BASE_URL}/users/fonctionnaires", json=fonctionnaire_data, headers=headers)
    if response.status_code not in [200, 201]:
        print(f"❌ Fonctionnaire creation failed: {response.text}")
        return False
    
    fonctionnaire_id = response.json()["id"]
    print(f"✅ Fonctionnaire created with ID: {fonctionnaire_id}")
      # Step 3: Test modification (the main issue we're fixing)
    print("\n3. 🔧 Testing fonctionnaire modification...")
    update_data = {
        "nom": "TestFonc",
        "prenom": "ModificationFixed",
        "email": "testfonc.modification@univ.dz",
        "password": "unchanged",  # Using 'unchanged' as we fixed in frontend
        "telephone": "0123456789",
        "adresse": "Test Address Updated",
        "cin": "AB123456",
        "service": "Administration Générale",
        "poste": "Chef de Bureau",
        "grade": "Échelle 11"
    }
    
    response = requests.put(f"{BASE_URL}/users/fonctionnaires/{fonctionnaire_id}", json=update_data, headers=headers)
    if response.status_code != 200:
        print(f"❌ Fonctionnaire modification failed: {response.text}")
        return False
    
    print("✅ Fonctionnaire modification successful")
      # Step 4: Verify the modification
    print("\n4. 🔍 Verifying modification...")
    response = requests.get(f"{BASE_URL}/users/fonctionnaires/{fonctionnaire_id}", headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to retrieve fonctionnaire: {response.text}")
        return False
    
    updated_fonctionnaire = response.json()
    print(f"✅ Updated fonctionnaire data:")
    print(f"   - Nom: {updated_fonctionnaire['user']['nom']}")
    print(f"   - Prénom: {updated_fonctionnaire['user']['prenom']}")
    print(f"   - Service: {updated_fonctionnaire['service']}")
    print(f"   - Poste: {updated_fonctionnaire['poste']}")
    
    # Step 5: Test modification with password change
    print("\n5. 🔑 Testing modification with password change...")
    update_data_with_password = {
        "nom": "TestFonc",
        "prenom": "ModificationFixed",
        "email": "testfonc.modification@univ.dz",
        "password": "newpassword123",  # Actual password change
        "telephone": "0123456789",
        "adresse": "Test Address Updated",
        "cin": "AB123456",
        "service": "Administration Générale",
        "poste": "Chef de Bureau",
        "grade": "Échelle 11"
    }
    
    response = requests.put(f"{BASE_URL}/users/fonctionnaires/{fonctionnaire_id}", json=update_data_with_password, headers=headers)
    if response.status_code != 200:
        print(f"❌ Fonctionnaire modification with password failed: {response.text}")
        return False
    
    print("✅ Fonctionnaire modification with password successful")
    
    # Step 6: Cleanup - delete test fonctionnaire
    print("\n6. 🗑️ Cleaning up...")
    response = requests.delete(f"{BASE_URL}/users/fonctionnaires/{fonctionnaire_id}", headers=headers)
    if response.status_code != 200:
        print(f"❌ Cleanup failed: {response.text}")
        return False
    
    print("✅ Cleanup successful")
    
    print("\n🎉 ALL TESTS PASSED! Fonctionnaires modification is working correctly.")
    return True

if __name__ == "__main__":
    try:
        success = test_fonctionnaires_flow()
        if success:
            print("\n✅ RESULT: Fonctionnaires modification fix is WORKING")
        else:
            print("\n❌ RESULT: There are still issues with fonctionnaires modification")
    except Exception as e:
        print(f"\n💥 UNEXPECTED ERROR: {e}")
        print("❌ RESULT: Test failed due to unexpected error")
