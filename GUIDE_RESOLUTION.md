# 🔧 Guide de Résolution - Connexion Frontend/Backend

## ⚡ Démarrage Rapide

### 1. Démarrer le Backend
```bash
cd "c:\Users\L13\Desktop\projet_pfe\back_end"
python start_server_simple.py
```
OU
```bash
cd "c:\Users\L13\Desktop\projet_pfe"
.\start_backend.bat
```

### 2. Démarrer le Frontend
```bash
cd "c:\Users\L13\Desktop\projet_pfe"
npm run dev
```
OU
```bash
.\start_frontend.bat
```

### 3. Tester la Connexion
- Ouvrir: `c:\Users\L13\Desktop\projet_pfe\test_frontend_backend.html`
- Ou exécuter: `python test_backend_simple.py`

## 🔍 Diagnostic

### Vérifier que le Backend Répond
1. Ouvrir: http://localhost:8000/health
2. Devrait retourner: `{"status": "OK", "message": "API is running"}`

### Vérifier CORS
1. Ouvrir les Dev Tools (F12) dans le navigateur
2. Vérifier s'il y a des erreurs CORS dans la console

### Tester le Login
- **Email:** admin@example.com
- **Mot de passe:** admin123

## 🛠️ Solutions Communes

### Problème: "Failed to fetch"
- ✅ Vérifier que le backend est démarré sur port 8000
- ✅ Tester avec: `curl http://localhost:8000/health`

### Problème: CORS Error
- ✅ Vérifier que le frontend est sur port 5173
- ✅ Vérifier la config CORS dans `back_end/main.py`

### Problème: "Connection refused"
- ✅ Firewall/Antivirus bloque les ports
- ✅ Essayer 127.0.0.1 au lieu de localhost

## 📂 URLs Important
- **Backend:** http://localhost:8000
- **Frontend:** http://localhost:5173
- **API Health:** http://localhost:8000/health
- **Login API:** http://localhost:8000/auth/login

## 🔑 Compte de Test
- **Email:** admin@example.com
- **Mot de passe:** admin123
- **Rôle:** admin
