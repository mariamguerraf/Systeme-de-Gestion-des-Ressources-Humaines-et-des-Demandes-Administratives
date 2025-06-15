@echo off
echo 🔍 TEST RAPIDE DE CONNECTIVITE
echo ==============================
echo.

echo 📍 Verification du port 8000...
netstat -an | findstr :8000
if errorlevel 1 (
    echo ❌ Backend pas demarré
    echo.
    echo 🚀 Demarrage du backend...
    cd /d "c:\Users\L13\Desktop\projet_pfe\back_end"
    start "Backend Server" cmd /k "python start_server_simple.py"
    echo ✅ Backend en cours de demarrage...
    timeout /t 3 > nul
) else (
    echo ✅ Backend deja actif
)

echo.
echo 🌐 Test de connexion...
curl -s http://localhost:8000/health 2>nul
if errorlevel 1 (
    echo ❌ Pas de reponse du backend
) else (
    echo ✅ Backend repond correctement
)

echo.
echo 📱 Pour tester le frontend:
echo    1. Ouvrez un nouveau terminal
echo    2. Executez: npm run dev
echo    3. Allez sur: http://localhost:5173
echo.
pause
