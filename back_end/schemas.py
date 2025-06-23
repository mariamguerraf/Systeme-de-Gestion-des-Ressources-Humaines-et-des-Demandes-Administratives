from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional, List, Union
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
    created_at: Union[datetime, str]
    updated_at: Optional[Union[datetime, str]] = None

    @validator('created_at', pre=True)
    def parse_created_at(cls, v):
        if isinstance(v, str):
            try:
                return datetime.strptime(v, "%Y-%m-%d %H:%M:%S")
            except:
                return v
        return v

    @validator('updated_at', pre=True)
    def parse_updated_at(cls, v):
        if isinstance(v, str):
            try:
                return datetime.strptime(v, "%Y-%m-%d %H:%M:%S")
            except:
                return v
        return v

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

    @validator('date_debut', 'date_fin', pre=True, allow_reuse=True)
    def parse_date(cls, v):
        if isinstance(v, str):
            try:
                # Si c'est juste une date (YYYY-MM-DD), ajouter l'heure
                if len(v) == 10 and '-' in v:
                    return datetime.strptime(v + ' 00:00:00', "%Y-%m-%d %H:%M:%S")
                # Si c'est déjà un datetime complet
                return datetime.strptime(v, "%Y-%m-%d %H:%M:%S")
            except:
                return v
        return v

    @validator('created_at', pre=True, allow_reuse=True)
    def parse_created_at(cls, v):
        if isinstance(v, str):
            try:
                return datetime.strptime(v, "%Y-%m-%d %H:%M:%S")
            except:
                return v
        return v

    @validator('updated_at', pre=True, allow_reuse=True)
    def parse_updated_at(cls, v):
        if isinstance(v, str):
            try:
                return datetime.strptime(v, "%Y-%m-%d %H:%M:%S")
            except:
                return v
        return v

    class Config:
        from_attributes = True

# Enseignant Schemas
class EnseignantBase(BaseModel):
    specialite: Optional[str] = None
    grade: Optional[str] = None
    photo: Optional[str] = None

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

# Schéma pour créer un enseignant complet (utilisateur + infos enseignant)
class EnseignantCreateComplete(BaseModel):
    # Informations utilisateur
    email: EmailStr
    nom: str
    prenom: str
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    cin: Optional[str] = None
    password: str
    # Informations spécifiques enseignant
    specialite: Optional[str] = None
    grade: Optional[str] = None
    photo: Optional[str] = None

# Schéma pour modifier un enseignant complet (utilisateur + infos enseignant)
class EnseignantUpdateComplete(BaseModel):
    # Informations utilisateur (toutes optionnelles en modification)
    email: Optional[EmailStr] = None
    nom: Optional[str] = None
    prenom: Optional[str] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    cin: Optional[str] = None
    password: Optional[str] = None
    # Informations spécifiques enseignant
    specialite: Optional[str] = None
    grade: Optional[str] = None
    photo: Optional[str] = None

# Schéma pour la réponse complète enseignant
class EnseignantComplete(BaseModel):
    id: int
    user_id: int
    specialite: Optional[str] = None
    grade: Optional[str] = None
    photo: Optional[str] = None
    user: User

    class Config:
        from_attributes = True
