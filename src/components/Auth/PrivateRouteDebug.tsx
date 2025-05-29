import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Versão de debug do PrivateRoute que bypassa a autenticação
 * USAR APENAS PARA DEBUG - REMOVER EM PRODUÇÃO
 */
const PrivateRouteDebug: React.FC = () => {
  console.log('🚨 ATENÇÃO: Usando PrivateRouteDebug - BYPASS de autenticação ativo!');
  
  // Sempre renderiza o conteúdo protegido (APENAS PARA DEBUG)
  return <Outlet />;
};

export default PrivateRouteDebug; 