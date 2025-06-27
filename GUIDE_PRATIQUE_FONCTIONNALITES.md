# 🛠️ GUIDE PRATIQUE : COMMENT FAIRE CHAQUE CHOSE

## 🎯 Exemples Concrets et Étapes Détaillées

---

## 🚀 **COMMENT DÉMARRER LE PROJET**

### 📋 **Étapes de Démarrage Détaillées**

#### **1. Préparation de l'Environnement**
```
🔧 PRÉREQUIS SYSTÈME :
✅ Windows 10/11
✅ Python 3.8+ installé
✅ Node.js 16+ installé
✅ Git installé (optionnel)
✅ Navigateur moderne (Chrome, Edge, Firefox)

🎯 VÉRIFIER VOS INSTALLATIONS :
1. Ouvrir PowerShell ou Command Prompt
2. Taper ces commandes :

python --version
# Résultat attendu : Python 3.8.x ou plus récent

node --version
# Résultat attendu : v16.x.x ou plus récent

npm --version
# Résultat attendu : 8.x.x ou plus récent
```

#### **2. Installation du Backend**
```
📂 ÉTAPES DÉTAILLÉES :

1️⃣ Naviguer vers le dossier backend :
   cd back_end

2️⃣ Créer un environnement virtuel Python (recommandé) :
   python -m venv venv
   
3️⃣ Activer l'environnement virtuel :
   # Sur Windows
   venv\Scripts\activate
   # Vous devriez voir (venv) dans votre terminal

4️⃣ Installer les dépendances :
   pip install -r requirements.txt
   
5️⃣ Initialiser la base de données :
   python init_db.py
   
6️⃣ Démarrer le serveur :
   python main.py
   
✅ RÉSULTAT ATTENDU :
   INFO:     Uvicorn running on http://127.0.0.1:8000
   INFO:     Application startup complete.
```

#### **3. Installation du Frontend**
```
📂 ÉTAPES DÉTAILLÉES :

1️⃣ Ouvrir un NOUVEAU terminal (garder le backend qui tourne)

2️⃣ Naviguer vers le dossier racine du projet :
   cd [dossier-du-projet]

3️⃣ Installer les dépendances Node.js :
   npm install
   # Cette commande peut prendre 2-3 minutes

4️⃣ Démarrer le serveur de développement :
   npm run dev
   
✅ RÉSULTAT ATTENDU :
   Local:   http://localhost:8080/
   Network: http://192.168.x.x:8080/
   ready in 1200ms.
```

#### **4. Vérification que Tout Fonctionne**
```
🧪 TESTS DE DÉMARRAGE :

1️⃣ BACKEND (http://localhost:8000) :
   ✅ Ouvrir dans le navigateur
   ✅ Voir : {"message": "API is running"}
   ✅ Aller sur /docs → Voir Swagger UI

2️⃣ FRONTEND (http://localhost:8080) :
   ✅ Voir la page de connexion
   ✅ Design moderne avec formulaire
   ✅ Pas d'erreurs dans la console (F12)

3️⃣ TEST DE CONNEXION :
   ✅ Email : admin@test.com
   ✅ Mot de passe : admin123
   ✅ Redirection vers dashboard admin

🎉 Si tout fonctionne → Votre environnement est prêt !
```

---

## 🔐 **COMMENT FONCTIONNE LA CONNEXION**

### 📋 **Processus de Connexion Détaillé**

#### **1. Ce qui se passe côté Frontend (React)**
```javascript
// 🎯 FICHIER : src/components/Login.tsx

// Fonction de connexion
const handleLogin = async (email: string, password: string) => {
  try {
    // 1. Envoyer les données au backend
    const response = await axios.post('/api/auth/login', {
      email: email,
      password: password
    });
    
    // 2. Récupérer le token JWT
    const { access_token, user } = response.data;
    
    // 3. Stocker le token localement
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // 4. Configurer les requêtes futures
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    
    // 5. Rediriger selon le rôle
    if (user.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else if (user.role === 'SECRETAIRE') {
      navigate('/secretaire/dashboard');
    } else if (user.role === 'ENSEIGNANT') {
      navigate('/enseignant/dashboard');
    } else {
      navigate('/fonctionnaire/dashboard');
    }
    
  } catch (error) {
    // Gestion des erreurs
    if (error.response?.status === 401) {
      setError('Email ou mot de passe incorrect');
    } else {
      setError('Erreur de connexion');
    }
  }
};
```

#### **2. Ce qui se passe côté Backend (FastAPI)**
```python
# 🎯 FICHIER : back_end/routers/auth.py

@router.post("/login")
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    # 1. Chercher l'utilisateur par email
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user:
        raise HTTPException(
            status_code=401, 
            detail="Utilisateur non trouvé"
        )
    
    # 2. Vérifier le mot de passe
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=401, 
            detail="Mot de passe incorrect"
        )
    
    # 3. Créer le token JWT
    token_data = {
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    
    access_token = create_jwt_token(token_data)
    
    # 4. Retourner le token et les infos utilisateur
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role
        }
    }
```

#### **3. Comment le Token est Vérifié sur Chaque Requête**
```python
# 🎯 FICHIER : back_end/auth.py

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        # 1. Décoder le token JWT
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # 2. Extraire les informations
        user_id = payload.get("user_id")
        email = payload.get("email")
        role = payload.get("role")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token invalide")
        
        # 3. Vérifier que l'utilisateur existe toujours
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
        
        return user
        
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide")

# Utilisation dans un endpoint protégé
@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "role": current_user.role
    }
```

---

## 👥 **COMMENT GÉRER LES UTILISATEURS**

### 📋 **Création d'un Nouvel Enseignant**

#### **1. Interface Admin - Formulaire de Création**
```typescript
// 🎯 FICHIER : src/pages/admin/CreateEnseignant.tsx

interface CreateEnseignantForm {
  // Informations utilisateur
  email: string;
  password: string;
  
  // Informations enseignant
  nom: string;
  prenom: string;
  cin: string;
  date_naissance: string;
  telephone: string;
  adresse: string;
  specialite: string;
  grade: string;
  date_recrutement: string;
}

const CreateEnseignant = () => {
  const [formData, setFormData] = useState<CreateEnseignantForm>({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    // ... autres champs
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validation côté client
      if (!formData.email || !formData.password) {
        throw new Error('Email et mot de passe requis');
      }
      
      // Envoi au backend
      const response = await axios.post('/api/enseignants', formData);
      
      if (response.status === 201) {
        toast.success('Enseignant créé avec succès');
        navigate('/admin/enseignants');
      }
      
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        placeholder="Email"
        required
      />
      {/* ... autres champs ... */}
      <button type="submit">Créer Enseignant</button>
    </form>
  );
};
```

#### **2. Backend - Traitement de la Création**
```python
# 🎯 FICHIER : back_end/routers/enseignant.py

@router.post("/", response_model=EnseignantResponse)
async def create_enseignant(
    enseignant_data: EnseignantCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Vérifier les permissions
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=403, 
            detail="Seuls les admins peuvent créer des enseignants"
        )
    
    # 2. Vérifier que l'email n'existe pas déjà
    existing_user = db.query(User).filter(User.email == enseignant_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail="Un utilisateur avec cet email existe déjà"
        )
    
    # 3. Créer l'utilisateur
    password_hash = hash_password(enseignant_data.password)
    new_user = User(
        email=enseignant_data.email,
        password_hash=password_hash,
        role="ENSEIGNANT"
    )
    db.add(new_user)
    db.flush()  # Pour obtenir l'ID
    
    # 4. Créer l'enseignant
    new_enseignant = Enseignant(
        user_id=new_user.id,
        nom=enseignant_data.nom,
        prenom=enseignant_data.prenom,
        cin=enseignant_data.cin,
        date_naissance=enseignant_data.date_naissance,
        telephone=enseignant_data.telephone,
        adresse=enseignant_data.adresse,
        specialite=enseignant_data.specialite,
        grade=enseignant_data.grade,
        date_recrutement=enseignant_data.date_recrutement
    )
    db.add(new_enseignant)
    
    # 5. Sauvegarder en base
    db.commit()
    db.refresh(new_enseignant)
    
    return new_enseignant
```

---

## 📝 **COMMENT GÉRER LES DEMANDES**

### 📋 **Création d'une Demande par un Enseignant**

#### **1. Interface Enseignant - Formulaire de Demande**
```typescript
// 🎯 FICHIER : src/pages/enseignant/CreateDemande.tsx

const CreateDemande = () => {
  const [demandeData, setDemandeData] = useState({
    type: 'ATTESTATION_TRAVAIL',
    motif: '',
    date_besoin: '',
    details: '',
    documents: [] as File[]
  });
  
  const handleFileUpload = (files: File[]) => {
    // Validation des fichiers
    const validFiles = files.filter(file => {
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Fichier ${file.name} trop volumineux`);
        return false;
      }
      
      // Vérifier l'extension
      const allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'png'];
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(extension || '')) {
        toast.error(`Type de fichier ${extension} non autorisé`);
        return false;
      }
      
      return true;
    });
    
    setDemandeData({...demandeData, documents: validFiles});
  };
  
  const handleSubmit = async () => {
    try {
      // Créer FormData pour inclure les fichiers
      const formData = new FormData();
      formData.append('type', demandeData.type);
      formData.append('motif', demandeData.motif);
      formData.append('date_besoin', demandeData.date_besoin);
      formData.append('details', demandeData.details);
      
      // Ajouter les fichiers
      demandeData.documents.forEach((file, index) => {
        formData.append(`documents`, file);
      });
      
      const response = await axios.post('/api/demandes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Demande soumise avec succès');
      navigate('/enseignant/demandes');
      
    } catch (error) {
      toast.error('Erreur lors de la soumission');
    }
  };
};
```

#### **2. Backend - Traitement de la Demande**
```python
# 🎯 FICHIER : back_end/routers/demandes.py

@router.post("/", response_model=DemandeResponse)
async def create_demande(
    type: str = Form(...),
    motif: str = Form(...),
    date_besoin: str = Form(...),
    details: str = Form(None),
    documents: List[UploadFile] = File([]),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Vérifier que l'utilisateur peut créer des demandes
    if current_user.role not in ["ENSEIGNANT", "FONCTIONNAIRE"]:
        raise HTTPException(
            status_code=403, 
            detail="Non autorisé à créer des demandes"
        )
    
    # 2. Valider les données
    try:
        date_besoin_parsed = datetime.strptime(date_besoin, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=400, 
            detail="Format de date invalide"
        )
    
    # 3. Créer la demande
    new_demande = Demande(
        user_id=current_user.id,
        type=type,
        motif=motif,
        date_besoin=date_besoin_parsed,
        details=details,
        statut="EN_ATTENTE",
        date_soumission=datetime.now()
    )
    db.add(new_demande)
    db.flush()  # Pour obtenir l'ID
    
    # 4. Traiter les documents joints
    uploaded_files = []
    for document in documents:
        if document.filename:
            # Valider le fichier
            if not is_valid_file(document):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Fichier {document.filename} non valide"
                )
            
            # Créer un nom unique
            file_extension = document.filename.split('.')[-1]
            unique_filename = f"{uuid4()}.{file_extension}"
            
            # Créer le chemin de stockage
            upload_dir = f"uploads/demandes/{new_demande.id}"
            os.makedirs(upload_dir, exist_ok=True)
            file_path = f"{upload_dir}/{unique_filename}"
            
            # Sauvegarder le fichier
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(document.file, buffer)
            
            # Enregistrer en base
            new_document = Document(
                demande_id=new_demande.id,
                nom_original=document.filename,
                nom_stockage=unique_filename,
                chemin=file_path,
                taille=os.path.getsize(file_path),
                type_mime=document.content_type
            )
            db.add(new_document)
            uploaded_files.append(new_document)
    
    # 5. Sauvegarder tout
    db.commit()
    db.refresh(new_demande)
    
    return new_demande
```

---

## 🔄 **COMMENT TRAITER LES DEMANDES (Secrétaire)**

### 📋 **Approbation d'une Demande**

#### **1. Interface Secrétaire - Liste des Demandes**
```typescript
// 🎯 FICHIER : src/pages/secretaire/ListeDemandes.tsx

const ListeDemandes = () => {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [filter, setFilter] = useState({
    statut: 'EN_ATTENTE',
    type: '',
    search: ''
  });
  
  useEffect(() => {
    loadDemandes();
  }, [filter]);
  
  const loadDemandes = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.statut) params.append('statut', filter.statut);
      if (filter.type) params.append('type', filter.type);
      if (filter.search) params.append('search', filter.search);
      
      const response = await axios.get(`/api/demandes?${params}`);
      setDemandes(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    }
  };
  
  const handleApprove = async (demandeId: number, commentaire: string) => {
    try {
      await axios.put(`/api/demandes/${demandeId}/approve`, {
        commentaire_admin: commentaire
      });
      
      toast.success('Demande approuvée');
      loadDemandes(); // Recharger la liste
    } catch (error) {
      toast.error('Erreur lors de l\'approbation');
    }
  };
  
  return (
    <div>
      {/* Filtres */}
      <div className="filters">
        <select 
          value={filter.statut} 
          onChange={(e) => setFilter({...filter, statut: e.target.value})}
        >
          <option value="">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="APPROUVE">Approuvé</option>
          <option value="REJETE">Rejeté</option>
        </select>
      </div>
      
      {/* Liste des demandes */}
      <div className="demandes-list">
        {demandes.map(demande => (
          <DemandeCard 
            key={demande.id} 
            demande={demande} 
            onApprove={handleApprove}
          />
        ))}
      </div>
    </div>
  );
};
```

#### **2. Backend - Approbation d'une Demande**
```python
# 🎯 FICHIER : back_end/routers/demandes.py

@router.put("/{demande_id}/approve")
async def approve_demande(
    demande_id: int,
    approval_data: DemandeApproval,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Vérifier les permissions
    if current_user.role not in ["SECRETAIRE", "ADMIN"]:
        raise HTTPException(
            status_code=403, 
            detail="Non autorisé à traiter les demandes"
        )
    
    # 2. Récupérer la demande
    demande = db.query(Demande).filter(Demande.id == demande_id).first()
    if not demande:
        raise HTTPException(
            status_code=404, 
            detail="Demande non trouvée"
        )
    
    # 3. Vérifier que la demande peut être traitée
    if demande.statut != "EN_ATTENTE":
        raise HTTPException(
            status_code=400, 
            detail="Cette demande a déjà été traitée"
        )
    
    # 4. Mettre à jour la demande
    demande.statut = "APPROUVE"
    demande.commentaire_admin = approval_data.commentaire_admin
    demande.date_traitement = datetime.now()
    demande.traite_par = current_user.id
    
    # 5. Enregistrer les modifications
    db.commit()
    db.refresh(demande)
    
    # 6. (Future) Envoyer une notification
    # send_notification(demande.user_id, "Votre demande a été approuvée")
    
    return {"message": "Demande approuvée avec succès", "demande": demande}
```

---

## 📁 **COMMENT GÉRER LES FICHIERS**

### 📋 **Upload et Téléchargement Sécurisé**

#### **1. Upload de Fichiers**
```python
# 🎯 FICHIER : back_end/utils/file_handler.py

import os
import shutil
from uuid import uuid4
from fastapi import UploadFile, HTTPException

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def is_valid_file(file: UploadFile) -> bool:
    """Valide un fichier uploadé"""
    
    # 1. Vérifier l'extension
    if not file.filename:
        return False
    
    extension = file.filename.split('.')[-1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Extension .{extension} non autorisée. "
                  f"Extensions permises: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # 2. Vérifier la taille
    file.file.seek(0, 2)  # Aller à la fin du fichier
    file_size = file.file.tell()
    file.file.seek(0)  # Revenir au début
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Fichier trop volumineux. Taille max: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # 3. Vérifier le MIME type
    allowed_mime_types = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png'
    }
    
    expected_mime = allowed_mime_types.get(extension)
    if expected_mime and file.content_type != expected_mime:
        raise HTTPException(
            status_code=400,
            detail=f"Type MIME invalide. Attendu: {expected_mime}, reçu: {file.content_type}"
        )
    
    return True

def save_file(file: UploadFile, upload_dir: str) -> dict:
    """Sauvegarde un fichier et retourne ses informations"""
    
    # 1. Valider le fichier
    if not is_valid_file(file):
        raise HTTPException(status_code=400, detail="Fichier invalide")
    
    # 2. Créer le dossier de destination
    os.makedirs(upload_dir, exist_ok=True)
    
    # 3. Générer un nom unique
    file_extension = file.filename.split('.')[-1].lower()
    unique_filename = f"{uuid4()}.{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # 4. Sauvegarder le fichier
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la sauvegarde: {str(e)}"
        )
    
    # 5. Retourner les informations
    return {
        "nom_original": file.filename,
        "nom_stockage": unique_filename,
        "chemin": file_path,
        "taille": os.path.getsize(file_path),
        "type_mime": file.content_type
    }
```

#### **2. Téléchargement Sécurisé**
```python
# 🎯 FICHIER : back_end/routers/files.py

@router.get("/download/{document_id}")
async def download_file(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Récupérer le document
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    
    # 2. Récupérer la demande associée
    demande = db.query(Demande).filter(Demande.id == document.demande_id).first()
    if not demande:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    
    # 3. Vérifier les permissions
    can_download = False
    
    if current_user.role in ["ADMIN", "SECRETAIRE"]:
        # Admin et secrétaire peuvent tout télécharger
        can_download = True
    elif current_user.id == demande.user_id:
        # L'utilisateur peut télécharger ses propres documents
        can_download = True
    
    if not can_download:
        raise HTTPException(
            status_code=403, 
            detail="Non autorisé à télécharger ce document"
        )
    
    # 4. Vérifier que le fichier existe
    if not os.path.exists(document.chemin):
        raise HTTPException(
            status_code=404, 
            detail="Fichier physique non trouvé"
        )
    
    # 5. Retourner le fichier
    return FileResponse(
        path=document.chemin,
        filename=document.nom_original,
        media_type=document.type_mime
    )
```

---

## 🎯 **COMMENT DÉBOGUER LES PROBLÈMES COURANTS**

### 🐛 **Guide de Résolution des Erreurs**

#### **1. Problèmes de Connexion**
```
❌ ERREUR : "Cannot connect to backend"

🔍 DIAGNOSTIC :
1. Vérifier que le backend tourne :
   - Aller sur http://localhost:8000
   - Vous devriez voir {"message": "API is running"}

2. Vérifier les logs du backend :
   - Regarder le terminal où tourne main.py
   - Chercher les erreurs en rouge

3. Vérifier la configuration du proxy :
   - Fichier vite.config.ts
   - Proxy doit pointer vers http://localhost:8000

✅ SOLUTION :
1. Redémarrer le backend : python main.py
2. Vérifier le port (8000 par défaut)
3. Désactiver le pare-feu temporairement
```

#### **2. Problèmes d'Authentification**
```
❌ ERREUR : "401 Unauthorized"

🔍 DIAGNOSTIC :
1. Vérifier le token JWT :
   - F12 → Application → Local Storage
   - Chercher la clé "token"

2. Vérifier l'en-tête Authorization :
   - F12 → Network → Cliquer sur une requête
   - Headers → Chercher Authorization: Bearer xxx

3. Tester la connexion manuellement :
   - Aller sur http://localhost:8000/docs
   - Tester l'endpoint /auth/login

✅ SOLUTION :
1. Se déconnecter et reconnecter
2. Vider le localStorage (F12 → Application)
3. Vérifier que l'utilisateur existe en base
```

#### **3. Problèmes d'Upload de Fichiers**
```
❌ ERREUR : "File upload failed"

🔍 DIAGNOSTIC :
1. Vérifier la taille du fichier :
   - Maximum 10MB autorisé
   - Compresser le fichier si nécessaire

2. Vérifier l'extension :
   - Autorisées : .pdf, .doc, .docx, .jpg, .png
   - Renommer le fichier si nécessaire

3. Vérifier les permissions du dossier :
   - Le dossier uploads/ doit exister
   - Permissions d'écriture nécessaires

✅ SOLUTION :
1. Créer le dossier uploads/ manuellement
2. Tester avec un petit fichier PDF
3. Vérifier les logs du backend pour plus de détails
```

---

## 🎓 **RÉSUMÉ : MAÎTRISER VOTRE PROJET**

### 📚 **Ce que vous savez maintenant faire :**

```
✅ DÉMARRAGE ET CONFIGURATION
• Installer et configurer l'environnement complet
• Démarrer backend et frontend correctement
• Diagnostiquer les problèmes de démarrage

✅ AUTHENTIFICATION ET SÉCURITÉ
• Comprendre le fonctionnement des tokens JWT
• Gérer les rôles et permissions
• Sécuriser les endpoints et routes

✅ GESTION DES UTILISATEURS
• Créer des enseignants et fonctionnaires
• Modifier les profils utilisateurs
• Gérer les permissions par rôle

✅ GESTION DES DEMANDES
• Créer des demandes avec documents
• Traiter et approuver les demandes
• Suivre le workflow complet

✅ GESTION DES FICHIERS
• Upload sécurisé avec validation
• Stockage organisé par demande
• Téléchargement avec contrôle d'accès

✅ DÉBOGAGE ET MAINTENANCE
• Identifier et résoudre les erreurs courantes
• Utiliser les outils de développement
• Maintenir et faire évoluer le système
```

**🎉 Félicitations ! Vous maîtrisez maintenant tous les aspects de votre projet et pouvez expliquer chaque fonctionnalité en détail !**
