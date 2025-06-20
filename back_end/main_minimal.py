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
from pathlib import Path
import sqlite3

# Imports pour la base de données
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User, UserRole, Enseignant, Fonctionnaire, Demande, DemandeStatus
from schemas import EnseignantComplete

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
            user_data['telephone'],
            user_data['adresse'],
            user_data['cin'],
            f"hashed_{user_data['password']}"
        ))

        user_id = cursor.lastrowid

        # Insérer les données enseignant
        enseignant_info = {
            'specialite': enseignant_data.get('specialite'),
            'grade': enseignant_data.get('grade'),
            'etablissement': enseignant_data.get('etablissement')
        }

        cursor.execute('''
            INSERT INTO enseignants (user_id, specialite, grade, etablissement)
            VALUES (?, ?, ?, ?)
        ''', (
            user_id,
            enseignant_info['specialite'],
            enseignant_info['grade'],
            enseignant_info['etablissement']
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

    # Vérifier si c'est un admin (simplifié)
    if not ("admin" in token.lower() or token.startswith("test_token_")):
        raise HTTPException(status_code=403, detail="Accès refusé. Droits admin requis.")

    # Récupérer tous les enseignants depuis SQLite directement
    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT
                e.id, e.user_id, e.specialite, e.grade, e.etablissement, e.photo,
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
                "etablissement": row['etablissement'],
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

        # Vérifier que l'enseignant existe
        cursor.execute("SELECT user_id FROM enseignants WHERE id = ?", (enseignant_id,))
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Enseignant non trouvé")

        user_id = result['user_id']

        # Mettre à jour les données utilisateur
        cursor.execute('''
            UPDATE users
            SET nom = ?, prenom = ?, telephone = ?, adresse = ?, cin = ?
            WHERE id = ?
        ''', (
            enseignant_data.get('nom'),
            enseignant_data.get('prenom'),
            enseignant_data.get('telephone'),
            enseignant_data.get('adresse'),
            enseignant_data.get('cin'),
            user_id
        ))

        # Mettre à jour les données enseignant
        cursor.execute('''
            UPDATE enseignants
            SET specialite = ?, grade = ?, etablissement = ?
            WHERE id = ?
        ''', (
            enseignant_data.get('specialite'),
            enseignant_data.get('grade'),
            enseignant_data.get('etablissement'),            enseignant_id
        ))

        conn.commit()

        # Récupérer l'enseignant modifié pour le retourner
        cursor.execute('''
            SELECT
                e.id, e.user_id, e.specialite, e.grade, e.etablissement, e.photo,
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
            "etablissement": row['etablissement'],
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

    token = authorization.replace("Bearer ", "")    # Vérifier si c'est un admin (simplifié)
    if not ("admin" in token.lower() or token.startswith("test_token_")):
        raise HTTPException(status_code=403, detail="Droits admin requis")

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

        # Mettre à jour les données utilisateur (incluant email si modifié)
        cursor.execute('''
            UPDATE users
            SET nom = ?, prenom = ?, email = ?, telephone = ?, adresse = ?, cin = ?
            WHERE id = ?
        ''', (
            fonctionnaire_data.get('nom'),
            fonctionnaire_data.get('prenom'),
            fonctionnaire_data.get('email'),
            fonctionnaire_data.get('telephone'),
            fonctionnaire_data.get('adresse'),
            fonctionnaire_data.get('cin'),
            user_id
        ))
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
        # Vérifier l'authentification admin
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Token manquant")

        token = authorization.replace("Bearer ", "")

        # Vérifier si c'est un admin
        if not ("admin" in token.lower() or token.startswith("test_token_")):
            raise HTTPException(status_code=403, detail="Droits admin requis")

        # Vérifier taille (5MB max)
        if hasattr(file, 'size') and file.size and file.size > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Fichier trop volumineux (max 5MB)")        # Vérifier que le fonctionnaire existe dans SQLite
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

        # Créer le dossier uploads s'il n'existe pas
        upload_dir = Path("uploads")
        upload_dir.mkdir(exist_ok=True)

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
        cursor.execute('''
            UPDATE fonctionnaires
            SET photo = ?
            WHERE id = ?
        ''', (str(filename), fonctionnaire_id))

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
                    "etablissement": enseignant.etablissement or "",
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
                    "etablissement": "",
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
            raise HTTPException(status_code=400, detail="Fichier trop volumineux (max 5MB)")        # Vérifier que l'enseignant existe dans la base de données
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
                e.id, e.user_id, e.specialite, e.grade, e.etablissement, e.photo,
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
                "etablissement": row['etablissement'],
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main_minimal:app", host="0.0.0.0", port=8000, reload=True)
