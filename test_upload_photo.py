#!/usr/bin/env python3
import requests
import json
import tempfile
from PIL import Image
import io

BASE_URL = "http://localhost:8000"
TOKEN = "test_token_admin"

def create_test_image():
    """Créer une image de test"""
    # Créer une image RGB de 100x100 pixels
    img = Image.new('RGB', (100, 100), color='red')
    
    # Sauvegarder dans un buffer
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    return buffer

def test_upload_photo():
    """Test de l'upload de photo"""
    print("🧪 Test de l'upload de photo pour fonctionnaire")
    print("=" * 50)
    
    # Test avec un fonctionnaire existant (ID 1)
    fonctionnaire_id = 1
    
    try:
        # Créer une image de test
        image_buffer = create_test_image()
        
        # Préparer la requête
        url = f"{BASE_URL}/users/fonctionnaires/{fonctionnaire_id}/upload-photo"
        headers = {
            "Authorization": f"Bearer {TOKEN}"
        }
        files = {
            'file': ('test_photo.png', image_buffer, 'image/png')
        }
        
        print(f"🔍 POST /users/fonctionnaires/{fonctionnaire_id}/upload-photo")
        response = requests.post(url, headers=headers, files=files)
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code < 400:
            print(f"   ✅ Succès - Photo uploadée")
            try:
                result = response.json()
                print(f"   📄 Résultat: {json.dumps(result, indent=2)}")
            except:
                print(f"   📄 Réponse: {response.text}")
        else:
            print(f"   ❌ Erreur")
            try:
                error = response.json()
                print(f"   📄 Erreur: {error}")
            except:
                print(f"   📄 Erreur: {response.text}")
        
        # Test avec un fonctionnaire inexistant
        print("\n🔍 Test avec fonctionnaire inexistant (ID 999)")
        image_buffer2 = create_test_image()
        url2 = f"{BASE_URL}/users/fonctionnaires/999/upload-photo"
        files2 = {
            'file': ('test_photo2.png', image_buffer2, 'image/png')
        }
        
        response2 = requests.post(url2, headers=headers, files=files2)
        print(f"   Status: {response2.status_code}")
        
        if response2.status_code >= 400:
            print(f"   ✅ Erreur 404 correctement détectée")
            try:
                error = response2.json()
                print(f"   📄 Erreur: {error}")
            except:
                print(f"   📄 Erreur: {response2.text}")
        
        # Test sans token d'authentification
        print("\n🔍 Test sans token d'authentification")
        image_buffer3 = create_test_image()
        files3 = {
            'file': ('test_photo3.png', image_buffer3, 'image/png')
        }
        
        response3 = requests.post(url, files=files3)  # Sans headers Authorization
        print(f"   Status: {response3.status_code}")
        
        if response3.status_code == 401:
            print(f"   ✅ Erreur 401 correctement détectée")
            try:
                error = response3.json()
                print(f"   📄 Erreur: {error}")
            except:
                print(f"   📄 Erreur: {response3.text}")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_upload_photo()
