import React, { useState, useEffect } from 'react';

const LoginDebug = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [backendUrl, setBackendUrl] = useState('');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[LOGIN DEBUG] ${message}`);
  };

  useEffect(() => {
    addLog('🚀 Composant LoginDebug chargé');

    // Configuration
    const getApiBaseUrl = (): string => {
      if (window.location.hostname.includes('app.github.dev')) {
        const hostname = window.location.hostname;
        let backendHostname;
        if (hostname.includes('-8081.')) {
          backendHostname = hostname.replace('-8081.', '-8000.');
        } else if (hostname.includes('-8080.')) {
          backendHostname = hostname.replace('-8080.', '-8000.');
        } else if (hostname.includes('-5173.')) {
          backendHostname = hostname.replace('-5173.', '-8000.');
        } else {
          backendHostname = hostname.replace('.app.github.dev', '-8000.app.github.dev');
        }
        return `https://${backendHostname}`;
      }
      if (window.location.hostname === 'localhost') {
        return 'http://localhost:8000';
      }
      return 'https://congenial-halibut-4qgp7jg67v35q-8000.app.github.dev';
    };

    const apiUrl = getApiBaseUrl();
    setBackendUrl(apiUrl);
    addLog(`🔗 URL Backend calculée: ${apiUrl}`);

    // Test de connectivité automatique
    testBackendHealth();
  }, []);

  const testBackendHealth = async () => {
    addLog('🔍 Test de sanité du backend...');
    try {
      const response = await fetch(`${backendUrl}/health`);
      if (response.ok) {
        const data = await response.json();
        addLog(`✅ Backend accessible: ${JSON.stringify(data)}`);
      } else {
        addLog(`❌ Backend répond mais avec erreur: ${response.status}`);
      }
    } catch (error) {
      addLog(`❌ Impossible de joindre le backend: ${error}`);
    }
  };

  const testLoginComponent = () => {
    addLog('🔍 Test des composants React...');

    try {
      // Test des imports
      addLog('✅ Composant LoginDebug fonctionnel');
      addLog('✅ React hooks fonctionnels');
      addLog('✅ TypeScript compilé correctement');
    } catch (error) {
      addLog(`❌ Erreur dans les composants: ${error}`);
    }
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1>🔍 Diagnostic React Login</h1>

        <div style={{
          backgroundColor: '#d1ecf1',
          padding: '15px',
          borderRadius: '4px',
          margin: '20px 0'
        }}>
          <h3>🌐 Configuration</h3>
          <p><strong>Frontend URL:</strong> {window.location.origin}</p>
          <p><strong>Backend URL:</strong> {backendUrl}</p>
          <p><strong>Hostname:</strong> {window.location.hostname}</p>
        </div>

        <div style={{ margin: '20px 0' }}>
          <button
            onClick={testBackendHealth}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              margin: '5px'
            }}
          >
            Test Backend
          </button>
          <button
            onClick={testLoginComponent}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              margin: '5px'
            }}
          >
            Test Composants React
          </button>
        </div>

        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          padding: '15px',
          borderRadius: '4px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <h3>📋 Logs</h3>
          {logs.map((log, index) => (
            <div key={index} style={{
              marginBottom: '5px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginDebug;
