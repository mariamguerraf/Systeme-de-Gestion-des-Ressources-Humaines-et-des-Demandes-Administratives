# 🏛️ Application de Gestion Administrative

## 🎯 Description

Application complète de gestion administrative avec authentification par rôles, développée avec :
- **Frontend**: React + TypeScript + Vite + TailwindCSS + ShadCN/UI
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL + JWT Authentication  
- **Base de données**: PostgreSQL avec Docker

## 🚀 Démarrage rapide

### ⚡ Démarrage automatique (recommandé)
```bash
/workspaces/start_app.sh
```

### 🔧 Démarrage manuel

1. **Base de données** :
```bash
cd /workspaces/backend
docker-compose up -d
python init_db.py  # Première fois seulement
```

2. **Backend** :
```bash
cd /workspaces/backend
source venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

3. **Frontend** :
```bash
cd /workspaces/front_end
npm run dev -- --port 5173 --host 0.0.0.0
```

## 🌐 Services

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Interface utilisateur |
| **Backend API** | http://localhost:8001 | API REST |
| **Documentation API** | http://localhost:8001/docs | Swagger UI |
| **Adminer** | http://localhost:8081 | Interface base de données |
| **PostgreSQL** | localhost:5432 | Base de données |

## 👤 Comptes de test

| Rôle | Email | Mot de passe | Permissions |
|------|-------|--------------|-------------|
| **Admin** | admin@gestion.com | password123 | Gestion complète |
| **Secrétaire** | secretaire@gestion.com | password123 | Validation demandes |
| **Enseignant** | enseignant@gestion.com | password123 | Soumission demandes |
| **Fonctionnaire** | fonctionnaire@gestion.com | password123 | Soumission demandes |

## ✅ Status actuel

🎉 **Application fonctionnelle à 90%** avec :
- ✅ Backend FastAPI opérationnel sur le port 8001
- ✅ Frontend React démarré sur le port 5173  
- ✅ Base de données PostgreSQL initialisée
- ✅ Authentification JWT fonctionnelle pour tous les rôles
- ✅ API endpoints protégés accessibles
- ✅ Interface web accessible

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + ShadCN/UI
- **Backend**: FastAPI + Python + SQLAlchemy
- **Base de données**: PostgreSQL
- **Authentification**: JWT
- **Containerisation**: Docker

## 📋 Fonctionnalités

### Rôles utilisateurs
- **Admin**: Gestion complète du système
- **Secrétaire**: Gestion des demandes et utilisateurs
- **Enseignant**: Soumission de demandes spécifiques
- **Fonctionnaire**: Soumission de demandes administratives

### Types de demandes
- Congés
- Absences
- Attestations
- Ordres de mission
- Heures supplémentaires

## 🛠️ Installation et Démarrage

### Prérequis
- Node.js 18+
- Python 3.9+
- Docker & Docker Compose

### Démarrage rapide
```bash
# Cloner le projet
cd /workspaces

# Démarrer l'application complète
./start-app.sh
```

### Démarrage manuel

#### 1. Base de données
```bash
cd backend
docker-compose up -d
```

#### 2. Backend FastAPI
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### 3. Frontend React
```bash
cd front_end
npm install
npm run dev
```

## 🌐 URLs d'accès

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Documentation API**: http://localhost:8000/docs
- **Base de données (Adminer)**: http://localhost:8080

## 👤 Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@gestion.com | password123 |
| Secrétaire | secretaire@gestion.com | password123 |
| Enseignant | enseignant@gestion.com | password123 |
| Fonctionnaire | fonctionnaire@gestion.com | password123 |

## 📚 Structure du projet

```
/workspaces/
├── front_end/                 # Application React
│   ├── src/
│   │   ├── components/        # Composants UI
│   │   ├── pages/            # Pages par rôle
│   │   ├── hooks/            # Hooks personnalisés
│   │   ├── services/         # Services API
│   │   ├── contexts/         # Contextes React
│   │   └── types/            # Types TypeScript
│   └── package.json
├── backend/                   # API FastAPI
│   ├── routers/              # Routes API
│   ├── models.py             # Modèles SQLAlchemy
│   ├── schemas.py            # Schémas Pydantic
│   ├── auth.py               # Authentification
│   ├── database.py           # Configuration DB
│   ├── main.py               # Application principale
│   ├── requirements.txt      # Dépendances Python
│   └── docker-compose.yml    # PostgreSQL
└── start-app.sh              # Script de démarrage
```

## 🔧 API Endpoints

### Authentification
- `POST /auth/login` - Connexion
- `POST /auth/register` - Inscription
- `GET /auth/me` - Profil utilisateur

### Utilisateurs
- `GET /users/` - Liste des utilisateurs
- `GET /users/{id}` - Détails utilisateur
- `PUT /users/{id}` - Modifier utilisateur
- `DELETE /users/{id}` - Supprimer utilisateur

### Demandes
- `GET /demandes/` - Liste des demandes
- `POST /demandes/` - Créer une demande
- `PUT /demandes/{id}` - Modifier une demande
- `DELETE /demandes/{id}` - Supprimer une demande

## 🎯 Développement

### Ajout d'une nouvelle fonctionnalité

1. **Backend**: Ajouter les modèles, schémas et routes
2. **Frontend**: Créer les types, services et composants
3. **Base de données**: Créer les migrations si nécessaire

### Tests
```bash
# Backend
cd backend
pytest

# Frontend
cd front_end
npm test
```

## 🚀 Déploiement

### Production
1. Configurer les variables d'environnement
2. Construire le frontend: `npm run build`
3. Déployer avec Docker: `docker-compose -f docker-compose.prod.yml up -d`

## 🤝 Contribution

1. Fork le projet
2. Créer une branche: `git checkout -b feature/nouvelle-fonctionnalite`
3. Commit: `git commit -m 'Ajout nouvelle fonctionnalité'`
4. Push: `git push origin feature/nouvelle-fonctionnalite`
5. Créer une Pull Request

## 📝 License

Ce projet est sous licence MIT.

## 🆘 Support

Pour toute question ou problème, créez une issue sur le repository.
