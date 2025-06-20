## 🖼️ TEST AFFICHAGE PHOTO PROFIL ENSEIGNANT

### 🎯 Objectif
Vérifier que les photos d'enseignants s'affichent correctement dans :
1. Page de profil enseignant (`/src/pages/enseignant/ProfilPage.tsx`)
2. Liste des enseignants dans l'admin (`/src/pages/cadmin/Enseignants.tsx`)

### ✅ Corrections Appliquées

#### 1. Page de Profil Enseignant
- ❌ **Avant** : `src="/api${enseignantData.photo}"`
- ✅ **Après** : `src="${getApiBaseUrl()}${enseignantData.photo}"`

#### 2. Page d'Administration des Enseignants
- ❌ **Avant** : `src="/api${enseignant.photo}"` (liste)
- ✅ **Après** : `src="${getApiBaseUrl()}${enseignant.photo}"`
- ❌ **Avant** : `src="/api${selectedEnseignant.photo}"` (modal modification)
- ✅ **Après** : `src="${getApiBaseUrl()}${selectedEnseignant.photo}"`

### 🔧 Import Ajouté
```typescript
import { getApiBaseUrl } from '../../utils/config';
```

### 🌐 URLs Générées
- **Local** : `http://localhost:8000/uploads/images/[filename]`
- **Codespace** : `https://congenial-halibut-4qgp7jg67v35q-8000.app.github.dev/uploads/images/[filename]`

### 🧪 Test à Effectuer
1. Se connecter en tant qu'enseignant
2. Aller sur la page de profil
3. Vérifier que la photo s'affiche correctement
4. Se connecter en tant qu'admin
5. Aller sur la gestion des enseignants
6. Vérifier que les photos s'affichent dans la liste et les modals

### 🎯 Résultat Attendu
- ✅ Photos visible dans le profil enseignant
- ✅ Photos visibles dans la liste admin des enseignants
- ✅ Photos visibles dans les formulaires de modification
- ✅ Fallback (avatar avec initiales) si pas de photo
