# PowerShell script to test teacher creation functionality
Write-Host "🚀 Starting Teacher Creation Test" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if backend is already running on port 8000
Write-Host "`n1. Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/docs" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend is already running on port 8000" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend not running. Please start it manually:" -ForegroundColor Red
    Write-Host "   cd back_end" -ForegroundColor Yellow
    Write-Host "   python main.py" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter after starting the backend"
}

# Check if frontend is running on port 5173
Write-Host "`n2. Checking if frontend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5
    Write-Host "✅ Frontend is already running on port 5173" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Frontend not running. You can start it with:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor Yellow
}

# Run the Python test script
Write-Host "`n3. Running backend API tests..." -ForegroundColor Yellow
python test_teacher_creation.py

Write-Host "`n4. Manual frontend test instructions:" -ForegroundColor Yellow
Write-Host "   1. Go to http://localhost:5173" -ForegroundColor White
Write-Host "   2. Login with admin@universite.ma / admin123" -ForegroundColor White
Write-Host "   3. Click on 'Enseignants' in navigation" -ForegroundColor White
Write-Host "   4. Click 'Ajouter un Enseignant'" -ForegroundColor White
Write-Host "   5. Fill the form and submit" -ForegroundColor White

Write-Host "`n🏁 Test completed!" -ForegroundColor Green
