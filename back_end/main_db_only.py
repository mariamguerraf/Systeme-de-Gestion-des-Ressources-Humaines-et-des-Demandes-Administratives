#!/usr/bin/env python3

from fastapi import FastAPI, HTTPException, File, UploadFile, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import sqlite3
import os
from pathlib import Path
import uuid
from PIL import Image
import io

app = FastAPI(title="Gestion Admin API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Créer le dossier pour les images
UPLOAD_DIR = Path("uploads/images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Monter le dossier static pour servir les images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

def get_db_connection():
    """Obtenir une connexion à la base de données"""
    conn = sqlite3.connect('gestion_db.db')
    conn.row_factory = sqlite3.Row  # Pour avoir les résultats comme des dictionnaires
    return conn

def save_and_resize_image(file: UploadFile) -> str:
    """Sauvegarder et redimensionner une image"""
    try:
        # Lire le fichier
        content = file.file.read()
        
        # Ouvrir avec PIL pour redimensionner
        image = Image.open(io.BytesIO(content))
        
        # Convertir en RGB si nécessaire
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        # Redimensionner (maximum 300x300 en gardant les proportions)
        image.thumbnail((300, 300), Image.Resampling.LANCZOS)
        
        # Générer un nom unique
        file_extension = file.filename.split('.')[-1].lower() if file.filename else 'jpg'
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Sauvegarder
        image.save(file_path, format='JPEG', quality=85)
        
        # Retourner l'URL relative
        return f"/uploads/images/{unique_filename}"
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur traitement image: {str(e)}")

# Endpoints d'authentification (simplifiés pour les tests)
@app.post("/auth/login")
async def login(credentials: dict):
    """Endpoint de login simplifié pour les tests"""
    email = credentials.get('email', '')
    password = credentials.get('password', '')
    
    # Vérification simple pour les tests
    if email == 'admin@test.com':
        return {
            "access_token": "test_token_1_admin",
            "token_type": "bearer",
            "user": {
                "id": 1,
                "email": email,
                "role": "ADMIN",
                "nom": "Admin",
                "prenom": "System"
            }
        }
    elif email.endswith('@test.com'):
        return {
            "access_token": f"test_token_user_{email.split('@')[0]}",
            "token_type": "bearer",
            "user": {
                "id": 2,
                "email": email,
                "role": "ENSEIGNANT",
                "nom": "Test",
                "prenom": "User"
            }
        }
    else:
        raise HTTPException(status_code=401, detail="Identifiants incorrects")

@app.get("/auth/me")
async def get_current_user(authorization: str = Header(None)):
    """Endpoint pour récupérer l'utilisateur actuel"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")
    
    token = authorization.replace("Bearer ", "")
    
    # Vérification simple du token
    if token == "test_token_1_admin":
        return {
            "id": 1,
            "email": "admin@test.com",
            "role": "ADMIN",
            "nom": "Admin",
            "prenom": "System"
        }
    elif token.startswith("test_token_user_"):
        return {
            "id": 2,
            "email": "enseignant1@test.com",
            "role": "ENSEIGNANT",
            "nom": "Test",
            "prenom": "User"
        }
    else:
        raise HTTPException(status_code=401, detail="Token invalide")

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Hello from FastAPI!", "status": "success"}

# Statistiques pour le dashboard
@app.get("/admin/stats")
async def get_admin_stats():
    """Statistiques du dashboard depuis la base de données"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Compter les enseignants
        cursor.execute("SELECT COUNT(*) as count FROM enseignants")
        total_enseignants = cursor.fetchone()['count']
        
        # Compter les fonctionnaires
        cursor.execute("SELECT COUNT(*) as count FROM fonctionnaires")
        total_fonctionnaires = cursor.fetchone()['count']
        
        # Compter les demandes
        cursor.execute("SELECT COUNT(*) as count FROM demandes")
        total_demandes = cursor.fetchone()['count']
        
        # Compter les demandes en attente
        cursor.execute("SELECT COUNT(*) as count FROM demandes WHERE statut = 'EN_ATTENTE'")
        demandes_en_attente = cursor.fetchone()['count']
        
        conn.close()
        
        return {
            "total_enseignants": total_enseignants,
            "total_fonctionnaires": total_fonctionnaires,
            "total_demandes": total_demandes,
            "demandes_en_attente": demandes_en_attente
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur base de données: {str(e)}")

# Endpoint alternatif pour /dashboard/stats (pour compatibilité frontend)
@app.get("/dashboard/stats")
async def get_dashboard_stats():
    """Alias pour /admin/stats - compatibilité frontend"""
    return await get_admin_stats()

# Liste des enseignants
@app.get("/users/enseignants")
async def get_enseignants_public():
    """Récupérer la liste des enseignants (version publique pour debug)"""
    try:
        conn = get_db_connection()
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

# Profil d'un enseignant
@app.get("/users/enseignants/profile/{user_id}")
async def get_enseignant_profile(user_id: int):
    """Récupérer le profil d'un enseignant depuis la base de données"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                e.id, e.user_id, e.specialite, e.grade, e.etablissement, e.photo,
                u.nom, u.prenom, u.email, u.telephone, u.adresse, u.cin, u.is_active
            FROM enseignants e
            JOIN users u ON e.user_id = u.id
            WHERE u.id = ? AND u.role = 'ENSEIGNANT'
        ''', (user_id,))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Enseignant non trouvé")
        
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
        
        conn.close()
        return enseignant
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur base de données: {str(e)}")

# Créer un nouvel enseignant
@app.post("/users/enseignants")
async def create_enseignant(enseignant_data: dict):
    """Créer un nouvel enseignant dans la base de données"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Extraire les données utilisateur
        user_data = {
            'email': enseignant_data.get('email'),
            'nom': enseignant_data.get('nom'),
            'prenom': enseignant_data.get('prenom'),
            'telephone': enseignant_data.get('telephone'),
            'adresse': enseignant_data.get('adresse'),
            'cin': enseignant_data.get('cin'),
            'password': enseignant_data.get('password', 'default_password')  # En production, hasher le mot de passe
        }
        
        # Vérifier que l'email n'existe pas déjà
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
            f"hashed_{user_data['password']}"  # En production, utiliser un vrai hash
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

# Modifier un enseignant existant
@app.put("/users/enseignants/{enseignant_id}")
async def update_enseignant(enseignant_id: int, enseignant_data: dict):
    """Modifier un enseignant existant dans la base de données"""
    try:
        conn = get_db_connection()
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
            enseignant_data.get('etablissement'),
            enseignant_id
        ))
        
        conn.commit()
        conn.close()
        
        return {"message": "Enseignant modifié avec succès"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la modification: {str(e)}")

# Supprimer un enseignant
@app.delete("/users/enseignants/{enseignant_id}")
async def delete_enseignant(enseignant_id: int):
    """Supprimer un enseignant de la base de données"""
    try:
        conn = get_db_connection()
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

# Upload photo enseignant
@app.post("/users/enseignants/{enseignant_id}/upload-photo")
async def upload_enseignant_photo(
    enseignant_id: int,
    file: UploadFile = File(...),
    authorization: str = Header(None)
):
    """Upload de photo d'enseignant avec sauvegarde en base de données"""
    try:
        # Vérifier l'authentification (simplifié pour les tests)
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Token manquant")
        
        token = authorization.replace("Bearer ", "")
        
        # Vérification simple du token admin
        if not ("admin" in token.lower() or token.startswith("test_token_")):
            raise HTTPException(status_code=403, detail="Droits admin requis")
        
        # Vérifier que l'enseignant existe
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM enseignants WHERE id = ?", (enseignant_id,))
        enseignant = cursor.fetchone()
        if not enseignant:
            raise HTTPException(status_code=404, detail="Enseignant non trouvé")
        
        # Récupérer l'ancienne photo pour la supprimer
        cursor.execute("SELECT photo FROM enseignants WHERE id = ?", (enseignant_id,))
        old_photo = cursor.fetchone()
        if old_photo and old_photo['photo']:
            old_photo_path = Path(f"uploads{old_photo['photo'].replace('/uploads', '')}")
            if old_photo_path.exists():
                try:
                    os.remove(old_photo_path)
                except:
                    pass
        
        # Sauvegarder la nouvelle image
        photo_url = save_and_resize_image(file)
        
        # Mettre à jour la base de données
        cursor.execute(
            "UPDATE enseignants SET photo = ? WHERE id = ?",
            (photo_url, enseignant_id)
        )
        conn.commit()
        conn.close()
        
        return {"message": "Photo uploadée avec succès", "photo_url": photo_url}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main_db_only:app", host="0.0.0.0", port=8000, reload=True)
