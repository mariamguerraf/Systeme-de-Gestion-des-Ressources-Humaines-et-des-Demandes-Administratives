from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_active_user
from models import User, UserRole
from schemas import User as UserSchema, UserUpdate

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
