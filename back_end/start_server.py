#!/usr/bin/env python3
"""
Script de démarrage du serveur backend FastAPI
"""

import subprocess
import sys
import os

def start_server():
    print("🚀 DÉMARRAGE DU SERVEUR BACKEND FastAPI")
    print("="*50)
    
    # Changer vers le répertoire backend
    backend_dir = r"c:\Users\L13\Desktop\projet_pfe\back_end"
    os.chdir(backend_dir)
    print(f"📍 Répertoire: {os.getcwd()}")
    
    # Vérifier que les fichiers nécessaires existent
    required_files = ["main.py", "database.py", "auth.py", "gestion_db.db"]
    for file in required_files:
        if not os.path.exists(file):
            print(f"❌ Fichier manquant: {file}")
            return False
        else:
            print(f"✅ {file}")
    
    print("\n🔧 Démarrage de uvicorn...")
    print("📡 URL: http://localhost:8000")
    print("🔄 Mode reload activé")
    print("\n" + "="*50)
    
    try:
        # Démarrer uvicorn
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ], check=True)
    except KeyboardInterrupt:
        print("\n\n🛑 Serveur arrêté par l'utilisateur")
    except Exception as e:
        print(f"\n❌ Erreur de démarrage: {e}")
        return False
    
    return True

if __name__ == "__main__":
    start_server()
