import React from 'react';

const DebugTest: React.FC = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🧪 Página de Teste - Pharma.AI</h1>
      <p>Se você está vendo esta página, o roteamento básico está funcionando!</p>
      <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
      <p><strong>URL:</strong> {window.location.href}</p>
      <a href="/login" style={{ marginRight: '20px' }}>🔐 Ir para Login</a>
      <a href="/admin" style={{ marginRight: '20px' }}>🏠 Ir para Admin</a>
      <a href="/">🏠 Ir para Home</a>
    </div>
  );
};

export default DebugTest; 