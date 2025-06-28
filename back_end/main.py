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
import time
import hashlib
from pathlib import Path
import sqlite3

# Imports pour la base de données
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User, UserRole, Enseignant, Fonctionnaire, Demande, DemandeStatus
from schemas import EnseignantComplete

# Import des routeurs
from routers import enseignant, demandes, users

# Ajouter un routeur avec le nom singulier pour compatibilité
from fastapi import APIRouter

router_enseignant_singular = APIRouter(prefix="/enseignant", tags=["Enseignant"])

@router_enseignant_singular.get("/profil")
async def get_profil_singular(authorization: str = Header(None)):
    """Endpoint de compatibilité pour /enseignant/profil"""
    from routers.enseignant import get_profile
    return await get_profile(authorization)

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
    allow_headers=["*"]
        )

# Inclure les routeurs
app.include_router(enseignant.router)
app.include_router(demandes.router)  # Réactivé pour les demandes
# app.include_router(users.router, prefix="/api/users", tags=["users"])  # Désactivé pour éviter conflit
app.include_router(router_enseignant_singular)

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
    photo: str = None

# Modèle pour la réponse enseignant
class EnseignantComplete(BaseModel):
    id: int
    user_id: int
    specialite: str = None
    grade: str = None
    photo: str = None
    user: User

# Modèle pour les demandes
class DemandeCreate(BaseModel):
    type_demande: str
    titre: str
    description: str = None
    date_debut: str = None
    date_fin: str = None

# Modèle pour les documents de demande
class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_size: int = None
    content_type: str = None
    uploaded_at: str

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
    documents: List[DocumentResponse] = []  # Ajouter la liste des documents
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
            "documents": ["fonctionnaire_1_1750440929.png", "fonctionnaire_1_1750440939.jpg"],
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
            "documents": ["fonctionnaire_11_1750442234.png"],
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
            "documents": ["fonctionnaire_14_1750596345.jpg", "fonctionnaire_14_1750596791.jpg"],
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
        },
        # Nouvelles demandes pour couvrir plus d'IDs
        {
            "id": 6,
            "user_id": 4,
            "type_demande": "ATTESTATION",
            "titre": "Attestation de salaire",
            "description": "Demande d'attestation de salaire pour prêt bancaire",
            "date_debut": None,
            "date_fin": None,
            "statut": "EN_ATTENTE",
            "commentaire_admin": None,
            "created_at": (datetime.now() - timedelta(days=1)).isoformat(),
            "documents": ["fonctionnaire_14_1750596854.jpg"],
            "user": {
                "id": 4,
                "email": "fonctionnaire@univ.ma",
                "nom": "Karam",
                "prenom": "Aicha",
                "role": "fonctionnaire"
            }
        },
        {
            "id": 7,
            "user_id": 3,
            "type_demande": "ABSENCE",
            "titre": "Absence formation",
            "description": "Absence pour formation continue",
            "date_debut": "2024-07-20",
            "date_fin": "2024-07-22",
            "statut": "APPROUVEE",
            "commentaire_admin": "Formation approuvée par le département",
            "created_at": (datetime.now() - timedelta(days=3)).isoformat(),
            "documents": [],
            "user": {
                "id": 3,
                "email": "enseignant@univ.ma",
                "nom": "Tazi",
                "prenom": "Ahmed",
                "role": "enseignant"
            }
        },
        {
            "id": 15,
            "user_id": 4,
            "type_demande": "CONGE",
            "titre": "Congé maternité",
            "description": "Demande de congé maternité",
            "date_debut": "2024-08-01",
            "date_fin": "2024-10-01",
            "statut": "EN_ATTENTE",
            "commentaire_admin": None,
            "created_at": datetime.now().isoformat(),
            "documents": ["fonctionnaire_17_1750597472.jpg"],
            "user": {
                "id": 4,
                "email": "fonctionnaire@univ.ma",
                "nom": "Karam",
                "prenom": "Aicha",
                "role": "fonctionnaire"
            }
        },
        {
            "id": 20,
            "user_id": 3,
            "type_demande": "ORDRE_MISSION",
            "titre": "Mission Rabat",
            "description": "Mission administrative à Rabat",
            "date_debut": "2024-07-25",
            "date_fin": "2024-07-26",
            "statut": "REJETEE",
            "commentaire_admin": "Budget insuffisant pour cette mission",
            "created_at": (datetime.now() - timedelta(days=7)).isoformat(),
            "documents": [],
            "user": {
                "id": 3,
                "email": "enseignant@univ.ma",
                "nom": "Tazi",
                "prenom": "Ahmed",
                "role": "enseignant"
            }
        },
        {
            "id": 23,
            "user_id": 4,
            "type_demande": "ATTESTATION",
            "titre": "Attestation de fonction",
            "description": "Attestation de fonction pour démarches consulaires",
            "date_debut": None,
            "date_fin": None,
            "statut": "EN_ATTENTE",
            "commentaire_admin": None,
            "created_at": datetime.now().isoformat(),
            "documents": ["fonctionnaire_1_test.svg"],
            "user": {
                "id": 4,
                "email": "fonctionnaire@univ.ma",
                "nom": "Karam",
                "prenom": "Aicha",
                "role": "fonctionnaire"
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
    # Import hashlib pour vérifier les mots de passe
    import hashlib
    
    # Vérifier d'abord dans la base de données SQLite
    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        # Chercher l'utilisateur par email
        cursor.execute("SELECT * FROM users WHERE email = ? AND is_active = 1", (form_data.username,))
        user_data = cursor.fetchone()
        
        if user_data:
            # Vérifier le mot de passe hashé
            password_hash = hashlib.sha256(form_data.password.encode()).hexdigest()
            
            if user_data['hashed_password'] == password_hash:
                conn.close()
                print(f"✅ Authentification réussie pour {form_data.username} (ID: {user_data['id']}, Role: {user_data['role']})")
                return {
                    "access_token": f"test_token_{user_data['id']}_{user_data['role']}",
                    "token_type": "bearer"
                }
            else:
                print(f"❌ Mot de passe incorrect pour {form_data.username}")
        else:
            print(f"❌ Utilisateur {form_data.username} non trouvé ou inactif")
        
        conn.close()

    except Exception as e:
        print(f"Erreur lors de la vérification dans la base de données: {e}")

    # Fallback vers les TEST_USERS pour la compatibilité
    user = TEST_USERS.get(form_data.username)
    if not user or user["password"] != form_data.password:
        raise HTTPException(
            status_code=401,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Retourner un token simple (pour les tests)
    return {
        "access_token": f"test_token_{user['id']}_{user['role']}",
        "token_type": "bearer"
    }

# Get current user info endpoint
@app.get("/auth/me")  # Retiré response_model=User temporairement
async def read_users_me(authorization: str = Header(None)):
    # Extraire les informations du token
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")

        # Le token a le format: test_token_{user_id}_{role}
        if token.startswith("test_token_"):
            parts = token.split("_")
            if len(parts) >= 3:
                user_id = parts[2]
                role = parts[3] if len(parts) > 3 else ""

                # Vérifier d'abord dans la base de données SQLite
                try:
                    conn = get_sqlite_connection()
                    cursor = conn.cursor()
                    cursor.execute("SELECT * FROM users WHERE id = ? AND role = ? AND is_active = 1",
                                 (user_id, role.upper()))
                    user_data = cursor.fetchone()
                    conn.close()

                    if user_data:
                        return {
                            "id": user_data["id"],
                            "email": user_data["email"],
                            "nom": user_data["nom"],
                            "prenom": user_data["prenom"],
                            "telephone": user_data["telephone"] or "",
                            "adresse": user_data["adresse"] or "",
                            "cin": user_data["cin"] or "",
                            "role": user_data["role"].lower(),
                            "is_active": bool(user_data["is_active"]),
                            "created_at": user_data["created_at"] or "2025-01-01T00:00:00",
                            "updated_at": user_data["updated_at"] or None
                        }

                except Exception as e:
                    print(f"Erreur lors de la vérification dans la base de données: {e}")

                # Fallback vers les TEST_USERS pour la compatibilité
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
        headers={"WWW-Authenticate": "Bearer"}
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
@app.post("/users/enseignants")
async def create_enseignant(
    enseignant_data: dict,
    authorization: str = Header(None)
):
    """Créer un nouvel enseignant dans la base de données SQLite"""
    # Vérifier l'autorisation admin
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")

    token = authorization.replace("Bearer ", "")

    # Vérifier si c'est un admin (simplifié)
    if not ("admin" in token.lower() or token.startswith("test_token_")):
        raise HTTPException(status_code=403, detail="Droits admin requis")

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        # Extraire les données utilisateur
        user_data = {
            'email': enseignant_data.get('email'),
            'nom': enseignant_data.get('nom'),
            'prenom': enseignant_data.get('prenom'),
            'telephone': enseignant_data.get('telephone'),
            'adresse': enseignant_data.get('adresse'),
            'cin': enseignant_data.get('cin'),
            'password': enseignant_data.get('password', 'default_password')
        }

        # Vérifier que l'email n'existe pas déjà dans SQLite
        cursor.execute("SELECT id FROM users WHERE email = ?", (user_data['email'],))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Un utilisateur avec cet email existe déjà")

        # Insérer l'utilisateur
        cursor.execute('''
            INSERT INTO users (email, nom, prenom, telephone, adresse, cin, hashed_password, role)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'ENSEIGNANT')
        ''', (
            user_data['email'],
            user_data['nom'],
            user_data['prenom'],
            user_data['telephone'],            user_data['adresse'],
            user_data['cin'],
            f"hashed_{user_data['password']}"
        ))

        user_id = cursor.lastrowid

        # Insérer les données enseignant
        enseignant_info = {
            'specialite': enseignant_data.get('specialite'),
            'grade': enseignant_data.get('grade')
        }

        cursor.execute('''
            INSERT INTO enseignants (user_id, specialite, grade)
            VALUES (?, ?, ?)
        ''', (
            user_id,
            enseignant_info['specialite'],
            enseignant_info['grade']
        ))

        enseignant_id = cursor.lastrowid

        conn.commit()
        conn.close()

        return {
            "message": "Enseignant créé avec succès",
            "id": enseignant_id,
            "user_id": user_id,
            "email": user_data['email'],
            "nom": user_data['nom'],
            "prenom": user_data['prenom']
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création: {str(e)}")

    return enseignant_response

# Récupérer tous les enseignants (endpoint pour admin)
@app.get("/users/enseignants")
async def get_all_enseignants(
    authorization: str = Header(None)
):
    # Vérifier l'autorisation admin
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")

    token = authorization.replace("Bearer ", "")
    print(f"🔍 [GET ENSEIGNANTS] Token reçu: {token[:30]}...")

    # Vérifier si c'est un admin ou un enseignant connecté
    admin_user = None
    current_user_id = None
    user_role = None
    
    if token.startswith("test_token_"):
        # Logique pour les tokens de test
        parts = token.split("_")
        print(f"🔍 [GET ENSEIGNANTS] Token test parts: {parts}")
        if len(parts) >= 3:
            current_user_id = parts[2] if parts[2].isdigit() else None
        if len(parts) >= 4:
            user_role = parts[3].upper()
            
        if user_role == "ADMIN":
            admin_user = {"role": "admin"}
            print(f"✅ [GET ENSEIGNANTS] Token admin test validé")
        elif user_role == "ENSEIGNANT":
            admin_user = {"role": "enseignant", "user_id": current_user_id}
            print(f"✅ [GET ENSEIGNANTS] Token enseignant test validé")
        elif any("admin" in part.lower() for part in parts):
            admin_user = {"role": "admin"}
            print(f"✅ [GET ENSEIGNANTS] Token admin test validé (fallback)")
    else:
        # Logique pour les vrais tokens JWT
        try:
            from auth import decode_jwt_token
            payload = decode_jwt_token(token)
            user_role = payload.get("role")
            current_user_id = payload.get("user_id")
            
            print(f"🔍 [GET ENSEIGNANTS] JWT décodé - Role: {user_role}, User ID: {current_user_id}")
            
            if user_role == "ADMIN":
                admin_user = {"role": "admin", "user_id": current_user_id}
                print(f"✅ [GET ENSEIGNANTS] Token JWT admin validé")
            elif user_role == "ENSEIGNANT":
                admin_user = {"role": "enseignant", "user_id": current_user_id}
                print(f"✅ [GET ENSEIGNANTS] Token JWT enseignant validé")
            else:
                print(f"❌ [GET ENSEIGNANTS] Role insuffisant: {user_role}")
                
        except Exception as jwt_error:
            print(f"❌ [GET ENSEIGNANTS] Erreur décodage JWT: {jwt_error}")

    if not admin_user:
        print(f"❌ [GET ENSEIGNANTS] Accès refusé pour token: {token[:30]}")
        raise HTTPException(status_code=403, detail="Accès refusé. Connexion requise.")

    # Récupérer tous les enseignants depuis SQLite directement
    try:
        conn = get_sqlite_connection()
        conn.row_factory = sqlite3.Row  # Pour accéder aux colonnes par nom
        cursor = conn.cursor()

        cursor.execute('''
            SELECT
                e.id, e.user_id, e.specialite, e.grade, e.photo,
                u.nom, u.prenom, u.email, u.telephone, u.adresse, u.cin, u.is_active
            FROM enseignants e
            JOIN users u ON e.user_id = u.id
            WHERE u.role = 'ENSEIGNANT'
            ORDER BY u.nom, u.prenom
        ''')

        enseignants = []
        for row in cursor.fetchall():
            enseignant = {
                "id": row['id'],
                "user_id": row['user_id'],
                "nom": row['nom'],  # Ajouter directement depuis user
                "prenom": row['prenom'],  # Ajouter directement depuis user
                "email": row['email'],  # Ajouter directement depuis user
                "telephone": row['telephone'] or '',  # Ajouter directement depuis user
                "specialite": row['specialite'],
                "grade": row['grade'],
                "photo": row['photo'],
                "statut": "Actif" if row['is_active'] else "Inactif",  # Calculé depuis is_active
                "user": {
                    "id": row['user_id'],
                    "nom": row['nom'],
                    "prenom": row['prenom'],
                    "email": row['email'],
                    "telephone": row['telephone'],
                    "adresse": row['adresse'],
                    "cin": row['cin'],
                    "is_active": bool(row['is_active']),
                    "role": "ENSEIGNANT"
                }
            }
            enseignants.append(enseignant)

        # Si c'est un enseignant, ne retourner que ses propres données
        if admin_user.get("role") == "enseignant" and current_user_id:
            enseignants = [ens for ens in enseignants if str(ens["user_id"]) == str(current_user_id)]
            print(f"🔍 [GET ENSEIGNANTS] Filtrage pour enseignant {current_user_id}: {len(enseignants)} résultats")

        conn.close()
        return enseignants

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur base de données: {str(e)}")

# Modifier un enseignant (endpoint pour admin)
@app.put("/users/enseignants/{enseignant_id}")
async def update_enseignant(
    enseignant_id: int,
    enseignant_data: dict,
    authorization: str = Header(None)
):
    """Modifier un enseignant existant dans la base de données SQLite"""
    # Vérifier l'autorisation admin
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")

    token = authorization.replace("Bearer ", "")

    # Vérifier si c'est un admin (simplifié)
    if not ("admin" in token.lower() or token.startswith("test_token_")):
        raise HTTPException(status_code=403, detail="Droits admin requis")

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        # Vérifier que l'enseignant existe et récupérer les données actuelles
        cursor.execute('''
            SELECT u.nom, u.prenom, u.email, u.telephone, u.adresse, u.cin,
                   e.specialite, e.grade, e.user_id
            FROM enseignants e
            JOIN users u ON e.user_id = u.id
            WHERE e.id = ?
        ''', (enseignant_id,))
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Enseignant non trouvé")

        user_id = result['user_id']

        # Préparer les données de mise à jour en gardant les valeurs existantes si non fournies
        user_updates = []
        user_params = []

        # Pour chaque champ utilisateur, utiliser la nouvelle valeur si fournie, sinon garder l'ancienne
        new_nom = enseignant_data.get('nom')
        if new_nom is not None and new_nom.strip() != "":
            user_updates.append("nom = ?")
            user_params.append(new_nom)

        new_prenom = enseignant_data.get('prenom')
        if new_prenom is not None and new_prenom.strip() != "":
            user_updates.append("prenom = ?")
            user_params.append(new_prenom)

        new_email = enseignant_data.get('email')
        if new_email is not None and new_email.strip() != "":
            # Vérifier l'unicité de l'email si il change
            if new_email != result['email']:
                cursor.execute("SELECT id FROM users WHERE email = ? AND id != ?", (new_email, user_id))
                if cursor.fetchone():
                    raise HTTPException(status_code=400, detail="Un utilisateur avec cet email existe déjà")
            user_updates.append("email = ?")
            user_params.append(new_email)

        new_telephone = enseignant_data.get('telephone')
        if new_telephone is not None and new_telephone.strip() != "":
            user_updates.append("telephone = ?")
            user_params.append(new_telephone)

        new_adresse = enseignant_data.get('adresse')
        if new_adresse is not None and new_adresse.strip() != "":
            user_updates.append("adresse = ?")
            user_params.append(new_adresse)

        new_cin = enseignant_data.get('cin')
        if new_cin is not None and new_cin.strip() != "":
            user_updates.append("cin = ?")
            user_params.append(new_cin)

        # Gestion du mot de passe (nouveau - cohérent avec l'endpoint login)
        new_password = enseignant_data.get('password')
        if new_password is not None and new_password.strip() != "" and new_password != 'unchanged':
            # Utiliser SHA256 pour être cohérent avec l'endpoint login
            password_hash = hashlib.sha256(new_password.encode()).hexdigest()
            user_updates.append("hashed_password = ?")
            user_params.append(password_hash)
            print(f"🔑 Mot de passe mis à jour pour {enseignant_data.get('email', 'enseignant')}")

        # Mettre à jour les données utilisateur seulement si il y a des changements
        if user_updates:
            user_params.append(user_id)
            cursor.execute(f'''
                UPDATE users
                SET {', '.join(user_updates)}
                WHERE id = ?
            ''', user_params)

        # Préparer les données de mise à jour pour l'enseignant
        enseignant_updates = []
        enseignant_params = []

        new_specialite = enseignant_data.get('specialite')
        if new_specialite is not None and new_specialite.strip() != "":
            enseignant_updates.append("specialite = ?")
            enseignant_params.append(new_specialite)

        new_grade = enseignant_data.get('grade')
        if new_grade is not None and new_grade.strip() != "":
            enseignant_updates.append("grade = ?")
            enseignant_params.append(new_grade)

        # Mettre à jour les données enseignant seulement si il y a des changements
        if enseignant_updates:
            enseignant_params.append(enseignant_id)
            cursor.execute(f'''
                UPDATE enseignants
                SET {', '.join(enseignant_updates)}
                WHERE id = ?
            ''', enseignant_params)

        conn.commit()

        # Récupérer l'enseignant modifié pour le retourner
        cursor.execute('''
            SELECT
                e.id, e.user_id, e.specialite, e.grade, e.photo,
                u.nom, u.prenom, u.email, u.telephone, u.adresse, u.cin, u.is_active
            FROM enseignants e
            JOIN users u ON e.user_id = u.id
            WHERE e.id = ?
        ''', (enseignant_id,))

        row = cursor.fetchone()
        conn.close()

        # Retourner l'enseignant modifié au format attendu par le frontend
        enseignant_modifie = {
            "id": row['id'],
            "user_id": row['user_id'],
            "specialite": row['specialite'],
            "grade": row['grade'],

            "photo": row['photo'],
            "user": {
                "id": row['user_id'],
                "nom": row['nom'],
                "prenom": row['prenom'],
                "email": row['email'],
                "telephone": row['telephone'],
                "adresse": row['adresse'],
                "cin": row['cin'],
                "is_active": bool(row['is_active']),
                "role": "ENSEIGNANT"
            }
        }

        return enseignant_modifie

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la modification: {str(e)}")

# Supprimer un enseignant (endpoint pour admin)
@app.delete("/users/enseignants/{enseignant_id}")
async def delete_enseignant(
    enseignant_id: int,
    authorization: str = Header(None)
):
    """Supprimer un enseignant de la base de données SQLite"""
    # Vérifier l'autorisation admin
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")

    token = authorization.replace("Bearer ", "")

    # Vérifier si c'est un admin (simplifié)
    if not ("admin" in token.lower() or token.startswith("test_token_")):
        raise HTTPException(status_code=403, detail="Droits admin requis")

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        # Récupérer l'user_id et la photo pour nettoyage
        cursor.execute("SELECT user_id, photo FROM enseignants WHERE id = ?", (enseignant_id,))
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Enseignant non trouvé")

        user_id = result['user_id']
        photo_url = result['photo']

        # Supprimer la photo si elle existe
        if photo_url:
            photo_path = Path(f"uploads{photo_url.replace('/uploads', '')}")
            if photo_path.exists():
                try:
                    os.remove(photo_path)
                except:
                    pass

        # Supprimer l'enseignant
        cursor.execute("DELETE FROM enseignants WHERE id = ?", (enseignant_id,))

        # Supprimer l'utilisateur
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))

        conn.commit()
        conn.close()

        return {"message": "Enseignant supprimé avec succès"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}")

# ===== ENDPOINTS POUR LES FONCTIONNAIRES =====

# Créer un fonctionnaire (endpoint pour admin)
@app.post("/users/fonctionnaires")
async def create_fonctionnaire(
    fonctionnaire_data: dict,
    authorization: str = Header(None)
):
    """Créer un nouveau fonctionnaire dans la base de données SQLite"""
    # Vérifier l'autorisation admin
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")

    token = authorization.replace("Bearer ", "")

    # Vérifier si c'est un admin (simplifié)
    if not ("admin" in token.lower() or token.startswith("test_token_")):
        raise HTTPException(status_code=403, detail="Droits admin requis")

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        # Extraire les données utilisateur
        user_data = {
            'email': fonctionnaire_data.get('email'),
            'nom': fonctionnaire_data.get('nom'),
            'prenom': fonctionnaire_data.get('prenom'),
            'telephone': fonctionnaire_data.get('telephone'),
            'adresse': fonctionnaire_data.get('adresse'),
            'cin': fonctionnaire_data.get('cin'),
            'password': fonctionnaire_data.get('password', 'default_password')
        }        # Validation des champs obligatoires
        if not user_data['nom'] or not user_data['nom'].strip():
            raise HTTPException(status_code=400, detail="Le nom est obligatoire")

        if not user_data['prenom'] or not user_data['prenom'].strip():
            raise HTTPException(status_code=400, detail="Le prénom est obligatoire")

        if not user_data['email'] or not user_data['email'].strip():
            raise HTTPException(status_code=400, detail="L'email est obligatoire")

        if not user_data['cin'] or not user_data['cin'].strip():
            raise HTTPException(status_code=400, detail="Le CIN est obligatoire et ne peut pas être vide")

        # Vérifier que l'email n'existe pas déjà dans SQLite
        cursor.execute("SELECT id FROM users WHERE email = ?", (user_data['email'],))
        existing_user = cursor.fetchone()
        if existing_user:
            raise HTTPException(status_code=400, detail=f"Un utilisateur avec l'email '{user_data['email']}' existe déjà")

        # Vérifier que le CIN n'existe pas déjà dans SQLite
        cursor.execute("SELECT id FROM users WHERE cin = ? AND cin IS NOT NULL AND cin != ''", (user_data['cin'],))
        existing_cin = cursor.fetchone()
        if existing_cin:
            raise HTTPException(status_code=400, detail=f"Un utilisateur avec le CIN '{user_data['cin']}' existe déjà")

        # Insérer l'utilisateur
        cursor.execute('''
            INSERT INTO users (email, nom, prenom, telephone, adresse, cin, hashed_password, role)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'FONCTIONNAIRE')
        ''', (
            user_data['email'],
            user_data['nom'],
            user_data['prenom'],
            user_data['telephone'],
            user_data['adresse'],
            user_data['cin'],
            f"hashed_{user_data['password']}"
        ))

        user_id = cursor.lastrowid
          # Insérer les données fonctionnaire
        fonctionnaire_info = {
            'service': fonctionnaire_data.get('service'),
            'poste': fonctionnaire_data.get('poste'),
            'grade': fonctionnaire_data.get('grade'),
            'photo': fonctionnaire_data.get('photo')
        }

        cursor.execute('''
            INSERT INTO fonctionnaires (user_id, service, poste, grade, photo)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            user_id,
            fonctionnaire_info['service'],
            fonctionnaire_info['poste'],
            fonctionnaire_info['grade'],
            fonctionnaire_info['photo']
        ))

        fonctionnaire_id = cursor.lastrowid

        conn.commit()
          # Récupérer le fonctionnaire créé avec toutes les données pour le retourner
        cursor.execute('''
            SELECT
                f.id, f.user_id, f.service, f.poste, f.grade, f.photo,
                u.nom, u.prenom, u.email, u.telephone, u.adresse, u.cin, u.is_active
            FROM fonctionnaires f
            JOIN users u ON f.user_id = u.id
            WHERE f.id = ?
        ''', (fonctionnaire_id,))

        row = cursor.fetchone()
        conn.close()

        # Retourner le fonctionnaire créé au format attendu par le frontend
        fonctionnaire_cree = {
            "id": row['id'],
            "user_id": row['user_id'],
            "service": row['service'],
            "poste": row['poste'],
            "grade": row['grade'],
            "photo": row['photo'],
            "user": {
                "id": row['user_id'],
                "nom": row['nom'],
                "prenom": row['prenom'],
                "email": row['email'],
                "telephone": row['telephone'],
                "adresse": row['adresse'],
                "cin": row['cin'],
                "is_active": bool(row['is_active']),
                "role": "FONCTIONNAIRE"
            }
        }

        return fonctionnaire_cree

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création: {str(e)}")

# Récupérer tous les fonctionnaires (endpoint pour admin)
@app.get("/users/fonctionnaires")
async def get_all_fonctionnaires(
    authorization: str = Header(None)
):
    """Récupérer la liste des fonctionnaires depuis SQLite"""
    # Vérifier l'autorisation admin (simplifié)
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")

    token = authorization.replace("Bearer ", "")
    print(f"🔍 [GET FONCTIONNAIRES] Token reçu: {token[:30]}...")

    # Vérifier si c'est un admin ou un fonctionnaire connecté
    admin_user = None
    current_user_id = None
    user_role = None
    
    if token.startswith("test_token_"):
        # Logique pour les tokens de test
        parts = token.split("_")
        print(f"🔍 [GET FONCTIONNAIRES] Token test parts: {parts}")
        if len(parts) >= 3:
            current_user_id = parts[2] if parts[2].isdigit() else None
        if len(parts) >= 4:
            user_role = parts[3].upper()
            
        if user_role == "ADMIN":
            admin_user = {"role": "admin"}
            print(f"✅ [GET FONCTIONNAIRES] Token admin test validé")
        elif user_role == "FONCTIONNAIRE":
            admin_user = {"role": "fonctionnaire", "user_id": current_user_id}
            print(f"✅ [GET FONCTIONNAIRES] Token fonctionnaire test validé")
        elif any("admin" in part.lower() for part in parts):
            admin_user = {"role": "admin"}
            print(f"✅ [GET FONCTIONNAIRES] Token admin test validé (fallback)")
    else:
        # Logique pour les vrais tokens JWT
        try:
            from auth import decode_jwt_token
            payload = decode_jwt_token(token)
            user_role = payload.get("role")
            current_user_id = payload.get("user_id")
            
            print(f"🔍 [GET FONCTIONNAIRES] JWT décodé - Role: {user_role}, User ID: {current_user_id}")
            
            if user_role == "ADMIN":
                admin_user = {"role": "admin", "user_id": current_user_id}
                print(f"✅ [GET FONCTIONNAIRES] Token JWT admin validé")
            elif user_role == "FONCTIONNAIRE":
                admin_user = {"role": "fonctionnaire", "user_id": current_user_id}
                print(f"✅ [GET FONCTIONNAIRES] Token JWT fonctionnaire validé")
            else:
                print(f"❌ [GET FONCTIONNAIRES] Role insuffisant: {user_role}")
                
        except Exception as jwt_error:
            print(f"❌ [GET FONCTIONNAIRES] Erreur décodage JWT: {jwt_error}")

    if not admin_user:
        print(f"❌ [GET FONCTIONNAIRES] Accès refusé pour token: {token[:30]}")
        raise HTTPException(status_code=403, detail="Accès refusé. Connexion requise.")

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT
                f.id, f.user_id, f.service, f.poste, f.grade, f.photo,
                u.nom, u.prenom, u.email, u.telephone, u.adresse, u.cin, u.is_active
            FROM fonctionnaires f
            JOIN users u ON f.user_id = u.id
            WHERE u.role = 'FONCTIONNAIRE'
            ORDER BY u.nom, u.prenom
        ''')

        fonctionnaires = []
        for row in cursor.fetchall():
            fonctionnaire = {
                "id": row['id'],
                "user_id": row['user_id'],
                "service": row['service'],
                "poste": row['poste'],
                "grade": row['grade'],
                "photo": row['photo'],
                "user": {
                    "id": row['user_id'],
                    "nom": row['nom'],
                    "prenom": row['prenom'],
                    "email": row['email'],
                    "telephone": row['telephone'],
                    "adresse": row['adresse'],
                    "cin": row['cin'],
                    "is_active": bool(row['is_active']),
                    "role": "FONCTIONNAIRE"
                }
            }
            fonctionnaires.append(fonctionnaire)

        # Si c'est un fonctionnaire, ne retourner que ses propres données
        if admin_user.get("role") == "fonctionnaire" and current_user_id:
            fonctionnaires = [fonc for fonc in fonctionnaires if str(fonc["user_id"]) == str(current_user_id)]
            print(f"🔍 [GET FONCTIONNAIRES] Filtrage pour fonctionnaire {current_user_id}: {len(fonctionnaires)} résultats")

        conn.close()
        return fonctionnaires

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur base de données: {str(e)}")

# Modifier un fonctionnaire (endpoint pour admin)
@app.put("/users/fonctionnaires/{fonctionnaire_id}")
async def update_fonctionnaire(
    fonctionnaire_id: int,
    fonctionnaire_data: dict,
    authorization: str = Header(None)
):
    """Modifier un fonctionnaire existant dans la base de données SQLite"""
    # Vérifier l'autorisation admin
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")

    token = authorization.replace("Bearer ", "")

    # Vérifier si c'est un admin (simplifié)
    if not ("admin" in token.lower() or token.startswith("test_token_")):
        raise HTTPException(status_code=403, detail="Droits admin requis")

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()
          # Vérifier que le fonctionnaire existe
        cursor.execute("SELECT user_id FROM fonctionnaires WHERE id = ?", (fonctionnaire_id,))
        result = cursor.fetchone()
        if not result:
            conn.close()
            raise HTTPException(status_code=404, detail=f"Fonctionnaire avec l'ID {fonctionnaire_id} non trouvé")

        user_id = result['user_id']

        # Validation des champs obligatoires si fournis
        if 'cin' in fonctionnaire_data:
            cin_value = fonctionnaire_data.get('cin')
            if not cin_value or not cin_value.strip():
                conn.close()
                raise HTTPException(status_code=400, detail="Le CIN est obligatoire et ne peut pas être vide")

        # Vérifier l'unicité de l'email si modifié
        if 'email' in fonctionnaire_data:
            email_value = fonctionnaire_data.get('email')
            if email_value:
                cursor.execute("SELECT id FROM users WHERE email = ? AND id != ?", (email_value, user_id))
                existing_user = cursor.fetchone()
                if existing_user:
                    conn.close()
                    raise HTTPException(status_code=400, detail=f"Un utilisateur avec l'email '{email_value}' existe déjà")

        # Vérifier l'unicité du CIN si modifié
        if 'cin' in fonctionnaire_data:
            cin_value = fonctionnaire_data.get('cin')
            if cin_value:
                cursor.execute("SELECT id FROM users WHERE cin = ? AND id != ? AND cin IS NOT NULL AND cin != ''", (cin_value, user_id))
                existing_cin = cursor.fetchone()
                if existing_cin:
                    conn.close()
                    raise HTTPException(status_code=400, detail=f"Un utilisateur avec le CIN '{cin_value}' existe déjà")

        # Préparer les données de mise à jour en gardant les valeurs existantes si non fournies
        user_updates = []
        user_params = []

        # Pour chaque champ utilisateur, utiliser la nouvelle valeur si fournie, sinon garder l'ancienne
        new_nom = fonctionnaire_data.get('nom')
        if new_nom is not None and new_nom.strip() != "":
            user_updates.append("nom = ?")
            user_params.append(new_nom)

        new_prenom = fonctionnaire_data.get('prenom')
        if new_prenom is not None and new_prenom.strip() != "":
            user_updates.append("prenom = ?")
            user_params.append(new_prenom)

        new_email = fonctionnaire_data.get('email')
        if new_email is not None and new_email.strip() != "":
            user_updates.append("email = ?")
            user_params.append(new_email)

        new_telephone = fonctionnaire_data.get('telephone')
        if new_telephone is not None and new_telephone.strip() != "":
            user_updates.append("telephone = ?")
            user_params.append(new_telephone)

        new_adresse = fonctionnaire_data.get('adresse')
        if new_adresse is not None and new_adresse.strip() != "":
            user_updates.append("adresse = ?")
            user_params.append(new_adresse)

        new_cin = fonctionnaire_data.get('cin')
        if new_cin is not None and new_cin.strip() != "":
            user_updates.append("cin = ?")
            user_params.append(new_cin)

        # Gestion du mot de passe (nouveau - cohérent avec l'endpoint login)
        new_password = fonctionnaire_data.get('password')
        if new_password is not None and new_password.strip() != "" and new_password != 'unchanged':
            # Utiliser SHA256 pour être cohérent avec l'endpoint login
            import hashlib
            password_hash = hashlib.sha256(new_password.encode()).hexdigest()
            user_updates.append("hashed_password = ?")
            user_params.append(password_hash)
            print(f"🔑 Mot de passe mis à jour pour {fonctionnaire_data.get('email', 'fonctionnaire')}")

        # Mettre à jour les données utilisateur seulement si il y a des changements
        if user_updates:
            user_params.append(user_id)
            cursor.execute(f'''
                UPDATE users
                SET {', '.join(user_updates)}
                WHERE id = ?
            ''', user_params)
          # Mettre à jour les données fonctionnaire
        cursor.execute('''
            UPDATE fonctionnaires
            SET service = ?, poste = ?, grade = ?, photo = ?
            WHERE id = ?
        ''', (
            fonctionnaire_data.get('service'),
            fonctionnaire_data.get('poste'),
            fonctionnaire_data.get('grade'),
            fonctionnaire_data.get('photo'),
            fonctionnaire_id
        ))

        conn.commit()
          # Récupérer le fonctionnaire modifié pour le retourner
        cursor.execute('''
            SELECT
                f.id, f.user_id, f.service, f.poste, f.grade, f.photo,
                u.nom, u.prenom, u.email, u.telephone, u.adresse, u.cin, u.is_active
            FROM fonctionnaires f
            JOIN users u ON f.user_id = u.id
            WHERE f.id = ?
        ''', (fonctionnaire_id,))

        row = cursor.fetchone()
        conn.close()
          # Retourner le fonctionnaire modifié au format attendu par le frontend
        fonctionnaire_modifie = {
            "id": row['id'],
            "user_id": row['user_id'],
            "service": row['service'],
            "poste": row['poste'],
            "grade": row['grade'],
            "photo": row['photo'],
            "user": {
                "id": row['user_id'],
                "nom": row['nom'],
                "prenom": row['prenom'],
                "email": row['email'],
                "telephone": row['telephone'],
                "adresse": row['adresse'],
                "cin": row['cin'],
                "is_active": bool(row['is_active']),
                "role": "FONCTIONNAIRE"
            }
        }

        return fonctionnaire_modifie

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la modification: {str(e)}")

# Supprimer un fonctionnaire (endpoint pour admin)
@app.delete("/users/fonctionnaires/{fonctionnaire_id}")
async def delete_fonctionnaire(
    fonctionnaire_id: int,
    authorization: str = Header(None)
):
    """Supprimer un fonctionnaire de la base de données SQLite"""
    # Vérifier l'autorisation admin
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")

    token = authorization.replace("Bearer ", "")

    # Vérifier si c'est un admin (simplifié)
    if not ("admin" in token.lower() or token.startswith("test_token_")):
        raise HTTPException(status_code=403, detail="Droits admin requis")

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()
          # Récupérer l'user_id pour nettoyage
        cursor.execute("SELECT user_id FROM fonctionnaires WHERE id = ?", (fonctionnaire_id,))
        result = cursor.fetchone()
        if not result:
            conn.close()
            raise HTTPException(status_code=404, detail=f"Fonctionnaire avec l'ID {fonctionnaire_id} non trouvé")

        user_id = result['user_id']
          # Supprimer le fonctionnaire
        cursor.execute("DELETE FROM fonctionnaires WHERE id = ?", (fonctionnaire_id,))

        # Supprimer l'utilisateur
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))

        conn.commit()
        conn.close()

        return {"message": "Fonctionnaire supprimé avec succès"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}")

# Upload photo pour un fonctionnaire (endpoint pour admin)
@app.post("/users/fonctionnaires/{fonctionnaire_id}/upload-photo")
async def upload_fonctionnaire_photo(
    fonctionnaire_id: int,
    file: UploadFile = File(...),
    authorization: str = Header(None)
):
    """Upload d'une photo pour un fonctionnaire"""
    print(f"🔄 [UPLOAD] Début upload photo pour fonctionnaire {fonctionnaire_id}")
    print(f"🔄 [UPLOAD] Fichier reçu: {file.filename if file else 'None'}")

    try:
        # Vérifier l'authentification
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Token manquant")

        token = authorization.replace("Bearer ", "")
        print(f"🔍 [UPLOAD] Token reçu: {token[:30]}...")

        # Vérifier si c'est un token de test ou un vrai JWT
        admin_user = None
        
        if token.startswith("test_token_"):
            # Logique pour les tokens de test
            parts = token.split("_")
            print(f"🔍 [UPLOAD] Token test parts: {parts}")
            if len(parts) >= 4 and (parts[3].lower() == "admin" or (len(parts) >= 5 and parts[4].lower() == "admin")):
                admin_user = {"role": "admin"}
                print(f"✅ [UPLOAD] Token admin test validé")
            elif any("admin" in part.lower() for part in parts):
                admin_user = {"role": "admin"}
                print(f"✅ [UPLOAD] Token admin test validé (fallback)")
        else:
            # Logique pour les vrais tokens JWT
            try:
                from auth import decode_jwt_token
                payload = decode_jwt_token(token)
                user_role = payload.get("role")
                user_id = payload.get("user_id")
                
                print(f"🔍 [UPLOAD] JWT décodé - Role: {user_role}, User ID: {user_id}")
                
                if user_role == "ADMIN":
                    admin_user = {"role": "admin", "user_id": user_id}
                    print(f"✅ [UPLOAD] Token JWT admin validé")
                else:
                    print(f"❌ [UPLOAD] Role insuffisant: {user_role}")
                    
            except Exception as jwt_error:
                print(f"❌ [UPLOAD] Erreur décodage JWT: {jwt_error}")

        if not admin_user:
            print(f"❌ [UPLOAD] Accès refusé pour token: {token[:30]}")
            raise HTTPException(status_code=403, detail="Accès refusé. Droits admin requis.")

        # Vérifier taille (5MB max)
        if hasattr(file, 'size') and file.size and file.size > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Fichier trop volumineux (max 5MB)")
        
        # Vérifier que le fonctionnaire existe dans SQLite
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM fonctionnaires WHERE id = ?", (fonctionnaire_id,))
        fonctionnaire_exists = cursor.fetchone()
        if not fonctionnaire_exists:
            conn.close()
            raise HTTPException(status_code=404, detail=f"Fonctionnaire avec l'ID {fonctionnaire_id} non trouvé")

        # Vérifier que le fichier est valide
        if not file or not file.filename:
            conn.close()
            raise HTTPException(status_code=400, detail="Aucun fichier fourni")

        # Créer le dossier uploads/images s'il n'existe pas
        upload_dir = Path("uploads/images")
        upload_dir.mkdir(parents=True, exist_ok=True)

        # Générer un nom de fichier unique
        file_extension = Path(file.filename).suffix.lower() if file.filename else ".jpg"
        if file_extension not in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
            conn.close()
            raise HTTPException(status_code=400, detail="Format de fichier non supporté. Formats acceptés: JPG, PNG, GIF, WebP")

        filename = f"fonctionnaire_{fonctionnaire_id}_{int(time.time())}{file_extension}"
        file_path = upload_dir / filename

        # Sauvegarder le fichier
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        print(f"✅ [UPLOAD] Fichier sauvegardé: {file_path}")

        # Mettre à jour le chemin de la photo dans la base de données
        photo_path = f"/uploads/images/{filename}"
        cursor.execute('''
            UPDATE fonctionnaires
            SET photo = ?
            WHERE id = ?
        ''', (photo_path, fonctionnaire_id))

        conn.commit()
        conn.close()

        return {
            "message": "Photo uploadée avec succès",
            "filename": filename,
            "fonctionnaire_id": fonctionnaire_id
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [UPLOAD] Erreur: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'upload: {str(e)}")

# ===== ENDPOINTS POUR LES DEMANDES =====

# Récupérer toutes les demandes (endpoint pour secrétaire/admin) - Utilise SQLite et inclut les documents
# DÉSACTIVÉ - Utilise maintenant le router demandes
# @app.get("/demandes/", response_model=List[DemandeResponse])
# ===== ENDPOINTS POUR LES DEMANDES =====
# Note: Les endpoints principaux sont maintenant gérés par le router demandes.py
# Les endpoints ci-dessous sont conservés pour compatibilité

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
                if user_data["id"] == int(user_id) and user_data["role"] == role:
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
    """Mettre à jour le statut d'une demande (admin/secrétaire seulement)"""
    # Utiliser la fonction d'authentification du router
    from routers.demandes import get_current_user_from_token
    
    try:
        current_user = get_current_user_from_token(authorization)
        
        # Vérifier les permissions (admin ou secrétaire)
        if current_user["role"].upper() not in ["ADMIN", "SECRETAIRE"]:
            raise HTTPException(status_code=403, detail="Accès refusé. Droits admin ou secrétaire requis.")
        
        print(f"✅ [DEBUG] Utilisateur autorisé: {current_user['email']} (rôle: {current_user['role']})")
        
    except HTTPException as e:
        print(f"❌ [DEBUG] Erreur authentification: {e.detail}")
        raise e
    except Exception as e:
        print(f"❌ [DEBUG] Erreur authentification: {e}")
        raise HTTPException(status_code=403, detail="Accès refusé. Droits admin ou secrétaire requis.")

    # Vérifier si la demande existe dans la base SQLite
    import sqlite3
    try:
        conn = sqlite3.connect('gestion_db.db')
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM demandes WHERE id = ?", (demande_id,))
        demande_data = cursor.fetchone()
        
        if not demande_data:
            conn.close()
            raise HTTPException(status_code=404, detail="Demande non trouvée")
        
        # Vérifier que le statut est valide
        valid_statuses = ["EN_ATTENTE", "APPROUVEE", "REJETEE"]
        if status_update.statut not in valid_statuses:
            conn.close()
            raise HTTPException(status_code=400, detail=f"Statut invalide. Valeurs autorisées: {valid_statuses}")
        
        # Mettre à jour la demande dans SQLite
        cursor.execute("""
            UPDATE demandes 
            SET statut = ?, commentaire_admin = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (status_update.statut, status_update.commentaire_admin or "", demande_id))
        
        conn.commit()
        
        # Récupérer la demande mise à jour
        cursor.execute("SELECT * FROM demandes WHERE id = ?", (demande_id,))
        updated_demande = cursor.fetchone()
        conn.close()
        
        print(f"✅ [DEBUG] Demande {demande_id} mise à jour: {status_update.statut}")
        
        # Retourner la demande mise à jour au format attendu
        return {
            "id": updated_demande[0],
            "user_id": updated_demande[1],
            "type_demande": updated_demande[2],
            "titre": updated_demande[3],
            "description": updated_demande[4],
            "date_debut": updated_demande[5],
            "date_fin": updated_demande[6],
            "statut": updated_demande[7],
            "commentaire_admin": updated_demande[8],
            "created_at": updated_demande[9],
            "updated_at": updated_demande[10]
        }
        
    except sqlite3.Error as e:
        print(f"❌ [DEBUG] Erreur SQLite: {e}")
        raise HTTPException(status_code=500, detail="Erreur base de données")

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
        if len(parts) >= 4 and (parts[3] == "admin" or (len(parts) >= 5 and parts[4] == "admin")):
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
async def get_dashboard_stats():
    """Obtenir les statistiques réelles pour le dashboard depuis la base SQLite"""
    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        # Compter les enseignants (avec JOIN pour s'assurer qu'ils ont un enregistrement dans la table enseignants)
        cursor.execute("""
            SELECT COUNT(*) as count
            FROM users u
            JOIN enseignants e ON u.id = e.user_id
            WHERE u.is_active = 1 AND u.role = 'ENSEIGNANT'
        """)
        enseignants_count = cursor.fetchone()['count']

        # Compter les fonctionnaires (avec JOIN pour s'assurer qu'ils ont un enregistrement dans la table fonctionnaires)
        cursor.execute("""
            SELECT COUNT(*) as count
            FROM users u
            JOIN fonctionnaires f ON u.id = f.user_id
            WHERE u.is_active = 1 AND u.role = 'FONCTIONNAIRE'
        """)
        fonctionnaires_count = cursor.fetchone()['count']

        # Compter les autres rôles directement depuis la table users
        cursor.execute("""
            SELECT COUNT(*) as count
            FROM users
            WHERE is_active = 1 AND role = 'SECRETAIRE'
        """)
        secretaires_count = cursor.fetchone()['count']

        cursor.execute("""
            SELECT COUNT(*) as count
            FROM users
            WHERE is_active = 1 AND role = 'ADMIN'
        """)
        admins_count = cursor.fetchone()['count']

        # Compter les demandes par statut
        cursor.execute("""
            SELECT statut, COUNT(*) as count
            FROM demandes
            GROUP BY statut
        """)
        demande_counts = {row['statut']: row['count'] for row in cursor.fetchall()}

        # Compter le total d'utilisateurs actifs
        cursor.execute("SELECT COUNT(*) as count FROM users WHERE is_active = 1")
        total_users = cursor.fetchone()['count']

        conn.close()

        # Retourner exactement les champs attendus par le frontend
        stats = {
            "totalUsers": total_users,
            "enseignants": enseignants_count,
            "fonctionnaires": fonctionnaires_count,
            "secretaires": secretaires_count,
            "admins": admins_count,
            "demandesEnAttente": demande_counts.get("EN_ATTENTE", 0),
            "demandesTraitees": demande_counts.get("APPROUVEE", 0) + demande_counts.get("REJETEE", 0)
        }

        print(f"📊 [DASHBOARD] Statistiques calculées: {stats}")
        return stats

    except Exception as e:
        print(f"❌ [DASHBOARD] Erreur: {str(e)}")
        # Retourner des valeurs par défaut en cas d'erreur
        return {
            "totalUsers": 0,
            "enseignants": 0,
            "fonctionnaires": 0,
            "secretaires": 0,
            "admins": 0,
            "demandesEnAttente": 0,
            "demandesTraitees": 0
        }

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
        if len(parts) >= 4 and (parts[3] == "admin" or (len(parts) >= 5 and parts[4] == "admin")):
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
    user_id = None
    if token.startswith("test_token_"):
        parts = token.split("_")
        if len(parts) >= 4:
            user_id = int(parts[2])

    if not user_id:
        raise HTTPException(status_code=401, detail="Token invalide")

    # Récupérer les données depuis la base de données
    from database import SessionLocal
    from models import Enseignant, User

    db = SessionLocal()
    try:
        # Récupérer l'utilisateur
        user = db.query(User).filter(User.id == user_id).first()
        if not user or user.role.value != "ENSEIGNANT":
            raise HTTPException(status_code=401, detail="Utilisateur non trouvé ou pas enseignant")

        # Récupérer les données enseignant
        enseignant = db.query(Enseignant).filter(Enseignant.user_id == user_id).first()

        if enseignant:
            return {
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "nom": user.nom,
                    "prenom": user.prenom,
                    "telephone": user.telephone,
                    "adresse": user.adresse,
                    "cin": user.cin,
                    "role": user.role.value,
                    "is_active": user.is_active,
                    "created_at": user.created_at.isoformat() if user.created_at else None
                },
                "enseignant": {
                    "id": enseignant.id,
                    "user_id": enseignant.user_id,
                    "specialite": enseignant.specialite or "",
                    "grade": enseignant.grade or "",

                    "photo": enseignant.photo  # Inclure la photo depuis la base de données
                }
            }
        else:
            # Si pas trouvé dans la table enseignants, créer une entrée
            return {
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "nom": user.nom,
                    "prenom": user.prenom,
                    "telephone": user.telephone,
                    "adresse": user.adresse,
                    "cin": user.cin,
                    "role": user.role.value,
                    "is_active": user.is_active,
                    "created_at": user.created_at.isoformat() if user.created_at else None
                },
                "enseignant": {
                    "id": None,
                    "user_id": user.id,
                    "specialite": "",
                    "grade": "",

                    "photo": None
                }            }
    finally:
        db.close()

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

    try:
        # Vérifier l'authentification
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Token manquant")

        token = authorization.replace("Bearer ", "")
        print(f"🔍 [UPLOAD] Token reçu: {token[:30]}...")

        # Vérifier si c'est un token de test ou un vrai JWT
        admin_user = None
        
        if token.startswith("test_token_"):
            # Logique pour les tokens de test
            parts = token.split("_")
            print(f"🔍 [UPLOAD] Token test parts: {parts}")
            if len(parts) >= 4 and (parts[3].lower() == "admin" or (len(parts) >= 5 and parts[4].lower() == "admin")):
                admin_user = {"role": "admin"}
                print(f"✅ [UPLOAD] Token admin test validé")
            elif any("admin" in part.lower() for part in parts):
                admin_user = {"role": "admin"}
                print(f"✅ [UPLOAD] Token admin test validé (fallback)")
        else:
            # Logique pour les vrais tokens JWT
            try:
                from auth import decode_jwt_token
                payload = decode_jwt_token(token)
                user_role = payload.get("role")
                user_id = payload.get("user_id")
                
                print(f"🔍 [UPLOAD] JWT décodé - Role: {user_role}, User ID: {user_id}")
                
                if user_role == "ADMIN":
                    admin_user = {"role": "admin", "user_id": user_id}
                    print(f"✅ [UPLOAD] Token JWT admin validé")
                else:
                    print(f"❌ [UPLOAD] Role insuffisant: {user_role}")
                    
            except Exception as jwt_error:
                print(f"❌ [UPLOAD] Erreur décodage JWT: {jwt_error}")

        if not admin_user:
            print(f"❌ [UPLOAD] Accès refusé pour token: {token[:30]}")
            raise HTTPException(status_code=403, detail="Accès refusé. Droits admin requis.")

        # Vérifier taille (5MB max)
        if hasattr(file, 'size') and file.size and file.size > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Fichier trop volumineux (max 5MB)")
        
        # Vérifier que l'enseignant existe dans la base de données
        from database import SessionLocal
        from models import Enseignant

        db = SessionLocal()
        try:
            enseignant = db.query(Enseignant).filter(Enseignant.id == enseignant_id).first()
            if not enseignant:
                raise HTTPException(status_code=404, detail="Enseignant non trouvé")

            # Supprimer ancienne photo si elle existe
            if enseignant.photo:
                old_photo_path = Path(f"uploads{enseignant.photo.replace('/uploads', '')}")
                if old_photo_path.exists():
                    try:
                        os.remove(old_photo_path)
                        print(f"🗑️ [UPLOAD] Ancienne photo supprimée: {old_photo_path}")
                    except Exception as e:
                        print(f"⚠️ [UPLOAD] Erreur suppression ancienne photo: {e}")

            # Sauvegarder nouvelle image
            photo_url = save_and_resize_image(file)
            print(f"💾 [UPLOAD] Nouvelle photo sauvegardée: {photo_url}")

            # Mettre à jour l'enseignant dans la base de données
            enseignant.photo = photo_url
            db.commit()
            db.refresh(enseignant)

            print(f"✅ [UPLOAD] Photo mise à jour dans la base de données pour enseignant {enseignant_id}")

            return {"message": "Photo uploadée avec succès", "photo_url": photo_url}

        finally:
            db.close()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")

# Endpoint pour créer une demande (solution directe)
@app.post("/demandes-direct")
async def create_demande_direct(
    demande_data: dict,
    authorization: str = Header(None)
):
    """Créer une nouvelle demande - endpoint direct avec authentification JWT fonctionnelle"""
    # Utiliser la même logique d'authentification que /auth/me mais avec support JWT
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Token manquant",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = authorization.replace("Bearer ", "")
    current_user = None

    # Essayer d'abord le JWT
    try:
        from jose import jwt, JWTError
        SECRET_KEY = "your-secret-key-here-change-in-production"  # Même clé que dans .env
        ALGORITHM = "HS256"

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")

        if email:
            # Chercher l'utilisateur par email dans TEST_USERS (fallback)
            for test_email, test_user_data in TEST_USERS.items():
                if test_user_data["email"] == email:
                    current_user = test_user_data
                    break
    except (JWTError, ImportError) as e:
        print(f"JWT decode failed: {e}, trying test token format")
        pass

    # Si JWT échoue, essayer le format test_token (pour compatibilité)
    if not current_user and token.startswith("test_token_"):
        parts = token.split("_")
        if len(parts) >= 3:
            user_id = parts[2]
            role = parts[3] if len(parts) > 3 else ""

            # Vérifier d'abord dans la base de données SQLite
            try:
                conn = get_sqlite_connection()
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM users WHERE id = ? AND role = ? AND is_active = 1",
                             (user_id, role.upper()))
                user_data = cursor.fetchone()
                conn.close()

                if user_data:
                    current_user = dict(user_data)
                else:
                    # Fallback vers les TEST_USERS pour la compatibilité
                    for email, user_data in TEST_USERS.items():
                        if str(user_data["id"]) == user_id and user_data["role"].upper() == role.upper():
                            current_user = user_data
                            break

            except Exception as e:
                # Fallback vers les TEST_USERS
                for email, user_data in TEST_USERS.items():
                    if str(user_data["id"]) == user_id and user_data["role"].upper() == role.upper():
                        current_user = user_data
                        break

    if not current_user:
        raise HTTPException(status_code=401, detail="Token invalide - utilisateur non trouvé")

    # Créer la demande
    global demande_id_counter
    from datetime import datetime

    # Sauvegarder dans la base SQLite
    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        # Insérer la nouvelle demande dans SQLite
        cursor.execute('''
            INSERT INTO demandes (user_id, type_demande, titre, description, date_debut, date_fin, statut, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'EN_ATTENTE', datetime('now'))
        ''', (
            current_user["id"],
            demande_data.get("type_demande", "ATTESTATION"),
            demande_data.get("titre", ""),
            demande_data.get("description", ""),
            demande_data.get("date_debut"),
            demande_data.get("date_fin")
        ))

        sqlite_demande_id = cursor.lastrowid
        conn.commit()
        conn.close()

        print(f"✅ Demande sauvegardée dans SQLite avec l'ID: {sqlite_demande_id}")

    except Exception as e:
        print(f"❌ Erreur lors de la sauvegarde SQLite: {e}")
        sqlite_demande_id = demande_id_counter

    # Créer aussi dans DEMANDES_DB pour compatibilité
    new_demande = {
        "id": sqlite_demande_id,
        "user_id": current_user["id"],
        "type_demande": demande_data.get("type_demande", "ATTESTATION"),
        "titre": demande_data.get("titre", ""),
        "description": demande_data.get("description", ""),
        "date_debut": demande_data.get("date_debut"),
        "date_fin": demande_data.get("date_fin"),
        "statut": "EN_ATTENTE",
        "commentaire_admin": "",
        "created_at": datetime.now().isoformat(),
        "user": {
            "id": current_user["id"],
            "email": current_user.get("email", ""),
            "nom": current_user.get("nom", ""),
            "prenom": current_user.get("prenom", ""),
            "role": current_user.get("role", "").lower(),
            "is_active": True,
            "created_at": datetime.now().isoformat()
        }
    }

    DEMANDES_DB[sqlite_demande_id] = new_demande
    demande_id_counter = max(demande_id_counter, sqlite_demande_id + 1)

    # Sauvegarder les données dans les fichiers
    save_all_data()

    return new_demande


# Fonction de connexion SQLite simple (fallback)
def get_sqlite_connection():
    """Obtenir une connexion SQLite directe pour debug"""
    conn = sqlite3.connect('gestion_db.db', timeout=20.0)
    conn.row_factory = sqlite3.Row
    # Activer le mode WAL pour éviter les locks
    conn.execute('PRAGMA journal_mode=WAL')
    return conn

# Endpoint de test simplifié pour récupérer les enseignants
@app.get("/users/enseignants/test")
async def get_enseignants_test():
    """Endpoint de test pour récupérer les enseignants avec SQLite direct"""
    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT
                e.id, e.user_id, e.specialite, e.grade, e.photo,
                u.nom, u.prenom, u.email, u.telephone, u.adresse, u.cin, u.is_active
            FROM enseignants e
            JOIN users u ON e.user_id = u.id
            WHERE u.role = 'ENSEIGNANT'
            ORDER BY u.nom, u.prenom
        ''')

        enseignants = []
        for row in cursor.fetchall():
            enseignant = {
                "id": row['id'],
                "user_id": row['user_id'],
                "specialite": row['specialite'],
                "grade": row['grade'],

                "photo": row['photo'],
                "user": {
                    "id": row['user_id'],
                    "nom": row['nom'],
                    "prenom": row['prenom'],
                    "email": row['email'],
                    "telephone": row['telephone'],
                    "adresse": row['adresse'],
                    "cin": row['cin'],
                    "is_active": bool(row['is_active']),
                    "role": "ENSEIGNANT"
                }
            }
            enseignants.append(enseignant)

        conn.close()
        return {"success": True, "count": len(enseignants), "data": enseignants}

    except Exception as e:
        return {"success": False, "error": str(e)}

# Endpoint temporaire pour créer des demandes (contournement du problème d'auth dans router)
@app.post("/demandes-temp")
async def create_demande_temp(
    demande_data: dict,
    authorization: str = Header(None)
):
    # Extraire les informations du token (même logique que /auth/me)
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")

        # Le token a le format: test_token_{user_id}_{role}
        if token.startswith("test_token_"):
            parts = token.split("_")
            if len(parts) >= 3:
                user_id = parts[2]
                role = parts[3] if len(parts) > 3 else ""

                # Vérifier d'abord dans la base de données SQLite

                try:
                    conn = get_sqlite_connection()
                    cursor = conn.cursor()
                    cursor.execute("SELECT * FROM users WHERE id = ? AND role = ? AND is_active = 1",
                                 (user_id, role.upper()))
                    user_data = cursor.fetchone()
                    conn.close()

                    if user_data:
                        current_user = dict(user_data)
                    else:
                        # Fallback vers TEST_USERS pour la compatibilité
                        current_user = None
                        for email, user_info in TEST_USERS.items():
                            if str(user_info["id"]) == user_id and user_info["role"].upper() == role.upper():
                                current_user = user_info
                                break

                except Exception as e:
                    print(f"Erreur lors de l'accès à la base de données: {e}")
                    # Fallback vers TEST_USERS en cas d'erreur
                    current_user = None
                    for email, user_info in TEST_USERS.items():
                        if str(user_info["id"]) == user_id and user_info["role"].upper() == role.upper():
                            current_user = user_info
                            break

                if not current_user:
                    raise HTTPException(status_code=401, detail="Utilisateur non trouvé")

                # Créer la demande
                global demande_id_counter
                from datetime import datetime

                new_demande = {
                    "id": demande_id_counter,
                    "user_id": current_user["id"],
                    "type_demande": demande_data.get("type_demande", "ATTESTATION"),
                    "titre": demande_data.get("titre", ""),
                    "description": demande_data.get("description", ""),
                    "date_debut": demande_data.get("date_debut"),
                    "date_fin": demande_data.get("date_fin"),
                    "statut": "EN_ATTENTE",
                    "commentaire_admin": None,
                    "created_at": datetime.now().isoformat(),
                    "user": {
                        "id": current_user["id"],
                        "email": current_user.get("email", ""),
                        "nom": current_user.get("nom", ""),
                        "prenom": current_user.get("prenom", ""),
                        "role": current_user.get("role", "").lower(),
                        "is_active": True,
                        "created_at": datetime.now().isoformat()
                    }
                }

                DEMANDES_DB[demande_id_counter] = new_demande
                demande_id_counter += 1

                # Sauvegarder les données dans les fichiers
                save_all_data()

                return new_demande

    # Si le token n'est pas valide, retourner une erreur
    raise HTTPException(
        status_code=401,
        detail="Token invalide ou manquant",
        headers={"WWW-Authenticate": "Bearer"}
    )

# Récupérer tous les utilisateurs (endpoint pour secrétaire/admin)
@app.get("/users")
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    authorization: str = Header(None)
):
    """Récupérer tous les utilisateurs depuis la base de données SQLite"""
    # Vérifier l'autorisation
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")

    token = authorization.replace("Bearer ", "")
    
    # Vérifier si c'est un admin ou secrétaire
    if not ("admin" in token.lower() or "secretaire" in token.lower() or token.startswith("test_token_")):
        raise HTTPException(status_code=403, detail="Droits insuffisants")

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        # Récupérer tous les utilisateurs avec leurs informations
        cursor.execute('''
            SELECT 
                u.id, u.nom, u.prenom, u.email, u.telephone, u.adresse, u.cin, 
                u.role, u.is_active, u.created_at,
                e.specialite, e.grade as enseignant_grade,
                f.service, f.poste, f.grade as fonctionnaire_grade
            FROM users u
            LEFT JOIN enseignants e ON u.id = e.user_id
            LEFT JOIN fonctionnaires f ON u.id = f.user_id
            WHERE u.is_active = 1
            ORDER BY u.nom, u.prenom
            LIMIT ? OFFSET ?
        ''', (limit, skip))

        users = []
        for row in cursor.fetchall():
            user = {
                "id": row['id'],
                "nom": row['nom'],
                "prenom": row['prenom'],
                "email": row['email'],
                "telephone": row['telephone'] or 'Non renseigné',
                "adresse": row['adresse'] or 'Non renseigné',
                "cin": row['cin'] or 'Non renseigné',
                "role": row['role'].lower(),
                "is_active": bool(row['is_active']),
                "created_at": row['created_at'],
                "type": row['role'].lower()
            }
            
            # Ajouter les informations spécifiques selon le rôle
            if row['role'] == 'ENSEIGNANT':
                user['specialite'] = row['specialite']
                user['grade'] = row['enseignant_grade']
            elif row['role'] == 'FONCTIONNAIRE':
                user['service'] = row['service']
                user['poste'] = row['poste']
                user['grade'] = row['fonctionnaire_grade']
            
            users.append(user)

        # Compter le total
        cursor.execute("SELECT COUNT(*) FROM users WHERE is_active = 1")
        total = cursor.fetchone()[0]

        conn.close()
        
        return {
            "users": users,
            "total": total,
            "skip": skip,
            "limit": limit
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur base de données: {str(e)}")

# Endpoint temporaire pour tester les demandes (sans authentification)

# Endpoint pour récupérer les demandes d'un utilisateur
@app.get("/users/{user_id}/demandes")
async def get_user_demandes_direct(
    user_id: int,
    authorization: str = Header(None),
    skip: int = 0,
    limit: int = 100
):
    """Récupérer les demandes d'un utilisateur spécifique"""
    
    # Debug: log du token reçu
    print(f"🔍 [DEBUG] User {user_id} demandes - Authorization header: {authorization}")
    print(f"🔍 [DEBUG] User {user_id} demandes - Request URL appelée")
    
    # Vérification d'authentification basique
    if not authorization or not authorization.startswith("Bearer "):
        print(f"❌ [DEBUG] Token manquant ou format incorrect")
        raise HTTPException(status_code=401, detail="Token manquant")
    
    token = authorization.split(" ")[1]
    print(f"🔍 [DEBUG] Token extrait: {token[:50]}...")
    print(f"🔍 [DEBUG] Token complet: {token}")
    
    # Support pour test_token (temporaire)
    if token.startswith("test_token_"):
        # Parse test_token format: test_token_{user_id}_{role}
        parts = token.split("_")
        print(f"🔍 [DEBUG] Token parts: {parts}")
        if len(parts) >= 3:
            try:
                token_user_id = int(parts[2])
                role = parts[3] if len(parts) > 3 else "USER"
                print(f"🔍 [DEBUG] Token user_id: {token_user_id}, role: {role}")
            except (ValueError, IndexError):
                # Si le format est test_token_1_ADMIN, extraire différemment
                if "ADMIN" in token:
                    token_user_id = 1
                    role = "ADMIN"
                    print(f"🔍 [DEBUG] Token ADMIN détecté: user_id={token_user_id}, role={role}")
                elif "SECRETAIRE" in token:
                    token_user_id = 1  
                    role = "SECRETAIRE"
                    print(f"🔍 [DEBUG] Token SECRETAIRE détecté: user_id={token_user_id}, role={role}")
                else:
                    print(f"❌ [DEBUG] Token format invalide")
                    raise HTTPException(status_code=401, detail="Token invalide")
            
            # Vérifier les permissions - Admin et Secrétaire ont accès à tout
            if role not in ["ADMIN", "SECRETAIRE"] and token_user_id != user_id:
                print(f"❌ [DEBUG] Accès refusé - role:{role}, token_user_id:{token_user_id}, requested_user_id:{user_id}")
                raise HTTPException(status_code=403, detail="Accès refusé")
            else:
                print(f"✅ [DEBUG] Accès autorisé - role:{role}, token_user_id:{token_user_id}, requested_user_id:{user_id}")
        else:
            print(f"❌ [DEBUG] Token format invalide - pas assez de parties")
            raise HTTPException(status_code=401, detail="Token invalide")
    else:
        # TODO: Ajouter validation JWT réelle si nécessaire
        print(f"🔍 [DEBUG] Token non-test détecté, passage sans validation")
    
    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()
        
        # Vérifier que l'utilisateur existe
        cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
        # Récupérer les demandes de l'utilisateur
        cursor.execute("""
            SELECT id, user_id, type_demande, titre, description, statut, 
                   date_debut, date_fin, created_at, updated_at
            FROM demandes 
            WHERE user_id = ? 
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        """, (user_id, limit, skip))
        
        demandes = cursor.fetchall()
        conn.close()
        
        print(f"🔍 [DEBUG] Demandes trouvées pour user_id {user_id}: {len(demandes)}")
        for demande in demandes:
            print(f"   - Demande ID: {demande[0]}, Titre: {demande[3]}, Statut: {demande[5]}")
        
        # Formater les résultats
        result = []
        for demande in demandes:
            result.append({
                "id": demande[0],
                "user_id": demande[1],
                "type_demande": demande[2],
                "titre": demande[3],
                "description": demande[4],
                "statut": demande[5],
                "date_debut": demande[6],
                "date_fin": demande[7],
                "created_at": demande[8],
                "updated_at": demande[9]
            })
        
        return result
        
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur base de données: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")

