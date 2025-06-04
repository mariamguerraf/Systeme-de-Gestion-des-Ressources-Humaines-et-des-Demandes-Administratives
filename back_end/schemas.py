from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from models import UserRole, DemandeStatus, DemandeType

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    nom: str
    prenom: str
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    cin: Optional[str] = None
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nom: Optional[str] = None
    prenom: Optional[str] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    cin: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Demande Schemas
class DemandeBase(BaseModel):
    type_demande: DemandeType
    titre: str
    description: Optional[str] = None
    date_debut: Optional[datetime] = None
    date_fin: Optional[datetime] = None

class DemandeCreate(DemandeBase):
    pass

class DemandeUpdate(BaseModel):
    titre: Optional[str] = None
    description: Optional[str] = None
    date_debut: Optional[datetime] = None
    date_fin: Optional[datetime] = None
    statut: Optional[DemandeStatus] = None
    commentaire_admin: Optional[str] = None

class Demande(DemandeBase):
    id: int
    user_id: int
    statut: DemandeStatus
    commentaire_admin: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: User

    class Config:
        from_attributes = True

# Enseignant Schemas
class EnseignantBase(BaseModel):
    specialite: Optional[str] = None
    grade: Optional[str] = None
    etablissement: Optional[str] = None

class EnseignantCreate(EnseignantBase):
    user_id: int

class Enseignant(EnseignantBase):
    id: int
    user_id: int
    user: User

    class Config:
        from_attributes = True

# Fonctionnaire Schemas
class FonctionnaireBase(BaseModel):
    service: Optional[str] = None
    poste: Optional[str] = None
    grade: Optional[str] = None

class FonctionnaireCreate(FonctionnaireBase):
    user_id: int

class Fonctionnaire(FonctionnaireBase):
    id: int
    user_id: int
    user: User

    class Config:
        from_attributes = True
