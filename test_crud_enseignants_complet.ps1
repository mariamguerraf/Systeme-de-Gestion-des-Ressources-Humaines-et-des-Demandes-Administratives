# Test complet du CRUD des enseignants
# Ce script teste toutes les fonctionnalités de gestion des enseignants

Write-Host "=== TEST COMPLET CRUD ENSEIGNANTS ===" -ForegroundColor Green
Write-Host ""

# 1. Vérifier que les serveurs sont démarrés
Write-Host "1. Vérification des serveurs..." -ForegroundColor Yellow

# Backend (port 8000)
try {
    $backendTest = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get
    Write-Host "✓ Backend FastAPI : $($backendTest.status)" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend FastAPI non accessible sur le port 8000" -ForegroundColor Red
    Write-Host "Démarrez le backend avec : wsl python main_minimal.py" -ForegroundColor Yellow
    exit 1
}

# Frontend (port 8080)
try {
    $frontendTest = Invoke-WebRequest -Uri "http://localhost:8080" -Method Get
    Write-Host "✓ Frontend React : En ligne (Code $($frontendTest.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Frontend React non accessible sur le port 8080" -ForegroundColor Red
    Write-Host "Démarrez le frontend avec : npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 2. Test de connexion admin
Write-Host "2. Test de connexion admin..." -ForegroundColor Yellow

$loginData = @{
    username = "admin@univ.ma"
    password = "admin2024"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/auth/login" -Method Post -Body $loginData -ContentType "application/x-www-form-urlencoded" -Form @{username="admin@univ.ma"; password="admin2024"}
    $token = $loginResponse.access_token
    Write-Host "✓ Connexion admin réussie : $token" -ForegroundColor Green
} catch {
    Write-Host "✗ Échec de la connexion admin" -ForegroundColor Red
    Write-Host "Erreur : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 3. Test de création d'enseignant
Write-Host "3. Test de création d'enseignant..." -ForegroundColor Yellow

$enseignantData = @{
    nom = "Dupont"
    prenom = "Jean"
    email = "jean.dupont@test.ma"
    telephone = "0612345678"
    adresse = "123 Rue Test, Rabat"
    cin = "EE123456"
    password = "test123"
    specialite = "Informatique"
    grade = "Professeur Assistant"
    etablissement = "Université Test"
} | ConvertTo-Json

$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

try {
    $createResponse = Invoke-RestMethod -Uri "http://localhost:8000/users/enseignants" -Method Post -Body $enseignantData -Headers $authHeaders
    $enseignantId = $createResponse.id
    Write-Host "✓ Enseignant créé avec succès : ID $enseignantId" -ForegroundColor Green
    Write-Host "  Nom: $($createResponse.user.prenom) $($createResponse.user.nom)" -ForegroundColor Cyan
    Write-Host "  Email: $($createResponse.user.email)" -ForegroundColor Cyan
    Write-Host "  Spécialité: $($createResponse.specialite)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Échec de création d'enseignant" -ForegroundColor Red
    Write-Host "Erreur : $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. Test de récupération de tous les enseignants
Write-Host "4. Test de récupération des enseignants..." -ForegroundColor Yellow

try {
    $enseignants = Invoke-RestMethod -Uri "http://localhost:8000/users/enseignants" -Method Get -Headers @{"Authorization" = "Bearer $token"}
    Write-Host "✓ Récupération réussie : $($enseignants.Count) enseignant(s) trouvé(s)" -ForegroundColor Green
    
    foreach ($ens in $enseignants) {
        Write-Host "  - ID: $($ens.id) | $($ens.user.prenom) $($ens.user.nom) | $($ens.user.email)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ Échec de récupération des enseignants" -ForegroundColor Red
    Write-Host "Erreur : $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 5. Test de modification d'enseignant (si créé)
if ($enseignantId) {
    Write-Host "5. Test de modification d'enseignant..." -ForegroundColor Yellow
    
    $updateData = @{
        nom = "Dupont-Modifié"
        prenom = "Jean-Claude"
        email = "jean.dupont.modifie@test.ma"
        telephone = "0687654321"
        adresse = "456 Avenue Modifiée, Casablanca"
        cin = "EE789123"
        password = "newpass123"
        specialite = "Mathématiques"
        grade = "Professeur"
        etablissement = "Université Modifiée"
    } | ConvertTo-Json
    
    try {
        $updateResponse = Invoke-RestMethod -Uri "http://localhost:8000/users/enseignants/$enseignantId" -Method Put -Body $updateData -Headers $authHeaders
        Write-Host "✓ Enseignant modifié avec succès" -ForegroundColor Green
        Write-Host "  Nouveau nom: $($updateResponse.user.prenom) $($updateResponse.user.nom)" -ForegroundColor Cyan
        Write-Host "  Nouvel email: $($updateResponse.user.email)" -ForegroundColor Cyan
        Write-Host "  Nouvelle spécialité: $($updateResponse.specialite)" -ForegroundColor Cyan
    } catch {
        Write-Host "✗ Échec de modification d'enseignant" -ForegroundColor Red
        Write-Host "Erreur : $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# 6. Test de suppression d'enseignant (si créé)
if ($enseignantId) {
    Write-Host "6. Test de suppression d'enseignant..." -ForegroundColor Yellow
    
    try {
        $deleteResponse = Invoke-RestMethod -Uri "http://localhost:8000/users/enseignants/$enseignantId" -Method Delete -Headers @{"Authorization" = "Bearer $token"}
        Write-Host "✓ Enseignant supprimé avec succès" -ForegroundColor Green
        Write-Host "  Message: $($deleteResponse.message)" -ForegroundColor Cyan
    } catch {
        Write-Host "✗ Échec de suppression d'enseignant" -ForegroundColor Red
        Write-Host "Erreur : $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# 7. Vérification finale
Write-Host "7. Vérification finale..." -ForegroundColor Yellow

try {
    $enseignantsFinal = Invoke-RestMethod -Uri "http://localhost:8000/users/enseignants" -Method Get -Headers @{"Authorization" = "Bearer $token"}
    Write-Host "✓ Vérification finale : $($enseignantsFinal.Count) enseignant(s) restant(s)" -ForegroundColor Green
} catch {
    Write-Host "✗ Échec de vérification finale" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== TEST COMPLET TERMINÉ ===" -ForegroundColor Green
Write-Host ""
Write-Host "Instructions pour tester l'interface :" -ForegroundColor Yellow
Write-Host "1. Ouvrez http://localhost:8080 dans votre navigateur" -ForegroundColor Cyan
Write-Host "2. Connectez-vous avec admin@univ.ma / admin2024" -ForegroundColor Cyan
Write-Host "3. Allez dans la section 'Enseignants'" -ForegroundColor Cyan
Write-Host "4. Testez les fonctions Créer, Modifier, Supprimer" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API : http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend Web : http://localhost:8080" -ForegroundColor Cyan
