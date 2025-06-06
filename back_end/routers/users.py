from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_active_user, get_password_hash
from models import User, UserRole, Enseignant
from schemas import User as UserSchema, UserUpdate, EnseignantCreateComplete, EnseignantComplete

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=List[UserSchema])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Seuls admin et secrétaire peuvent voir tous les utilisateurs
    if current_user.role not in [UserRole.ADMIN, UserRole.SECRETAIRE]:
        raise HTTPException(status_code=403, detail="Accès refusé")

    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserSchema)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Vérifier les permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.SECRETAIRE] and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Accès refusé")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user

@router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Vérifier les permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.SECRETAIRE] and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Accès refusé")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Seuls les admins peuvent supprimer des utilisateurs
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Accès refusé")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    db.delete(user)
    db.commit()
    return {"message": "Utilisateur supprimé avec succès"}

@router.get("/role/{role}", response_model=List[UserSchema])
async def get_users_by_role(
    role: UserRole,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Seuls admin et secrétaire peuvent filtrer par rôle
    if current_user.role not in [UserRole.ADMIN, UserRole.SECRETAIRE]:
        raise HTTPException(status_code=403, detail="Accès refusé")

    users = db.query(User).filter(User.role == role).all()
    return users

@router.post("/enseignants", response_model=EnseignantComplete)
async def create_enseignant(
    enseignant_data: EnseignantCreateComplete,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Seuls les admins peuvent créer des enseignants
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Seuls les administrateurs peuvent créer des enseignants")

    # Vérifier si l'email existe déjà
    existing_user = db.query(User).filter(User.email == enseignant_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Un utilisateur avec cet email existe déjà")

    # Vérifier si le CIN existe déjà (s'il est fourni)
    if enseignant_data.cin:
        existing_cin = db.query(User).filter(User.cin == enseignant_data.cin).first()
        if existing_cin:
            raise HTTPException(status_code=400, detail="Un utilisateur avec ce CIN existe déjà")

    try:
        # Commencer une transaction
        # 1. Créer l'utilisateur
        hashed_password = get_password_hash(enseignant_data.password)
        
        new_user = User(
            email=enseignant_data.email,
            nom=enseignant_data.nom,
            prenom=enseignant_data.prenom,
            telephone=enseignant_data.telephone,
            adresse=enseignant_data.adresse,
            cin=enseignant_data.cin,
            hashed_password=hashed_password,
            role=UserRole.ENSEIGNANT,
            is_active=True
        )
        
        db.add(new_user)
        db.flush()  # Pour obtenir l'ID de l'utilisateur
        
        # 2. Créer l'enregistrement enseignant
        new_enseignant = Enseignant(
            user_id=new_user.id,
            specialite=enseignant_data.specialite,
            grade=enseignant_data.grade,
            etablissement=enseignant_data.etablissement
        )
        
        db.add(new_enseignant)
        db.commit()  # Valider la transaction
        
        # Rafraîchir les objets pour obtenir toutes les données
        db.refresh(new_user)
        db.refresh(new_enseignant)
        
        return EnseignantComplete(
            id=new_enseignant.id,
            user_id=new_enseignant.user_id,
            specialite=new_enseignant.specialite,
            grade=new_enseignant.grade,
            etablissement=new_enseignant.etablissement,
            user=new_user
        )
        
    except Exception as e:
        db.rollback()  # Annuler la transaction en cas d'erreur
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création de l'enseignant: {str(e)}")
