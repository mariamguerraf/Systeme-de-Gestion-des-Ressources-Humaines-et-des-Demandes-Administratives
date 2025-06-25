from fastapi import APIRouter, Depends, HTTPException, Header, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
import sqlite3
import os
import shutil
import uuid
import time
from pathlib import Path
from database import get_db
from models import User, Demande
from schemas import Demande as DemandeSchema, DemandeCreate, DemandeUpdate, DemandeDocument as DemandeDocumentSchema

router = APIRouter(prefix="/demandes", tags=["Demandes"])

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
    print(f"🔍 [DEBUG] Token reçu: '{token}'")

    # Le token a le format: test_token_{user_id}_{role}
    if token.startswith("test_token_"):
        parts = token.split("_")
        print(f"🔍 [DEBUG] Token parts: {parts}")
        if len(parts) >= 3:
            user_id = parts[2]
            role = parts[3] if len(parts) > 3 else ""
            print(f"🔍 [DEBUG] Recherche user_id={user_id}, role={role}")

            # Vérifier d'abord dans la base de données SQLite
            try:
                conn = get_sqlite_connection()
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM users WHERE id = ? AND role = ? AND is_active = 1", (user_id, role.upper()))
                user_data = cursor.fetchone()
                conn.close()

                if user_data:
                    print(f"✅ [DEBUG] Utilisateur trouvé dans SQLite: {user_data['email']}")
                    # Convertir la Row en dictionnaire
                    user_dict = {
                        'id': user_data['id'],
                        'email': user_data['email'],
                        'nom': user_data['nom'],
                        'prenom': user_data['prenom'],
                        'role': user_data['role'],
                        'is_active': user_data['is_active']
                    }
                    return user_dict
                else:
                    print(f"❌ [DEBUG] Utilisateur non trouvé dans SQLite avec id={user_id}, role={role.upper()}")

            except Exception as e:
                print(f"❌ [DEBUG] Erreur lors de la récupération de l'utilisateur: {e}")

            # Fallback vers TEST_USERS pour compatibilité
            try:
                # Importer les données de test directement
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
                    }
                }
                
                print(f"🔄 [DEBUG] Recherche dans TEST_USERS...")
                for email, user_data in DEFAULT_TEST_USERS.items():
                    print(f"🔍 [DEBUG] Comparaison: TEST_USERS[{email}] id={user_data['id']}, role={user_data['role']}")
                    if str(user_data["id"]) == user_id and user_data["role"].upper() == role.upper():
                        print(f"✅ [DEBUG] Utilisateur trouvé dans TEST_USERS: {email}")
                        # Ajouter les champs manquants pour la compatibilité
                        return {
                            "id": user_data["id"],
                            "email": user_data["email"],
                            "nom": user_data["nom"],
                            "prenom": user_data["prenom"],
                            "role": user_data["role"].upper(),
                            "is_active": True,
                            "created_at": "2025-01-01 00:00:00",
                            "telephone": "",
                            "adresse": "",
                            "cin": ""
                        }
                print(f"❌ [DEBUG] Utilisateur non trouvé dans TEST_USERS")
            except Exception as e:
                print(f"❌ [DEBUG] Erreur lors de la vérification dans TEST_USERS: {e}")

    print(f"❌ [DEBUG] Token invalide final")
    raise HTTPException(status_code=401, detail="Token invalide")

@router.post("/", response_model=DemandeSchema)
async def create_demande(
    demande: DemandeCreate,
    authorization: str = Header(None)
):
    """Créer une nouvelle demande"""
    current_user = get_current_user_from_token(authorization)

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        # Insérer la nouvelle demande
        cursor.execute('''
            INSERT INTO demandes (user_id, type_demande, titre, description, date_debut, date_fin, statut, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'EN_ATTENTE', datetime('now'))
        ''', (
            current_user["id"],
            demande.type_demande.value if hasattr(demande.type_demande, 'value') else str(demande.type_demande),
            demande.titre,
            demande.description,
            demande.date_debut,
            demande.date_fin
        ))

        demande_id = cursor.lastrowid
        conn.commit()

        # Récupérer la demande créée avec les informations utilisateur
        cursor.execute('''
            SELECT d.*, u.nom, u.prenom, u.email, u.role, u.is_active, u.created_at as user_created_at
            FROM demandes d
            JOIN users u ON d.user_id = u.id
            WHERE d.id = ?
        ''', (demande_id,))

        demande_data = cursor.fetchone()
        conn.close()

        return {
            "id": demande_data["id"],
            "user_id": demande_data["user_id"],
            "type_demande": demande_data["type_demande"],
            "titre": demande_data["titre"],
            "description": demande_data["description"] or "",
            "date_debut": demande_data["date_debut"],
            "date_fin": demande_data["date_fin"],
            "statut": demande_data["statut"],
            "commentaire_admin": demande_data["commentaire_admin"] or "",
            "created_at": demande_data["created_at"],
            "updated_at": demande_data["updated_at"],
            "user": {
                "id": demande_data["user_id"],
                "nom": demande_data["nom"],
                "prenom": demande_data["prenom"],
                "email": demande_data["email"],
                "role": demande_data["role"],
                "is_active": bool(demande_data["is_active"]),
                "created_at": demande_data["user_created_at"] or "2025-01-01T00:00:00"
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création: {str(e)}")

# Endpoint spécialisé pour les demandes d'attestation
@router.post("/attestation", response_model=DemandeSchema)
async def create_demande_attestation(
    titre: str,
    description: Optional[str] = None,
    authorization: str = Header(None)
):
    """Créer une demande d'attestation"""
    current_user = get_current_user_from_token(authorization)

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO demandes (user_id, type_demande, titre, description, statut, created_at)
            VALUES (?, 'ATTESTATION', ?, ?, 'EN_ATTENTE', datetime('now'))
        ''', (current_user["id"], titre, description))

        demande_id = cursor.lastrowid
        conn.commit()

        # Récupérer la demande créée
        cursor.execute('''
            SELECT d.*, u.nom, u.prenom, u.email, u.role
            FROM demandes d
            JOIN users u ON d.user_id = u.id
            WHERE d.id = ?
        ''', (demande_id,))

        demande_data = cursor.fetchone()
        conn.close()

        return {
            "id": demande_data["id"],
            "user_id": demande_data["user_id"],
            "type_demande": demande_data["type_demande"],
            "titre": demande_data["titre"],
            "description": demande_data["description"],
            "date_debut": demande_data["date_debut"],
            "date_fin": demande_data["date_fin"],
            "statut": demande_data["statut"],
            "commentaire_admin": demande_data["commentaire_admin"],
            "created_at": demande_data["created_at"],
            "updated_at": demande_data["updated_at"],
            "user": {
                "id": demande_data["user_id"],
                "nom": demande_data["nom"],
                "prenom": demande_data["prenom"],
                "email": demande_data["email"],
                "role": demande_data["role"]
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création: {str(e)}")

# Endpoint spécialisé pour les demandes d'ordre de mission
@router.post("/ordre-mission", response_model=DemandeSchema)
async def create_demande_ordre_mission(
    titre: str,
    description: Optional[str] = None,
    date_debut: Optional[str] = None,
    date_fin: Optional[str] = None,
    authorization: str = Header(None)
):
    """Créer une demande d'ordre de mission"""
    current_user = get_current_user_from_token(authorization)

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO demandes (user_id, type_demande, titre, description, date_debut, date_fin, statut, created_at)
            VALUES (?, 'ORDRE_MISSION', ?, ?, ?, ?, 'EN_ATTENTE', datetime('now'))
        ''', (current_user["id"], titre, description, date_debut, date_fin))

        demande_id = cursor.lastrowid
        conn.commit()

        # Récupérer la demande créée
        cursor.execute('''
            SELECT d.*, u.nom, u.prenom, u.email, u.role
            FROM demandes d
            JOIN users u ON d.user_id = u.id
            WHERE d.id = ?
        ''', (demande_id,))

        demande_data = cursor.fetchone()
        conn.close()

        return {
            "id": demande_data["id"],
            "user_id": demande_data["user_id"],
            "type_demande": demande_data["type_demande"],
            "titre": demande_data["titre"],
            "description": demande_data["description"],
            "date_debut": demande_data["date_debut"],
            "date_fin": demande_data["date_fin"],
            "statut": demande_data["statut"],
            "commentaire_admin": demande_data["commentaire_admin"],
            "created_at": demande_data["created_at"],
            "updated_at": demande_data["updated_at"],
            "user": {
                "id": demande_data["user_id"],
                "nom": demande_data["nom"],
                "prenom": demande_data["prenom"],
                "email": demande_data["email"],
                "role": demande_data["role"]
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création: {str(e)}")

# Endpoint spécialisé pour les demandes d'heures supplémentaires
@router.post("/heures-sup", response_model=DemandeSchema)
async def create_demande_heures_sup(
    titre: str,
    description: Optional[str] = None,
    date_debut: Optional[str] = None,
    date_fin: Optional[str] = None,
    authorization: str = Header(None)
):
    """Créer une demande d'heures supplémentaires"""
    current_user = get_current_user_from_token(authorization)

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO demandes (user_id, type_demande, titre, description, date_debut, date_fin, statut, created_at)
            VALUES (?, 'HEURES_SUP', ?, ?, ?, ?, 'EN_ATTENTE', datetime('now'))
        ''', (current_user["id"], titre, description, date_debut, date_fin))

        demande_id = cursor.lastrowid
        conn.commit()

        # Récupérer la demande créée
        cursor.execute('''
            SELECT d.*, u.nom, u.prenom, u.email, u.role
            FROM demandes d
            JOIN users u ON d.user_id = u.id
            WHERE d.id = ?
        ''', (demande_id,))

        demande_data = cursor.fetchone()
        conn.close()

        return {
            "id": demande_data["id"],
            "user_id": demande_data["user_id"],
            "type_demande": demande_data["type_demande"],
            "titre": demande_data["titre"],
            "description": demande_data["description"],
            "date_debut": demande_data["date_debut"],
            "date_fin": demande_data["date_fin"],
            "statut": demande_data["statut"],
            "commentaire_admin": demande_data["commentaire_admin"],
            "created_at": demande_data["created_at"],
            "updated_at": demande_data["updated_at"],
            "user": {
                "id": demande_data["user_id"],
                "nom": demande_data["nom"],
                "prenom": demande_data["prenom"],
                "email": demande_data["email"],
                "role": demande_data["role"]
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création: {str(e)}")

@router.get("/test")
async def test_demandes():
    """Endpoint de test simple pour vérifier si le routeur fonctionne"""
    return {"message": "Test réussi", "status": "OK"}

@router.get("/test-auth")
async def test_auth(authorization: str = Header(None)):
    """Endpoint de test avec authentification"""
    try:
        user = get_current_user_from_token(authorization)
        return {"message": "Auth réussie", "user": user}
    except Exception as e:
        return {"message": "Auth échouée", "error": str(e)}

@router.get("/")
async def get_demandes(
    skip: int = 0,
    limit: int = 100,
    authorization: str = Header(None)
):
    """Récupérer les demandes selon le rôle de l'utilisateur"""
    print(f"🔍 [DEBUG] get_demandes appelé avec authorization: {authorization}")
    
    try:
        current_user = get_current_user_from_token(authorization)
        print(f"🔍 [DEBUG] Utilisateur courant: {current_user}")
    except Exception as e:
        print(f"❌ [DEBUG] Erreur lors de l'authentification: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Erreur d'authentification: {str(e)}")

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        if current_user["role"] in ["ADMIN", "SECRETAIRE"]:
            print(f"🔍 [DEBUG] Récupération de toutes les demandes pour {current_user['role']}")
            # Admin et secrétaire voient toutes les demandes
            cursor.execute('''
                SELECT d.id, d.user_id, d.type_demande, d.titre, d.description, 
                       d.date_debut, d.date_fin, d.statut, d.commentaire_admin, 
                       d.created_at, d.updated_at,
                       u.nom, u.prenom, u.email, u.role
                FROM demandes d
                JOIN users u ON d.user_id = u.id
                ORDER BY d.created_at DESC
                LIMIT ? OFFSET ?
            ''', (limit, skip))
        else:
            print(f"🔍 [DEBUG] Récupération des demandes pour l'utilisateur {current_user['id']}")
            # Utilisateurs normaux voient seulement leurs demandes
            cursor.execute('''
                SELECT d.id, d.user_id, d.type_demande, d.titre, d.description,
                       d.date_debut, d.date_fin, d.statut, d.commentaire_admin,
                       d.created_at, d.updated_at,
                       u.nom, u.prenom, u.email, u.role
                FROM demandes d
                JOIN users u ON d.user_id = u.id
                WHERE d.user_id = ?
                ORDER BY d.created_at DESC
                LIMIT ? OFFSET ?
            ''', (current_user["id"], limit, skip))

        demandes_data = cursor.fetchall()
        print(f"🔍 [DEBUG] Nombre de demandes trouvées: {len(demandes_data)}")
        conn.close()

        demandes_list = []
        for demande in demandes_data:
            try:
                # Conversion simple sans validation Pydantic
                demande_dict = {
                    "id": int(demande["id"]) if demande["id"] else 0,
                    "user_id": int(demande["user_id"]) if demande["user_id"] else 0,
                    "type_demande": str(demande["type_demande"]) if demande["type_demande"] else "",
                    "titre": str(demande["titre"]) if demande["titre"] else "",
                    "description": str(demande["description"]) if demande["description"] else "",
                    "date_debut": str(demande["date_debut"]) if demande["date_debut"] else None,
                    "date_fin": str(demande["date_fin"]) if demande["date_fin"] else None,
                    "statut": str(demande["statut"]) if demande["statut"] else "EN_ATTENTE",
                    "commentaire_admin": str(demande["commentaire_admin"]) if demande["commentaire_admin"] else "",
                    "created_at": str(demande["created_at"]) if demande["created_at"] else "",
                    "updated_at": str(demande["updated_at"]) if demande["updated_at"] else "",
                    "user": {
                        "id": int(demande["user_id"]) if demande["user_id"] else 0,
                        "nom": str(demande["nom"]) if demande["nom"] else "",
                        "prenom": str(demande["prenom"]) if demande["prenom"] else "",
                        "email": str(demande["email"]) if demande["email"] else "",
                        "role": str(demande["role"]) if demande["role"] else ""
                    }
                }
                demandes_list.append(demande_dict)
            except Exception as e:
                print(f"❌ [DEBUG] Erreur lors du traitement de la demande {demande.get('id', 'unknown')}: {str(e)}")
                continue

        print(f"🔍 [DEBUG] Liste des demandes formatée: {len(demandes_list)} demandes")
        return demandes_list

    except Exception as e:
        print(f"❌ [DEBUG] Erreur dans get_demandes: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

@router.get("/user/me", response_model=List[DemandeSchema])
async def get_my_demandes(
    skip: int = 0,
    limit: int = 100,
    authorization: str = Header(None)
):
    """Récupérer les demandes de l'utilisateur connecté"""
    current_user = get_current_user_from_token(authorization)

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        # Récupérer seulement les demandes de l'utilisateur connecté
        cursor.execute('''
            SELECT d.*, u.nom, u.prenom, u.email, u.role, u.is_active, u.created_at as user_created_at
            FROM demandes d
            JOIN users u ON d.user_id = u.id
            WHERE d.user_id = ?
            ORDER BY d.created_at DESC
            LIMIT ? OFFSET ?
        ''', (current_user["id"], limit, skip))

        demandes_data = cursor.fetchall()
        conn.close()

        demandes_list = []
        for demande in demandes_data:
            demandes_list.append({
                "id": demande["id"],
                "user_id": demande["user_id"],
                "type_demande": demande["type_demande"],
                "titre": demande["titre"],
                "description": demande["description"],
                "date_debut": demande["date_debut"],
                "date_fin": demande["date_fin"],
                "statut": demande["statut"],
                "commentaire_admin": demande["commentaire_admin"],
                "created_at": demande["created_at"],
                "updated_at": demande["updated_at"],
                "user": {
                    "id": demande["user_id"],
                    "nom": demande["nom"],
                    "prenom": demande["prenom"],
                    "email": demande["email"],
                    "role": demande["role"],
                    "is_active": bool(demande["is_active"]),
                    "created_at": demande["user_created_at"] or "2025-01-01T00:00:00"
                }
            })

        return demandes_list

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

@router.get("/debug-sql")
async def debug_sql_demandes(authorization: str = Header(None)):
    """Debug de la requête SQL des demandes"""
    try:
        current_user = get_current_user_from_token(authorization)
        print(f"🔍 [DEBUG] Utilisateur: {current_user}")
        
        conn = get_sqlite_connection()
        cursor = conn.cursor()
        
        # Test simple de la requête
        cursor.execute("SELECT COUNT(*) as count FROM demandes")
        count = cursor.fetchone()['count']
        print(f"🔍 [DEBUG] Total demandes: {count}")
        
        # Requête complète
        cursor.execute('''
            SELECT d.id, d.titre, d.statut, u.nom, u.prenom 
            FROM demandes d
            JOIN users u ON d.user_id = u.id
            ORDER BY d.created_at DESC
            LIMIT 3
        ''')
        demandes = cursor.fetchall()
        conn.close()
        
        result = []
        for demande in demandes:
            result.append({
                "id": demande["id"],
                "titre": demande["titre"],
                "statut": demande["statut"],
                "utilisateur": f"{demande['prenom']} {demande['nom']}"
            })
        
        return {
            "count": count,
            "demandes": result,
            "user": current_user
        }
        
    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }

@router.get("/{demande_id}", response_model=DemandeSchema)
async def get_demande(
    demande_id: int,
    authorization: str = Header(None)
):
    """Récupérer une demande spécifique"""
    current_user = get_current_user_from_token(authorization)

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT d.*, u.nom, u.prenom, u.email, u.role
            FROM demandes d
            JOIN users u ON d.user_id = u.id
            WHERE d.id = ?
        ''', (demande_id,))

        demande_data = cursor.fetchone()
        conn.close()

        if not demande_data:
            raise HTTPException(status_code=404, detail="Demande non trouvée")

        # Vérifier les permissions
        if current_user["role"] not in ["ADMIN", "SECRETAIRE"] and demande_data["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Accès refusé")

        return {
            "id": demande_data["id"],
            "user_id": demande_data["user_id"],
            "type_demande": demande_data["type_demande"],
            "titre": demande_data["titre"],
            "description": demande_data["description"],
            "date_debut": demande_data["date_debut"],
            "date_fin": demande_data["date_fin"],
            "statut": demande_data["statut"],
            "commentaire_admin": demande_data["commentaire_admin"],
            "created_at": demande_data["created_at"],
            "updated_at": demande_data["updated_at"],
            "user": {
                "id": demande_data["user_id"],
                "nom": demande_data["nom"],
                "prenom": demande_data["prenom"],
                "email": demande_data["email"],
                "role": demande_data["role"]
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

@router.put("/{demande_id}", response_model=DemandeSchema)
async def update_demande(
    demande_id: int,
    demande_update: DemandeUpdate,
    authorization: str = Header(None)
):
    """Mettre à jour une demande"""
    current_user = get_current_user_from_token(authorization)

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        # Vérifier que la demande existe
        cursor.execute("SELECT user_id FROM demandes WHERE id = ?", (demande_id,))
        demande_data = cursor.fetchone()
        if not demande_data:
            raise HTTPException(status_code=404, detail="Demande non trouvée")

        # Vérifier les permissions
        if current_user["role"] not in ["ADMIN", "SECRETAIRE"] and demande_data["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Accès refusé")

        # Seuls admin et secrétaire peuvent changer le statut
        if demande_update.statut and current_user["role"] not in ["ADMIN", "SECRETAIRE"]:
            raise HTTPException(status_code=403, detail="Seuls les administrateurs peuvent changer le statut")

        # Préparer les mises à jour
        updates = []
        params = []

        if demande_update.titre is not None:
            updates.append("titre = ?")
            params.append(demande_update.titre)
        if demande_update.description is not None:
            updates.append("description = ?")
            params.append(demande_update.description)
        if demande_update.date_debut is not None:
            updates.append("date_debut = ?")
            params.append(demande_update.date_debut)
        if demande_update.date_fin is not None:
            updates.append("date_fin = ?")
            params.append(demande_update.date_fin)
        if demande_update.statut is not None:
            updates.append("statut = ?")
            params.append(demande_update.statut.value if hasattr(demande_update.statut, 'value') else str(demande_update.statut))
        if demande_update.commentaire_admin is not None:
            updates.append("commentaire_admin = ?")
            params.append(demande_update.commentaire_admin)

        if updates:
            updates.append("updated_at = datetime('now')")
            params.append(demande_id)

            cursor.execute(f"UPDATE demandes SET {', '.join(updates)} WHERE id = ?", params)
            conn.commit()

        # Récupérer la demande mise à jour
        cursor.execute('''
            SELECT d.*, u.nom, u.prenom, u.email, u.role
            FROM demandes d
            JOIN users u ON d.user_id = u.id
            WHERE d.id = ?
        ''', (demande_id,))

        updated_data = cursor.fetchone()
        conn.close()

        return {
            "id": updated_data["id"],
            "user_id": updated_data["user_id"],
            "type_demande": updated_data["type_demande"],
            "titre": updated_data["titre"],
            "description": updated_data["description"],
            "date_debut": updated_data["date_debut"],
            "date_fin": updated_data["date_fin"],
            "statut": updated_data["statut"],
            "commentaire_admin": updated_data["commentaire_admin"],
            "created_at": updated_data["created_at"],
            "updated_at": updated_data["updated_at"],
            "user": {
                "id": updated_data["user_id"],
                "nom": updated_data["nom"],
                "prenom": updated_data["prenom"],
                "email": updated_data["email"],
                "role": updated_data["role"]
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la mise à jour: {str(e)}")

@router.delete("/{demande_id}")
async def delete_demande(
    demande_id: int,
    authorization: str = Header(None)
):
    """Supprimer une demande"""
    current_user = get_current_user_from_token(authorization)

    try:
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        # Vérifier que la demande existe
        cursor.execute("SELECT user_id FROM demandes WHERE id = ?", (demande_id,))
        demande_data = cursor.fetchone()
        if not demande_data:
            raise HTTPException(status_code=404, detail="Demande non trouvée")

        # Vérifier les permissions
        if current_user["role"] not in ["ADMIN", "SECRETAIRE"] and demande_data["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Accès refusé")

        cursor.execute("DELETE FROM demandes WHERE id = ?", (demande_id,))
        conn.commit()
        conn.close()

        return {"message": "Demande supprimée avec succès"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}")

# Endpoints pour l'upload de documents
@router.post("/{demande_id}/upload-documents")
async def upload_documents_to_demande(
    demande_id: int,
    files: List[UploadFile] = File(...),
    authorization: str = Header(None)
):
    """Upload de documents pour une demande spécifique"""
    
    # Vérifier l'authentification
    current_user = get_current_user_from_token(authorization)
    
    # Vérifier que la demande existe et appartient à l'utilisateur
    conn = get_sqlite_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM demandes 
        WHERE id = ? AND user_id = ?
    """, (demande_id, current_user["id"]))
    
    demande = cursor.fetchone()
    if not demande:
        conn.close()
        raise HTTPException(status_code=404, detail="Demande non trouvée ou accès non autorisé")
    
    # Vérifier que la demande est du bon type (HEURES_SUP ou ORDRE_MISSION)
    if demande["type_demande"] not in ["HEURES_SUP", "ORDRE_MISSION"]:
        conn.close()
        raise HTTPException(status_code=400, detail="Upload de documents non autorisé pour ce type de demande")
    
    # Créer le dossier de destination
    upload_dir = Path("uploads/demandes")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    uploaded_files = []
    
    try:
        for file in files:
            if not file.filename:
                continue
                
            # Vérifier la taille du fichier (5MB max)
            content = await file.read()
            if len(content) > 5 * 1024 * 1024:  # 5MB
                raise HTTPException(status_code=400, detail=f"Fichier {file.filename} trop volumineux (max 5MB)")
            
            # Vérifier le type de fichier
            allowed_types = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']
            file_extension = Path(file.filename).suffix.lower()
            if file_extension not in allowed_types:
                raise HTTPException(status_code=400, detail=f"Type de fichier non autorisé: {file.filename}")
            
            # Générer un nom de fichier unique
            unique_filename = f"demande_{demande_id}_{int(time.time())}_{uuid.uuid4().hex[:8]}{file_extension}"
            file_path = upload_dir / unique_filename
            
            # Sauvegarder le fichier
            with open(file_path, "wb") as f:
                f.write(content)
            
            # Enregistrer dans la base de données
            cursor.execute("""
                INSERT INTO demande_documents 
                (demande_id, filename, original_filename, file_path, file_size, content_type)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                demande_id,
                unique_filename,
                file.filename,
                str(file_path),
                len(content),
                file.content_type
            ))
            
            uploaded_files.append({
                "filename": unique_filename,
                "original_filename": file.filename,
                "file_size": len(content),
                "content_type": file.content_type
            })
        
        conn.commit()
        conn.close()
        
        return {
            "message": f"{len(uploaded_files)} fichier(s) uploadé(s) avec succès",
            "files": uploaded_files
        }
        
    except Exception as e:
        conn.rollback()
        conn.close()
        # Nettoyer les fichiers uploadés en cas d'erreur
        for file_info in uploaded_files:
            try:
                os.remove(upload_dir / file_info["filename"])
            except:
                pass
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'upload: {str(e)}")

@router.get("/{demande_id}/documents")
async def get_demande_documents(
    demande_id: int,
    authorization: str = Header(None)
):
    """Récupérer la liste des documents d'une demande"""
    
    current_user = get_current_user_from_token(authorization)
    
    conn = get_sqlite_connection()
    cursor = conn.cursor()
    
    # Vérifier l'accès à la demande
    cursor.execute("""
        SELECT * FROM demandes 
        WHERE id = ? AND (user_id = ? OR ? IN ('ADMIN', 'SECRETAIRE'))
    """, (demande_id, current_user["id"], current_user["role"]))
    
    demande = cursor.fetchone()
    if not demande:
        conn.close()
        raise HTTPException(status_code=404, detail="Demande non trouvée ou accès non autorisé")
    
    # Récupérer les documents
    cursor.execute("""
        SELECT * FROM demande_documents 
        WHERE demande_id = ?
        ORDER BY uploaded_at DESC
    """, (demande_id,))
    
    documents = cursor.fetchall()
    conn.close()
    
    return [
        {
            "id": doc["id"],
            "filename": doc["filename"],
            "original_filename": doc["original_filename"],
            "file_size": doc["file_size"],
            "content_type": doc["content_type"],
            "uploaded_at": doc["uploaded_at"]
        }
        for doc in documents
    ]

@router.delete("/{demande_id}/documents/{document_id}")
async def delete_demande_document(
    demande_id: int,
    document_id: int,
    authorization: str = Header(None)
):
    """Supprimer un document d'une demande"""
    
    current_user = get_current_user_from_token(authorization)
    
    conn = get_sqlite_connection()
    cursor = conn.cursor()
    
    # Vérifier l'accès à la demande
    cursor.execute("""
        SELECT * FROM demandes 
        WHERE id = ? AND user_id = ?
    """, (demande_id, current_user["id"]))
    
    demande = cursor.fetchone()
    if not demande:
        conn.close()
        raise HTTPException(status_code=404, detail="Demande non trouvée ou accès non autorisé")
    
    # Récupérer le document
    cursor.execute("""
        SELECT * FROM demande_documents 
        WHERE id = ? AND demande_id = ?
    """, (document_id, demande_id))
    
    document = cursor.fetchone()
    if not document:
        conn.close()
        raise HTTPException(status_code=404, detail="Document non trouvé")
    
    try:
        # Supprimer le fichier physique
        if os.path.exists(document["file_path"]):
            os.remove(document["file_path"])
        
        # Supprimer l'enregistrement de la base de données
        cursor.execute("""
            DELETE FROM demande_documents 
            WHERE id = ?
        """, (document_id,))
        
        conn.commit()
        conn.close()
        
        return {"message": "Document supprimé avec succès"}
        
    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}")

@router.get("/debug-sql")
async def debug_sql_demandes(authorization: str = Header(None)):
    """Debug de la requête SQL des demandes"""
    try:
        current_user = get_current_user_from_token(authorization)
        print(f"🔍 [DEBUG] Utilisateur: {current_user}")
        
        conn = get_sqlite_connection()
        cursor = conn.cursor()
        
        # Test simple de la requête
        cursor.execute("SELECT COUNT(*) as count FROM demandes")
        count = cursor.fetchone()['count']
        print(f"🔍 [DEBUG] Total demandes: {count}")
        
        # Requête complète
        cursor.execute('''
            SELECT d.id, d.titre, d.statut, u.nom, u.prenom 
            FROM demandes d
            JOIN users u ON d.user_id = u.id
            ORDER BY d.created_at DESC
            LIMIT 3
        ''')
        demandes = cursor.fetchall()
        conn.close()
        
        result = []
        for demande in demandes:
            result.append({
                "id": demande["id"],
                "titre": demande["titre"],
                "statut": demande["statut"],
                "utilisateur": f"{demande['prenom']} {demande['nom']}"
            })
        
        return {
            "count": count,
            "demandes": result,
            "user": current_user
        }
        
    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }

@router.get("/count")
async def count_demandes(authorization: str = Header(None)):
    """Compter les demandes (endpoint simple pour debug)"""
    try:
        user = get_current_user_from_token(authorization)
        conn = get_sqlite_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) as count FROM demandes")
        count = cursor.fetchone()['count']
        conn.close()
        
        return {"count": count, "user_role": user["role"]}
    except Exception as e:
        return {"error": str(e)}
