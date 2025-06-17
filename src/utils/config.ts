// Configuration d'environnement pour l'API
export const getApiBaseUrl = (): string => {
  // En production/codespace, utilise l'URL du codespace
  if (window.location.hostname.includes('app.github.dev')) {
    const hostname = window.location.hostname;
    // Remplace le port 8080 (frontend) par 8000 (backend)
    const backendHostname = hostname.replace('-8080.', '-8000.');
    return `https://${backendHostname}`;
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