# Configuration des Ports Codespaces

## 🎯 Objectif

Ce guide explique comment configurer correctement les ports de votre GitHub Codespace pour assurer une communication optimale entre le front-end et le back-end de votre application.

## 📋 Scripts Disponibles

### 1. `setup_codespaces.sh`
- **Fonction**: Détecte automatiquement l'environnement Codespace et met à jour les URLs dans le code
- **Action**: Met à jour `src/services/api.ts` avec l'URL correcte du backend
- **Usage**: `./setup_codespaces.sh`

### 2. `setup_codespaces_ports.sh`
- **Fonction**: Configure les ports comme publics pour permettre l'accès externe
- **Ports configurés**: 8000 (backend), 8080 (frontend), 3000, 5173
- **Usage**: `./setup_codespaces_ports.sh`

### 3. `start_services.sh`
- **Fonction**: Script tout-en-un qui lance l'application complète
- **Actions**: Configure les ports, met à jour les URLs, et démarre backend + frontend
- **Usage**: `./start_services.sh`

## 🚀 Démarrage Rapide

### Option 1: Démarrage automatique complet
```bash
./start_services.sh
```

### Option 2: Démarrage manuel étape par étape
```bash
# 1. Configurer les URLs
./setup_codespaces.sh

# 2. Rendre les ports publics
./setup_codespaces_ports.sh

# 3. Démarrer le backend
cd back_end
python main_minimal.py &

# 4. Démarrer le frontend (dans un autre terminal)
cd ..
npm run dev
```

## 🔗 URLs d'Accès

Après configuration, vos URLs seront :
- **Frontend**: `https://[CODESPACE_NAME]-8080.app.github.dev`
- **Backend**: `https://[CODESPACE_NAME]-8000.app.github.dev`

## 📊 Vérification des Ports

Pour vérifier l'état de vos ports :
```bash
gh codespace ports
```

## 🔧 Configuration Manuelle

Si les scripts automatiques ne fonctionnent pas, vous pouvez configurer manuellement :

### Via l'Interface Codespaces
1. Allez dans l'onglet "Ports" de votre Codespace
2. Cliquez sur le port souhaité
3. Changez la visibilité de "Private" à "Public"

### Via la Ligne de Commande
```bash
gh codespace ports visibility 8000:public
gh codespace ports visibility 8080:public
```

## ⚠️ Problèmes Courants

### Port non accessible
- Vérifiez que le port est bien configuré comme "Public"
- Attendez quelques secondes après la configuration
- Redémarrez le service si nécessaire

### Erreur CORS
- Vérifiez que l'URL backend dans `api.ts` correspond à l'URL réelle
- Assurez-vous que le backend autorise les requêtes cross-origin

### Backend non joignable
- Vérifiez que le backend tourne sur le bon port (8000)
- Vérifiez les logs du backend pour des erreurs

## 📝 Fichiers Modifiés

Les scripts modifient automatiquement :
- `src/services/api.ts`: URL de l'API backend
- Configuration des ports Codespaces

Une sauvegarde est créée avant chaque modification.

## 🆘 Support

En cas de problème :
1. Vérifiez les logs dans les terminaux
2. Utilisez `gh codespace ports` pour vérifier l'état des ports
3. Redémarrez les services si nécessaire
4. Consultez la documentation GitHub Codespaces
