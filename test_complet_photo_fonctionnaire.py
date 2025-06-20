#!/usr/bin/env python3
import requests
import json
import os
from PIL import Image
import io
import time

BASE_URL = "http://localhost:8000"
TOKEN = "test_token_admin"

def create_test_image():
    """Créer une image de test"""
    # Créer une image de test simple
    image = Image.new('RGB', (100, 100), color='purple')
    
    # Sauvegarder en mémoire
    img_buffer = io.BytesIO()
    image.save(img_buffer, format='PNG')
    img_buffer.seek(0)
    
    return img_buffer

def test_create_fonctionnaire_with_photo():
    """Test complet: création + upload photo"""
    print("🧪 TEST COMPLET - CRÉATION FONCTIONNAIRE + PHOTO")
    print("=" * 50)
    
    # 1. Créer un fonctionnaire
    print("1️⃣ Création du fonctionnaire...")
    
    fonctionnaire_data = {
        "nom": "TestPhotoComplet",
        "prenom": "Utilisateur", 
        "email": f"test.photo.complet.{int(time.time())}@univ.ma",
        "cin": f"PHOTO{int(time.time())}",
        "password": "test123",
        "service": "Test Photo Service",
        "poste": "Testeur Photo",
        "grade": "Catégorie Test",
        "telephone": "0123456789",
        "adresse": "Adresse de test"
    }
    
    try:
        # Création via API
        response = requests.post(
            f"{BASE_URL}/users/fonctionnaires",
            headers={
                "Authorization": f"Bearer {TOKEN}",
                "Content-Type": "application/json"
            },
            json=fonctionnaire_data
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            fonctionnaire = response.json()
            print(f"   ✅ Fonctionnaire créé: ID {fonctionnaire['id']}")
            print(f"      Nom: {fonctionnaire['user']['nom']} {fonctionnaire['user']['prenom']}")
            print(f"      Email: {fonctionnaire['user']['email']}")
            print(f"      CIN: {fonctionnaire['user']['cin']}")
            print(f"      Photo initiale: {fonctionnaire.get('photo', 'None')}")
            
            # 2. Upload de photo
            print(f"\n2️⃣ Upload de photo pour le fonctionnaire ID {fonctionnaire['id']}...")
            
            # Créer l'image de test
            test_image = create_test_image()
            
            # Upload via API
            files = {
                'file': ('test_photo.png', test_image, 'image/png')
            }
            
            upload_response = requests.post(
                f"{BASE_URL}/users/fonctionnaires/{fonctionnaire['id']}/upload-photo",
                headers={
                    "Authorization": f"Bearer {TOKEN}"
                },
                files=files
            )
            
            print(f"   Status upload: {upload_response.status_code}")
            
            if upload_response.status_code == 200:
                upload_result = upload_response.json()
                print(f"   ✅ Photo uploadée: {upload_result.get('filename', 'N/A')}")
                print(f"      Message: {upload_result.get('message', 'N/A')}")
                
                # 3. Vérifier le fonctionnaire mis à jour
                print(f"\n3️⃣ Vérification après upload...")
                
                check_response = requests.get(
                    f"{BASE_URL}/users/fonctionnaires",
                    headers={"Authorization": f"Bearer {TOKEN}"}
                )
                
                if check_response.status_code == 200:
                    fonctionnaires = check_response.json()
                    
                    # Trouver notre fonctionnaire
                    notre_fonc = None
                    for f in fonctionnaires:
                        if f['id'] == fonctionnaire['id']:
                            notre_fonc = f
                            break
                    
                    if notre_fonc:
                        print(f"   ✅ Fonctionnaire trouvé dans la liste:")
                        print(f"      ID: {notre_fonc['id']}")
                        print(f"      Nom: {notre_fonc['user']['nom']} {notre_fonc['user']['prenom']}")
                        print(f"      Photo: {notre_fonc.get('photo', 'None')}")
                        
                        # 4. Test de l'URL de la photo
                        if notre_fonc.get('photo'):
                            photo_url = f"{BASE_URL}{notre_fonc['photo']}"
                            print(f"\n4️⃣ Test d'accès à la photo: {photo_url}")
                            
                            photo_check = requests.head(photo_url)
                            if photo_check.status_code == 200:
                                print(f"   ✅ Photo accessible (Content-Type: {photo_check.headers.get('content-type', 'N/A')})")
                            else:
                                print(f"   ❌ Photo inaccessible (Status: {photo_check.status_code})")
                        else:
                            print(f"\n4️⃣ ❌ Aucune photo trouvée dans la réponse")
                    else:
                        print(f"   ❌ Fonctionnaire non trouvé dans la liste")
                else:
                    print(f"   ❌ Erreur lors de la vérification: {check_response.status_code}")
                        
            else:
                print(f"   ❌ Erreur upload: {upload_response.text}")
                
        else:
            print(f"   ❌ Erreur création: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_create_fonctionnaire_with_photo()
