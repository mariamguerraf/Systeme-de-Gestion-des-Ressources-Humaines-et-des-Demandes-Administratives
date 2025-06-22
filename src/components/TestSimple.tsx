import React from 'react';

const TestSimple = () => {
  console.log('🧪 TestSimple - Composant de test chargé');

  return (
    <div style={{
      padding: '50px',
      backgroundColor: '#f0f8ff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{
        color: '#2c5282',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        🧪 Test de Rendu React
      </h1>

      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <p style={{ color: '#2d3748', marginBottom: '20px' }}>
          ✅ Si vous voyez ce message, React fonctionne correctement !
        </p>

        <div style={{
          backgroundColor: '#e6fffa',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <strong>Informations de test :</strong>
          <br />
          📅 Date: {new Date().toLocaleString()}
          <br />
          🌐 URL: {window.location.href}
          <br />
          🏠 Host: {window.location.hostname}
        </div>

        <button
          onClick={() => {
            console.log('🔘 Bouton cliqué !');
            alert('✅ Les événements React fonctionnent !');
          }}
          style={{
            backgroundColor: '#4299e1',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🔘 Tester les événements
        </button>
      </div>
    </div>
  );
};

export default TestSimple;
