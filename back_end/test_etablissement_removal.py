#!/usr/bin/env python3
"""
Test pour vérifier que la suppression du champ etablissement fonctionne correctement
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from sqlalchemy.orm import Session
from database import get_db, engine
from models import User, Enseignant, UserRole
from schemas import EnseignantCreateComplete, EnseignantUpdateComplete
import json

def test_enseignant_operations():
    """Test des opérations CRUD sur les enseignants sans le champ etablissement"""

    print("🧪 Test des opérations enseignant sans 'etablissement'")
    print("=" * 55)

    # Obtenir une session de base de données
    db = next(get_db())

    try:
        # 1. Test de création d'un enseignant
        print("\n1️⃣ Test de création d'enseignant...")

        test_data = {
            "email": "test.enseignant@university.com",
            "nom": "Test",
            "prenom": "Enseignant",
            "telephone": "0123456789",
            "adresse": "123 Rue Test",
            "cin": "AB123456",
            "password": "testpass123",
            "specialite": "Informatique",
            "grade": "Professeur Assistant"
        }

        # Vérifier qu'on peut créer un schema sans etablissement
        try:
            schema = EnseignantCreateComplete(**test_data)
            print(f"✅ Schéma de création valide: {schema.specialite}, {schema.grade}")
        except Exception as e:
            print(f"❌ Erreur de schéma: {e}")
            return False

        # 2. Test de mise à jour d'un enseignant
        print("\n2️⃣ Test de mise à jour d'enseignant...")

        update_data = {
            "specialite": "Mathématiques",
            "grade": "Maître de Conférences"
        }

        try:
            update_schema = EnseignantUpdateComplete(**update_data)
            print(f"✅ Schéma de mise à jour valide: {update_schema.specialite}, {update_schema.grade}")
        except Exception as e:
            print(f"❌ Erreur de schéma de mise à jour: {e}")
            return False

        # 3. Test de la structure de la table enseignants
        print("\n3️⃣ Test de la structure de la table...")

        # Vérifier qu'on peut créer un enseignant en base
        try:
            # Créer un utilisateur test
            test_user = User(
                email="test2@university.com",
                nom="Test2",
                prenom="User2",
                hashed_password="hashedpass",
                role=UserRole.ENSEIGNANT,
                is_active=True
            )
            db.add(test_user)
            db.flush()

            # Créer l'enseignant associé
            test_enseignant = Enseignant(
                user_id=test_user.id,
                specialite="Physique",
                grade="Professeur"
            )
            db.add(test_enseignant)
            db.commit()

            print(f"✅ Enseignant créé en base: ID={test_enseignant.id}")

            # Vérifier qu'on peut le récupérer
            retrieved = db.query(Enseignant).filter(Enseignant.id == test_enseignant.id).first()
            if retrieved:
                print(f"✅ Enseignant récupéré: {retrieved.specialite}, {retrieved.grade}")
                # Vérifier qu'il n'y a pas de champ etablissement
                if hasattr(retrieved, 'etablissement'):
                    print("❌ Le champ 'etablissement' existe encore!")
                    return False
                else:
                    print("✅ Le champ 'etablissement' a été correctement supprimé")
            else:
                print("❌ Impossible de récupérer l'enseignant")
                return False

            # Nettoyer
            db.delete(test_enseignant)
            db.delete(test_user)
            db.commit()

        except Exception as e:
            print(f"❌ Erreur de base de données: {e}")
            db.rollback()
            return False

        print("\n✅ Tous les tests sont passés avec succès!")
        return True

    except Exception as e:
        print(f"❌ Erreur générale: {e}")
        return False

    finally:
        db.close()

def test_api_response_format():
    """Test que les réponses API n'incluent plus le champ etablissement"""

    print("\n🌐 Test du format de réponse API")
    print("=" * 35)

    try:
        from schemas import EnseignantComplete
        from pydantic import ValidationError

        # Test avec des données complètes SANS etablissement
        test_response = {
            "id": 1,
            "user_id": 1,
            "specialite": "Informatique",
            "grade": "Professeur",
            "user": {
                "id": 1,
                "email": "test@test.com",
                "nom": "Test",
                "prenom": "User",
                "telephone": "123456789",
                "role": "ENSEIGNANT",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00"
            }
        }

        try:
            response = EnseignantComplete(**test_response)
            print("✅ Réponse API valide sans 'etablissement'")
            print(f"   Enseignant: {response.specialite}, {response.grade}")
        except ValidationError as e:
            print(f"❌ Erreur de validation: {e}")
            return False

        # Test avec etablissement (doit échouer)
        test_with_etablissement = test_response.copy()
        test_with_etablissement["etablissement"] = "Université Test"

        try:
            response_with_etab = EnseignantComplete(**test_with_etablissement)
            # Vérifier que le champ etablissement n'est pas présent dans l'objet final
            if hasattr(response_with_etab, 'etablissement'):
                print("❌ Le schéma accepte encore le champ 'etablissement'!")
                return False
            else:
                print("✅ Le champ 'etablissement' est ignoré par le schéma")
        except ValidationError:
            print("✅ Le schéma rejette correctement le champ 'etablissement'")
        except TypeError:
            print("✅ Le schéma rejette correctement le champ 'etablissement'")

        print("\n✅ Format de réponse API conforme!")
        return True

    except Exception as e:
        print(f"❌ Erreur de test API: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Tests de suppression du champ 'etablissement'")
    print("=" * 60)

    success1 = test_enseignant_operations()
    success2 = test_api_response_format()

    if success1 and success2:
        print("\n🎉 Tous les tests sont passés!")
        print("✅ Le champ 'etablissement' a été supprimé avec succès")
        sys.exit(0)
    else:
        print("\n💥 Certains tests ont échoué")
        sys.exit(1)
