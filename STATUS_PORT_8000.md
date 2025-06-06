# Status Application - Port 8000

## Configuration Actuelle
- **Backend FastAPI**: Port 8000 ✅
- **Frontend React**: Port 8081 (en cours de démarrage)
- **Configuration API**: http://localhost:8000 ✅

## Services en Cours
1. **Backend FastAPI** sur http://localhost:8000
   - Endpoint santé: http://localhost:8000/health
   - API principale: http://localhost:8000/
   - Test endpoint: http://localhost:8000/test

2. **Frontend React** sur http://localhost:8081 (à vérifier)
   - Interface utilisateur accessible via navigateur

## Tests de Connectivité
```bash
# Test backend
curl http://localhost:8000/health

# Test frontend (une fois démarré)
curl http://localhost:8081
```

## Commandes de Redémarrage
```bash
# Redémarrer backend
pkill -f "python3.*main_minimal"
nohup python3 back_end/main_minimal.py > backend.log 2>&1 &

# Redémarrer frontend
pkill -f "npm.*dev"
nohup npm run dev > frontend.log 2>&1 &
```

## Logs
- Backend: `backend.log`
- Frontend: `frontend.log`

Date: $(date)
