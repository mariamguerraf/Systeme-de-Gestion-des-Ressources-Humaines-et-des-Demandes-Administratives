@echo off
echo 🚀 DÉMARRAGE DU SERVEUR BACKEND
echo ================================
cd /d "c:\Users\L13\Desktop\projet_pfe\back_end"
echo.
echo 📍 Répertoire: %CD%
echo 🔧 Démarrage FastAPI sur port 8000...
echo.
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
