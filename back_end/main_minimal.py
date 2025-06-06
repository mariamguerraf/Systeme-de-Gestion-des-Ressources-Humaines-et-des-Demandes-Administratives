"""
Minimal FastAPI application - main_minimal.py
This is a simplified version to test basic FastAPI functionality
"""
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List

# Create FastAPI app
app = FastAPI(
    title="Minimal FastAPI Test",
    description="Simple test API",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple token response model
class Token(BaseModel):
    access_token: str
    token_type: str

# Simple user response model
class User(BaseModel):
    id: int
    email: str
    nom: str
    prenom: str
    role: str

# Modèle pour créer un enseignant
class EnseignantCreateComplete(BaseModel):
    nom: str
    prenom: str
    email: str
    telephone: str = None
    adresse: str = None
    cin: str = None
    password: str
    specialite: str = None
    grade: str = None
    etablissement: str = None

# Modèle pour la réponse enseignant
class EnseignantComplete(BaseModel):
    id: int
    user_id: int
    specialite: str = None
    grade: str = None
    etablissement: str = None
    user: User

# Test users data (sans base de données)
TEST_USERS = {
    "admin@univ.ma": {
        "id": 1,
        "email": "admin@univ.ma",
        "password": "admin2024",
        "nom": "Alami",
        "prenom": "Hassan",
        "role": "admin"
    },
    "secretaire@univ.ma": {
        "id": 2,
        "email": "secretaire@univ.ma", 
        "password": "secretaire2024",
        "nom": "Benali",
        "prenom": "Fatima",
        "role": "secretaire"
    },
    "enseignant@univ.ma": {
        "id": 3,
        "email": "enseignant@univ.ma",
        "password": "enseignant2024", 
        "nom": "Tazi",
        "prenom": "Ahmed",
        "role": "enseignant"
    },
    "fonctionnaire@univ.ma": {
        "id": 4,
        "email": "fonctionnaire@univ.ma",
        "password": "fonction2024",
        "nom": "Karam",
        "prenom": "Aicha",
        "role": "fonctionnaire"
    },    "test@test.com": {
        "id": 5,
        "email": "test@test.com",
        "password": "123",
        "nom": "Test",
        "prenom": "User",
        "role": "admin"
    }
}

# Base de données temporaire pour les enseignants créés
ENSEIGNANTS_DB = {}

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Hello from FastAPI!", "status": "success"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "OK", "message": "Server is running"}

# Test endpoint
@app.get("/test")
async def test():
    return {"test": "This is a test endpoint", "working": True}

# Login endpoint for authentication
@app.post("/auth/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # Vérifier les identifiants
    user = TEST_USERS.get(form_data.username)
    if not user or user["password"] != form_data.password:
        raise HTTPException(
            status_code=401,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Retourner un token simple (pour les tests)
    return {
        "access_token": f"test_token_{user['id']}_{user['role']}", 
        "token_type": "bearer"
    }

# Get current user info endpoint
@app.get("/auth/me", response_model=User)
async def read_users_me(authorization: str = Header(None)):
    # Extraire les informations du token
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        
        # Le token a le format: test_token_{user_id}_{role}
        if token.startswith("test_token_"):
            parts = token.split("_")
            if len(parts) >= 3:
                # Corriger l'indexation: test_token_2_secretaire -> ["test", "token", "2", "secretaire"]
                user_id = parts[2]
                role = parts[3] if len(parts) > 3 else ""
                
                # Trouver l'utilisateur correspondant
                for email, user_data in TEST_USERS.items():
                    if str(user_data["id"]) == user_id and user_data["role"] == role:
                        return {
                            "id": user_data["id"],
                            "email": user_data["email"],
                            "nom": user_data["nom"], 
                            "prenom": user_data["prenom"],
                            "role": user_data["role"]
                        }
    
    # Si le token n'est pas valide, retourner une erreur au lieu de l'admin par défaut
    raise HTTPException(
        status_code=401,
        detail="Token invalide ou manquant",
        headers={"WWW-Authenticate": "Bearer"},
    )

# List test users endpoint
@app.get("/test/users")
async def get_test_users():
    return {
        "message": "Comptes de test disponibles - Université",
        "users": [
            {"email": "admin@univ.ma", "password": "admin2024", "role": "admin"},
            {"email": "secretaire@univ.ma", "password": "secretaire2024", "role": "secretaire"},
            {"email": "enseignant@univ.ma", "password": "enseignant2024", "role": "enseignant"},
            {"email": "fonctionnaire@univ.ma", "password": "fonction2024", "role": "fonctionnaire"},
            {"email": "test@test.com", "password": "123", "role": "admin", "note": "Compte simple pour tests rapides"}
        ]
    }

# Créer un enseignant (endpoint pour admin)
@app.post("/users/enseignants", response_model=EnseignantComplete)
async def create_enseignant(
    enseignant_data: EnseignantCreateComplete,
    authorization: str = Header(None)
):
    # Vérifier l'autorisation admin
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")
    
    token = authorization.replace("Bearer ", "")
    
    # Vérifier si c'est un admin
    admin_user = None
    if token.startswith("test_token_"):
        parts = token.split("_")
        if len(parts) >= 4 and parts[3] == "admin":
            # C'est un admin, on peut continuer
            admin_user = True
    
    if not admin_user:
        raise HTTPException(status_code=403, detail="Seuls les administrateurs peuvent créer des enseignants")
    
    # Vérifier si l'email existe déjà
    if enseignant_data.email in TEST_USERS:
        raise HTTPException(status_code=400, detail="Un utilisateur avec cet email existe déjà")
    
    # Créer un nouvel ID
    new_id = max([user["id"] for user in TEST_USERS.values()]) + 1
      # Ajouter le nouvel enseignant aux utilisateurs de test
    TEST_USERS[enseignant_data.email] = {
        "id": new_id,
        "email": enseignant_data.email,
        "password": enseignant_data.password,
        "nom": enseignant_data.nom,
        "prenom": enseignant_data.prenom,
        "role": "enseignant",
        "telephone": enseignant_data.telephone,
        "adresse": enseignant_data.adresse,
        "cin": enseignant_data.cin,
        "specialite": enseignant_data.specialite,
        "grade": enseignant_data.grade,
        "etablissement": enseignant_data.etablissement
    }
    
    # Créer l'objet User pour la réponse
    user_data = User(
        id=new_id,
        email=enseignant_data.email,
        nom=enseignant_data.nom,
        prenom=enseignant_data.prenom,
        role="enseignant"
    )
    
    # Ajouter aussi dans ENSEIGNANTS_DB pour la récupération
    enseignant_response = EnseignantComplete(
        id=new_id,
        user_id=new_id,
        specialite=enseignant_data.specialite,
        grade=enseignant_data.grade,
        etablissement=enseignant_data.etablissement,
        user=user_data
    )
    
    ENSEIGNANTS_DB[new_id] = {
        "id": new_id,
        "user_id": new_id,
        "specialite": enseignant_data.specialite,
        "grade": enseignant_data.grade,
        "etablissement": enseignant_data.etablissement,
        "user": user_data
    }
    
    return enseignant_response

# Récupérer tous les enseignants (endpoint pour admin)
@app.get("/users/enseignants", response_model=List[EnseignantComplete])
async def get_all_enseignants(
    authorization: str = Header(None)
):
    # Vérifier l'autorisation admin
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")
    
    token = authorization.replace("Bearer ", "")
    
    # Vérifier si c'est un admin
    admin_user = None
    if token.startswith("test_token_"):
        parts = token.split("_")
        if len(parts) >= 4 and parts[3] == "admin":
            admin_user = {"role": "admin"}
    
    if not admin_user:
        raise HTTPException(status_code=403, detail="Accès refusé. Droits admin requis.")
    
    # Retourner tous les enseignants créés
    enseignants_list = []
    for ens_id, ens_data in ENSEIGNANTS_DB.items():
        enseignants_list.append(EnseignantComplete(
            id=ens_data["id"],
            user_id=ens_data["user_id"],
            specialite=ens_data["specialite"],
            grade=ens_data["grade"],
            etablissement=ens_data["etablissement"],
            user=ens_data["user"]
        ))
    
    return enseignants_list

# Modifier un enseignant (endpoint pour admin)
@app.put("/users/enseignants/{enseignant_id}", response_model=EnseignantComplete)
async def update_enseignant(
    enseignant_id: int,
    enseignant_data: EnseignantCreateComplete,
    authorization: str = Header(None)
):
    # Vérifier l'autorisation admin
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")
    
    token = authorization.replace("Bearer ", "")
    
    # Vérifier si c'est un admin
    admin_user = None
    if token.startswith("test_token_"):
        parts = token.split("_")
        if len(parts) >= 4 and parts[3] == "admin":
            admin_user = {"role": "admin"}
    
    if not admin_user:
        raise HTTPException(status_code=403, detail="Accès refusé. Droits admin requis.")
    
    # Vérifier si l'enseignant existe
    if enseignant_id not in ENSEIGNANTS_DB:
        raise HTTPException(status_code=404, detail="Enseignant non trouvé")
    
    # Récupérer les anciennes données
    old_data = ENSEIGNANTS_DB[enseignant_id]
    old_email = old_data["user"]["email"]
    
    # Vérifier si le nouvel email existe déjà (sauf si c'est le même)
    if enseignant_data.email != old_email and enseignant_data.email in TEST_USERS:
        raise HTTPException(status_code=400, detail="Un utilisateur avec cet email existe déjà")
    
    # Mettre à jour TEST_USERS
    if old_email in TEST_USERS:
        del TEST_USERS[old_email]
    
    TEST_USERS[enseignant_data.email] = {
        "id": enseignant_id,
        "email": enseignant_data.email,
        "password": enseignant_data.password,
        "nom": enseignant_data.nom,
        "prenom": enseignant_data.prenom,
        "role": "enseignant",
        "telephone": enseignant_data.telephone,
        "adresse": enseignant_data.adresse,
        "cin": enseignant_data.cin,
        "specialite": enseignant_data.specialite,
        "grade": enseignant_data.grade,
        "etablissement": enseignant_data.etablissement
    }
    
    # Créer l'objet User mis à jour
    updated_user = User(
        id=enseignant_id,
        email=enseignant_data.email,
        nom=enseignant_data.nom,
        prenom=enseignant_data.prenom,
        role="enseignant"
    )
    
    # Mettre à jour ENSEIGNANTS_DB
    ENSEIGNANTS_DB[enseignant_id] = {
        "id": enseignant_id,
        "user_id": enseignant_id,
        "specialite": enseignant_data.specialite,
        "grade": enseignant_data.grade,
        "etablissement": enseignant_data.etablissement,
        "user": updated_user
    }
    
    # Retourner l'enseignant mis à jour
    return EnseignantComplete(
        id=enseignant_id,
        user_id=enseignant_id,
        specialite=enseignant_data.specialite,
        grade=enseignant_data.grade,
        etablissement=enseignant_data.etablissement,
        user=updated_user
    )

# Supprimer un enseignant (endpoint pour admin)
@app.delete("/users/enseignants/{enseignant_id}")
async def delete_enseignant(
    enseignant_id: int,
    authorization: str = Header(None)
):
    # Vérifier l'autorisation admin
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")
    
    token = authorization.replace("Bearer ", "")
    
    # Vérifier si c'est un admin
    admin_user = None
    if token.startswith("test_token_"):
        parts = token.split("_")
        if len(parts) >= 4 and parts[3] == "admin":
            admin_user = {"role": "admin"}
    
    if not admin_user:
        raise HTTPException(status_code=403, detail="Accès refusé. Droits admin requis.")
    
    # Vérifier si l'enseignant existe
    if enseignant_id not in ENSEIGNANTS_DB:
        raise HTTPException(status_code=404, detail="Enseignant non trouvé")
    
    # Récupérer les données de l'enseignant avant suppression
    enseignant_data = ENSEIGNANTS_DB[enseignant_id]
    user_email = enseignant_data["user"]["email"]
    
    # Supprimer de ENSEIGNANTS_DB
    del ENSEIGNANTS_DB[enseignant_id]
    
    # Supprimer aussi de TEST_USERS
    if user_email in TEST_USERS:
        del TEST_USERS[user_email]
    
    return {"message": f"Enseignant {enseignant_data['user']['nom']} {enseignant_data['user']['prenom']} supprimé avec succès"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main_minimal:app", host="0.0.0.0", port=8000, reload=True)
