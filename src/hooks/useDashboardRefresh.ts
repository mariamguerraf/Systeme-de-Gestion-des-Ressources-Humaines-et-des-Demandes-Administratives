import { useCallback } from 'react';

// Event personnalisé pour déclencher le rafraîchissement du dashboard
const DASHBOARD_REFRESH_EVENT = 'dashboard-refresh';

export const useDashboardRefresh = () => {
  // Fonction pour déclencher le rafraîchissement
  const triggerRefresh = useCallback(() => {
    console.log('🔄 [Dashboard Hook] Déclenchement du rafraîchissement...');
    window.dispatchEvent(new CustomEvent(DASHBOARD_REFRESH_EVENT));
  }, []);

  // Fonction pour écouter les événements de rafraîchissement
  const onRefresh = useCallback((callback: () => void) => {
    const handler = () => {
      console.log('📊 [Dashboard Hook] Événement de rafraîchissement reçu');
      callback();
    };

    window.addEventListener(DASHBOARD_REFRESH_EVENT, handler);

    // Retourner la fonction de nettoyage
    return () => {
      window.removeEventListener(DASHBOARD_REFRESH_EVENT, handler);
    };
  }, []);

  return {
    triggerRefresh,
    onRefresh
  };
};

export default useDashboardRefresh;
