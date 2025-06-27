@echo off
chcp 65001 >nul 2>&1
echo ========================================
echo  CONVERTISSEUR HTML vers PDF
echo ========================================
echo.

set "HTML_FILE=presentation_projet_fin_etudes.html"
set "PDF_FILE=Presentation_Projet_Fin_Etudes.pdf"

REM Vérifier si le fichier HTML existe
if not exist "%HTML_FILE%" (
    echo ❌ ERREUR: Le fichier %HTML_FILE% n'existe pas!
    echo.
    echo Assurez-vous que le fichier est dans le même dossier que ce script.
    pause
    exit /b 1
)

echo ✅ Fichier HTML trouvé: %HTML_FILE%
echo.

REM Méthode 1: Essayer avec Chrome
echo 🔄 Tentative avec Google Chrome...
set "CHROME_PATH="
for %%i in (
    "C:\Program Files\Google\Chrome\Application\chrome.exe"
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
) do (
    if exist %%i set "CHROME_PATH=%%i"
)

if defined CHROME_PATH (
    echo ✅ Chrome trouvé: %CHROME_PATH%
    echo 📄 Conversion en cours...
    %CHROME_PATH% --headless --disable-gpu --print-to-pdf="%PDF_FILE%" "file:///%CD%\%HTML_FILE%"
    timeout /t 3 >nul
    if exist "%PDF_FILE%" (
        echo ✅ SUCCÈS! PDF créé: %PDF_FILE%
        goto success
    )
)

REM Méthode 2: Essayer avec Edge
echo.
echo 🔄 Tentative avec Microsoft Edge...
set "EDGE_PATH="
for %%i in (
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
) do (
    if exist %%i set "EDGE_PATH=%%i"
)

if defined EDGE_PATH (
    echo ✅ Edge trouvé: %EDGE_PATH%
    echo 📄 Conversion en cours...
    %EDGE_PATH% --headless --disable-gpu --print-to-pdf="%PDF_FILE%" "file:///%CD%\%HTML_FILE%"
    timeout /t 3 >nul
    if exist "%PDF_FILE%" (
        echo ✅ SUCCÈS! PDF créé: %PDF_FILE%
        goto success
    )
)

REM Méthode 3: Ouvrir le fichier HTML directement
echo.
echo 🔄 Ouverture du fichier HTML dans le navigateur par défaut...
start "" "%HTML_FILE%"
timeout /t 2 >nul

echo.
echo 📝 INSTRUCTIONS MANUELLES:
echo ========================
echo.
echo Le fichier HTML s'est ouvert dans votre navigateur.
echo Maintenant:
echo.
echo 1. Dans votre navigateur, appuyez sur Ctrl+P
echo 2. Choisissez "Enregistrer au format PDF" ou "Microsoft Print to PDF"
echo 3. Paramètres recommandés:
echo    - Format: A4
echo    - Marges: Standard  
echo    - Couleurs: ✅ Activées (important!)
echo    - Échelle: 100%%
echo 4. Enregistrez sous: %PDF_FILE%
echo.
echo 💡 ASTUCE: Assurez-vous d'activer les couleurs de fond!
goto end

:success
echo.
echo 🎉 CONVERSION RÉUSSIE!
echo 📂 Voulez-vous ouvrir le dossier? (O/N)
set /p "choice="
if /i "%choice%"=="O" start "" "%CD%"
if /i "%choice%"=="o" start "" "%CD%"

:end
echo.
echo ✅ Script terminé!
pause
