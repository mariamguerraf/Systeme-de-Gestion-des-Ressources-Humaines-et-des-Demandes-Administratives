"""
Script simple pour démarrer le backend SQLite
"""
import uvicorn

if __name__ == "__main__":
    print("🚀 Démarrage du backend avec SQLite...")
    print("🌐 Accédez à : http://localhost:8000")
    print("📋 Documentation : http://localhost:8000/docs")
    print("🔄 Ctrl+C pour arrêter")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
