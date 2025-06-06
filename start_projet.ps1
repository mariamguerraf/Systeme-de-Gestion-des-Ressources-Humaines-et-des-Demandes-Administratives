# Script de démarrage automatique du projet
# Utilisation: .\start_projet.ps1

Write-Host "🚀 Démarrage du projet FastAPI + React..." -ForegroundColor Green

# Démarrer le backend FastAPI
Write-Host "📡 Lancement du backend FastAPI sur le port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd back_end; Write-Host 'Backend FastAPI - Port 8000' -ForegroundColor Green; python main_minimal.py"

# Attendre un peu pour que le backend se lance
Start-Sleep -Seconds 3

# Démarrer le frontend React
Write-Host "🎨 Lancement du frontend React sur le port 8081..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Frontend React - Port 8081' -ForegroundColor Blue; npm run dev"

# Attendre que les services se lancent
Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Cyan
Start-Sleep -Seconds 8

# Ouvrir les navigateurs
Write-Host "🌐 Ouverture des interfaces..." -ForegroundColor Magenta
Start-Process "http://localhost:8000"  # API Backend
Start-Process "http://localhost:8081"  # Frontend React

Write-Host "`n✅ Projet lancé avec succès!" -ForegroundColor Green
Write-Host "📱 Frontend React: http://localhost:8081" -ForegroundColor Blue
Write-Host "🔧 Backend FastAPI: http://localhost:8000" -ForegroundColor Yellow
Write-Host "🩺 Health Check: http://localhost:8000/health" -ForegroundColor Cyan

Write-Host "`n📋 Pour arrêter le projet:" -ForegroundColor Red
Write-Host "   - Fermez les fenêtres PowerShell du backend et frontend" -ForegroundColor Red
Write-Host "   - Ou utilisez Ctrl+C dans chaque fenêtre" -ForegroundColor Red
