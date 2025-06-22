from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, Header
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import uuid
from pathlib import Path
import sqlite3

# Import conditionnel pour Pillow
try:
    from PIL import Image
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False

from database import get_db
from models import User, UserRole, Enseignant, Demande
from schemas import EnseignantComplete, DemandeBase, Demande as DemandeSchema

router = APIRouter(prefix="/enseignants", tags=["Enseignants"])

# Configuration pour l'upload de photos
UPLOAD_DIR = Path("uploads/images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def get_sqlite_connection():
    """Obtenir une connexion à la base de données SQLite"""
    conn = sqlite3.connect('gestion_db.db')
    conn.row_factory = sqlite3.Row  # Pour accéder aux colonnes par nom
    return conn

def get_current_user_from_token(authorization: str = Header(None)):
    """Extraire l'utilisateur actuel depuis le token d'autorisation"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")

    token = authorization.replace("Bearer ", "")

    # Le token a le format: test_token_{user_id}_{role}
    if token.startswith("test_token_"):
        parts = token.split("_")
        if len(parts) >= 3:
            user_id = parts[2]
            role = parts[3] if len(parts) > 3 else ""

            # Vérifier dans la base de données SQLite
            try:
                conn = get_sqlite_connection()
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM users WHERE id = ? AND role = ?", (user_id, role.upper()))
                user_data = cursor.fetchone()
                conn.close()

                if user_data:
                    return dict(user_data)

            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Erreur base de données: {str(e)}")

    raise HTTPException(status_code=401, detail="Token invalide")

@router.get("/profile", response_model=EnseignantComplete)
async def get_profile(
    authorization: str = Header(None)
):
    """Récupérer le profil complet de l'enseignant connecté"""
    current_user = get_current_user_from_token(authorization)

    if current_user["role"] != "ENSEIGNANT":
        raise HTTPException(status_code=403, detail="Accès réservé aux enseignants")

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        # Récupérer les informations de l'enseignant
        cursor.execute('''
            SELECT e.id, e.user_id, e.specialite, e.grade, e.photo,
                   u.nom, u.prenom, u.email, u.telephone, u.adresse, u.cin, u.is_active
            FROM enseignants e
            JOIN users u ON e.user_id = u.id
            WHERE u.id = ?
        ''', (current_user["id"],))

        enseignant_data = cursor.fetchone()
        conn.close()

        if not enseignant_data:
            raise HTTPException(status_code=404, detail="Profil enseignant non trouvé")

        # Construire l'URL de la photo si elle existe
        photo_url = None
        if enseignant_data["photo"]:
            # Le chemin dans la base commence par /uploads/, on enlève le / initial
            photo_path_str = enseignant_data["photo"]
            if photo_path_str.startswith("/"):
                photo_path_str = photo_path_str[1:]  # Enlever le / initial

            photo_path = Path(photo_path_str)
            if photo_path.exists():
                photo_url = f"/{photo_path_str}"  # Remettre le / pour l'URL
            else:
                # Fallback: juste retourner l'URL même si le fichier n'existe pas
                photo_url = enseignant_data["photo"]

        return {
            "id": enseignant_data["id"],
            "user_id": enseignant_data["user_id"],
            "specialite": enseignant_data["specialite"],
            "grade": enseignant_data["grade"],
            "photo": photo_url,
            "user": {
                "id": enseignant_data["user_id"],
                "nom": enseignant_data["nom"],
                "prenom": enseignant_data["prenom"],
                "email": enseignant_data["email"],
                "telephone": enseignant_data["telephone"],
                "adresse": enseignant_data["adresse"],
                "cin": enseignant_data["cin"],
                "is_active": bool(enseignant_data["is_active"]),
                "role": "ENSEIGNANT"
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

@router.put("/profile", response_model=EnseignantComplete)
async def update_profile(
    specialite: Optional[str] = Form(None),
    grade: Optional[str] = Form(None),
    nom: Optional[str] = Form(None),
    prenom: Optional[str] = Form(None),
    telephone: Optional[str] = Form(None),
    adresse: Optional[str] = Form(None),
    authorization: str = Header(None)
):
    """Mettre à jour le profil de l'enseignant connecté"""
    current_user = get_current_user_from_token(authorization)

    if current_user["role"] != "ENSEIGNANT":
        raise HTTPException(status_code=403, detail="Accès réservé aux enseignants")

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        # Vérifier que l'enseignant existe
        cursor.execute("SELECT id FROM enseignants WHERE user_id = ?", (current_user["id"],))
        enseignant_data = cursor.fetchone()
        if not enseignant_data:
            raise HTTPException(status_code=404, detail="Profil enseignant non trouvé")

        # Mettre à jour les informations utilisateur
        user_updates = []
        user_params = []
        if nom is not None:
            user_updates.append("nom = ?")
            user_params.append(nom)
        if prenom is not None:
            user_updates.append("prenom = ?")
            user_params.append(prenom)
        if telephone is not None:
            user_updates.append("telephone = ?")
            user_params.append(telephone)
        if adresse is not None:
            user_updates.append("adresse = ?")
            user_params.append(adresse)

        if user_updates:
            user_params.append(current_user["id"])
            cursor.execute(f"UPDATE users SET {', '.join(user_updates)} WHERE id = ?", user_params)

        # Mettre à jour les informations spécifiques enseignant
        enseignant_updates = []
        enseignant_params = []
        if specialite is not None:
            enseignant_updates.append("specialite = ?")
            enseignant_params.append(specialite)
        if grade is not None:
            enseignant_updates.append("grade = ?")
            enseignant_params.append(grade)

        if enseignant_updates:
            enseignant_params.append(current_user["id"])
            cursor.execute(f"UPDATE enseignants SET {', '.join(enseignant_updates)} WHERE user_id = ?", enseignant_params)

        conn.commit()

        # Récupérer les données mises à jour
        cursor.execute('''
            SELECT e.id, e.user_id, e.specialite, e.grade, e.photo,
                   u.nom, u.prenom, u.email, u.telephone, u.adresse, u.cin, u.is_active
            FROM enseignants e
            JOIN users u ON e.user_id = u.id
            WHERE u.id = ?
        ''', (current_user["id"],))

        updated_data = cursor.fetchone()
        conn.close()

        return {
            "id": updated_data["id"],
            "user_id": updated_data["user_id"],
            "specialite": updated_data["specialite"],
            "grade": updated_data["grade"],
            "photo": updated_data["photo"],
            "user": {
                "id": updated_data["user_id"],
                "nom": updated_data["nom"],
                "prenom": updated_data["prenom"],
                "email": updated_data["email"],
                "telephone": updated_data["telephone"],
                "adresse": updated_data["adresse"],
                "cin": updated_data["cin"],
                "is_active": bool(updated_data["is_active"]),
                "role": "ENSEIGNANT"
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la mise à jour: {str(e)}")

@router.post("/profile/upload-photo")
async def upload_photo(
    photo: UploadFile = File(...),
    authorization: str = Header(None)
):
    """Télécharger une photo de profil pour l'enseignant connecté"""
    current_user = get_current_user_from_token(authorization)

    if current_user["role"] != "ENSEIGNANT":
        raise HTTPException(status_code=403, detail="Accès réservé aux enseignants")

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        # Vérifier que l'enseignant existe
        cursor.execute("SELECT id FROM enseignants WHERE user_id = ?", (current_user["id"],))
        enseignant_data = cursor.fetchone()
        if not enseignant_data:
            raise HTTPException(status_code=404, detail="Profil enseignant non trouvé")

        enseignant_id = enseignant_data["id"]

        # Vérifier le type de fichier
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
        if photo.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Type de fichier non autorisé. Formats acceptés: JPEG, PNG, GIF"
            )

        # Vérifier la taille du fichier (max 5MB)
        if photo.size > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Fichier trop volumineux (max 5MB)")

        # Générer un nom de fichier unique
        file_extension = photo.filename.split(".")[-1].lower()
        unique_filename = f"enseignant_{enseignant_id}_{int(uuid.uuid4().hex[:8], 16)}.{file_extension}"
        file_path = UPLOAD_DIR / unique_filename

        # Sauvegarder le fichier
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)

        # Redimensionner l'image si Pillow est disponible
        if PILLOW_AVAILABLE:
            try:
                with Image.open(file_path) as img:
                    # Redimensionner à 400x400 max en gardant les proportions
                    img.thumbnail((400, 400), Image.Resampling.LANCZOS)
                    img.save(file_path, optimize=True, quality=85)
            except Exception as e:
                print(f"Erreur lors du redimensionnement: {e}")
                # Continuer même si le redimensionnement échoue

        # Récupérer l'ancienne photo pour la supprimer
        cursor.execute("SELECT photo FROM enseignants WHERE id = ?", (enseignant_id,))
        old_photo_data = cursor.fetchone()

        # Supprimer l'ancienne photo si elle existe
        if old_photo_data and old_photo_data["photo"]:
            old_photo_path = Path(old_photo_data["photo"])
            if old_photo_path.exists():
                try:
                    old_photo_path.unlink()
                except Exception as e:
                    print(f"Erreur lors de la suppression de l'ancienne photo: {e}")

        # Mettre à jour le chemin de la photo dans la base de données
        cursor.execute("UPDATE enseignants SET photo = ? WHERE id = ?", (str(file_path), enseignant_id))
        conn.commit()
        conn.close()

        return {
            "message": "Photo téléchargée avec succès",
            "photo_url": f"/uploads/images/{unique_filename}"
        }

    except Exception as e:
        # Nettoyer le fichier en cas d'erreur
        if 'file_path' in locals() and file_path.exists():
            try:
                file_path.unlink()
            except:
                pass
        raise HTTPException(status_code=500, detail=f"Erreur lors du téléchargement: {str(e)}")

@router.get("/profil")  # Endpoint avec le nom français pour compatibilité
async def get_profil(
    authorization: str = Header(None)
):
    """Récupérer le profil complet de l'enseignant connecté (endpoint français)"""
    return await get_profile(authorization)

@router.delete("/profile/photo")
async def delete_photo(
    authorization: str = Header(None)
):
    """Supprimer la photo de profil de l'enseignant connecté"""
    current_user = get_current_user_from_token(authorization)

    if current_user["role"] != "ENSEIGNANT":
        raise HTTPException(status_code=403, detail="Accès réservé aux enseignants")

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        # Récupérer les informations de l'enseignant et sa photo actuelle
        cursor.execute("SELECT id, photo FROM enseignants WHERE user_id = ?", (current_user["id"],))
        enseignant_data = cursor.fetchone()
        if not enseignant_data:
            raise HTTPException(status_code=404, detail="Profil enseignant non trouvé")

        if not enseignant_data["photo"]:
            raise HTTPException(status_code=404, detail="Aucune photo à supprimer")

        # Supprimer le fichier physique
        photo_path = Path(enseignant_data["photo"])
        if photo_path.exists():
            photo_path.unlink()

        # Supprimer la référence dans la base de données
        cursor.execute("UPDATE enseignants SET photo = NULL WHERE id = ?", (enseignant_data["id"],))
        conn.commit()
        conn.close()

        return {"message": "Photo supprimée avec succès"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}")
