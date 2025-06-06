# Guide de Test - Création d'Enseignant par l'Admin

## 📋 Objectif
Tester la fonctionnalité complète de création d'enseignant par l'administrateur, incluant :
- Interface frontend (formulaire)
- Endpoint backend (/users/enseignants)
- Validation des données
- Gestion des erreurs
- Sauvegarde en base de données

## 🚀 Démarrage

### 1. Démarrer le Backend
```powershell
cd c:\Users\L13\Desktop\projet_pfe\back_end
python main.py
```
Le serveur démarrera sur http://localhost:8000

### 2. Démarrer le Frontend  
```powershell
cd c:\Users\L13\Desktop\projet_pfe
npm run dev
```
Le frontend démarrera sur http://localhost:5173

## 🔑 Comptes de Test

### Administrateur
- **Email**: admin@universite.ma
- **Mot de passe**: admin123

## 📝 Procédure de Test

### Étape 1 : Connexion Admin
1. Aller sur http://localhost:5173
2. Se connecter avec les identifiants admin
3. Vérifier la redirection vers le dashboard admin

### Étape 2 : Accès à la Gestion des Enseignants
1. Cliquer sur "Enseignants" dans la navigation
2. Vérifier l'affichage de la page de gestion des enseignants
3. Cliquer sur "Ajouter un Enseignant"

### Étape 3 : Test du Formulaire de Création
1. **Remplir le formulaire avec des données valides :**
   - Prénom : Mohamed
   - Nom : Alami
   - Email : mohamed.alami@universite.ma
   - Téléphone : 0612345678
   - Adresse : 123 Rue de l'Université, Rabat
   - CIN : EE123456
   - Mot de passe : enseignant123
   - Spécialité : Informatique
   - Grade : Professeur Associé
   - Établissement : Faculté des Sciences

2. **Cliquer sur "Créer l'Enseignant"**

### Étape 4 : Vérification du Succès
1. Vérifier l'affichage du message de succès
2. Vérifier que l'enseignant apparaît dans la liste
3. Fermer le modal automatiquement

### Étape 5 : Tests d'Erreur

#### Test Email Duplicate
1. Essayer de créer un enseignant avec l'email : admin@universite.ma
2. Vérifier l'affichage d'un message d'erreur approprié

#### Test Champs Obligatoires
1. Laisser des champs obligatoires vides
2. Vérifier la validation côté frontend

## 🧪 Tests Backend Directs

### Test avec Script Python
```powershell
cd c:\Users\L13\Desktop\projet_pfe\back_end
python test_create_enseignant.py
```

### Test avec cURL
```powershell
# 1. Obtenir le token admin
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/auth/login" -Method POST -Body @{username="admin@universite.ma"; password="admin123"} -ContentType "application/x-www-form-urlencoded"
$token = $loginResponse.access_token

# 2. Créer un enseignant
$enseignantData = @{
    email = "test.enseignant@universite.ma"
    nom = "Test"
    prenom = "Enseignant"
    password = "test123"
    specialite = "Mathématiques"
    grade = "Professeur"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/users/enseignants" -Method POST -Headers @{Authorization="Bearer $token"} -Body $enseignantData -ContentType "application/json"
```

## ✅ Critères de Validation

### Frontend
- [ ] Formulaire s'affiche correctement
- [ ] Validation des champs obligatoires
- [ ] Icônes et design cohérents
- [ ] Messages d'erreur clairs
- [ ] État de chargement visible
- [ ] Fermeture automatique du modal au succès

### Backend
- [ ] Endpoint /users/enseignants répond en POST
- [ ] Validation des données reçues
- [ ] Hachage du mot de passe
- [ ] Création dans les tables User et Enseignant
- [ ] Gestion des erreurs (email duplicate, etc.)
- [ ] Réponse JSON correcte

### Base de Données
- [ ] Nouvel utilisateur créé avec role=ENSEIGNANT
- [ ] Enregistrement enseignant associé créé
- [ ] Relations correctes entre les tables
- [ ] Contraintes d'unicité respectées

## 🐛 Résolution de Problèmes

### Erreur de Connexion Backend
- Vérifier que le serveur FastAPI est démarré
- Vérifier le port 8000
- Regarder les logs du terminal backend

### Erreur CORS
- Vérifier la configuration CORS dans main.py
- L'URL frontend doit être autorisée

### Erreur Token
- Vérifier que l'admin est bien connecté
- Regarder la console du navigateur pour les erreurs JS

### Erreur Base de Données
- Vérifier que la base existe et est accessible
- Regarder les logs Python pour les erreurs SQLAlchemy

## 📊 Résultats Attendus

Après un test réussi :
1. Nouvel enseignant visible dans l'interface admin
2. Possibilité de se connecter avec les identifiants créés
3. Redirection correcte vers le dashboard enseignant
4. Données complètes accessibles via l'API

## 🔧 Commandes Utiles

### Vérifier les utilisateurs en base
```python
# Dans le terminal Python backend
from database import SessionLocal
from models import User, Enseignant

db = SessionLocal()
users = db.query(User).all()
for user in users:
    print(f"{user.email} - {user.role}")
```

### Reset de la base si nécessaire
```powershell
cd c:\Users\L13\Desktop\projet_pfe\back_end
python init_db.py
```
