# 🎯 COMMENT SE CONNECTER À VOTRE PROJET

## ✅ État actuel - MISE À JOUR CRITIQUE ✅
- ✅ **Backend** : Fonctionne sur http://localhost:8000 - **TESTÉ ET VALIDÉ**
- ✅ **Frontend** : Fonctionne sur http://localhost:8080 - **OPÉRATIONNEL**
- ✅ **Base de données** : PostgreSQL connectée - **4 COMPTES VALIDÉS**
- ✅ **Interface de test** : Aide aux credentials intégrée

## 🔐 Credentials de test disponibles - TOUS VALIDÉS ✅

### 👑 Administrateur (FONCTIONNEL ✅)
```
Email: admin@gestion.com
Mot de passe: password123
Status: ✅ VALIDÉ SUR BACKEND
```

### 📝 Autres rôles - TOUS FONCTIONNELS ✅
```
Secrétaire: secretaire@gestion.com / password123 ✅
Enseignant: enseignant@gestion.com / password123 ✅
Fonctionnaire: fonctionnaire@gestion.com / password123 ✅
```

**⚠️ IMPORTANT: Utilisez les emails @gestion.com, pas @test.com**

## 🚀 Comment se connecter

### Méthode 1: Interface Web (RECOMMANDÉE)
1. Ouvrez http://localhost:8080 dans votre navigateur
2. Cliquez sur "Voir les comptes de test" sous le formulaire
3. Choisissez un rôle et cliquez "Utiliser"
4. Cliquez "Sign In"

### Méthode 2: Saisie manuelle
1. Allez sur http://localhost:8080
2. Saisissez `admin@test.com` dans le champ email
3. Saisissez `admin123` dans le champ mot de passe
4. Cliquez "Sign In"

## 📱 Redirections après connexion
- **Admin** → `/cadmin/dashboard`
- **Secrétaire** → `/dashboard`
- **Enseignant** → `/enseignant/demandes`
- **Fonctionnaire** → `/fonctionnaire/demandes`

## 🔧 Si ça ne marche pas

### Vérifier les services
```bash
# Backend (doit répondre)
curl http://localhost:8000/

# Frontend (doit s'ouvrir dans le navigateur)
curl http://localhost:8080/
```

### Recréer un utilisateur
```bash
cd /workspaces/front_end/back_end
python3 create_admin.py
```

### Redémarrer les services
```bash
# Arrêter et relancer le backend
cd /workspaces/front_end/back_end
./start_backend.sh

# Arrêter et relancer le frontend
cd /workspaces/front_end
npm run dev
```

## 🎉 Prêt à tester !

Votre application est maintenant prête. Utilisez les credentials ci-dessus pour vous connecter et explorer les différentes fonctionnalités selon le rôle choisi.

**Interface Web** : http://localhost:8080
**API Documentation** : http://localhost:8000/docs
