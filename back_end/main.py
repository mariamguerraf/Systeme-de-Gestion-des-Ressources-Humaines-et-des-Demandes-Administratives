from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, demandes, users

# Créer les tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API Gestion Administrative",
    description="API pour la gestion des demandes administratives",
    version="1.0.0"
)

# Configuration CORS pour permettre les requêtes depuis le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:8080", "http://localhost:8082", "http://localhost:8083", "http://localhost:3000", "https://*.app.github.dev", "https://*.github.dev"],  # URLs de votre frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routeurs
app.include_router(auth.router)
app.include_router(demandes.router)
app.include_router(users.router)

@app.get("/")
async def root():
    return {"message": "API Gestion Administrative - Backend FastAPI"}

@app.get("/health")
async def health_check():
    return {"status": "OK", "message": "API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
