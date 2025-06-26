#!/usr/bin/env python3
"""
Script pour ajouter des demandes de test pour mariam guerraf
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import sqlite3
from datetime import datetime, timedelta

def create_test_demandes_mariam():
    """Créer des demandes de test pour mariam guerraf"""
    print("🎯 === CRÉATION DEMANDES TEST POUR MARIAM ===")
    
    try:
        conn = sqlite3.connect('gestion_db.db')
        cursor = conn.cursor()
        
        # Vérifier l'ID de mariam
        cursor.execute("SELECT id, email, nom, prenom FROM users WHERE email = 'mariam@univ.ma'")
        mariam = cursor.fetchone()
        
        if not mariam:
            print("❌ Utilisateur mariam@univ.ma non trouvé")
            return False
            
        user_id = mariam[0]
        print(f"👤 Mariam trouvée - ID: {user_id}, Email: {mariam[1]}, Nom: {mariam[2]} {mariam[3]}")
        
        # Vérifier si elle a déjà des demandes
        cursor.execute("SELECT COUNT(*) FROM demandes WHERE user_id = ?", (user_id,))
        existing_count = cursor.fetchone()[0]
        print(f"📝 Demandes existantes pour mariam: {existing_count}")
        
        if existing_count == 0:
            # Créer des demandes de test
            demandes_test = [
                {
                    'type_demande': 'ATTESTATION',
                    'titre': 'Attestation de travail',
                    'description': 'Demande d\'attestation de travail pour démarches administratives',
                    'statut': 'EN_ATTENTE',
                    'date_debut': '2025-06-20',
                    'date_fin': None
                },
                {
                    'type_demande': 'CONGE',
                    'titre': 'Congé annuel',
                    'description': 'Demande de congé annuel pour les vacances d\'été',
                    'statut': 'APPROUVEE',
                    'date_debut': '2025-07-15',
                    'date_fin': '2025-07-30'
                },
                {
                    'type_demande': 'FORMATION',
                    'titre': 'Formation pédagogique',
                    'description': 'Participation à la formation sur les nouvelles méthodes d\'enseignement',
                    'statut': 'EN_ATTENTE',
                    'date_debut': '2025-09-01',
                    'date_fin': '2025-09-05'
                }
            ]
            
            for demande in demandes_test:
                cursor.execute("""
                    INSERT INTO demandes (user_id, type_demande, titre, description, statut, date_debut, date_fin, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    user_id,
                    demande['type_demande'],
                    demande['titre'],
                    demande['description'],
                    demande['statut'],
                    demande['date_debut'],
                    demande['date_fin'],
                    datetime.now().isoformat()
                ))
                
            conn.commit()
            print(f"✅ {len(demandes_test)} demandes créées pour mariam")
            
            # Vérifier les demandes créées
            cursor.execute("SELECT id, type_demande, titre, statut FROM demandes WHERE user_id = ?", (user_id,))
            nouvelles_demandes = cursor.fetchall()
            print("📋 Demandes créées:")
            for demande in nouvelles_demandes:
                print(f"   - ID: {demande[0]}, Type: {demande[1]}, Titre: {demande[2]}, Statut: {demande[3]}")
        else:
            print(f"ℹ️ Mariam a déjà {existing_count} demandes, pas de création")
            
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    success = create_test_demandes_mariam()
    sys.exit(0 if success else 1)
