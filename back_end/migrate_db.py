"""
Script de migration pour ajouter la table demande_documents
"""
import sqlite3
import os

def migrate_database():
    """Ajouter la table demande_documents à la base de données existante"""
    
    # Chemin vers la base de données
    db_path = "gestion_db.db"
    
    if not os.path.exists(db_path):
        print("❌ Base de données non trouvée. Veuillez d'abord initialiser la base.")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Vérifier si la table existe déjà
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='demande_documents'
        """)
        
        if cursor.fetchone():
            print("✅ La table demande_documents existe déjà.")
            conn.close()
            return
        
        # Créer la table demande_documents
        cursor.execute("""
            CREATE TABLE demande_documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                demande_id INTEGER NOT NULL,
                filename VARCHAR NOT NULL,
                original_filename VARCHAR NOT NULL,
                file_path VARCHAR NOT NULL,
                file_size INTEGER,
                content_type VARCHAR,
                uploaded_at DATETIME DEFAULT (datetime('now')),
                FOREIGN KEY (demande_id) REFERENCES demandes (id) ON DELETE CASCADE
            )
        """)
        
        # Créer un index pour améliorer les performances
        cursor.execute("""
            CREATE INDEX ix_demande_documents_demande_id 
            ON demande_documents (demande_id)
        """)
        
        conn.commit()
        print("✅ Table demande_documents créée avec succès!")
        
        # Vérifier la création
        cursor.execute("SELECT COUNT(*) FROM demande_documents")
        print(f"✅ Vérification: table demande_documents opérationnelle (0 enregistrements)")
        
    except Exception as e:
        print(f"❌ Erreur lors de la migration: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("🔄 Début de la migration de base de données...")
    migrate_database()
    print("✅ Migration terminée!")
