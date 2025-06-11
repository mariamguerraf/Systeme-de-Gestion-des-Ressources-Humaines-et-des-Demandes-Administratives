# Script PowerShell pour nettoyer le workspace
# Supprime les fichiers de test et les fichiers temporaires

Write-Host "Nettoyage du workspace..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow

$projectPath = "c:\Users\L13\Desktop\projet_pfe"
Set-Location $projectPath

# Compteur de fichiers supprimes
$deletedCount = 0

# Fichiers de test
Write-Host "`nSuppression des fichiers de test..." -ForegroundColor Cyan
$testPatterns = @("test_*.py", "test_*.ps1", "test_*.html", "test_*.js", "test-*.sh", "test-*.html")
foreach ($pattern in $testPatterns) {
    $files = Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if (Test-Path $file) {
            Write-Host "  Suppression: $file" -ForegroundColor Red
            Remove-Item $file -Force
            $deletedCount++
        }
    }
}

# Documentation temporaire
Write-Host "`nSuppression des guides temporaires..." -ForegroundColor Cyan
$docPatterns = @(
    "GUIDE_*.md", "COMPTES_*.md", "CONFIGURATION_*.md", "CONNEXION_*.md",
    "CORRECTION_*.md", "CORRECTIONS_*.md", "IDENTIFIANTS_*.md", "PLAN_*.md",
    "PROBLEM_*.md", "RESOLUTION_*.md", "SOLUTION_*.md", "STATUS_*.md",
    "IMPLEMENTATION_STATUS.md", "INTEGRATION_PROGRESS_SUMMARY.md",
    "FORMULAIRE_EXISTE.md", "RESUME_TECHNIQUE.md", "RAPPORT_FINAL_ETAT_PROJET.md"
)
foreach ($pattern in $docPatterns) {
    $files = Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if (Test-Path $file) {
            Write-Host "  Suppression: $file" -ForegroundColor Red
            Remove-Item $file -Force
            $deletedCount++
        }
    }
}

# Fichiers de debug
Write-Host "`nSuppression des fichiers de debug..." -ForegroundColor Cyan
$debugPatterns = @("debug*.html", "debug*.js", "diagnostic*.ps1", "diagnostic*.sh", "verification_finale.sh", "RAPPORT_FINAL.sh")
foreach ($pattern in $debugPatterns) {
    $files = Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if (Test-Path $file) {
            Write-Host "  Suppression: $file" -ForegroundColor Red
            Remove-Item $file -Force
            $deletedCount++
        }
    }
}

# Logs temporaires
Write-Host "`nSuppression des logs temporaires..." -ForegroundColor Cyan
$logPatterns = @("*.log")
foreach ($pattern in $logPatterns) {
    $files = Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if (Test-Path $file) {
            Write-Host "  Suppression: $file" -ForegroundColor Red
            Remove-Item $file -Force
            $deletedCount++
        }
    }
}

# Scripts redondants
Write-Host "`nSuppression des scripts redondants..." -ForegroundColor Cyan
$redundantFiles = @(
    "start_app.sh", "start-app.sh", "start_projet.ps1", 
    "start_test_enseignant.ps1", "start_ubuntu.sh", "create_admin.py", "bun.lockb"
)
foreach ($file in $redundantFiles) {
    if (Test-Path $file) {
        Write-Host "  Suppression: $file" -ForegroundColor Red
        Remove-Item $file -Force
        $deletedCount++
    }
}

# Résumé
Write-Host "`nNETTOYAGE TERMINE !" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host "Total de fichiers supprimes: $deletedCount" -ForegroundColor Green

Write-Host "`nFichiers conserves (essentiels):" -ForegroundColor Yellow
Write-Host "  src/ (code source frontend)" -ForegroundColor Green
Write-Host "  back_end/ (code source backend)" -ForegroundColor Green  
Write-Host "  public/ (assets publics)" -ForegroundColor Green
Write-Host "  data/ (donnees application)" -ForegroundColor Green
Write-Host "  node_modules/ (dependances)" -ForegroundColor Green
Write-Host "  .git/ (historique git)" -ForegroundColor Green
Write-Host "  package.json, tsconfig.json (config)" -ForegroundColor Green
Write-Host "  README.md (documentation)" -ForegroundColor Green
Write-Host "  start_app.ps1 (script principal)" -ForegroundColor Green

Write-Host "`nWorkspace maintenant propre et organise !" -ForegroundColor Cyan
