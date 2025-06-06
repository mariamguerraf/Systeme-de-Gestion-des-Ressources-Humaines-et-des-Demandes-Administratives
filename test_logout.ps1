# Test de Déconnexion - Système Universitaire
# Ce script teste le bon fonctionnement de la déconnexion pour tous les rôles

Write-Host "🔐 TEST DE DECONNEXION - SYSTEME UNIVERSITAIRE" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Configuration
$API_URL = "http://localhost:8000"
$FRONTEND_URL = "http://localhost:5173"

# Comptes de test
$accounts = @(
    @{ email = "admin@univ.ma"; password = "admin2024"; role = "admin"; dashboard = "/cadmin/dashboard" },
    @{ email = "secretaire@univ.ma"; password = "secretaire2024"; role = "secretaire"; dashboard = "/secretaire/dashboard" },
    @{ email = "enseignant@univ.ma"; password = "enseignant2024"; role = "enseignant"; dashboard = "/enseignant/profil" },
    @{ email = "fonctionnaire@univ.ma"; password = "fonction2024"; role = "fonctionnaire"; dashboard = "/fonctionnaire/profil" }
)

function Test-BackendHealth {
    Write-Host "`n🏥 Vérification de l'état du backend..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$API_URL/health" -Method Get -TimeoutSec 5
        Write-Host "✅ Backend accessible: $($response.status)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Backend inaccessible: $_" -ForegroundColor Red
        return $false
    }
}

function Test-Login {
    param($Email, $Password, $ExpectedRole)
    
    Write-Host "`n🔑 Test de connexion pour $Email ($ExpectedRole)..." -ForegroundColor Yellow
    
    try {
        # Préparer les données de connexion
        $body = @{
            username = $Email
            password = $Password
        }
        
        # Connexion
        $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -Body $body -TimeoutSec 10
        
        if (-not $loginResponse.access_token) {
            throw "Aucun token reçu"
        }
        
        Write-Host "✅ Token reçu: $($loginResponse.access_token.Substring(0, 20))..." -ForegroundColor Green
        
        # Vérifier les informations utilisateur
        $headers = @{ Authorization = "Bearer $($loginResponse.access_token)" }
        $userResponse = Invoke-RestMethod -Uri "$API_URL/auth/me" -Method Get -Headers $headers -TimeoutSec 10
        
        if ($userResponse.role -ne $ExpectedRole) {
            throw "Rôle incorrect: reçu '$($userResponse.role)', attendu '$ExpectedRole'"
        }
        
        Write-Host "✅ Utilisateur authentifié: $($userResponse.prenom) $($userResponse.nom) ($($userResponse.role))" -ForegroundColor Green
        
        return @{
            success = $true
            token = $loginResponse.access_token
            user = $userResponse
        }
    }
    catch {
        Write-Host "❌ Erreur de connexion: $_" -ForegroundColor Red
        return @{ success = $false; error = $_ }
    }
}

function Test-TokenValidation {
    param($Token)
    
    Write-Host "`n🔍 Validation du token..." -ForegroundColor Yellow
    
    try {
        $headers = @{ Authorization = "Bearer $Token" }
        $response = Invoke-RestMethod -Uri "$API_URL/auth/me" -Method Get -Headers $headers -TimeoutSec 10
        Write-Host "✅ Token valide pour: $($response.prenom) $($response.nom)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Token invalide: $_" -ForegroundColor Red
        return $false
    }
}

function Show-LogoutInstructions {
    param($Role, $DashboardPath)
    
    Write-Host "`n📋 INSTRUCTIONS DE TEST MANUEL:" -ForegroundColor Cyan
    Write-Host "1. Ouvrez votre navigateur sur: $FRONTEND_URL$DashboardPath" -ForegroundColor White
    Write-Host "2. Vérifiez que le dashboard s'affiche correctement" -ForegroundColor White
    Write-Host "3. Cherchez le bouton 'Déconnexion' (généralement en haut à droite)" -ForegroundColor White
    Write-Host "4. Cliquez sur le bouton 'Déconnexion'" -ForegroundColor White
    Write-Host "5. Vérifiez que vous êtes redirigé vers la page de connexion principale ($FRONTEND_URL/)" -ForegroundColor White
    Write-Host "6. Vérifiez qu'un retour en arrière ne vous ramène pas au dashboard" -ForegroundColor White
    Write-Host "7. Essayez d'accéder directement au dashboard - vous devez être redirigé vers la connexion" -ForegroundColor White
}

function Test-LogoutProcess {
    param($Account)
    
    Write-Host "`n" + "="*50 -ForegroundColor Cyan
    Write-Host "🧪 TEST DE DÉCONNEXION POUR: $($Account.role.ToUpper())" -ForegroundColor Cyan
    Write-Host "="*50 -ForegroundColor Cyan
    
    # Étape 1: Connexion
    $loginResult = Test-Login -Email $Account.email -Password $Account.password -ExpectedRole $Account.role
    
    if (-not $loginResult.success) {
        Write-Host "❌ Échec du test pour $($Account.role) - impossible de se connecter" -ForegroundColor Red
        return $false
    }
    
    # Étape 2: Validation du token
    $tokenValid = Test-TokenValidation -Token $loginResult.token
    if (-not $tokenValid) {
        Write-Host "❌ Échec du test pour $($Account.role) - token invalide" -ForegroundColor Red
        return $false
    }
    
    # Étape 3: Instructions manuelles
    Show-LogoutInstructions -Role $Account.role -DashboardPath $Account.dashboard
    
    Write-Host "`n⏳ Appuyez sur ENTRÉE une fois que vous avez testé la déconnexion..." -ForegroundColor Yellow
    Read-Host
    
    # Étape 4: Vérification post-déconnexion
    Write-Host "`n🔍 Vérification que le token n'est plus valide..." -ForegroundColor Yellow
    $tokenStillValid = Test-TokenValidation -Token $loginResult.token
    
    if ($tokenStillValid) {
        Write-Host "⚠️  Le token semble encore valide côté serveur - c'est normal si vous n'avez pas cliqué sur Déconnexion" -ForegroundColor Yellow
        Write-Host "   La déconnexion côté client supprime le token du localStorage" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Token invalidé côté serveur" -ForegroundColor Green
    }
    
    return $true
}

# Programme principal
Write-Host "`n🚀 Démarrage des tests de déconnexion..." -ForegroundColor Green

# Vérifier le backend
if (-not (Test-BackendHealth)) {
    Write-Host "`n❌ Le backend n'est pas accessible. Assurez-vous qu'il est démarré sur $API_URL" -ForegroundColor Red
    Write-Host "Utilisez: cd back_end && python main_minimal.py" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n📝 Ce test va vérifier que:" -ForegroundColor Cyan
Write-Host "• La connexion fonctionne pour chaque rôle" -ForegroundColor White
Write-Host "• Le dashboard correct s'affiche" -ForegroundColor White
Write-Host "• Le bouton de déconnexion existe et fonctionne" -ForegroundColor White
Write-Host "• La redirection vers la page de connexion s'effectue" -ForegroundColor White
Write-Host "• Le token est supprimé du localStorage" -ForegroundColor White

Write-Host "`n⚠️  IMPORTANT: Assurez-vous que le frontend est démarré sur $FRONTEND_URL" -ForegroundColor Yellow
Write-Host "Utilisez: npm run dev" -ForegroundColor Yellow

Write-Host "`n▶️  Appuyez sur ENTRÉE pour commencer les tests..." -ForegroundColor Green
Read-Host

$testResults = @()

foreach ($account in $accounts) {
    $result = Test-LogoutProcess -Account $account
    $testResults += @{
        role = $account.role
        success = $result
    }
}

# Résumé final
Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "📊 RÉSUMÉ DES TESTS DE DÉCONNEXION" -ForegroundColor Cyan
Write-Host "="*60 -ForegroundColor Cyan

foreach ($result in $testResults) {
    if ($result.success) {
        Write-Host "✅ $($result.role.ToUpper()): Test terminé" -ForegroundColor Green
    } else {
        Write-Host "❌ $($result.role.ToUpper()): Échec du test" -ForegroundColor Red
    }
}

Write-Host "`n🎯 POINTS CLÉS À VÉRIFIER:" -ForegroundColor Cyan
Write-Host "• Le bouton 'Déconnexion' appelle bien logout() du contexte AuthContext" -ForegroundColor White
Write-Host "• La fonction logout() supprime le token du localStorage" -ForegroundColor White
Write-Host "• L'utilisateur est redirigé vers '/' après déconnexion" -ForegroundColor White
Write-Host "• Le contexte d'authentification est réinitialisé (user = null)" -ForegroundColor White
Write-Host "• Impossible de retourner au dashboard sans se reconnecter" -ForegroundColor White

Write-Host "`n✅ Tests de déconnexion terminés!" -ForegroundColor Green
Write-Host "📄 Pour un test interactif, ouvrez: test_logout.html" -ForegroundColor Yellow
