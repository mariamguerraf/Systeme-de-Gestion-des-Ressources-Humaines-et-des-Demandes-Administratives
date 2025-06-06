#!/usr/bin/env python3
"""
Test script for teacher creation functionality
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def login_admin():
    """Login as admin and get token"""
    login_data = {
        "username": "admin@univ.ma",
        "password": "admin2024"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    if response.status_code == 200:
        data = response.json()
        return data.get("access_token")
    else:
        print(f"Login failed: {response.status_code} - {response.text}")
        return None

def create_teacher(token):
    """Test teacher creation"""
    teacher_data = {
        "nom": "Alami",
        "prenom": "Mohamed",
        "email": "mohamed.alami@univ.ma",
        "telephone": "0612345678",
        "adresse": "123 Rue de l'Université, Rabat",
        "cin": "AB123456",
        "password": "enseignant123",
        "specialite": "Informatique",
        "grade": "Professeur Assistant",
        "etablissement": "Faculté des Sciences"
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(f"{BASE_URL}/users/enseignants", 
                           json=teacher_data, 
                           headers=headers)
    
    return response

def test_duplicate_email(token):
    """Test duplicate email scenario"""
    teacher_data = {
        "nom": "Duplicate",
        "prenom": "Test",
        "email": "mohamed.alami@univ.ma",  # Same email as before
        "telephone": "0612345679",
        "adresse": "Another address",
        "cin": "CD789012",
        "password": "test123",
        "specialite": "Mathématiques",
        "grade": "Professeur",
        "etablissement": "Faculté des Sciences"
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(f"{BASE_URL}/users/enseignants", 
                           json=teacher_data, 
                           headers=headers)
    
    return response

def main():
    print("🚀 Testing Teacher Creation Functionality")
    print("=" * 50)
    
    # Test 1: Admin Login
    print("1. Testing admin login...")
    token = login_admin()
    if not token:
        print("❌ Admin login failed. Make sure the server is running and admin account exists.")
        sys.exit(1)
    print("✅ Admin login successful")
    
    # Test 2: Create Teacher
    print("\n2. Testing teacher creation...")
    response = create_teacher(token)
    
    if response.status_code == 200:
        teacher = response.json()
        print("✅ Teacher created successfully!")
        print(f"   - ID: {teacher.get('id')}")
        print(f"   - Name: {teacher.get('user', {}).get('prenom')} {teacher.get('user', {}).get('nom')}")
        print(f"   - Email: {teacher.get('user', {}).get('email')}")
        print(f"   - Speciality: {teacher.get('specialite')}")
    else:
        print(f"❌ Teacher creation failed: {response.status_code}")
        print(f"   Error: {response.text}")
    
    # Test 3: Duplicate Email
    print("\n3. Testing duplicate email validation...")
    response = test_duplicate_email(token)
    
    if response.status_code == 400:
        print("✅ Duplicate email properly rejected!")
        print(f"   Error message: {response.json().get('detail')}")
    else:
        print(f"❌ Duplicate email test failed: {response.status_code}")
        print(f"   Response: {response.text}")
    
    # Test 4: Check API endpoint exists
    print("\n4. Testing API endpoint availability...")
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("✅ API documentation available at http://localhost:8000/docs")
        else:
            print("⚠️  API docs not accessible")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running on port 8000")
    
    print("\n" + "=" * 50)
    print("🏁 Test completed!")

if __name__ == "__main__":
    main()
