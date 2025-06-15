@echo off
echo ========================================
echo 🚀 DÉMARRAGE DU BACKEND FASTAPI
echo ========================================
echo.
cd /d "%~dp0"
echo 📂 Répertoire: %cd%
echo 🐍 Python: 
python --version
echo.
echo 🌐 Le serveur sera accessible sur:
echo    - http://127.0.0.1:8000
echo    - http://localhost:8000
echo.
echo 🔍 Endpoints principaux:
echo    - GET  /health      (Test de santé)
echo    - POST /auth/login  (Connexion)
echo    - GET  /auth/me     (Utilisateur actuel)
echo.
echo ⚡ Démarrage en cours...
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
echo.
echo ❌ Le serveur s'est arrêté.
pause
