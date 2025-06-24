# Système de Gestion des Ressources Humaines

## Configuration pour Windows

### Prérequis
- Python 3.13+ installé
- Node.js installé
- Git installé

### Installation et Démarrage

#### Méthode 1 : Démarrage automatique (Recommandé)
Double-cliquez sur `start_app.bat` pour démarrer automatiquement le backend et le frontend.

#### Méthode 2 : Démarrage manuel

1. **Backend (FastAPI)**
   - Double-cliquez sur `start_backend.bat`
   - Ou via terminal : 
     ```cmd
     cd back_end
     C:\Users\L13\AppData\Local\Programs\Python\Python313\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
     ```

2. **Frontend (React/Vite)**
   - Double-cliquez sur `start_frontend.bat`
   - Ou via terminal :
     ```cmd
     npm run dev
     ```

### URLs d'accès
- **Frontend** : http://localhost:8080
- **Backend API** : http://localhost:8000
- **Documentation API** : http://localhost:8000/docs

### Structure du projet
- `back_end/` : Serveur FastAPI (Python)
- `src/` : Frontend React avec TypeScript
- `public/` : Fichiers statiques
- `uploads/` : Fichiers uploadés

### Scripts utiles
- `start_app.bat` : Démarre backend + frontend
- `start_backend.bat` : Démarre uniquement le backend
- `start_frontend.bat` : Démarre uniquement le frontend

### Dépannage
- Si SQLAlchemy pose des problèmes, assurez-vous d'avoir la version 2.0.25+
- Vérifiez que les ports 8000 et 8080 ne sont pas utilisés par d'autres applications
- Les logs du backend se trouvent dans `back_end/backend.log`

### Base de données
Le projet utilise SQLite par défaut. La base de données est créée automatiquement au premier démarrage dans `back_end/gestion_db.db`.
