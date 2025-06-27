# Script PowerShell pour convertir HTML en PDF
# Utilise Microsoft Edge WebView2

param(
    [string]$HtmlFile = "presentation_projet_fin_etudes.html",
    [string]$OutputFile = "Presentation_Projet_Fin_Etudes.pdf"
)

Write-Host "🔄 Conversion HTML vers PDF en cours..." -ForegroundColor Cyan

# Vérifier si le fichier HTML existe
if (-not (Test-Path $HtmlFile)) {
    Write-Host "❌ Erreur: Le fichier $HtmlFile n'existe pas" -ForegroundColor Red
    exit 1
}

# Obtenir le chemin complet
$FullHtmlPath = Resolve-Path $HtmlFile
$OutputPath = Join-Path (Get-Location) $OutputFile

Write-Host "📄 Fichier source: $FullHtmlPath" -ForegroundColor Green
Write-Host "💾 Fichier de sortie: $OutputPath" -ForegroundColor Green

try {
    # Méthode 1: Utiliser Edge en mode headless
    $EdgePath = Get-Command msedge -ErrorAction SilentlyContinue
    
    if ($EdgePath) {
        Write-Host "🌐 Utilisation de Microsoft Edge..." -ForegroundColor Yellow
        
        $arguments = @(
            "--headless"
            "--disable-gpu"
            "--run-all-compositor-stages-before-draw"
            "--disable-dev-shm-usage"
            "--virtual-time-budget=10000"
            "--print-to-pdf=`"$OutputPath`""
            "file:///$($FullHtmlPath.Path.Replace('\', '/'))"
        )
        
        Start-Process -FilePath $EdgePath.Source -ArgumentList $arguments -Wait -NoNewWindow
        
        if (Test-Path $OutputPath) {
            Write-Host "✅ PDF créé avec succès: $OutputFile" -ForegroundColor Green
            Write-Host "📂 Ouvrir le dossier? (O/N):" -ForegroundColor Yellow -NoNewline
            $response = Read-Host
            if ($response -eq "O" -or $response -eq "o") {
                Start-Process explorer (Split-Path $OutputPath)
            }
        } else {
            throw "La conversion a échoué"
        }
    } else {
        Write-Host "❌ Microsoft Edge n'est pas trouvé" -ForegroundColor Red
        Write-Host "📝 Instructions manuelles:" -ForegroundColor Yellow
        Write-Host "   1. Ouvrez $HtmlFile dans votre navigateur" -ForegroundColor White
        Write-Host "   2. Appuyez sur Ctrl+P" -ForegroundColor White
        Write-Host "   3. Choisissez 'Enregistrer au format PDF'" -ForegroundColor White
        Write-Host "   4. Enregistrez sous '$OutputFile'" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Erreur lors de la conversion: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "📝 Instructions manuelles:" -ForegroundColor Yellow
    Write-Host "   1. Ouvrez $HtmlFile dans votre navigateur" -ForegroundColor White
    Write-Host "   2. Appuyez sur Ctrl+P" -ForegroundColor White
    Write-Host "   3. Choisissez 'Enregistrer au format PDF'" -ForegroundColor White
    Write-Host "   4. Enregistrez sous '$OutputFile'" -ForegroundColor White
}

Write-Host "🏁 Script terminé. Appuyez sur une touche pour continuer..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
