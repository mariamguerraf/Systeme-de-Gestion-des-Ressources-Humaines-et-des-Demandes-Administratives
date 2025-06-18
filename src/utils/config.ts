// Configuration d'environnement pour l'API
export const getApiBaseUrl = (): string => {
  // En production/codespace, utilise l'URL du codespace
  if (window.location.hostname.includes('app.github.dev')) {
    const hostname = window.location.hostname;
    console.log('🌐 [Config] Hostname détecté:', hostname);

    // Remplace le port frontend par le port backend (8000)
    let backendHostname;
    if (hostname.includes('-8080.')) {
      backendHostname = hostname.replace('-8080.', '-8000.');
    } else if (hostname.includes('-8081.')) {
      backendHostname = hostname.replace('-8081.', '-8000.');
    } else if (hostname.includes('-5173.')) {
      backendHostname = hostname.replace('-5173.', '-8000.');
    } else {
      // Si pas de port détecté, ajouter 8000
      backendHostname = hostname.replace('.app.github.dev', '-8000.app.github.dev');
    }

    const apiUrl = `https://${backendHostname}`;
    console.log('🔗 [Config] URL API construite:', apiUrl);
    return apiUrl;
  }

  // En développement local
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8000';
  }

  // Fallback par défaut
  return 'https://congenial-halibut-4qgp7jg67v35q-8000.app.github.dev';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
} as const;