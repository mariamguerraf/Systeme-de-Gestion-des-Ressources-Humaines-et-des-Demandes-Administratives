# Script PowerShell pour nettoyer le workspace
# Supprime les fichiers de test et les fichiers temporaires

Write-Host "Nettoyage du workspace..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow

$projectPath = "c:\Users\L13\Desktop\projet_pfe"
Set-Location $projectPath

# Compteur de fichiers supprimés
$deletedCount = 0

# =====================================
# 1. FICHIERS DE TEST (test_*, test-*)
# =====================================
Write-Host "`nSuppression des fichiers de test..." -ForegroundColor Cyan

$testFiles = @(
    "test_*.py",
    "test_*.ps1", 
    "test_*.html",
    "test_*.js",
    "test-*.sh",
    "test-*.html"
)

foreach ($pattern in $testFiles) {
    $files = Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if (Test-Path $file) {
            Write-Host "  ❌ $file" -ForegroundColor Red
            Remove-Item $file -Force
            $deletedCount++
        }
    }
}

# =====================================
# 2. GUIDES ET DOCUMENTATION TEMPORAIRE  
# =====================================
Write-Host "`nSuppression des guides temporaires..." -ForegroundColor Cyan

$docsToDelete = @(
    "GUIDE_*.md",
    "COMPTES_*.md", 
    "CONFIGURATION_*.md",
    "CONNEXION_*.md",
    "CORRECTION_*.md",
    "CORRECTIONS_*.md",
    "IDENTIFIANTS_*.md",
    "PLAN_*.md",
    "PROBLEM_*.md",
    "RESOLUTION_*.md",
    "SOLUTION_*.md",
    "STATUS_*.md",
    "IMPLEMENTATION_STATUS.md",
    "INTEGRATION_PROGRESS_SUMMARY.md",
    "FORMULAIRE_EXISTE.md",
    "RESUME_TECHNIQUE.md",
    "RAPPORT_FINAL_ETAT_PROJET.md"
)

foreach ($pattern in $docsToDelete) {
    $files = Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if (Test-Path $file) {
            Write-Host "  ❌ $file" -ForegroundColor Red
            Remove-Item $file -Force
            $deletedCount++
        }
    }
}

# =====================================
# 3. FICHIERS DE DEBUG ET DIAGNOSTIC
# =====================================
Write-Host "`nSuppression des fichiers de debug..." -ForegroundColor Cyan

$debugFiles = @(
    "debug*.html",
    "debug*.js", 
    "diagnostic*.ps1",
    "diagnostic*.sh",
    "verification_finale.sh",
    "RAPPORT_FINAL.sh"
)

foreach ($pattern in $debugFiles) {
    $files = Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if (Test-Path $file) {
            Write-Host "  ❌ $file" -ForegroundColor Red
            Remove-Item $file -Force
            $deletedCount++
        }
    }
}

# =====================================
# 4. LOGS TEMPORAIRES
# =====================================
Write-Host "`nSuppression des logs temporaires..." -ForegroundColor Cyan

$logFiles = @("*.log")
foreach ($pattern in $logFiles) {
    $files = Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if (Test-Path $file) {
            Write-Host "  ❌ $file" -ForegroundColor Red
            Remove-Item $file -Force
            $deletedCount++
        }
    }
}

# =====================================
# 5. SCRIPTS REDONDANTS
# =====================================
Write-Host "`nSuppression des scripts redondants..." -ForegroundColor Cyan

$redundantScripts = @(
    "start_app.sh",        # Garder start_app.ps1
    "start-app.sh",        # Redondant
    "start_projet.ps1",    # Redondant
    "start_test_enseignant.ps1",  # Test script
    "start_ubuntu.sh",     # Spécifique Ubuntu, pas needed sur Windows
    "create_admin.py"      # Script temporaire
)

foreach ($file in $redundantScripts) {
    if (Test-Path $file) {
        Write-Host "  ❌ $file" -ForegroundColor Red
        Remove-Item $file -Force
        $deletedCount++
    }
}

# =====================================
# 6. FICHIERS TEMPORAIRES DIVERS
# =====================================
Write-Host "`nSuppression des fichiers temporaires..." -ForegroundColor Cyan

$tempFiles = @(
    "bun.lockb"  # Lock file de Bun, pas nécessaire si on utilise npm
)

foreach ($file in $tempFiles) {
    if (Test-Path $file) {
        Write-Host "  ❌ $file" -ForegroundColor Red
        Remove-Item $file -Force
        $deletedCount++
    }
}

# =====================================
# RÉSUMÉ
# =====================================
Write-Host "`nNETTOYAGE TERMINE !" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host "Total de fichiers supprimes: $deletedCount" -ForegroundColor Green

Write-Host "`n📁 Fichiers conserves (essentiels):" -ForegroundColor Yellow
Write-Host "  ✅ src/ (code source frontend)" -ForegroundColor Green
Write-Host "  ✅ back_end/ (code source backend)" -ForegroundColor Green
Write-Host "  ✅ public/ (assets publics)" -ForegroundColor Green
Write-Host "  ✅ data/ (donnees de l'application)" -ForegroundColor Green
Write-Host "  ✅ node_modules/ (dependances)" -ForegroundColor Green
Write-Host "  ✅ dist/ (build de production)" -ForegroundColor Green
Write-Host "  ✅ .git/ (historique git)" -ForegroundColor Green
Write-Host "  ✅ Configuration files (package.json, tsconfig.json, etc.)" -ForegroundColor Green
Write-Host "  ✅ README.md (documentation principale)" -ForegroundColor Green
Write-Host "  ✅ start_app.ps1 (script de demarrage principal)" -ForegroundColor Green

Write-Host "`n🎯 Le workspace est maintenant propre et organise !" -ForegroundColor Cyan
