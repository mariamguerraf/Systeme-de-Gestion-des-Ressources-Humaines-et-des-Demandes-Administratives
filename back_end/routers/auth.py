from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from database import get_db
from auth import authenticate_user, create_access_token, get_password_hash, get_current_active_user
from models import User
from schemas import Token, UserCreate, User as UserSchema
from config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserSchema)
async def register(user_create: UserCreate, db: Session = Depends(get_db)):
    # Vérifier si l'utilisateur existe déjà
    db_user = db.query(User).filter(User.email == user_create.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email déjà enregistré"
        )

    # Créer le nouvel utilisateur
    hashed_password = get_password_hash(user_create.password)
    db_user = User(
        email=user_create.email,
        nom=user_create.nom,
        prenom=user_create.prenom,
        telephone=user_create.telephone,
        adresse=user_create.adresse,
        cin=user_create.cin,
        hashed_password=hashed_password,
        role=user_create.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.post("/create-test-users")
async def create_test_users(db: Session = Depends(get_db)):
    """Crée les utilisateurs de test pour le développement"""
    from models import UserRole
    
    # Supprimer les anciens utilisateurs de test
    db.query(User).filter(User.email.in_([
        "admin@test.com", 
        "secretaire@test.com", 
        "enseignant@test.com", 
        "fonctionnaire@test.com"
    ])).delete(synchronize_session=False)
    
    # Données des utilisateurs de test
    test_users_data = [
        {
            "email": "admin@test.com",
            "password": "admin123",
            "nom": "Admin",
            "prenom": "System",
            "role": UserRole.ADMIN
        },
        {
            "email": "secretaire@test.com",
            "password": "secret123",
            "nom": "Martin",
            "prenom": "Sophie",
            "role": UserRole.SECRETAIRE
        },
        {
            "email": "enseignant@test.com",
            "password": "enseign123",
            "nom": "Dupont",
            "prenom": "Jean",
            "role": UserRole.ENSEIGNANT
        },
        {
            "email": "fonctionnaire@test.com",
            "password": "fonct123",
            "nom": "Bernard",
            "prenom": "Marie",
            "role": UserRole.FONCTIONNAIRE
        }
    ]
    
    created_users = []
    for user_data in test_users_data:
        hashed_password = get_password_hash(user_data["password"])
        db_user = User(
            email=user_data["email"],
            nom=user_data["nom"],
            prenom=user_data["prenom"],
            hashed_password=hashed_password,
            role=user_data["role"],
            is_active=True
        )
        db.add(db_user)
        created_users.append(f"{user_data['email']} ({user_data['role'].value})")
    
    db.commit()
    
    return {
        "message": "Utilisateurs de test créés avec succès",
        "users": created_users
    }
