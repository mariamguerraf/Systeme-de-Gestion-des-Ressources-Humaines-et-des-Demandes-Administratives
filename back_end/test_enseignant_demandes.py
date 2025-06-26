#!/usr/bin/env python3
"""
Test pour valider l'affichage des demandes d'un enseignant
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import sqlite3
from datetime import datetime

def test_enseignant_demandes():
    """Test de récupération des demandes d'un enseignant"""
    print("🎯 === TEST DEMANDES ENSEIGNANT ===")
    
    # Connexion à la base de données
    try:
        conn = sqlite3.connect('gestion_db.db')
        cursor = conn.cursor()
        
        # Vérifier les tables existantes
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"📋 Tables disponibles: {[table[0] for table in tables]}")
        
        # Vérifier les utilisateurs enseignants
        if any('users' in str(table) for table in tables):
            cursor.execute("SELECT id, email, nom, prenom, role FROM users WHERE role = 'ENSEIGNANT' LIMIT 3")
            enseignants = cursor.fetchall()
            print(f"👨‍🏫 Enseignants trouvés: {len(enseignants)}")
            for ens in enseignants:
                print(f"   - ID: {ens[0]}, Email: {ens[1]}, Nom: {ens[2]} {ens[3]}")
            
            # Vérifier les demandes s'il y en a
            if any('demandes' in str(table) for table in tables) and enseignants:
                user_id = enseignants[0][0]  # Premier enseignant
                cursor.execute("SELECT id, type_demande, statut, created_at FROM demandes WHERE user_id = ? LIMIT 5", (user_id,))
                demandes = cursor.fetchall()
                print(f"📝 Demandes pour l'enseignant ID {user_id}: {len(demandes)}")
                for demande in demandes:
                    print(f"   - ID: {demande[0]}, Type: {demande[1]}, Statut: {demande[2]}, Date: {demande[3]}")
            else:
                print("⚠️  Table 'demandes' non trouvée ou aucun enseignant")
        else:
            print("⚠️  Table 'users' non trouvée")
        
        conn.close()
        print("✅ Test terminé avec succès")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors du test: {e}")
        return False

if __name__ == "__main__":
    success = test_enseignant_demandes()
    sys.exit(0 if success else 1)
