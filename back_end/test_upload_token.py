#!/usr/bin/env python3
import requests
import json
import jwt
from datetime import datetime, timedelta
from config import settings

def create_admin_token():
    """Créer un token JWT valide pour l'admin"""
    payload = {
        "user_id": 1,
        "email": "admin@univ-maroc.ma", 
        "role": "ADMIN",
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)
    return token

def test_upload_auth():
    """Tester l'authentification sur l'endpoint d'upload"""
    token = create_admin_token()
    print(f"🔑 Token créé: {token}")
    
    # Test avec un GET sur l'endpoint enseignants d'abord
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        # Test simple GET enseignants
        response = requests.get("http://localhost:8000/users/enseignants", headers=headers)
        print(f"📋 GET enseignants - Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Authentification OK - {len(data)} enseignants")
            if data:
                enseignant_id = data[0]["id"]
                print(f"🎯 Test upload avec enseignant ID: {enseignant_id}")
                
                # Test POST upload (sans fichier pour voir l'auth)
                upload_url = f"http://localhost:8000/users/enseignants/{enseignant_id}/upload-photo"
                files = {"file": ("test.jpg", b"fake_image_data", "image/jpeg")}
                headers_upload = {"Authorization": f"Bearer {token}"}
                
                upload_response = requests.post(upload_url, headers=headers_upload, files=files)
                print(f"📤 Upload test - Status: {upload_response.status_code}")
                print(f"📤 Upload test - Response: {upload_response.text}")
        else:
            print(f"❌ Erreur GET enseignants: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_upload_auth()
