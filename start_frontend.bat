@echo off
echo ========================================
echo 🚀 DÉMARRAGE DU FRONTEND REACT
echo ========================================
echo.
echo 📂 Répertoire: %cd%
echo.
echo 🔍 Vérification des dépendances...
if not exist "node_modules" (
    echo ❌ node_modules manquant, installation...
    npm install
) else (
    echo ✅ node_modules présent
)
echo.
echo 🌐 Le frontend sera accessible sur:
echo    - http://localhost:5173
echo    - http://127.0.0.1:5173
echo.
echo ⚡ Démarrage en cours...
npm run dev
echo.
echo ❌ Le serveur s'est arrêté.
pause
