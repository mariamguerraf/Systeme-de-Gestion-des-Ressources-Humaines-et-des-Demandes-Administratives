# PowerShell script pour tester la création d'enseignant avec main_minimal.py
Write-Host "🚀 Test de Création d'Enseignant - Version Minimale" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Vérifier si le backend est déjà en cours d'exécution
Write-Host "`n1. Vérification du backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend déjà en cours d'exécution sur le port 8000" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non démarré. Démarrage en cours..." -ForegroundColor Yellow
    
    # Démarrer le backend en arrière-plan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\L13\Desktop\projet_pfe\back_end'; python main_minimal.py"
    
    # Attendre que le serveur démarre
    Write-Host "⏳ Attente du démarrage du serveur..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Vérifier à nouveau
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET -TimeoutSec 5
        Write-Host "✅ Backend démarré avec succès" -ForegroundColor Green
    } catch {
        Write-Host "❌ Impossible de démarrer le backend" -ForegroundColor Red
        Write-Host "Veuillez démarrer manuellement avec: cd back_end && python main_minimal.py" -ForegroundColor Yellow
        exit 1
    }
}

# Afficher les comptes de test disponibles
Write-Host "`n2. Comptes de test disponibles:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/test/users" -Method GET
    $users = ($response.Content | ConvertFrom-Json).users
    
    foreach ($user in $users) {
        if ($user.role -eq "admin") {
            Write-Host "   🔑 Admin: $($user.email) / $($user.password)" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "   🔑 Admin par défaut: admin@univ.ma / admin2024" -ForegroundColor Cyan
}

# Exécuter les tests API
Write-Host "`n3. Exécution des tests API..." -ForegroundColor Yellow
python test_teacher_creation.py

# Instructions pour les tests manuels
Write-Host "`n4. Instructions pour les tests manuels:" -ForegroundColor Yellow
Write-Host "   1. Démarrez le frontend: npm run dev" -ForegroundColor White
Write-Host "   2. Allez sur http://localhost:5173" -ForegroundColor White
Write-Host "   3. Connectez-vous avec: admin@univ.ma / admin2024" -ForegroundColor White
Write-Host "   4. Cliquez sur 'Enseignants' dans la navigation" -ForegroundColor White
Write-Host "   5. Cliquez sur 'Ajouter un Enseignant'" -ForegroundColor White
Write-Host "   6. Remplissez et soumettez le formulaire" -ForegroundColor White

Write-Host "`n5. URLs utiles:" -ForegroundColor Yellow
Write-Host "   📊 API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "   🏥 Health Check: http://localhost:8000/health" -ForegroundColor White
Write-Host "   👥 Test Users: http://localhost:8000/test/users" -ForegroundColor White
Write-Host "   🌐 Frontend: http://localhost:5173" -ForegroundColor White

Write-Host "`n🏁 Configuration terminée!" -ForegroundColor Green
