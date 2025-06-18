#!/bin/bash

echo "=== Test Upload Photo Enseignant ==="

# Test 1: Vérifier le backend
echo "1. Test connexion backend..."
HEALTH=$(curl -s http://localhost:8000/health)
echo "Backend health: $HEALTH"

# Test 2: Test login admin
echo "2. Test login admin..."
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@univ.ma&password=admin2024")
echo "Login response: $LOGIN_RESPONSE"

# Test 3: Lister les enseignants avec token manual
echo "3. Test liste enseignants..."
TOKEN="test_token_1_admin"
ENSEIGNANTS=$(curl -s "http://localhost:8000/users/enseignants" \
  -H "Authorization: Bearer $TOKEN" | head -200)
echo "Enseignants: $ENSEIGNANTS"

# Test 4: Test upload avec image simple
echo "4. Test upload photo..."
# Créer une image de test simple
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > test_upload.png

UPLOAD_RESPONSE=$(curl -s -X POST "http://localhost:8000/users/enseignants/14/upload-photo" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_upload.png")
echo "Upload response: $UPLOAD_RESPONSE"

echo "=== Fin du test ==="
