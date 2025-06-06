# Guide Rapide - Test Création Enseignant (Version Minimale)

## 🚀 Démarrage Rapide

### 1. Démarrer le Backend Minimal
```powershell
cd back_end
python main_minimal.py
```
Le serveur démarre sur http://localhost:8000

### 2. Démarrer le Frontend
```powershell
npm run dev
```
Le frontend démarre sur http://localhost:5173

## 🔑 Comptes de Test (main_minimal.py)

### Administrateur
- **Email**: admin@univ.ma
- **Mot de passe**: admin2024

### Autres comptes disponibles
- **Secrétaire**: secretaire@univ.ma / secretaire2024
- **Enseignant**: enseignant@univ.ma / enseignant2024
- **Fonctionnaire**: fonctionnaire@univ.ma / fonction2024
- **Test Simple**: test@test.com / 123

## 🧪 Tests Automatisés

### Script PowerShell complet
```powershell
.\test_enseignant_minimal.ps1
```

### Test API seulement
```powershell
python test_teacher_creation.py
```

## 📝 Test Manuel - Étapes

1. **Connexion Admin**
   - Aller sur http://localhost:5173
   - Se connecter avec admin@univ.ma / admin2024

2. **Créer un Enseignant**
   - Cliquer sur "Enseignants"
   - Cliquer sur "Ajouter un Enseignant"
   - Remplir le formulaire :
     ```
     Prénom: Mohamed
     Nom: Alami
     Email: mohamed.alami@univ.ma
     Téléphone: 0612345678
     Adresse: 123 Rue de l'Université, Rabat
     CIN: AB123456
     Mot de passe: enseignant123
     Spécialité: Informatique
     Grade: Professeur Assistant
     Établissement: Faculté des Sciences
     ```
   - Cliquer sur "Créer l'Enseignant"

3. **Vérifications**
   - ✅ Message de succès affiché
   - ✅ Nouvel enseignant dans la liste
   - ✅ Peut se connecter avec le nouvel enseignant

## 🔍 URLs de Test

- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Comptes Test**: http://localhost:8000/test/users
- **Frontend**: http://localhost:5173

## ⚠️ Différences avec la Version Complète

- **Stockage**: En mémoire (pas de base de données)
- **Persistance**: Les données sont perdues au redémarrage
- **Validation**: Simplifiée
- **Sécurité**: Tokens simplifiés pour les tests

## 🐛 Résolution de Problèmes

### Backend ne démarre pas
```powershell
cd back_end
pip install -r requirements.txt
python main_minimal.py
```

### Port 8000 occupé
```powershell
# Tuer le processus sur le port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Erreur de connexion frontend
- Vérifier que le backend est sur http://localhost:8000
- Vérifier les logs du navigateur (F12)

## ✅ Test de Validation

1. **Backend répond**: http://localhost:8000/health
2. **Login admin**: admin@univ.ma / admin2024
3. **Création enseignant**: Formulaire complet
4. **Validation erreurs**: Email en double
5. **Frontend mis à jour**: Liste actualisée
