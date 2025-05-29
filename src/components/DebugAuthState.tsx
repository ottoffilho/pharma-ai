import React from 'react';
import { useAuthSimple } from '@/modules/usuarios-permissoes/hooks/useAuthSimple';

const DebugAuthState: React.FC = () => {
  const { usuario, carregando, autenticado, erro } = useAuthSimple();

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-bold mb-2">🔍 Debug Auth State</div>
      <div className="space-y-1">
        <div>
          <span className="text-yellow-300">Carregando:</span> 
          <span className={carregando ? 'text-red-400' : 'text-green-400'}>
            {carregando ? 'SIM' : 'NÃO'}
          </span>
        </div>
        <div>
          <span className="text-yellow-300">Autenticado:</span> 
          <span className={autenticado ? 'text-green-400' : 'text-red-400'}>
            {autenticado ? 'SIM' : 'NÃO'}
          </span>
        </div>
        <div>
          <span className="text-yellow-300">Usuário:</span> 
          <span className="text-blue-300">
            {usuario?.usuario?.nome || 'Nenhum'}
          </span>
        </div>
        <div>
          <span className="text-yellow-300">Dashboard:</span> 
          <span className="text-purple-300">
            {usuario?.dashboard || 'N/A'}
          </span>
        </div>
        {erro && (
          <div>
            <span className="text-yellow-300">Erro:</span> 
            <span className="text-red-400">{erro}</span>
          </div>
        )}
        <div className="text-gray-400 text-xs mt-2">
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default DebugAuthState; 