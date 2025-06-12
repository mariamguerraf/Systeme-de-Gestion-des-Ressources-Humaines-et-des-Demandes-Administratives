// Test de persistance - à exécuter dans la console du navigateur
// Ce script teste la persistance de l'état d'authentification

console.log('🧪 Test de persistance démarré...');

// Fonction pour tester la persistance
async function testPersistence() {
  console.log('1️⃣ Nettoyage initial...');
  localStorage.removeItem('access_token');
  localStorage.removeItem('current_user');
  
  console.log('2️⃣ Test de connexion...');
  const formData = new FormData();
  formData.append('username', 'admin@gestion.com');
  formData.append('password', 'password123');

  try {
    const loginResponse = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      body: formData
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Connexion réussie:', loginData);
    
    // Simuler le comportement de l'AuthContext
    localStorage.setItem('access_token', loginData.access_token);
    
    // Récupérer les données utilisateur
    const userResponse = await fetch('http://localhost:8000/auth/me', {
      headers: { 'Authorization': `Bearer ${loginData.access_token}` }
    });
    
    const userData = await userResponse.json();
    console.log('✅ Données utilisateur:', userData);
    
    // Sauvegarder l'utilisateur
    localStorage.setItem('current_user', JSON.stringify(userData));
    
    console.log('3️⃣ Vérification de la persistance...');
    const savedToken = localStorage.getItem('access_token');
    const savedUser = JSON.parse(localStorage.getItem('current_user') || '{}');
    
    console.log('💾 Token sauvé:', savedToken ? `${savedToken.substring(0, 20)}...` : 'AUCUN');
    console.log('💾 Utilisateur sauvé:', savedUser);
    
    if (savedToken && savedUser.email) {
      console.log('🎉 PERSISTANCE RÉUSSIE !');
      console.log('📍 Redirection attendue pour rôle:', savedUser.role);
      
      const redirections = {
        'ADMIN': '/cadmin/dashboard',
        'SECRETAIRE': '/secretaire/dashboard',
        'ENSEIGNANT': '/enseignant/profil',
        'FONCTIONNAIRE': '/fonctionnaire/profil'
      };
      
      console.log('➡️ URL de redirection:', redirections[savedUser.role] || 'INCONNUE');
      
      return true;
    } else {
      console.log('❌ PERSISTANCE ÉCHOUÉE !');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur durant le test:', error);
    return false;
  }
}

// Exécuter le test
testPersistence().then(success => {
  if (success) {
    console.log('✅ Test de persistance terminé avec succès');
    console.log('🔄 Maintenant, vous pouvez recharger la page et vérifier que l\'état persiste');
  } else {
    console.log('❌ Test de persistance échoué');
  }
});
