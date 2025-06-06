# ✅ IDENTIFIANTS CORRECTS DE L'ADMIN

## 🔑 **Identifiants Admin CORRECTS :**
- **Email :** `admin@univ.ma`
- **Mot de passe :** `admin2024`

## 🚫 **NE PAS utiliser :**
- ❌ `admin@universite.ma`
- ❌ `admin123`

## 🧪 **Test Complet - Création d'Enseignant**

### 1. 🚀 Démarrer l'application
```powershell
# Backend
cd back_end
python main_minimal.py

# Frontend (nouveau terminal)
npm run dev
```

### 2. 🔐 Se connecter comme admin
- Aller sur : `http://localhost:5173`
- **Email :** `admin@univ.ma`
- **Mot de passe :** `admin2024`

### 3. ➕ Créer un enseignant
- Cliquer sur **"Enseignants"**
- Cliquer sur **"Ajouter un Enseignant"**
- Remplir le formulaire :

**Données de test suggérées :**
```
Prénom: Mohammed
Nom: Alami  
Email: mohammed.alami@univ.ma
Téléphone: 0612345678
Adresse: 123 Rue de l'Université, Rabat
CIN: AB123456
Mot de passe: enseignant123
Spécialité: Informatique
Grade: Professeur Assistant
Établissement: Faculté des Sciences
```

### 4. ✅ Vérifier le résultat
- Message : "Enseignant créé avec succès !"
- Nouvel enseignant dans la liste
- Modal se ferme automatiquement

## 🎯 **Si ça ne marche pas :**

### Problème de connexion ?
- Vérifiez l'email : `admin@univ.ma` (pas `admin@universite.ma`)
- Vérifiez le mot de passe : `admin2024` (pas `admin123`)

### Problème de token ?
- Ouvrez F12 → Console
- Tapez : `localStorage.getItem('access_token')`
- Doit retourner un token, pas `null`

### Problème serveur ?
- Backend sur port 8000 : `http://localhost:8000/docs`
- Frontend sur port 5173 : `http://localhost:5173`

## 🎉 **Les identifiants sont maintenant corrects !**
Utilisez `admin@univ.ma` / `admin2024` pour tous vos tests.
