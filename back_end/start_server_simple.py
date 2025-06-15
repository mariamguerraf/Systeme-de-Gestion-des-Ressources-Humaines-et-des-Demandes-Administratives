#!/usr/bin/env python3
"""
Script de démarrage simple du backend avec diagnostic
"""
import sys
import os
import uvicorn

# Assurer que nous sommes dans le bon répertoire
backend_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(backend_dir)
print(f"📂 Répertoire de travail: {os.getcwd()}")

print("🚀 Démarrage du serveur FastAPI...")
print("📍 URL: http://localhost:8000")
print("📍 Alternative: http://127.0.0.1:8000")
print("🔍 Health check: http://localhost:8000/health")
print("🔑 Login endpoint: http://localhost:8000/auth/login")
print("=" * 60)

try:
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
except KeyboardInterrupt:
    print("\n⏹️ Serveur arrêté par l'utilisateur")
except Exception as e:
    print(f"\n❌ Erreur lors du démarrage: {e}")
    input("Appuyez sur Entrée pour continuer...")
