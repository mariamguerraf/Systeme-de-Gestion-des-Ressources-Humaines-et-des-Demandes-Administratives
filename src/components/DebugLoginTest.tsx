import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

const DebugLoginTest: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const { user, isAuthenticated, login } = useAuth();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const testDirectApiLogin = async () => {
    setLogs([]);
    addLog('🔄 Test de connexion directe via API...');
    
    try {
      addLog('📡 Appel apiService.login...');
      const result = await apiService.login('admin@gestion.com', 'password123');
      addLog(`✅ Login réussi: ${JSON.stringify(result)}`);
      
      addLog('📡 Vérification du token stocké...');
      const token = localStorage.getItem('access_token');
      addLog(`🔐 Token: ${token ? `${token.substring(0, 30)}...` : 'AUCUN'}`);
      
      addLog('📡 Appel getCurrentUser...');
      const currentUser = await apiService.getCurrentUser();
      addLog(`👤 Utilisateur: ${JSON.stringify(currentUser)}`);
      
    } catch (error) {
      addLog(`❌ Erreur: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testContextLogin = async () => {
    setLogs([]);
    addLog('🔄 Test de connexion via AuthContext...');
    
    try {
      await login({ email: 'admin@gestion.com', password: 'password123' });
      addLog('✅ Login via contexte réussi');
    } catch (error) {
      addLog(`❌ Erreur contexte: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('access_token');
    addLog('🗑️ Storage nettoyé');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Login Test</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold">État actuel:</h2>
        <p>Utilisateur connecté: {isAuthenticated ? 'OUI' : 'NON'}</p>
        <p>Utilisateur: {user ? `${user.email} (${user.role})` : 'Aucun'}</p>
        <p>Token: {localStorage.getItem('access_token') ? 'Présent' : 'Absent'}</p>
      </div>

      <div className="space-x-4 mb-4">
        <button 
          onClick={testDirectApiLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test API Direct
        </button>
        <button 
          onClick={testContextLogin}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Test Contexte
        </button>
        <button 
          onClick={clearStorage}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Clear Storage
        </button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
        <h3 className="text-white font-bold mb-2">Logs:</h3>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
};

export default DebugLoginTest;
