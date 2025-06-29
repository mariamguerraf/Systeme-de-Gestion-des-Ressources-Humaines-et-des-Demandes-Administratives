# 🏢 Système de Gestion des Ressources Humaines et des Demandes Administratives

Une application web moderne de gestion des ressources humaines développée avec **FastAPI** (backend) et **React/TypeScript** (frontend).

## 📋 Fonctionnalités

- 🔐 **Authentification multi-rôles** (Admin, Secrétaire, Enseignant, Fonctionnaire)
- 👥 **Gestion des utilisateurs** (CRUD complet)
- 📝 **Gestion des demandes administratives** avec workflow d'approbation
- 📄 **Upload et gestion de documents**
- 🖼️ **Gestion des photos de profil**
- 📊 **Tableaux de bord personnalisés** selon le rôle
- 🔒 **Sécurité JWT** avec gestion des permissions

## 🛠️ Technologies Utilisées

### Backend
- **FastAPI** - Framework web moderne et rapide
- **SQLAlchemy** - ORM Python
- **SQLite** - Base de données légère
- **JWT** - Authentification sécurisée
- **Pydantic** - Validation des données
- **Uvicorn** - Serveur ASGI

### Frontend
- **React 18** - Bibliothèque UI moderne
- **TypeScript** - JavaScript typé
- **Vite** - Build tool rapide
- **Tailwind CSS** - Framework CSS utility-first
- **Shadcn/ui** - Composants UI modernes
- **React Query** - Gestion d'état et cache
- **React Router** - Navigation

## 📦 Installation et Configuration

### Prérequis

- **Python 3.8+** installé
- **Node.js 16+** et **npm** installés
- **Git** pour cloner le projet

### 1. 📥 Cloner le Projet

```bash
git clone https://github.com/votre-username/systeme-gestion-rh.git
cd systeme-gestion-rh
```

### 2. 🔧 Configuration du Backend

#### a) Naviguer vers le dossier backend
```bash
cd back_end
```

#### b) Créer un environnement virtuel Python
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

#### c) Installer les dépendances Python
```bash
pip install -r requirements.txt
```

#### d) Configurer les variables d'environnement
Créer un fichier `.env` dans le dossier `back_end` :

```env
# Base de données
DATABASE_URL=sqlite:///./gestion_db.db

# Sécurité JWT
SECRET_KEY=votre_cle_secrete_tres_longue_et_securisee
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
FRONTEND_URL=http://localhost:8080

# Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5000000  # 5MB
```

#### e) Initialiser la base de données
```bash
python init_db.py
```

#### f) Démarrer le serveur backend
```bash
python main.py
```

Le backend sera disponible sur **http://localhost:8001**

### 3. ⚛️ Configuration du Frontend

#### a) Ouvrir un nouveau terminal et naviguer vers la racine
```bash
cd ..  # Retour à la racine du projet
```

#### b) Installer les dépendances Node.js
```bash
npm install
```

#### c) Configurer les variables d'environnement
Créer un fichier `.env.local` à la racine :

```env
VITE_API_URL=http://localhost:8001
```

#### d) Démarrer le serveur frontend
```bash
npm run dev
```

Le frontend sera disponible sur **http://localhost:8080**

## 🚀 Démarrage Rapide

### Méthode 1 : Scripts automatiques (Windows)

```bash
# Démarrer le backend
.\start_backend.bat

# Dans un autre terminal, démarrer le frontend
npm run dev
```

### Méthode 2 : Démarrage manuel

#### Terminal 1 - Backend :
```bash
cd back_end
python main.py
```

#### Terminal 2 - Frontend :
```bash
npm run dev
```

## 📁 Structure du Projet

```
📦 systeme-gestion-rh/
├── 📂 back_end/                 # Backend FastAPI
│   ├── 📄 main.py              # Point d'entrée API
│   ├── 📄 auth.py              # Authentification JWT
│   ├── 📄 models.py            # Modèles SQLAlchemy
│   ├── 📄 database.py          # Configuration DB
│   ├── 📄 config.py            # Configuration app
│   ├── 📄 schemas.py           # Schémas Pydantic
│   ├── 📄 init_db.py           # Initialisation DB
│   ├── 📄 requirements.txt     # Dépendances Python
│   ├── 📂 routers/             # Endpoints API
│   ├── 📂 uploads/             # Fichiers uploadés
│   └── 📄 gestion_db.db        # Base de données SQLite
├── 📂 src/                     # Frontend React
│   ├── 📂 components/          # Composants réutilisables
│   ├── 📂 pages/               # Pages de l'application
│   ├── 📂 contexts/            # Contextes React
│   ├── 📂 services/            # Services API
│   └── 📂 lib/                 # Utilitaires
├── 📂 public/                  # Ressources statiques
├── 📄 package.json             # Dépendances Node.js
├── 📄 vite.config.ts           # Configuration Vite
├── 📄 tailwind.config.ts       # Configuration Tailwind
└── 📄 README.md                # Ce fichier
```

## 🔗 API Endpoints

### Authentification
- `POST /auth/login` - Connexion utilisateur
- `GET /auth/me` - Profil utilisateur actuel

### Utilisateurs
- `GET /users/` - Liste des utilisateurs (Admin)
- `GET /users/enseignants` - Liste des enseignants
- `GET /users/fonctionnaires` - Liste des fonctionnaires
- `POST /users/` - Créer un utilisateur (Admin)
- `PUT /users/{id}` - Modifier un utilisateur
- `PATCH /users/{id}/password` - Changer mot de passe

### Demandes
- `GET /demandes/` - Liste des demandes
- `POST /demandes/` - Créer une demande
- `GET /demandes/{id}` - Détail d'une demande
- `PATCH /demandes/{id}/status` - Modifier statut (Admin/Secrétaire)

### Upload
- `POST /upload/photo/{user_id}` - Upload photo de profil
- `POST /upload/document/{demande_id}` - Upload document

## 🎯 Fonctionnalités par Rôle

### 👑 Administrateur
- Gestion complète des utilisateurs
- Validation/rejet des demandes
- Accès à tous les tableaux de bord
- Gestion des paramètres système

### 📋 Secrétaire
- Validation/rejet des demandes
- Consultation des dossiers
- Gestion des documents administratifs

### 👨‍🏫 Enseignant
- Soumission de demandes
- Consultation de ses demandes
- Mise à jour de son profil
- Upload de documents justificatifs

### 👨‍💼 Fonctionnaire
- Soumission de demandes
- Consultation de ses demandes
- Mise à jour de son profil
- Changement de mot de passe

## 🔐 Sécurité

- **JWT** avec expiration configurable
- **Hashage SHA256** des mots de passe
- **Validation des rôles** pour chaque endpoint
- **CORS** configuré pour la production
- **Upload sécurisé** avec validation des types de fichiers
- **Limitation de taille** des fichiers uploadés

## 🚀 Déploiement

### Backend (FastAPI)
```bash
# Production avec Uvicorn
uvicorn main:app --host 0.0.0.0 --port 8001 --workers 4

# Ou avec Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend (React)
```bash
# Build de production
npm run build

# Les fichiers seront dans le dossier dist/
```

## 🛠️ Développement

### Commandes utiles

```bash
# Démarrage en mode développement
npm run dev

# Build de production
npm run build

# Linting du code
npm run lint

# Tests backend
python -m pytest

# Réinitialiser la base de données
python init_db.py
```

### Variables d'environnement

#### Backend (.env)
```env
DATABASE_URL=sqlite:///./gestion_db.db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=http://localhost:8080
```

#### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:8001
```

## 📚 Documentation API

Une fois le backend démarré, la documentation interactive Swagger est disponible sur :
- **Swagger UI** : http://localhost:8001/docs
- **ReDoc** : http://localhost:8001/redoc

## ❗ Résolution des Problèmes

### Problème : "Port already in use"
```bash
# Tuer le processus sur le port 8001 (Windows)
netstat -ano | findstr :8001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8001 | xargs kill -9
```

### Problème : "Module not found"
```bash
# Réinstaller les dépendances
cd back_end
pip install -r requirements.txt

# Frontend
npm install
```

⭐ **N'hésitez pas à donner une étoile si ce projet vous a aidé !** ⭐
