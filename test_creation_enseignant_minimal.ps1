# Script de test pour la création d'enseignant avec main_minimal.py
Write-Host "🚀 Test de Création d'Enseignant - Version Minimale" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# 1. Démarrer le backend
Write-Host "`n1. Démarrage du backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd 'c:\Users\L13\Desktop\projet_pfe\back_end'; python main_minimal.py" -WindowStyle Normal

# Attendre que le serveur démarre
Write-Host "   Attente du démarrage du serveur..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Vérifier si le serveur est démarré
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend démarré avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur de démarrage du backend" -ForegroundColor Red
    Write-Host "   Veuillez démarrer manuellement: cd back_end && python main_minimal.py" -ForegroundColor Yellow
    exit
}

# 2. Tester l'endpoint de login
Write-Host "`n2. Test de connexion admin..." -ForegroundColor Yellow
try {
    $loginData = @{
        username = "admin@test.com"
        password = "admin123"
    }
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/auth/login" -Method POST -Body $loginData -ContentType "application/x-www-form-urlencoded"
    $token = $loginResponse.access_token
    Write-Host "✅ Connexion admin réussie" -ForegroundColor Green
    Write-Host "   Token: $token" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erreur de connexion admin" -ForegroundColor Red
    Write-Host "   Erreur: $_" -ForegroundColor Red
    exit
}

# 3. Tester la création d'enseignant
Write-Host "`n3. Test de création d'enseignant..." -ForegroundColor Yellow
try {
    $enseignantData = @{
        nom = "Alami"
        prenom = "Mohamed" 
        email = "mohamed.alami@test.com"
        telephone = "0612345678"
        adresse = "123 Rue Test, Rabat"
        cin = "AB123456"
        password = "enseignant123"
        specialite = "Informatique"
        grade = "Professeur Assistant"
        etablissement = "Faculté des Sciences"
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $createResponse = Invoke-RestMethod -Uri "http://localhost:8000/users/enseignants" -Method POST -Body $enseignantData -Headers $headers
    Write-Host "✅ Enseignant créé avec succès!" -ForegroundColor Green
    Write-Host "   Nom: $($createResponse.user.prenom) $($createResponse.user.nom)" -ForegroundColor Gray
    Write-Host "   Email: $($createResponse.user.email)" -ForegroundColor Gray
    Write-Host "   Spécialité: $($createResponse.specialite)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erreur de création d'enseignant" -ForegroundColor Red
    Write-Host "   Erreur: $_" -ForegroundColor Red
}

# 4. Instructions pour le test frontend
Write-Host "`n4. Test du Frontend:" -ForegroundColor Yellow
Write-Host "   1. Ouvrez un nouveau terminal et lancez: npm run dev" -ForegroundColor White
Write-Host "   2. Allez sur http://localhost:5173" -ForegroundColor White
Write-Host "   3. Connectez-vous avec:" -ForegroundColor White
Write-Host "      Email: admin@test.com" -ForegroundColor Cyan
Write-Host "      Mot de passe: admin123" -ForegroundColor Cyan
Write-Host "   4. Cliquez sur 'Enseignants' dans la navigation" -ForegroundColor White
Write-Host "   5. Cliquez sur 'Ajouter un Enseignant'" -ForegroundColor White
Write-Host "   6. Remplissez le formulaire et cliquez 'Créer'" -ForegroundColor White

Write-Host "`n🏁 Test terminé!" -ForegroundColor Green
Write-Host "Le backend reste en cours d'exécution pour vos tests frontend." -ForegroundColor Yellow
