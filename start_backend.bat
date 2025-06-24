@echo off
echo Démarrage du serveur backend FastAPI...
cd /d "%~dp0\back_end"
C:\Users\L13\AppData\Local\Programs\Python\Python313\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
