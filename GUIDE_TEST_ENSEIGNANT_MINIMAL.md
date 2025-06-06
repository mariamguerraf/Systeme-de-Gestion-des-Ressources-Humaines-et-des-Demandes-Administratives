# Guide de Test - Création d'Enseignant (Version Minimale)

## 🎯 Objectif
Tester que l'admin peut créer un nouvel enseignant via l'interface web et que cela fonctionne avec `main_minimal.py`.

## 🚀 Étapes de Test

### 1. Démarrer le Backend
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

### 3. Test Automatique (Optionnel)
```powershell
.\test_creation_enseignant_minimal.ps1
```

## 🔑 Comptes de Test

### Admin
- **Email**: admin@test.com
- **Mot de passe**: admin123

### Secrétaire (pour comparaison)
- **Email**: secretaire@test.com  
- **Mot de passe**: secretaire123

## 📝 Procédure Manuelle

### Étape 1: Connexion Admin
1. Aller sur http://localhost:5173
2. Se connecter avec `admin@test.com` / `admin123`
3. Vérifier la redirection vers le dashboard admin

### Étape 2: Créer un Enseignant
1. Cliquer sur **"Enseignants"** dans la navigation
2. Cliquer sur **"Ajouter un Enseignant"**
3. Remplir le formulaire avec:

#### Informations Personnelles
- **Prénom**: Mohamed
- **Nom**: Alami  
- **Email**: mohamed.alami@universite.ma
- **Téléphone**: 0612345678
- **Adresse**: 123 Rue de l'Université, Rabat
- **CIN**: AB123456

#### Informations Professionnelles
- **Spécialité**: Informatique
- **Grade**: Professeur Assistant
- **Établissement**: Faculté des Sciences
- **Mot de passe**: enseignant123

4. Cliquer sur **"Créer"**

### Étape 3: Vérification
1. ✅ Message de succès s'affiche
2. ✅ Modal se ferme automatiquement
3. ✅ Nouvel enseignant apparaît dans la liste
4. ✅ Aucune erreur dans la console

## 🧪 Tests d'Erreur

### Test 1: Email Déjà Existant
1. Essayer de créer un enseignant avec `admin@test.com`
2. ✅ Doit afficher: "Un utilisateur avec cet email existe déjà"

### Test 2: Accès Non-Admin
1. Se connecter avec `secretaire@test.com` / `secretaire123`
2. Aller sur la page Enseignants
3. ✅ Ne doit pas voir le bouton "Ajouter un Enseignant"

## 🔍 Vérification Backend

Après création, vérifier dans les logs du serveur que:
- L'utilisateur a été ajouté à `TEST_USERS`
- Le role est bien "enseignant"
- Toutes les informations sont correctement stockées

## ✅ Résultats Attendus

1. **Interface**: Formulaire complet et intuitif
2. **Validation**: Messages d'erreur clairs
3. **Succès**: Enseignant ajouté à la liste
4. **Sécurité**: Seuls les admins peuvent créer
5. **Données**: Toutes les informations sont sauvegardées

## 🛠️ Dépannage

### Erreur de Connexion
- Vérifier que le backend est démarré sur port 8000
- Vérifier les identifiants de connexion

### Erreur de Création
- Vérifier que l'email n'existe pas déjà
- Vérifier que tous les champs obligatoires sont remplis
- Vérifier les logs du serveur

### Modal Ne S'Ouvre Pas
- Vérifier que vous êtes connecté en tant qu'admin
- Rafraîchir la page si nécessaire
