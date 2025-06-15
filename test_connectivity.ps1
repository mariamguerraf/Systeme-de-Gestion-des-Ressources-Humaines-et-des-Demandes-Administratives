#!/usr/bin/env powershell
# Script de test de connectivité backend/frontend

Write-Host "🔍 Test de connectivité Backend/Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Vérifier si le port 8000 est occupé
Write-Host "📍 Test 1: Port 8000..." -ForegroundColor Yellow
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) {
    Write-Host "✅ Port 8000 est occupé (backend probablement actif)" -ForegroundColor Green
    
    # Test 2: Test de l'endpoint /health
    Write-Host "📍 Test 2: Endpoint /health..." -ForegroundColor Yellow
    try {
        $healthResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8000/health" -Method GET -TimeoutSec 5
        if ($healthResponse.StatusCode -eq 200) {
            Write-Host "✅ Backend répond correctement" -ForegroundColor Green
            $content = $healthResponse.Content | ConvertFrom-Json
            Write-Host "   Réponse: $($content.message)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Backend ne répond pas sur /health" -ForegroundColor Red
        Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test 3: Test de l'endpoint /test
    Write-Host "📍 Test 3: Endpoint /test..." -ForegroundColor Yellow
    try {
        $testResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8000/test" -Method GET -TimeoutSec 5
        if ($testResponse.StatusCode -eq 200) {
            Write-Host "✅ Endpoint /test fonctionne" -ForegroundColor Green
            $content = $testResponse.Content | ConvertFrom-Json
            Write-Host "   Test: $($content.test), CORS: $($content.cors)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Endpoint /test ne répond pas" -ForegroundColor Red
        Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} else {
    Write-Host "❌ Port 8000 n'est pas occupé (backend probablement arrêté)" -ForegroundColor Red
    Write-Host "   Démarrez le backend avec: ./back_end/start_backend.bat" -ForegroundColor Yellow
}

# Test 4: Vérifier si le port 5173 est occupé (Vite)
Write-Host "📍 Test 4: Port 5173 (Frontend)..." -ForegroundColor Yellow
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Host "✅ Port 5173 est occupé (frontend probablement actif)" -ForegroundColor Green
} else {
    Write-Host "❌ Port 5173 n'est pas occupé (frontend probablement arrêté)" -ForegroundColor Red
    Write-Host "   Démarrez le frontend avec: ./start_frontend.bat" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 RÉSUMÉ DES ÉTAPES:" -ForegroundColor Cyan
Write-Host "1. Démarrer le backend: ./back_end/start_backend.bat" -ForegroundColor White
Write-Host "2. Démarrer le frontend: ./start_frontend.bat" -ForegroundColor White
Write-Host "3. Ouvrir http://localhost:5173 dans le navigateur" -ForegroundColor White
Write-Host "4. Se connecter avec admin/admin" -ForegroundColor White
Write-Host ""
