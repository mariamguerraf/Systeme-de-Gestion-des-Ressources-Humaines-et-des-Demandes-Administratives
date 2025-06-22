from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_active_user
from models import User, Demande
from schemas import Demande as DemandeSchema, DemandeCreate, DemandeUpdate

router = APIRouter(prefix="/demandes", tags=["Demandes"])

@router.post("/", response_model=DemandeSchema)
async def create_demande(
    demande: DemandeCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_demande = Demande(**demande.dict(), user_id=current_user.id)
    db.add(db_demande)
    db.commit()
    db.refresh(db_demande)
    return db_demande

@router.get("/", response_model=List[DemandeSchema])
async def get_demandes(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role in ["ADMIN", "SECRETAIRE"]:
        # Admin et secrétaire voient toutes les demandes
        demandes = db.query(Demande).offset(skip).limit(limit).all()
    else:
        # Utilisateurs normaux voient seulement leurs demandes
        demandes = db.query(Demande).filter(
            Demande.user_id == current_user.id
        ).offset(skip).limit(limit).all()
    return demandes

@router.get("/{demande_id}", response_model=DemandeSchema)
async def get_demande(
    demande_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    demande = db.query(Demande).filter(Demande.id == demande_id).first()
    if not demande:
        raise HTTPException(status_code=404, detail="Demande non trouvée")

    # Vérifier les permissions
    if current_user.role not in ["ADMIN", "SECRETAIRE"] and demande.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")

    return demande

@router.put("/{demande_id}", response_model=DemandeSchema)
async def update_demande(
    demande_id: int,
    demande_update: DemandeUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    demande = db.query(Demande).filter(Demande.id == demande_id).first()
    if not demande:
        raise HTTPException(status_code=404, detail="Demande non trouvée")

    # Vérifier les permissions
    if current_user.role not in ["ADMIN", "SECRETAIRE"] and demande.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")

    # Seuls admin et secrétaire peuvent changer le statut
    if demande_update.statut and current_user.role not in ["ADMIN", "SECRETAIRE"]:
        raise HTTPException(status_code=403, detail="Seuls les administrateurs peuvent changer le statut")

    update_data = demande_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(demande, field, value)

    db.commit()
    db.refresh(demande)
    return demande

@router.delete("/{demande_id}")
async def delete_demande(
    demande_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    demande = db.query(Demande).filter(Demande.id == demande_id).first()
    if not demande:
        raise HTTPException(status_code=404, detail="Demande non trouvée")

    # Vérifier les permissions
    if current_user.role not in ["ADMIN", "SECRETAIRE"] and demande.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")

    db.delete(demande)
    db.commit()
    return {"message": "Demande supprimée avec succès"}
