@echo off
echo.
echo 🎯 CONVERSION PDF - MÉTHODE SIMPLE
echo ==================================
echo.

REM Vérifier si le fichier HTML existe
if not exist "presentation_projet_fin_etudes.html" (
    echo ❌ ERREUR: Fichier HTML introuvable!
    pause
    exit
)

echo ✅ Ouverture du fichier HTML...
echo.
echo 📋 ÉTAPES À SUIVRE:
echo.
echo 1. Le fichier s'ouvre dans votre navigateur
echo 2. Appuyez sur Ctrl+P
echo 3. Choisissez "Enregistrer au format PDF"
echo 4. IMPORTANT: Activez les "Couleurs de fond"
echo 5. Format: A4, Marges: Standard
echo 6. Sauvegardez sous "Presentation_Projet_Fin_Etudes.pdf"
echo.

pause

REM Ouvrir le fichier HTML
start "" "presentation_projet_fin_etudes.html"

echo.
echo ✅ Le fichier est maintenant ouvert dans votre navigateur
echo 🎯 Suivez les étapes ci-dessus pour créer le PDF
echo.
pause
