# Script de démarrage pour tester la création d'enseignant
# Lance le backend et le frontend automatiquement

Write-Host "=== Démarrage des serveurs pour test création enseignant ===" -ForegroundColor Green

# Vérifier si le répertoire existe
$projectPath = "c:\Users\L13\Desktop\projet_pfe"
if (-not (Test-Path $projectPath)) {
    Write-Host "❌ Répertoire du projet non trouvé: $projectPath" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Répertoire du projet trouvé" -ForegroundColor Green

# Fonction pour démarrer le backend
function Start-Backend {
    Write-Host "🚀 Démarrage du serveur backend..." -ForegroundColor Yellow
    
    $backendPath = Join-Path $projectPath "back_end"
    
    # Vérifier si main.py existe
    if (-not (Test-Path (Join-Path $backendPath "main.py"))) {
        Write-Host "❌ Fichier main.py non trouvé dans $backendPath" -ForegroundColor Red
        return $false
    }
    
    # Démarrer le backend en arrière-plan
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "cd '$backendPath'; Write-Host 'Backend démarré - FastAPI sur http://localhost:8000' -ForegroundColor Green; python main.py"
    ) -WindowStyle Normal
    
    Write-Host "✅ Backend en cours de démarrage..." -ForegroundColor Green
    return $true
}

# Fonction pour démarrer le frontend
function Start-Frontend {
    Write-Host "🚀 Démarrage du serveur frontend..." -ForegroundColor Yellow
    
    # Vérifier si package.json existe
    if (-not (Test-Path (Join-Path $projectPath "package.json"))) {
        Write-Host "❌ Fichier package.json non trouvé dans $projectPath" -ForegroundColor Red
        return $false
    }
    
    # Démarrer le frontend en arrière-plan
    Start-Process powershell -ArgumentList @(
        "-NoExit", 
        "-Command",
        "cd '$projectPath'; Write-Host 'Frontend démarré - React sur http://localhost:5173' -ForegroundColor Green; npm run dev"
    ) -WindowStyle Normal
    
    Write-Host "✅ Frontend en cours de démarrage..." -ForegroundColor Green
    return $true
}

# Démarrer les serveurs
Write-Host "`n1️⃣ Démarrage du backend..." -ForegroundColor Cyan
if (-not (Start-Backend)) {
    Write-Host "❌ Échec du démarrage du backend" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 3

Write-Host "`n2️⃣ Démarrage du frontend..." -ForegroundColor Cyan  
if (-not (Start-Frontend)) {
    Write-Host "❌ Échec du démarrage du frontend" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 2

Write-Host "`n🎉 Serveurs en cours de démarrage!" -ForegroundColor Green
Write-Host "`n📋 INFORMATIONS DE CONNEXION:" -ForegroundColor White
Write-Host "   🌐 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   🔧 Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "   📚 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan

Write-Host "`n🔑 COMPTE ADMINISTRATEUR:" -ForegroundColor White
Write-Host "   📧 Email:    admin@universite.ma" -ForegroundColor Yellow
Write-Host "   🔒 Password: admin123" -ForegroundColor Yellow

Write-Host "`n📝 PROCÉDURE DE TEST:" -ForegroundColor White
Write-Host "   1. Aller sur http://localhost:5173" -ForegroundColor Gray
Write-Host "   2. Se connecter avec le compte admin" -ForegroundColor Gray
Write-Host "   3. Cliquer sur 'Enseignants' dans la navigation" -ForegroundColor Gray
Write-Host "   4. Cliquer sur 'Ajouter un Enseignant'" -ForegroundColor Gray
Write-Host "   5. Remplir le formulaire et tester la création" -ForegroundColor Gray

Write-Host "`n⏳ Attendez quelques secondes que les serveurs démarrent..." -ForegroundColor Yellow
Write-Host "   (Les fenêtres de terminal vont s'ouvrir automatiquement)" -ForegroundColor Gray

# Attendre que l'utilisateur soit prêt
Write-Host "`n🔄 Les serveurs démarrent dans des fenêtres séparées..." -ForegroundColor Green
Write-Host "   Appuyez sur [Entrée] pour ouvrir le navigateur automatiquement" -ForegroundColor White
Read-Host

# Ouvrir le navigateur vers l'application
Write-Host "🌐 Ouverture du navigateur..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "`n✅ Tout est prêt pour les tests!" -ForegroundColor Green
Write-Host "   Consultez le fichier GUIDE_TEST_CREATION_ENSEIGNANT.md pour plus de détails" -ForegroundColor Gray

# Option pour tester l'endpoint directement
Write-Host "`n🧪 Voulez-vous également tester l'endpoint backend directement? (y/N)" -ForegroundColor Cyan
$testEndpoint = Read-Host

if ($testEndpoint -eq "y" -or $testEndpoint -eq "Y") {
    Write-Host "🔄 Test de l'endpoint en cours..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5  # Attendre que le backend soit prêt
    
    $testScriptPath = Join-Path $projectPath "back_end\test_create_enseignant.py"
    if (Test-Path $testScriptPath) {
        Write-Host "▶️ Exécution du script de test..." -ForegroundColor Green
        Start-Process powershell -ArgumentList @(
            "-NoExit",
            "-Command", 
            "cd '$($projectPath)\back_end'; python test_create_enseignant.py; Write-Host 'Test terminé - Appuyez sur Entrée pour fermer'; Read-Host"
        ) -WindowStyle Normal
    } else {
        Write-Host "⚠️ Script de test non trouvé: $testScriptPath" -ForegroundColor Yellow
    }
}

Write-Host "`n🎯 Session de test initialisée avec succès!" -ForegroundColor Green
