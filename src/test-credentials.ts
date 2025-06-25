// Credentials de test pour le développement
// ⚠️ NE JAMAIS UTILISER EN PRODUCTION ⚠️

export const TEST_CREDENTIALS = {
  // Administrateur
  admin: {
    email: "admin@univ.ma",
    password: "admin2024",
    role: "admin"
  },

  // Secrétaire
  secretaire: {
    email: "secretaire@univ.ma",
    password: "secretaire2024",
    role: "secretaire"
  },

  // Enseignant
  enseignant: {
    email: "enseignant@univ.ma",
    password: "enseignant2024",
    role: "enseignant"
  },

  // Fonctionnaire
  fonctionnaire: {
    email: "fonctionnaire@univ.ma",
    password: "fonction2024",
    role: "fonctionnaire"
  },

  // Test rapide
  test: {
    email: "test@test.com",
    password: "123",
    role: "admin"
  }
};

// Fonction utilitaire pour obtenir des credentials de test
export const getTestCredentials = (role: 'admin' | 'secretaire' | 'enseignant' | 'fonctionnaire' | 'test') => {
  return TEST_CREDENTIALS[role];
};

// Liste de tous les emails de test disponibles
export const getAllTestEmails = () => {
  return Object.values(TEST_CREDENTIALS).map(cred => cred.email);
};

// Affichage des credentials pour le développement
export const displayTestCredentials = () => {
  console.log("🔧 Credentials de test disponibles:");
  Object.entries(TEST_CREDENTIALS).forEach(([role, creds]) => {
    console.log(`${role.toUpperCase()}: ${creds.email} / ${creds.password}`);
  });
};
