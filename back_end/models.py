from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from database import Base

class UserRole(PyEnum):
    ADMIN = "ADMIN"
    ENSEIGNANT = "ENSEIGNANT"
    FONCTIONNAIRE = "FONCTIONNAIRE"
    SECRETAIRE = "SECRETAIRE"

class DemandeStatus(PyEnum):
    EN_ATTENTE = "EN_ATTENTE"
    APPROUVEE = "APPROUVEE"
    REJETEE = "REJETEE"

class DemandeType(PyEnum):
    CONGE = "CONGE"
    ABSENCE = "ABSENCE"
    ATTESTATION = "ATTESTATION"
    ORDRE_MISSION = "ORDRE_MISSION"
    HEURES_SUP = "HEURES_SUP"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    nom = Column(String, nullable=False)
    prenom = Column(String, nullable=False)
    telephone = Column(String)
    adresse = Column(String)
    cin = Column(String, unique=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relations
    demandes = relationship("Demande", back_populates="user")

class Demande(Base):
    __tablename__ = "demandes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type_demande = Column(Enum(DemandeType), nullable=False)
    titre = Column(String, nullable=False)
    description = Column(Text)
    date_debut = Column(DateTime)
    date_fin = Column(DateTime)
    statut = Column(Enum(DemandeStatus), default=DemandeStatus.EN_ATTENTE)
    commentaire_admin = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relations
    user = relationship("User", back_populates="demandes")

class Enseignant(Base):
    __tablename__ = "enseignants"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    specialite = Column(String)
    grade = Column(String)
    photo = Column(String, nullable=True)  # URL de la photo de profil

    # Relations
    user = relationship("User")

class Fonctionnaire(Base):
    __tablename__ = "fonctionnaires"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    service = Column(String)
    poste = Column(String)
    grade = Column(String)

    # Relations
    user = relationship("User")
