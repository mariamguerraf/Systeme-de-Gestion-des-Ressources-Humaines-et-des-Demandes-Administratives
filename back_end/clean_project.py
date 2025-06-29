#!/usr/bin/env python3
"""
Script de nettoyage automatique du projet
Supprime tous les fichiers de test, temporaires et supports non essentiels
"""

import os
import shutil
import glob
from pathlib import Path

# Répertoire racine du projet
PROJECT_ROOT = Path(__file__).parent.parent

def delete_file_safe(file_path):
    """Supprime un fichier de manière sécurisée"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"✓ Supprimé: {file_path}")
            return True
    except Exception as e:
        print(f"✗ Erreur lors de la suppression de {file_path}: {e}")
    return False

def delete_files_pattern(pattern, base_dir=None):
    """Supprime tous les fichiers correspondant au pattern"""
    if base_dir:
        search_pattern = os.path.join(base_dir, pattern)
    else:
        search_pattern = os.path.join(PROJECT_ROOT, pattern)
    
    files = glob.glob(search_pattern)
    deleted_count = 0
    for file_path in files:
        if delete_file_safe(file_path):
            deleted_count += 1
    return deleted_count

def main():
    print("🧹 Démarrage du nettoyage automatique du projet...")
    print(f"📁 Répertoire de travail: {PROJECT_ROOT}")
    
    total_deleted = 0
    
    # 1. Fichiers de documentation et supports
    print("\n📚 Suppression des fichiers de documentation et supports...")
    doc_files = [
        "CORRECTION_BACKEND_FINALE.md",
        "CORRECTION_DEMANDES_FINAL.md", 
        "CORRECTION_ENSEIGNANTS_FINAL.md",
        "GUIDE_INTEGRATION_FRONTEND.md",
        "MISSION_ACCOMPLIE_FINAL.md",
        "PROFIL_FONCTIONNAIRE_INTEGRATION.md",
        "RAPPORT_PROJET_COMPLET.md",
        "RAPPORT_TEST_BOUTON_VOIR.md",
        "README_WINDOWS.md",
        "SOLUTION_DEMANDES_FINALE.md",
        "SOLUTION_DOCUMENTS_COMPLETE.md",
        "SOLUTION_FINALE_100_PERCENT.md",
        "SOLUTION_FINALE_COMPLETE.md",
        "SOLUTION_PASSWORD_FINALE.md"
    ]
    
    for doc_file in doc_files:
        if delete_file_safe(os.path.join(PROJECT_ROOT, doc_file)):
            total_deleted += 1
    
    # 2. Scripts de test dans back_end
    print("\n🧪 Suppression des scripts de test...")
    backend_dir = os.path.join(PROJECT_ROOT, "back_end")
    test_files = [
        "add_change_password_endpoint.py",
        "add_test_fonctionnaires.py",
        "analyze_password_issue.py",
        "check_admin.py",
        "check_mariam.py",
        "check_users_structure.py",
        "check_users.py",
        "create_admin_univ.py",
        "create_demandes_mariam.py",
        "create_secretaire.py",
        "create_test_data_db.py",
        "create_users.py",
        "debug_enseignants.py",
        "delete_admin_test.py",
        "diagnose_mariam_login.py",
        "diagnose_password_endpoint.py",
        "diagnostic_frontend_password.py",
        "fix_admin_passwords.py",
        "fix_mariam_complete.py",
        "main_backup.py",
        "migrate_db.py",
        "setup_test_db.py",
        "solution_finale_password.py",
        "test_admin_change_password.py",
        "test_admin_login.py",
        "test_auth_status.py",
        "test_complete_workflow.py",
        "test_demandes_final.py",
        "test_endpoint_demandes.py",
        "test_enseignant_demandes.py",
        "test_enseignants_list.py",
        "test_password_fix.py",
        "test_simple_endpoint.py",
        "test_token_mariam.py",
        "test_user_41_tokens.py",
        "validation_finale.py"
    ]
    
    for test_file in test_files:
        if delete_file_safe(os.path.join(backend_dir, test_file)):
            total_deleted += 1
    
    # 3. Fichiers de logs
    print("\n📋 Suppression des fichiers de logs...")
    log_files = [
        "backend.log",
        "server.log",
        "uvicorn_new.log",
        "uvicorn.log"
    ]
    
    for log_file in log_files:
        if delete_file_safe(os.path.join(backend_dir, log_file)):
            total_deleted += 1
    
    # 4. Fichiers temporaires et scripts de démarrage redondants
    print("\n🗂️ Suppression des fichiers temporaires...")
    temp_files = [
        "admin_token.txt",
        "start_backend.bat",
        "start_backend.sh", 
        "start_fastapi.sh",
        "start.sh",
        "docker-compose.yml"
    ]
    
    for temp_file in temp_files:
        if delete_file_safe(os.path.join(backend_dir, temp_file)):
            total_deleted += 1
    
    # 5. Fichiers racine temporaires
    print("\n📄 Suppression des fichiers racine temporaires...")
    root_temp_files = [
        "test_navigation.html",
        "setup_codespaces_ports.sh"
    ]
    
    for temp_file in root_temp_files:
        if delete_file_safe(os.path.join(PROJECT_ROOT, temp_file)):
            total_deleted += 1
    
    # 6. Base de données de test (garder seulement celle dans back_end)
    print("\n🗄️ Suppression des bases de données dupliquées...")
    if delete_file_safe(os.path.join(PROJECT_ROOT, "gestion_db.db")):
        total_deleted += 1
    
    # 7. Fichiers de test dans src
    print("\n⚛️ Suppression des fichiers de test frontend...")
    src_dir = os.path.join(PROJECT_ROOT, "src")
    if delete_file_safe(os.path.join(src_dir, "test-credentials.ts")):
        total_deleted += 1
    
    # 8. Nettoyage des caches Python
    print("\n🐍 Nettoyage des caches Python...")
    cache_deleted = delete_files_pattern("**/__pycache__", PROJECT_ROOT)
    cache_deleted += delete_files_pattern("**/*.pyc", PROJECT_ROOT)
    cache_deleted += delete_files_pattern("**/*.pyo", PROJECT_ROOT)
    total_deleted += cache_deleted
    
    # 9. Suppression des répertoires vides (uploads si vide)
    print("\n📁 Vérification des répertoires uploads...")
    uploads_dir = os.path.join(PROJECT_ROOT, "uploads")
    if os.path.exists(uploads_dir):
        try:
            # Compter les fichiers dans uploads (exclure .gitkeep)
            files_in_uploads = [f for f in os.listdir(uploads_dir) if f != '.gitkeep']
            if not files_in_uploads:
                print(f"📁 Répertoire uploads vide (sauf .gitkeep) - conservé")
            else:
                print(f"📁 Répertoire uploads contient {len(files_in_uploads)} fichier(s) - conservé")
        except Exception as e:
            print(f"✗ Erreur lors de la vérification d'uploads: {e}")
    
    print(f"\n✅ Nettoyage terminé!")
    print(f"📊 Total de fichiers supprimés: {total_deleted}")
    
    # Affichage des fichiers essentiels conservés
    print(f"\n📋 Fichiers essentiels conservés:")
    essential_files = [
        "package.json",
        "tsconfig.json", 
        "vite.config.ts",
        "tailwind.config.ts",
        "components.json",
        "index.html",
        "back_end/main.py",
        "back_end/auth.py",
        "back_end/config.py",
        "back_end/database.py",
        "back_end/models.py",
        "back_end/schemas.py",
        "back_end/init_db.py",
        "back_end/requirements.txt",
        "back_end/gestion_db.db",
        "src/ (tous les fichiers source)",
        "public/ (ressources statiques)"
    ]
    
    for essential in essential_files:
        print(f"  ✓ {essential}")
    
    print(f"\n🎉 Projet nettoyé et prêt pour la production!")

if __name__ == "__main__":
    main()
