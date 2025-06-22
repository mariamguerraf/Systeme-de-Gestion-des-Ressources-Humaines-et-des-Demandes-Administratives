from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_active_user, get_password_hash
from models import User, UserRole, Enseignant
from schemas import User as UserSchema, UserUpdate, EnseignantCreateComplete, EnseignantUpdateComplete, EnseignantComplete, EnseignantUpdateComplete

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
            grade=enseignant_data.grade
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
            user=new_user
        )

    except Exception as e:
        db.rollback()  # Annuler la transaction en cas d'erreur
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création de l'enseignant: {str(e)}")

@router.put("/enseignants/{enseignant_id}", response_model=EnseignantComplete)
async def update_enseignant(
    enseignant_id: int,
    enseignant_data: EnseignantUpdateComplete,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Seuls les admins peuvent modifier des enseignants
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Seuls les administrateurs peuvent modifier des enseignants")

    # Vérifier si l'enseignant existe
    enseignant = db.query(Enseignant).filter(Enseignant.id == enseignant_id).first()
    if not enseignant:
        raise HTTPException(status_code=404, detail="Enseignant non trouvé")

    # Récupérer l'utilisateur associé
    user = db.query(User).filter(User.id == enseignant.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur associé non trouvé")

    try:
        # Commencer une transaction
        update_data = enseignant_data.dict(exclude_unset=True)

        # Séparer les champs utilisateur des champs enseignant
        user_fields = ['email', 'nom', 'prenom', 'telephone', 'adresse', 'cin', 'password']
        enseignant_fields = ['specialite', 'grade', 'photo']

        # Mettre à jour les champs utilisateur
        for field in user_fields:
            if field in update_data:
                if field == 'password':
                    # Gérer le mot de passe spécialement
                    if update_data[field] and update_data[field] != 'unchanged':
                        user.hashed_password = get_password_hash(update_data[field])
                elif field == 'email':
                    # Vérifier l'unicité de l'email
                    if update_data[field] != user.email:
                        existing_user = db.query(User).filter(User.email == update_data[field]).first()
                        if existing_user:
                            raise HTTPException(status_code=400, detail="Un utilisateur avec cet email existe déjà")
                        user.email = update_data[field]
                elif field == 'cin':
                    # Vérifier l'unicité du CIN
                    if update_data[field] != user.cin:
                        existing_cin = db.query(User).filter(User.cin == update_data[field]).first()
                        if existing_cin:
                            raise HTTPException(status_code=400, detail="Un utilisateur avec ce CIN existe déjà")
                        user.cin = update_data[field]
                else:
                    setattr(user, field, update_data[field])

        # Mettre à jour les champs enseignant
        for field in enseignant_fields:
            if field in update_data:
                setattr(enseignant, field, update_data[field])

        db.commit()  # Valider la transaction

        # Rafraîchir les objets pour obtenir toutes les données
        db.refresh(user)
        db.refresh(enseignant)

        return EnseignantComplete(
            id=enseignant.id,
            user_id=enseignant.user_id,
            specialite=enseignant.specialite,
            grade=enseignant.grade,
            photo=enseignant.photo,
            user=user
        )

    except Exception as e:
        db.rollback()  # Annuler la transaction en cas d'erreur
        raise HTTPException(status_code=500, detail=f"Erreur lors de la modification de l'enseignant: {str(e)}")

@router.get("/enseignants", response_model=List[EnseignantComplete])
async def get_enseignants(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Seuls admin et secrétaire peuvent voir la liste des enseignants
    if current_user.role not in [UserRole.ADMIN, UserRole.SECRETAIRE]:
        raise HTTPException(status_code=403, detail="Accès refusé")

    enseignants = db.query(Enseignant).join(User).all()
    return [EnseignantComplete(
        id=ens.id,
        user_id=ens.user_id,
        specialite=ens.specialite,
        grade=ens.grade,
        photo=ens.photo,
        user=ens.user
    ) for ens in enseignants]

@router.delete("/enseignants/{enseignant_id}")
async def delete_enseignant(
    enseignant_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Seuls les admins peuvent supprimer des enseignants
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Seuls les administrateurs peuvent supprimer des enseignants")

    # Vérifier si l'enseignant existe
    enseignant = db.query(Enseignant).filter(Enseignant.id == enseignant_id).first()
    if not enseignant:
        raise HTTPException(status_code=404, detail="Enseignant non trouvé")

    # Récupérer l'utilisateur associé
    user = db.query(User).filter(User.id == enseignant.user_id).first()

    try:
        # Supprimer l'enseignant et l'utilisateur dans une transaction
        db.delete(enseignant)
        if user:
            db.delete(user)
        db.commit()
        return {"message": "Enseignant supprimé avec succès"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}")
