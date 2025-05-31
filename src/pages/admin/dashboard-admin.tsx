// Página para forçar Dashboard Administrativo - TEMPORÁRIO
import React from 'react';
import { useAuthSimple } from '@/modules/usuarios-permissoes/hooks/useAuthSimple';
import DashboardAdministrativo from '@/modules/usuarios-permissoes/components/DashboardAdministrativo';
import { Navigate } from 'react-router-dom';

const DashboardAdminPage: React.FC = () => {
  const { usuario, carregando, autenticado } = useAuthSimple();

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!autenticado || !usuario) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardAdministrativo 
      usuario={usuario.usuario} 
      permissoes={usuario.permissoes} 
    />
  );
};

export default DashboardAdminPage; 