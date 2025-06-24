@echo off
echo ========================================
echo   Système de Gestion RH - Démarrage
echo ========================================
echo.
echo Démarrage du backend en arrière-plan...
start "Backend FastAPI" cmd /k "cd /d \"%~dp0\back_end\" && C:\Users\L13\AppData\Local\Programs\Python\Python313\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo Attente de 3 secondes pour le démarrage du backend...
timeout /t 3 /nobreak > nul

echo Démarrage du frontend...
cd /d "%~dp0"
npm run dev

echo.
echo ========================================
echo   Application démarrée !
echo   Backend: http://localhost:8000
echo   Frontend: http://localhost:8080
echo ========================================
pause
