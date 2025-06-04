# Guide de résolution des problèmes de connexion Codespaces

## Problème identifié
Le backend FastAPI s'exécute correctement sur le port 8001, mais il n'est pas accessible depuis le navigateur car le port n'est pas configuré comme "Public" dans GitHub Codespaces.

## Solution étape par étape

### Étape 1: Configurer le port comme Public
1. **Ouvrir l'onglet Ports** dans VS Code
   - Aller dans le panneau du bas de VS Code
   - Cliquer sur l'onglet "Ports" (à côté de Terminal, Problèmes, etc.)

2. **Localiser le port 8001**
   - Chercher la ligne avec le port 8001
   - Vérifier la colonne "Visibility"

3. **Rendre le port public**
   - Clic droit sur la ligne du port 8001
   - Sélectionner "Port Visibility"
   - Choisir "Public"
   - Le port devrait maintenant afficher "Public" dans la colonne Visibility

### Étape 2: Vérifier l'accessibilité du backend
```bash
./test-backend-access.sh
```
Vous devriez voir des status 200 au lieu de 401.

### Étape 3: Tester la connexion complète
```bash
./test-frontend-connection.sh
```

### Étape 4: Tester dans le navigateur
1. Ouvrir http://localhost:8082 (ou le port indiqué par Vite)
2. Utiliser un des comptes de test :
   - **Admin**: admin@gestion.com / password123
   - **Secrétaire**: secretaire@gestion.com / password123
   - **Enseignant**: enseignant@gestion.com / password123
   - **Fonctionnaire**: fonctionnaire@gestion.com / password123

## État actuel des services

### Backend (FastAPI)
- ✅ Serveur démarré sur port 8001
- ✅ Base de données PostgreSQL connectée
- ✅ 4 utilisateurs de test créés
- ❌ Port non public (à corriger)

### Frontend (React + Vite)
- ✅ Serveur démarré sur port 8082
- ✅ Configuration d'environnement correcte
- ✅ Service API configuré avec l'URL Codespaces
- ⏳ En attente que le backend soit accessible

## URLs importantes
- **Backend**: https://glorious-halibut-7vpx5rjj4w7g37qv-8001.app.github.dev
- **Frontend**: http://localhost:8082
- **Documentation API**: https://glorious-halibut-7vpx5rjj4w7g37qv-8001.app.github.dev/docs (une fois public)

## Commandes utiles

### Redémarrer le backend
```bash
cd back_end && uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### Redémarrer le frontend
```bash
npm run dev
```

### Vérifier les processus en cours
```bash
ps aux | grep -E "(uvicorn|vite)"
```
