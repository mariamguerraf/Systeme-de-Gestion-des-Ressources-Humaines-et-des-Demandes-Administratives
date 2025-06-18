"""
Minimal FastAPI application - main_minimal.py
This is a simplified version to test basic FastAPI functionality
"""
from fastapi import FastAPI, HTTPException, Depends, Header, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import json
import os
import shutil
import uuid
from pathlib import Path

# Import conditionnel pour Pillow
try:
    from PIL import Image
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False

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

# Créer le dossier pour les images
UPLOAD_DIR = Path("uploads/images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Monter le dossier static pour servir les images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Data persistence functions
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

def load_data_from_file(filename: str, default_data: dict):
    """Load data from JSON file or return default if file doesn't exist"""
    file_path = DATA_DIR / filename
    if file_path.exists():
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading {filename}: {e}")
            return default_data
    return default_data

def save_data_to_file(filename: str, data: dict):
    """Save data to JSON file"""
    file_path = DATA_DIR / filename
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving {filename}: {e}")

def save_all_data():
    """Save all data to files"""
    save_data_to_file("users.json", TEST_USERS)
    save_data_to_file("enseignants.json", ENSEIGNANTS_DB)
    save_data_to_file("demandes.json", DEMANDES_DB)

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
    photo: str = None

# Modèle pour la réponse enseignant
class EnseignantComplete(BaseModel):
    id: int
    user_id: int
    specialite: str = None
    grade: str = None
    etablissement: str = None
    photo: str = None
    user: User

# Modèle pour les demandes
class DemandeCreate(BaseModel):
    type_demande: str
    titre: str
    description: str = None
    date_debut: str = None
    date_fin: str = None

class DemandeResponse(BaseModel):
    id: int
    user_id: int
    type_demande: str
    titre: str
    description: str = None
    date_debut: str = None
    date_fin: str = None
    statut: str
    commentaire_admin: str = None
    created_at: str
    user: User = None

class DemandeStatusUpdate(BaseModel):
    statut: str
    commentaire_admin: str = None

# Modèle pour créer un fonctionnaire
class FonctionnaireCreateComplete(BaseModel):
    nom: str
    prenom: str
    email: str
    telephone: str = None
    adresse: str = None
    cin: str = None
    password: str
    service: str = None
    poste: str = None
    grade: str = None

# Modèle pour la réponse fonctionnaire
class FonctionnaireComplete(BaseModel):
    id: int
    user_id: int
    service: str = None
    poste: str = None
    grade: str = None
    user: User

# Test users data - Load from file or use defaults
DEFAULT_TEST_USERS = {
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
    },
    "test@test.com": {
        "id": 5,
        "email": "test@test.com",
        "password": "123",
        "nom": "Test",
        "prenom": "User",
        "role": "admin"
    }
}

# Load data from files or use defaults
TEST_USERS = load_data_from_file("users.json", DEFAULT_TEST_USERS.copy())
ENSEIGNANTS_DB = load_data_from_file("enseignants.json", {})
DEMANDES_DB = load_data_from_file("demandes.json", {})

# Initialize counters based on existing data
def initialize_counters():
    global demande_id_counter

    # Set demande counter to max existing ID + 1
    if DEMANDES_DB:
        max_demande_id = max(int(k) for k in DEMANDES_DB.keys())
        demande_id_counter = max_demande_id + 1
    else:
        demande_id_counter = 1

# Initialize counters
initialize_counters()

# Initialiser les données de test pour les demandes
def initialize_test_demandes():
    global demande_id_counter, DEMANDES_DB
    from datetime import datetime, timedelta

    test_demandes = [
        {
            "id": 1,
            "user_id": 3,  # enseignant@univ.ma
            "type_demande": "CONGE",
            "titre": "Congé annuel",
            "description": "Demande de congé annuel pour vacances d'été",

            "date_fin": "2024-07-15",
            "statut": "EN_ATTENTE",
            "commentaire_admin": None,
            "created_at": datetime.now().isoformat(),
            "user": {
                "id": 3,
                "email": "enseignant@univ.ma",
                "nom": "Tazi",
                "prenom": "Ahmed",
                "role": "enseignant"
            }
        },
        {
            "id": 2,
            "user_id": 4,  # fonctionnaire@univ.ma
            "type_demande": "ABSENCE",
            "titre": "Absence médicale",
            "description": "Absence pour raisons médicales",
            "date_debut": "2024-06-20",
            "date_fin": "2024-06-22",
            "statut": "APPROUVEE",
            "commentaire_admin": "Demande approuvée avec justificatif médical",
            "created_at": (datetime.now() - timedelta(days=5)).isoformat(),
            "user": {
                "id": 4,
                "email": "fonctionnaire@univ.ma",
                "nom": "Karam",
                "prenom": "Aicha",
                "role": "fonctionnaire"
            }
        },
        {
            "id": 3,
            "user_id": 3,  # enseignant@univ.ma
            "type_demande": "ATTESTATION",
            "titre": "Attestation de travail",
            "description": "Demande d'attestation de travail pour démarches administratives",
            "date_debut": None,
            "date_fin": None,
            "statut": "REJETEE",
            "commentaire_admin": "Documents insuffisants",
            "created_at": (datetime.now() - timedelta(days=10)).isoformat(),
            "user": {
                "id": 3,
                "email": "enseignant@univ.ma",
                "nom": "Tazi",
                "prenom": "Ahmed",
                "role": "enseignant"
            }
        },
        {
            "id": 4,
            "user_id": 4,  # fonctionnaire@univ.ma
            "type_demande": "ORDRE_MISSION",
            "titre": "Mission à Casablanca",
            "description": "Mission de formation à Casablanca",
            "date_debut": "2024-07-10",
            "date_fin": "2024-07-12",
            "statut": "EN_ATTENTE",
            "commentaire_admin": None,
            "created_at": (datetime.now() - timedelta(days=2)).isoformat(),
            "user": {
                "id": 4,
                "email": "fonctionnaire@univ.ma",
                "nom": "Karam",
                "prenom": "Aicha",
                "role": "fonctionnaire"
            }
        },
        {
            "id": 5,
            "user_id": 3,  # enseignant@univ.ma
            "type_demande": "HEURES_SUP",
            "titre": "Heures supplémentaires",
            "description": "Demande d'heures supplémentaires pour cours du soir",
            "date_debut": "2024-06-01",
            "date_fin": "2024-06-30",
            "statut": "APPROUVEE",
            "commentaire_admin": "Approuvé selon les besoins du département",
            "created_at": (datetime.now() - timedelta(days=15)).isoformat(),
            "user": {
                "id": 3,
                "email": "enseignant@univ.ma",
                "nom": "Tazi",
                "prenom": "Ahmed",
                "role": "enseignant"
            }
        }
    ]

    for demande in test_demandes:
        DEMANDES_DB[demande["id"]] = demande
        if demande["id"] >= demande_id_counter:
            demande_id_counter = demande["id"] + 1

# Initialiser les données de test
initialize_test_demandes()

# Base de données des fonctionnaires en mémoire
FONCTIONNAIRES_DB = {}
fonctionnaire_id_counter = 1

# Initialiser les données de test pour les fonctionnaires
def initialize_test_fonctionnaires():
    global fonctionnaire_id_counter, FONCTIONNAIRES_DB

    test_fonctionnaires = [
        {
            "id": 1,
            "user_id": 4,  # fonctionnaire@univ.ma
            "service": "Ressources Humaines",
            "poste": "Gestionnaire RH",
            "grade": "Administrateur Principal",
            "user": {
                "id": 4,
                "email": "fonctionnaire@univ.ma",
                "nom": "Karam",
                "prenom": "Aicha",
                "role": "fonctionnaire"
            }
        }
    ]

    for fonctionnaire in test_fonctionnaires:
        FONCTIONNAIRES_DB[fonctionnaire["id"]] = fonctionnaire
        if fonctionnaire["id"] >= fonctionnaire_id_counter:
            fonctionnaire_id_counter = fonctionnaire["id"] + 1

# Initialiser les données de test pour les fonctionnaires
initialize_test_fonctionnaires()

# Fonction pour sauvegarder et redimensionner l'image
def save_and_resize_image(file: UploadFile, max_size: tuple = (300, 300)) -> str:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Nom de fichier manquant")

    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in ["jpg", "jpeg", "png", "gif"]:
        raise HTTPException(status_code=400, detail="Format non supporté. Utilisez JPG, PNG ou GIF")

    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / unique_filename

    try:
        # Sauvegarder l'image
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Redimensionner si Pillow disponible
        if PILLOW_AVAILABLE:
            try:
                with Image.open(file_path) as img:
                    if img.mode in ('RGBA', 'LA', 'P'):
                        img = img.convert('RGB')
                    img.thumbnail(max_size, Image.Resampling.LANCZOS)
                    img.save(file_path, optimize=True, quality=85)
            except Exception:
                pass  # Continuer sans redimensionnement

        return f"/uploads/images/{unique_filename}"

    except Exception as e:
        if file_path.exists():
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

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
    enseignant_response = EnseignantComplete(        id=new_id,
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
        "user": {
            "id": user_data.id,
            "email": user_data.email,
            "nom": user_data.nom,
            "prenom": user_data.prenom,
            "role": user_data.role
        }
    }

    # Sauvegarder les données dans les fichiers
    save_all_data()

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
        raise HTTPException(status_code=403, detail="Accès refusé. Droits admin requis.")    # Vérifier si l'enseignant existe
    # Convertir enseignant_id en string pour la comparaison
    enseignant_id_str = str(enseignant_id)

    if enseignant_id_str not in ENSEIGNANTS_DB:
        raise HTTPException(status_code=404, detail=f"Enseignant non trouvé")

    # Récupérer les anciennes données
    old_data = ENSEIGNANTS_DB[enseignant_id_str]
    old_email = old_data["user"]["email"]

    # Vérifier si le nouvel email existe déjà (sauf si c'est le même)
    if enseignant_data.email != old_email and enseignant_data.email in TEST_USERS:
        raise HTTPException(status_code=400, detail="Un utilisateur avec cet email existe déjà")
      # Mettre à jour TEST_USERS
    if old_email in TEST_USERS:
        del TEST_USERS[old_email]

    # Conserver le mot de passe existant si non fourni ou "unchanged"
    password_to_use = old_data["user"].get("password", "enseignant123")
    if enseignant_data.password and enseignant_data.password != "unchanged":
        password_to_use = enseignant_data.password

    TEST_USERS[enseignant_data.email] = {
        "id": enseignant_id,
        "email": enseignant_data.email,
        "password": password_to_use,
        "nom": enseignant_data.nom,
        "prenom": enseignant_data.prenom,
        "role": "enseignant",
        "telephone": enseignant_data.telephone or "",
        "adresse": enseignant_data.adresse or "",
        "cin": enseignant_data.cin or "",
        "is_active": True,
        "created_at": old_data["user"].get("created_at", "2024-01-01T00:00:00")
    }
      # Créer l'objet User mis à jour avec TOUS les champs
    updated_user = User(
        id=enseignant_id,
        email=enseignant_data.email,
        nom=enseignant_data.nom,
        prenom=enseignant_data.prenom,
        role="enseignant"
    )

    # Mettre à jour ENSEIGNANTS_DB avec structure complète
    ENSEIGNANTS_DB[enseignant_id_str] = {
        "id": enseignant_id,
        "user_id": enseignant_id,
        "nom": enseignant_data.nom,
        "prenom": enseignant_data.prenom,
        "email": enseignant_data.email,
        "telephone": enseignant_data.telephone or "",
        "adresse": enseignant_data.adresse or "",
        "cin": enseignant_data.cin or "",
        "specialite": enseignant_data.specialite or "",
        "grade": enseignant_data.grade or "",
        "etablissement": enseignant_data.etablissement or "",
        "user": {
            "id": updated_user.id,
            "email": updated_user.email,
            "nom": updated_user.nom,
            "prenom": updated_user.prenom,
            "telephone": enseignant_data.telephone or "",
            "adresse": enseignant_data.adresse or "",
            "cin": enseignant_data.cin or "",
            "role": updated_user.role,
            "is_active": True,
            "created_at": old_data["user"].get("created_at", "2024-01-01T00:00:00")
        }
    }
      # Retourner l'enseignant mis à jour
    updated_enseignant = EnseignantComplete(
        id=enseignant_id,
        user_id=enseignant_id,
        specialite=enseignant_data.specialite,
        grade=enseignant_data.grade,
        etablissement=enseignant_data.etablissement,
        user=updated_user
    )

    # Sauvegarder les données dans les fichiers
    save_all_data()

    return updated_enseignant

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
    # Convertir enseignant_id en string pour la comparaison
    enseignant_id_str = str(enseignant_id)

    if enseignant_id_str not in ENSEIGNANTS_DB:
        raise HTTPException(status_code=404, detail="Enseignant non trouvé")

    # Récupérer les données de l'enseignant avant suppression
    enseignant_data = ENSEIGNANTS_DB[enseignant_id_str]
    user_email = enseignant_data["user"]["email"]

    # Supprimer de ENSEIGNANTS_DB
    del ENSEIGNANTS_DB[enseignant_id_str]

    # Supprimer aussi de TEST_USERS
    if user_email in TEST_USERS:
        del TEST_USERS[user_email]

    # Sauvegarder les données dans les fichiers
    save_all_data()

    return {"message": f"Enseignant {enseignant_data['user']['nom']} {enseignant_data['user']['prenom']} supprimé avec succès"}

# ===== ENDPOINTS POUR LES FONCTIONNAIRES =====

# Créer un fonctionnaire (endpoint pour admin)
@app.post("/users/fonctionnaires", response_model=FonctionnaireComplete)
async def create_fonctionnaire(
    fonctionnaire_data: FonctionnaireCreateComplete,
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
            admin_user = True

    if not admin_user:
        raise HTTPException(status_code=403, detail="Seuls les administrateurs peuvent créer des fonctionnaires")

    # Vérifier si l'email existe déjà
    if fonctionnaire_data.email in TEST_USERS:
        raise HTTPException(status_code=400, detail="Un utilisateur avec cet email existe déjà")

    # Créer un nouvel ID
    new_id = max([user["id"] for user in TEST_USERS.values()]) + 1

    # Ajouter le nouveau fonctionnaire aux utilisateurs de test
    TEST_USERS[fonctionnaire_data.email] = {
        "id": new_id,
        "email": fonctionnaire_data.email,
        "password": fonctionnaire_data.password,
        "nom": fonctionnaire_data.nom,
        "prenom": fonctionnaire_data.prenom,
        "role": "fonctionnaire",
        "telephone": fonctionnaire_data.telephone,
        "adresse": fonctionnaire_data.adresse,
        "cin": fonctionnaire_data.cin,
        "service": fonctionnaire_data.service,
        "poste": fonctionnaire_data.poste,
        "grade": fonctionnaire_data.grade
    }

    # Créer l'objet User pour la réponse
    user_data = User(
        id=new_id,
        email=fonctionnaire_data.email,
        nom=fonctionnaire_data.nom,
        prenom=fonctionnaire_data.prenom,
        role="fonctionnaire"
    )

    # Ajouter aussi dans FONCTIONNAIRES_DB pour la récupération
    global fonctionnaire_id_counter
    fonctionnaire_response = FonctionnaireComplete(
        id=fonctionnaire_id_counter,
        user_id=new_id,
        service=fonctionnaire_data.service,
        poste=fonctionnaire_data.poste,
        grade=fonctionnaire_data.grade,
        user=user_data
    )

    FONCTIONNAIRES_DB[fonctionnaire_id_counter] = {
        "id": fonctionnaire_id_counter,
        "user_id": new_id,
        "service": fonctionnaire_data.service,
        "poste": fonctionnaire_data.poste,
        "grade": fonctionnaire_data.grade,
        "user": user_data    }

    fonctionnaire_id_counter += 1

    # Sauvegarder les données dans les fichiers
    save_all_data()

    return fonctionnaire_response

# Récupérer tous les fonctionnaires (endpoint pour admin)
@app.get("/users/fonctionnaires", response_model=List[FonctionnaireComplete])
async def get_all_fonctionnaires(
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

    # Retourner tous les fonctionnaires créés
    fonctionnaires_list = []
    for fonc_id, fonc_data in FONCTIONNAIRES_DB.items():
        fonctionnaires_list.append(FonctionnaireComplete(
            id=fonc_data["id"],
            user_id=fonc_data["user_id"],
            service=fonc_data["service"],
            poste=fonc_data["poste"],
            grade=fonc_data["grade"],
            user=fonc_data["user"]
        ))

    return fonctionnaires_list

# Modifier un fonctionnaire (endpoint pour admin)
@app.put("/users/fonctionnaires/{fonctionnaire_id}", response_model=FonctionnaireComplete)
async def update_fonctionnaire(
    fonctionnaire_id: int,
    fonctionnaire_data: FonctionnaireCreateComplete,
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

    # Vérifier si le fonctionnaire existe
    if fonctionnaire_id not in FONCTIONNAIRES_DB:
        raise HTTPException(status_code=404, detail="Fonctionnaire non trouvé")
      # Récupérer les anciennes données
    old_data = FONCTIONNAIRES_DB[fonctionnaire_id]
    if isinstance(old_data["user"], dict):
        old_email = old_data["user"]["email"]
        old_password = old_data["user"].get("password", "")
    else:
        old_email = old_data["user"].email
        old_password = getattr(old_data["user"], "password", "")
    user_id = old_data["user_id"]

    # Vérifier si le nouvel email existe déjà (sauf si c'est le même)
    if fonctionnaire_data.email != old_email and fonctionnaire_data.email in TEST_USERS:
        raise HTTPException(status_code=400, detail="Un utilisateur avec cet email existe déjà")

    # Gérer le mot de passe : garder l'ancien si "unchanged" ou None
    password_to_use = old_password
    if fonctionnaire_data.password and fonctionnaire_data.password != "unchanged":
        password_to_use = fonctionnaire_data.password

    # Mettre à jour TEST_USERS
    if old_email in TEST_USERS:
        del TEST_USERS[old_email]

    TEST_USERS[fonctionnaire_data.email] = {
        "id": user_id,
        "email": fonctionnaire_data.email,
        "password": password_to_use,
        "nom": fonctionnaire_data.nom,
        "prenom": fonctionnaire_data.prenom,
        "role": "fonctionnaire",
        "telephone": fonctionnaire_data.telephone,
        "adresse": fonctionnaire_data.adresse,
        "cin": fonctionnaire_data.cin,
        "service": fonctionnaire_data.service,
        "poste": fonctionnaire_data.poste,
        "grade": fonctionnaire_data.grade
    }
      # Créer l'objet User mis à jour
    updated_user = User(
        id=user_id,
        email=fonctionnaire_data.email,
        nom=fonctionnaire_data.nom,
        prenom=fonctionnaire_data.prenom,
        role="fonctionnaire"
    )

    # Mettre à jour FONCTIONNAIRES_DB
    FONCTIONNAIRES_DB[fonctionnaire_id] = {
        "id": fonctionnaire_id,
        "user_id": user_id,
        "service": fonctionnaire_data.service,
        "poste": fonctionnaire_data.poste,
        "grade": fonctionnaire_data.grade,
        "user": updated_user
    }

    # Sauvegarder les données dans les fichiers
    save_all_data()

    # Retourner le fonctionnaire mis à jour
    return FonctionnaireComplete(
        id=fonctionnaire_id,
        user_id=user_id,
        service=fonctionnaire_data.service,
        poste=fonctionnaire_data.poste,
        grade=fonctionnaire_data.grade,
        user=updated_user
    )

# Supprimer un fonctionnaire (endpoint pour admin)
@app.delete("/users/fonctionnaires/{fonctionnaire_id}")
async def delete_fonctionnaire(
    fonctionnaire_id: int,
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
        raise HTTPException(status_code=403, detail="Accès refusé. Droits admin requis.")    # Vérifier si le fonctionnaire existe
    if fonctionnaire_id not in FONCTIONNAIRES_DB:
        raise HTTPException(status_code=404, detail="Fonctionnaire non trouvé")

    # Récupérer les données du fonctionnaire avant suppression
    fonctionnaire_data = FONCTIONNAIRES_DB[fonctionnaire_id]
    user_email = fonctionnaire_data["user"]["email"]

    # Supprimer de FONCTIONNAIRES_DB
    del FONCTIONNAIRES_DB[fonctionnaire_id]
      # Supprimer aussi de TEST_USERS
    if user_email in TEST_USERS:
        del TEST_USERS[user_email]

    # Sauvegarder les données dans les fichiers
    save_all_data()

    return {"message": f"Fonctionnaire {fonctionnaire_data['user']['nom']} {fonctionnaire_data['user']['prenom']} supprimé avec succès"}

# ===== ENDPOINTS POUR LES DEMANDES =====

# Récupérer toutes les demandes (endpoint pour secrétaire/admin)
@app.get("/demandes/", response_model=List[DemandeResponse])
async def get_all_demandes(
    skip: int = 0,
    limit: int = 100,
    authorization: str = Header(None)
):
    # Vérifier l'autorisation (secrétaire ou admin)
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")

    token = authorization.replace("Bearer ", "")

    # Vérifier si c'est un admin ou secrétaire
    authorized_user = None
    if token.startswith("test_token_"):
        parts = token.split("_")
        if len(parts) >= 4 and parts[3] in ["admin", "secretaire"]:
            authorized_user = {"role": parts[3]}

    if not authorized_user:
        raise HTTPException(status_code=403, detail="Accès refusé. Droits admin ou secrétaire requis.")

    # Retourner toutes les demandes avec pagination
    demandes_list = list(DEMANDES_DB.values())
    demandes_list.sort(key=lambda x: x["created_at"], reverse=True)  # Trier par date de création décroissante

    # Appliquer la pagination
    total = len(demandes_list)
    start = skip
    end = skip + limit
    paginated_demandes = demandes_list[start:end]

    return paginated_demandes

# Récupérer une demande spécifique (endpoint pour secrétaire/admin)
@app.get("/demandes/{demande_id}", response_model=DemandeResponse)
async def get_demande(
    demande_id: int,
    authorization: str = Header(None)
):
    # Vérifier l'autorisation
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")

    token = authorization.replace("Bearer ", "")

    # Vérifier si c'est un admin ou secrétaire
    authorized_user = None
    if token.startswith("test_token_"):
        parts = token.split("_")
        if len(parts) >= 4 and parts[3] in ["admin", "secretaire"]:
            authorized_user = {"role": parts[3]}

    if not authorized_user:
        raise HTTPException(status_code=403, detail="Accès refusé. Droits admin ou secrétaire requis.")

    # Vérifier si la demande existe
    if demande_id not in DEMANDES_DB:
        raise HTTPException(status_code=404, detail="Demande non trouvée")

    return DEMANDES_DB[demande_id]

# Créer une nouvelle demande (endpoint pour tous les utilisateurs connectés)
@app.post("/demandes", response_model=DemandeResponse)
async def create_demande(
    demande_data: DemandeCreate,
    authorization: str = Header(None)
):
    # Vérifier l'autorisation
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")

    token = authorization.replace("Bearer ", "")

    # Extraire l'utilisateur du token
    current_user = None
    if token.startswith("test_token_"):
        parts = token.split("_")
        if len(parts) >= 3:
            user_id = parts[2]
            role = parts[3] if len(parts) > 3 else ""

            # Trouver l'utilisateur correspondant
            for email, user_data in TEST_USERS.items():
                if str(user_data["id"]) == user_id and user_data["role"] == role:
                    current_user = user_data
                    break

    if not current_user:
        raise HTTPException(status_code=401, detail="Token invalide")

    # Créer une nouvelle demande
    global demande_id_counter
    from datetime import datetime

    new_demande = {
        "id": demande_id_counter,
        "user_id": current_user["id"],
        "type_demande": demande_data.type_demande,
        "titre": demande_data.titre,
        "description": demande_data.description,
        "date_debut": demande_data.date_debut,
        "date_fin": demande_data.date_fin,
        "statut": "EN_ATTENTE",
        "commentaire_admin": None,
        "created_at": datetime.now().isoformat(),
        "user": {
            "id": current_user["id"],
            "email": current_user["email"],
            "nom": current_user["nom"],
            "prenom": current_user["prenom"],
            "role": current_user["role"]        }
    }

    DEMANDES_DB[demande_id_counter] = new_demande
    demande_id_counter += 1

    # Sauvegarder les données dans les fichiers
    save_all_data()

    return new_demande

# Mettre à jour le statut d'une demande (endpoint pour secrétaire/admin)
@app.patch("/demandes/{demande_id}/status", response_model=DemandeResponse)
async def update_demande_status(
    demande_id: int,
    status_update: DemandeStatusUpdate,
    authorization: str = Header(None)
):
    # Vérifier l'autorisation (secrétaire ou admin)
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")

    token = authorization.replace("Bearer ", "")

    # Vérifier si c'est un admin ou secrétaire
    authorized_user = None
    if token.startswith("test_token_"):
        parts = token.split("_")
        if len(parts) >= 4 and parts[3] in ["admin", "secretaire"]:
            authorized_user = {"role": parts[3]}

    if not authorized_user:
        raise HTTPException(status_code=403, detail="Accès refusé. Droits admin ou secrétaire requis.")

    # Vérifier si la demande existe
    if demande_id not in DEMANDES_DB:
        raise HTTPException(status_code=404, detail="Demande non trouvée")

    # Vérifier que le statut est valide
    valid_statuses = ["EN_ATTENTE", "APPROUVEE", "REJETEE"]
    if status_update.statut not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Statut invalide. Valeurs autorisées: {valid_statuses}")
      # Mettre à jour la demande
    demande = DEMANDES_DB[demande_id]
    demande["statut"] = status_update.statut
    if status_update.commentaire_admin:
        demande["commentaire_admin"] = status_update.commentaire_admin

    # Sauvegarder les données dans les fichiers
    save_all_data()

    return demande

# Supprimer une demande (endpoint pour admin)
@app.delete("/demandes/{demande_id}")
async def delete_demande(
    demande_id: int,
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

    # Vérifier si la demande existe
    if demande_id not in DEMANDES_DB:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
      # Récupérer les données avant suppression
    demande_data = DEMANDES_DB[demande_id]

    # Supprimer la demande
    del DEMANDES_DB[demande_id]

    # Sauvegarder les données dans les fichiers
    save_all_data()

    return {"message": f"Demande '{demande_data['titre']}' supprimée avec succès"}

# ===== ENDPOINT POUR LES STATISTIQUES DU DASHBOARD =====

@app.get("/dashboard/stats")
async def get_dashboard_stats(authorization: str = Header(None)):
    """Obtenir les statistiques pour le dashboard"""
    # Vérifier l'autorisation
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")

    token = authorization.replace("Bearer ", "")

    # Vérifier le token (admin ou secrétaire peuvent accéder aux stats)
    user_role = None
    if token.startswith("test_token_"):
        parts = token.split("_")
        if len(parts) >= 4:
            user_role = parts[3]

    if user_role not in ["admin", "secretaire"]:
        raise HTTPException(status_code=403, detail="Accès refusé. Droits admin ou secrétaire requis.")

    # Calculer les statistiques
    stats = {
        "totalUsers": len(TEST_USERS),
        "enseignants": len(ENSEIGNANTS_DB),
        "fonctionnaires": len(FONCTIONNAIRES_DB),
        "secretaires": sum(1 for user in TEST_USERS.values() if user["role"] == "secretaire"),
        "admins": sum(1 for user in TEST_USERS.values() if user["role"] == "admin"),
        "demandesEnAttente": sum(1 for demande in DEMANDES_DB.values() if demande["statut"] == "EN_ATTENTE"),
        "demandesTraitees": sum(1 for demande in DEMANDES_DB.values() if demande["statut"] in ["APPROUVEE", "REJETEE"]),
        "totalDemandes": len(DEMANDES_DB)
    }

    return stats

# Endpoint de debug pour examiner FONCTIONNAIRES_DB
@app.get("/debug/fonctionnaires-db")
async def debug_fonctionnaires_db(authorization: str = Header(None)):
    # Vérifier l'autorisation admin
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")

    token = authorization.replace("Bearer ", "")
    admin_user = None
    if token.startswith("test_token_"):
        parts = token.split("_")
        if len(parts) >= 4 and parts[3] == "admin":
            admin_user = {"role": "admin"}

    if not admin_user:
        raise HTTPException(status_code=403, detail="Accès refusé. Droits admin requis.")

    return {
        "FONCTIONNAIRES_DB_keys": list(FONCTIONNAIRES_DB.keys()),
        "FONCTIONNAIRES_DB_content": FONCTIONNAIRES_DB,
        "FONCTIONNAIRES_DB_size": len(FONCTIONNAIRES_DB),
        "key_types": [type(k).__name__ for k in FONCTIONNAIRES_DB.keys()]
    }

# ===== ENDPOINT PROFIL ENSEIGNANT =====

@app.get("/enseignant/profil")
async def get_enseignant_profil(authorization: str = Header(None)):
    """Obtenir le profil complet de l'enseignant connecté"""
    # Vérifier l'autorisation
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")

    token = authorization.replace("Bearer ", "")

    # Décoder le token pour récupérer l'utilisateur
    user_data = None
    if token.startswith("test_token_"):
        parts = token.split("_")
        if len(parts) >= 4:
            user_id = int(parts[2])
            # Trouver l'utilisateur dans TEST_USERS
            for email, user in TEST_USERS.items():
                if user["id"] == user_id and user["role"] == "enseignant":
                    user_data = user
                    break

    if not user_data:
        raise HTTPException(status_code=401, detail="Token invalide ou utilisateur non trouvé")

    # Récupérer les données enseignant depuis ENSEIGNANTS_DB
    enseignant_info = None
    for ens_id, ens_data in ENSEIGNANTS_DB.items():
        if ens_data.get("user_id") == user_data["id"]:
            enseignant_info = ens_data
            break

    # Retourner les données complètes
    if enseignant_info:        return {
            "user": {
                "id": user_data["id"],
                "email": user_data["email"],
                "nom": user_data["nom"],
                "prenom": user_data["prenom"],
                "telephone": enseignant_info.get("telephone", user_data.get("telephone", "")),
                "adresse": enseignant_info.get("adresse", user_data.get("adresse", "")),
                "cin": enseignant_info.get("cin", user_data.get("cin", "")),
                "role": user_data["role"],
                "is_active": user_data.get("is_active", True),
                "created_at": user_data.get("created_at", "")
            },
            "enseignant": {
                "id": enseignant_info.get("id"),
                "user_id": enseignant_info.get("user_id"),
                "specialite": enseignant_info.get("specialite", ""),
                "grade": enseignant_info.get("grade", ""),
                "etablissement": enseignant_info.get("etablissement", "")
            }
        }
    else:
        # Si pas trouvé dans ENSEIGNANTS_DB, retourner les données de base
        return {
            "user": {
                "id": user_data["id"],
                "email": user_data["email"],
                "nom": user_data["nom"],
                "prenom": user_data["prenom"],
                "telephone": user_data.get("telephone", ""),
                "adresse": user_data.get("adresse", ""),
                "cin": user_data.get("cin", ""),
                "role": user_data["role"],
                "is_active": user_data.get("is_active", True),
                "created_at": user_data.get("created_at", "")
            },
            "enseignant": {
                "id": None,
                "user_id": user_data["id"],
                "specialite": "",
                "grade": "",
                "etablissement": ""
            }
        }

# Endpoint pour upload d'image d'enseignant
@app.post("/users/enseignants/{enseignant_id}/upload-photo")
async def upload_enseignant_photo(
    enseignant_id: int,
    file: UploadFile = File(...),
    authorization: str = Header(None)
):
    print(f"🔄 [UPLOAD] Début upload pour enseignant {enseignant_id}")
    print(f"🔄 [UPLOAD] Fichier reçu: {file.filename if file else 'None'}")
    print(f"🔄 [UPLOAD] Token reçu: {authorization[:50] if authorization else 'None'}...")
    
    try:        # Vérifier l'authentification
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Token manquant")
        
        token = authorization.replace("Bearer ", "")

        # Vérifier si c'est un admin
        admin_user = None
        if token.startswith("test_token_"):
            parts = token.split("_")
            print(f"🔍 [UPLOAD] Token parts: {parts}")
            # Le token peut être test_token_user_X_admin ou test_token_admin
            if len(parts) >= 4 and (parts[3] == "admin" or (len(parts) >= 5 and parts[4] == "admin")):
                admin_user = {"role": "admin"}
                print(f"✅ [UPLOAD] Token admin validé")
            elif "admin" in parts:  # Fallback plus permissif
                admin_user = {"role": "admin"}
                print(f"✅ [UPLOAD] Token admin validé (fallback)")
            else:
                print(f"❌ [UPLOAD] Token non admin: {parts}")

        if not admin_user:
            print(f"❌ [UPLOAD] Accès refusé pour token: {token[:30]}")
            raise HTTPException(status_code=403, detail="Accès refusé. Droits admin requis.")

        # Vérifier taille (5MB max)
        if hasattr(file, 'size') and file.size and file.size > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Fichier trop volumineux (max 5MB)")

        # Vérifier que l'enseignant existe
        enseignant_id_str = str(enseignant_id)
        if enseignant_id_str not in ENSEIGNANTS_DB:
            raise HTTPException(status_code=404, detail="Enseignant non trouvé")

        # Supprimer ancienne photo
        enseignant = ENSEIGNANTS_DB[enseignant_id_str]
        if enseignant.get("photo"):
            old_photo_path = Path(f"uploads{enseignant['photo'].replace('/uploads', '')}")
            if old_photo_path.exists():
                try:
                    os.remove(old_photo_path)
                except:
                    pass

        # Sauvegarder nouvelle image
        photo_url = save_and_resize_image(file)

        # Mettre à jour enseignant
        ENSEIGNANTS_DB[enseignant_id_str]["photo"] = photo_url
        if "user" in ENSEIGNANTS_DB[enseignant_id_str]:
            ENSEIGNANTS_DB[enseignant_id_str]["user"]["photo"] = photo_url

        save_all_data()

        return {"message": "Photo uploadée avec succès", "photo_url": photo_url}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main_minimal:app", host="0.0.0.0", port=8000, reload=True)
