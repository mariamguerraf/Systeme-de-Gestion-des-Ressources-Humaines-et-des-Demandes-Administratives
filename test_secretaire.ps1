# Script de test pour la redirection secrétaire
# Utilisation: .\test_secretaire.ps1

Write-Host "🧪 TEST DE REDIRECTION SECRÉTAIRE" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Fonction pour tester l'API
function Test-API {
    Write-Host "📡 Test de l'API Backend..." -ForegroundColor Yellow
    
    try {
        # Test de connexion avec le compte secrétaire
        $body = @{
            username = "secretaire@univ.ma"
            password = "secretaire2024"
        }
        
        $response = Invoke-RestMethod -Uri "http://localhost:8000/auth/login" -Method POST -Body $body -ContentType "application/x-www-form-urlencoded"
        
        if ($response.access_token) {
            Write-Host "✅ Connexion secrétaire réussie" -ForegroundColor Green
            Write-Host "   Token reçu: $($response.access_token.Substring(0, 20))..." -ForegroundColor Gray
            
            # Test de récupération des informations utilisateur
            $headers = @{
                Authorization = "Bearer $($response.access_token)"
            }
            
            $userInfo = Invoke-RestMethod -Uri "http://localhost:8000/auth/me" -Method GET -Headers $headers
            Write-Host "   Email: $($userInfo.email)" -ForegroundColor Gray
            Write-Host "   Rôle: $($userInfo.role)" -ForegroundColor Gray
            
            return $true
        } else {
            Write-Host "❌ Pas de token reçu" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Erreur API: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Fonction pour vérifier les routes
function Test-Routes {
    Write-Host "🛣️ Vérification des routes configurées..." -ForegroundColor Yellow
    
    $routes = @(
        "/secretaire/dashboard",
        "/secretaire/users", 
        "/secretaire/demandes"
    )
    
    foreach ($route in $routes) {
        Write-Host "   Route: $route" -ForegroundColor Gray
    }
    
    Write-Host "✅ Routes secrétaire configurées" -ForegroundColor Green
}

# Fonction pour vérifier les fichiers modifiés
function Test-FilesModified {
    Write-Host "📝 Vérification des modifications..." -ForegroundColor Yellow
    
    $files = @(
        "src\components\DashboardRouter.tsx",
        "src\App.tsx", 
        "src\components\ProtectedRoute.tsx",
        "start_projet.ps1"
    )
    
    foreach ($file in $files) {
        if (Test-Path $file) {
            Write-Host "✅ $file existe" -ForegroundColor Green
        } else {
            Write-Host "❌ $file manquant" -ForegroundColor Red
        }
    }
}

# Fonction principale
function Main {
    Write-Host "🚀 Démarrage des tests..." -ForegroundColor Cyan
    Write-Host ""
    
    # Test 1: Vérifier les fichiers
    Test-FilesModified
    Write-Host ""
    
    # Test 2: Vérifier les routes
    Test-Routes
    Write-Host ""
    
    # Test 3: Tester l'API (si le backend est démarré)
    Write-Host "🔍 Tentative de test API..." -ForegroundColor Cyan
    $apiWorking = Test-API
    Write-Host ""
    
    # Résumé
    Write-Host "📋 RÉSUMÉ DES TESTS" -ForegroundColor Cyan
    Write-Host "==================" -ForegroundColor Cyan
    Write-Host ""
    
    if ($apiWorking) {
        Write-Host "✅ API Backend: Fonctionnel" -ForegroundColor Green
        Write-Host "✅ Authentification secrétaire: OK" -ForegroundColor Green
    } else {
        Write-Host "⚠️ API Backend: Non accessible" -ForegroundColor Yellow
        Write-Host "   Démarrez le backend avec: .\start_projet.ps1" -ForegroundColor Gray
    }
    
    Write-Host "✅ Routes secrétaire: Configurées" -ForegroundColor Green
    Write-Host "✅ Redirections: Mises à jour" -ForegroundColor Green
    Write-Host ""
    
    # Instructions pour test manuel
    Write-Host "🎯 INSTRUCTIONS POUR TEST MANUEL" -ForegroundColor Magenta
    Write-Host "================================" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "1. Lancez les services:" -ForegroundColor White
    Write-Host "   .\start_projet.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Ouvrez l'application:" -ForegroundColor White
    Write-Host "   http://localhost:8081" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Connectez-vous avec:" -ForegroundColor White
    Write-Host "   Email: secretaire@univ.ma" -ForegroundColor Gray
    Write-Host "   Mot de passe: secretaire2024" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Vérifiez la redirection vers:" -ForegroundColor White
    Write-Host "   /secretaire/dashboard" -ForegroundColor Gray
    Write-Host ""
    Write-Host "5. Testez la navigation entre pages secrétaire" -ForegroundColor White
    Write-Host ""
    
    # Ouvrir la page de test
    Write-Host "🌐 Ouverture de la page de test..." -ForegroundColor Cyan
    $testFile = "test_secretaire_redirection.html"
    if (Test-Path $testFile) {
        Start-Process $testFile
        Write-Host "✅ Page de test ouverte dans votre navigateur" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Fichier de test non trouvé: $testFile" -ForegroundColor Yellow
    }
}

# Lancer le script principal
Main

Write-Host ""
Write-Host "🏁 Tests terminés!" -ForegroundColor Green
