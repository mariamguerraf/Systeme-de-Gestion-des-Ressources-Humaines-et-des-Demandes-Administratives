#!/usr/bin/env powershell
# Script de test avec le bon port 8080

Write-Host "🔧 CORRECTION - Port Backend (8080)" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

Write-Host "`n📋 Problème identifié :" -ForegroundColor Yellow
Write-Host "   L'application utilise le port 8080 et non 8000" -ForegroundColor White
Write-Host "   Le formulaire envoyait vers http://localhost:8000" -ForegroundColor Red
Write-Host "   Mais le backend tourne sur http://localhost:8080" -ForegroundColor Red

Write-Host "`n✅ Corrections appliquées :" -ForegroundColor Green
Write-Host "   ✓ src/pages/cadmin/Enseignants.tsx - URL API corrigée" -ForegroundColor White
Write-Host "   ✓ src/services/api.ts - URL de base corrigée" -ForegroundColor White
Write-Host "   ✓ .env - VITE_API_URL mis à jour" -ForegroundColor White
Write-Host "   ✓ .env.local - VITE_API_URL mis à jour" -ForegroundColor White

Write-Host "`n🔄 Redémarrage nécessaire :" -ForegroundColor Yellow
Write-Host "   Pour que les changements .env prennent effet," -ForegroundColor White
Write-Host "   vous devez redémarrer le frontend :" -ForegroundColor White
Write-Host "   1. Arrêter le serveur (Ctrl+C)" -ForegroundColor Gray
Write-Host "   2. Relancer : npm run dev" -ForegroundColor Gray

Write-Host "`n🧪 Test à effectuer :" -ForegroundColor Cyan
Write-Host "   1. Vérifier que le backend tourne sur port 8080" -ForegroundColor White
Write-Host "   2. Redémarrer le frontend : npm run dev" -ForegroundColor White
Write-Host "   3. Se connecter : admin@univ.ma / admin2024" -ForegroundColor White
Write-Host "   4. Aller dans Enseignants > Ajouter un Enseignant" -ForegroundColor White
Write-Host "   5. Remplir et soumettre le formulaire" -ForegroundColor White

Write-Host "`n📝 Données de test :" -ForegroundColor Yellow
Write-Host "   - Prénom: Mohammed" -ForegroundColor Gray
Write-Host "   - Nom: Alami" -ForegroundColor Gray
Write-Host "   - Email: mohammed.alami@univ.ma" -ForegroundColor Gray
Write-Host "   - Téléphone: 0612345678" -ForegroundColor Gray
Write-Host "   - Mot de passe: enseignant123" -ForegroundColor Gray
Write-Host "   - Spécialité: Informatique" -ForegroundColor Gray
Write-Host "   - Grade: Professeur Assistant" -ForegroundColor Gray

Write-Host "`n🎯 Résultat attendu :" -ForegroundColor Green
Write-Host "   ✓ Plus de message d'erreur de connexion" -ForegroundColor White
Write-Host "   ✓ Appel API vers le bon port (8080)" -ForegroundColor White
Write-Host "   ✓ Message 'Enseignant créé avec succès !'" -ForegroundColor White
Write-Host "   ✓ Nouvel enseignant dans la liste" -ForegroundColor White

Write-Host "`n🔍 Vérification rapide :" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/docs" -Method GET -TimeoutSec 5
    Write-Host "   ✅ Backend accessible sur port 8080" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend non accessible sur port 8080" -ForegroundColor Red
    Write-Host "   Vérifiez que le backend est démarré" -ForegroundColor Yellow
}

Write-Host "`n💡 Important :" -ForegroundColor Cyan
Write-Host "   N'oubliez pas de redémarrer le frontend pour que" -ForegroundColor White
Write-Host "   les nouvelles variables d'environnement soient prises en compte !" -ForegroundColor White

Write-Host "`n🚀 Prêt pour le test !" -ForegroundColor Green
