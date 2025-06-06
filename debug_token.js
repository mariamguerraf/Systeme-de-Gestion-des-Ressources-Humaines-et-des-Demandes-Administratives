// Script de débogage pour vérifier le token d'authentification
// À exécuter dans la console du navigateur

console.log("🔍 Vérification du Token d'Authentification");
console.log("===========================================");

// Vérifier le token dans localStorage
const token = localStorage.getItem('access_token');
console.log("📋 Token stocké:", token ? "✅ Présent" : "❌ Absent");

if (token) {
    console.log("🔑 Token:", token.substring(0, 20) + "...");
    
    // Tenter de décoder le JWT (partie payload)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log("👤 Utilisateur dans le token:", payload);
        console.log("⏰ Expiration:", new Date(payload.exp * 1000));
        console.log("🕐 Maintenant:", new Date());
        console.log("⏳ Token expiré:", new Date() > new Date(payload.exp * 1000));
    } catch (e) {
        console.log("⚠️ Impossible de décoder le token JWT");
    }
} else {
    console.log("❌ Aucun token trouvé - l'utilisateur doit se reconnecter");
}

// Vérifier toutes les clés dans localStorage
console.log("\n📦 Toutes les clés localStorage:");
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(`  - ${key}: ${localStorage.getItem(key)?.substring(0, 30)}...`);
}

// Test de requête à l'API
console.log("\n🧪 Test de requête API:");
fetch('http://localhost:8080/users/enseignants', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        nom: 'TEST',
        prenom: 'Debug',
        email: 'debug@test.com',
        password: 'test123'
    })
})
.then(response => {
    console.log("📡 Réponse API:", response.status, response.statusText);
    return response.json();
})
.then(data => {
    console.log("📄 Données réponse:", data);
})
.catch(error => {
    console.log("❌ Erreur API:", error);
});

console.log("\n💡 Instructions:");
console.log("1. Si le token est absent, reconnectez-vous");
console.log("2. Si le token est expiré, reconnectez-vous");
console.log("3. Si l'API répond 401, vérifiez l'authentification backend");
console.log("4. Si l'API répond 403, vérifiez les permissions admin");
