# Guide de connexion - Projet Front-end

## 🔐 Comment se connecter à votre projet

Votre projet utilise un système d'authentification avec différents rôles d'utilisateurs. Voici comment vous connecter :

### 📋 Credentials de test disponibles

#### 👑 Administrateur
- **Email :** `admin@test.com`
- **Mot de passe :** `admin123`
- **Accès :** Dashboard administrateur, gestion des utilisateurs

#### 📝 Secrétaire
- **Email :** `secretaire@test.com`
- **Mot de passe :** `secretaire123`
- **Accès :** Dashboard, gestion des demandes

#### 🎓 Enseignant
- **Email :** `enseignant@test.com`
- **Mot de passe :** `enseignant123`
- **Accès :** Demandes d'absence, attestations, heures supplémentaires

#### 🏢 Fonctionnaire
- **Email :** `fonctionnaire@test.com`
- **Mot de passe :** `fonctionnaire123`
- **Accès :** Demandes de congé, ordres de mission

### 🚀 Comment utiliser

1. **Méthode simple :**
   - Allez sur la page de connexion
   - Cliquez sur "Voir les comptes de test"
   - Choisissez un rôle et cliquez sur "Utiliser"

2. **Méthode manuelle :**
   - Copiez l'email et le mot de passe d'un rôle
   - Saisissez-les dans le formulaire de connexion

### 📁 Redirections après connexion

- **Admin** → `/cadmin/dashboard`
- **Secrétaire** → `/dashboard`
- **Enseignant** → `/enseignant/demandes`
- **Fonctionnaire** → `/fonctionnaire/demandes`

### 🔧 Configuration backend

Assurez-vous que votre backend :
- Fonctionne sur `http://localhost:8000`
- Accepte ces credentials de test
- Retourne le bon rôle dans la réponse `/auth/me`

### ⚠️ Important

- Ces credentials sont uniquement pour le développement
- Ne jamais les utiliser en production
- Pour créer de vrais utilisateurs, utilisez l'interface d'inscription ou l'administration

### 🛠️ Dépannage

Si la connexion ne fonctionne pas :

1. **Vérifiez le backend :**
   ```bash
   curl http://localhost:8000/docs
   ```

2. **Vérifiez les variables d'environnement :**
   - `VITE_API_URL` doit pointer vers votre backend

3. **Consultez la console du navigateur** pour les erreurs

4. **Vérifiez que les utilisateurs existent** dans votre base de données

### 📱 Interface

Le projet dispose d'une interface moderne avec :
- Formulaire de connexion responsive
- Validation des champs
- Messages d'erreur clairs
- Aide intégrée aux credentials de test
- Navigation automatique selon le rôle
