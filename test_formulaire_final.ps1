# Script de test pour la création d'enseignant
Write-Host "🧪 TEST - Création d'Enseignant par l'Admin" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

Write-Host "`n📝 Ce que nous allons tester :" -ForegroundColor Yellow
Write-Host "  1. Le formulaire s'affiche correctement" -ForegroundColor White
Write-Host "  2. Tous les champs sont présents" -ForegroundColor White
Write-Host "  3. La validation fonctionne" -ForegroundColor White
Write-Host "  4. L'envoi à l'API fonctionne" -ForegroundColor White

Write-Host "`n🔧 Étapes du test :" -ForegroundColor Yellow

Write-Host "`n1️⃣  Test du formulaire HTML (interface)" -ForegroundColor Cyan
Write-Host "   - Ouvrir le fichier test_formulaire_enseignant.html" -ForegroundColor White
Write-Host "   - Vérifier que tous les champs s'affichent" -ForegroundColor White
Write-Host "   - Tester la validation" -ForegroundColor White

# Ouvrir le fichier de test HTML
Write-Host "`n   ⏳ Ouverture du formulaire de test..." -ForegroundColor Yellow
Start-Process "test_formulaire_enseignant.html"

Write-Host "`n2️⃣  Test avec données d'exemple" -ForegroundColor Cyan
Write-Host "   Remplissez le formulaire avec ces données :" -ForegroundColor White
Write-Host "   - Prénom: Mohammed" -ForegroundColor Gray
Write-Host "   - Nom: Alami" -ForegroundColor Gray
Write-Host "   - Email: mohammed.alami@universite.ma" -ForegroundColor Gray
Write-Host "   - Téléphone: 0612345678" -ForegroundColor Gray
Write-Host "   - Adresse: 123 Rue de l'Université, Rabat" -ForegroundColor Gray
Write-Host "   - CIN: AB123456" -ForegroundColor Gray
Write-Host "   - Mot de passe: enseignant123" -ForegroundColor Gray
Write-Host "   - Spécialité: Informatique" -ForegroundColor Gray
Write-Host "   - Grade: Professeur Assistant" -ForegroundColor Gray
Write-Host "   - Établissement: Faculté des Sciences" -ForegroundColor Gray

Read-Host "`n   ⏸️  Appuyez sur Entrée après avoir testé le formulaire HTML"

Write-Host "`n3️⃣  Test de l'application React" -ForegroundColor Cyan
Write-Host "   Pour tester dans l'application complète :" -ForegroundColor White
Write-Host "   - Démarrer le backend: cd back_end && python main_minimal.py" -ForegroundColor Gray
Write-Host "   - Démarrer le frontend: npm run dev" -ForegroundColor Gray
Write-Host "   - Aller sur http://localhost:5173" -ForegroundColor Gray
Write-Host "   - Se connecter comme admin: admin@universite.ma / admin123" -ForegroundColor Gray
Write-Host "   - Aller dans Enseignants > Ajouter un Enseignant" -ForegroundColor Gray

Write-Host "`n4️⃣  Points à vérifier dans l'app React :" -ForegroundColor Cyan
Write-Host "   ✓ Modal s'ouvre au clic sur 'Ajouter un Enseignant'" -ForegroundColor White
Write-Host "   ✓ Tous les champs du formulaire sont présents" -ForegroundColor White
Write-Host "   ✓ Validation des champs obligatoires" -ForegroundColor White
Write-Host "   ✓ Message de succès après création" -ForegroundColor White
Write-Host "   ✓ Nouvel enseignant apparaît dans la liste" -ForegroundColor White
Write-Host "   ✓ Modal se ferme automatiquement" -ForegroundColor White

Write-Host "`n📋 Checklist :" -ForegroundColor Yellow
Write-Host "   [ ] Formulaire HTML fonctionne" -ForegroundColor White
Write-Host "   [ ] Validation des données OK" -ForegroundColor White
Write-Host "   [ ] Backend main_minimal.py démarré" -ForegroundColor White
Write-Host "   [ ] Frontend React démarré" -ForegroundColor White
Write-Host "   [ ] Connexion admin réussie" -ForegroundColor White
Write-Host "   [ ] Modal enseignant s'ouvre" -ForegroundColor White
Write-Host "   [ ] Création d'enseignant réussie" -ForegroundColor White
Write-Host "   [ ] Enseignant ajouté à la liste" -ForegroundColor White

Write-Host "`n🎯 Résultat attendu :" -ForegroundColor Green
Write-Host "   L'admin peut facilement ajouter un nouvel enseignant" -ForegroundColor White
Write-Host "   Le formulaire est complet et intuitif" -ForegroundColor White
Write-Host "   Les données sont sauvegardées en base" -ForegroundColor White
Write-Host "   L'interface se met à jour automatiquement" -ForegroundColor White

Write-Host "`n✨ Le formulaire est prêt ! Testez maintenant dans l'application." -ForegroundColor Green
