$baseUrl = "http://localhost:8000"
$loginData = @{
    email = "admin@test.com"
    password = "admin123"
} | ConvertTo-Json

Write-Host "🔍 Test de l'endpoint de connexion..." -ForegroundColor Yellow
Write-Host "URL: $baseUrl/auth/login" -ForegroundColor Gray
Write-Host "Données: $loginData" -ForegroundColor Gray

try {
    # Test login
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    Write-Host "✅ Connexion réussie!" -ForegroundColor Green
    Write-Host "Token reçu: $($response.access_token.Substring(0, 50))..." -ForegroundColor Green
    
    # Test /auth/me
    Write-Host "`n🔍 Test de l'endpoint /auth/me..." -ForegroundColor Yellow
    $headers = @{ Authorization = "Bearer $($response.access_token)" }
    $userResponse = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method Get -Headers $headers
    
    Write-Host "✅ Utilisateur récupéré!" -ForegroundColor Green
    Write-Host "Email: $($userResponse.email)" -ForegroundColor Green
    Write-Host "Rôle: $($userResponse.role)" -ForegroundColor Green
    Write-Host "ID: $($userResponse.id)" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}
