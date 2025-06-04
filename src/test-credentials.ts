// Credentials de test pour le développement
// ⚠️ NE JAMAIS UTILISER EN PRODUCTION ⚠️

export const TEST_CREDENTIALS = {
  // Administrateur
  admin: {
    email: "admin@gestion.com",
    password: "password123",
    role: "admin"
  },

  // Secrétaire
  secretaire: {
    email: "secretaire@gestion.com",
    password: "password123",
    role: "secretaire"
  },

  // Enseignant
  enseignant: {
    email: "enseignant@gestion.com",
    password: "password123",
    role: "enseignant"
  },

  // Fonctionnaire
  fonctionnaire: {
    email: "fonctionnaire@gestion.com",
    password: "password123",
    role: "fonctionnaire"
  }
};

// Fonction utilitaire pour obtenir des credentials de test
export const getTestCredentials = (role: 'admin' | 'secretaire' | 'enseignant' | 'fonctionnaire') => {
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
