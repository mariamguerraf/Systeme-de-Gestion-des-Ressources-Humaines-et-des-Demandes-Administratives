# Solution pour la persistance des données

## Problème identifié
Le backend utilise des dictionnaires Python en mémoire qui se réinitialisent à chaque redémarrage :
- `TEST_USERS = {}` 
- `ENSEIGNANTS_DB = {}`
- `DEMANDES_DB = {}`

## Solutions disponibles

### Option 1 : Base de données SQLite (Recommandée)
- Persistance des données
- Facile à mettre en place
- Pas de serveur séparé requis

### Option 2 : Fichiers JSON (Solution rapide)
- Sauvegarde dans des fichiers JSON
- Simple à implémenter
- Moins robuste que SQLite

### Option 3 : PostgreSQL/MySQL (Solution production)
- Base de données complète
- Plus complexe à configurer
- Idéal pour production

## Implémentation recommandée : SQLite

1. Modifier le backend pour utiliser SQLite
2. Garder la compatibilité avec l'interface actuelle
3. Migration automatique des données de test

Voulez-vous que j'implémente cette solution ?
