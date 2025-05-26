// Router de Dashboards - Pharma.AI
// Módulo: M09-USUARIOS_PERMISSOES

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { DashboardAdministrativo } from './DashboardAdministrativo';
import { DashboardAtendimento } from './DashboardAtendimento';
import { AcessoNegado } from './ProtectedComponent';
import type { TipoDashboard } from '../types';

/**
 * Componente que roteia para o dashboard correto baseado no perfil do usuário
 */
export const DashboardRouter: React.FC = () => {
  const { usuario, carregando, autenticado } = useAuth();

  // Loading state
  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!autenticado || !usuario) {
    return (
      <AcessoNegado
        titulo="Acesso Não Autorizado"
        mensagem="Você precisa estar logado para acessar esta área."
        className="min-h-screen"
      />
    );
  }

  // Route to appropriate dashboard based on user profile
  const tipoDashboard = usuario.dashboard;
  const usuarioData = usuario.usuario;
  const permissoes = usuario.permissoes;

  switch (tipoDashboard) {
    case 'administrativo':
      return (
        <DashboardAdministrativo 
          usuario={usuarioData} 
          permissoes={permissoes} 
        />
      );
    
    case 'operacional':
      // TODO: Implementar DashboardOperacional para farmacêuticos
      return (
        <DashboardAdministrativo 
          usuario={usuarioData} 
          permissoes={permissoes} 
        />
      );
    
    case 'atendimento':
      return (
        <DashboardAtendimento 
          usuario={usuarioData} 
          permissoes={permissoes} 
        />
      );
    
    case 'producao':
      // TODO: Implementar DashboardProducao para manipuladores
      return (
        <DashboardAtendimento 
          usuario={usuarioData} 
          permissoes={permissoes} 
        />
      );
    
    default:
      return (
        <AcessoNegado
          titulo="Dashboard Não Configurado"
          mensagem="Seu perfil não possui um dashboard configurado. Contate o administrador."
          className="min-h-screen"
        />
      );
  }
};

/**
 * Hook para obter informações do dashboard atual
 */
export const useDashboardInfo = () => {
  const { usuario } = useAuth();
  
  const getDashboardTitle = (tipo: TipoDashboard): string => {
    switch (tipo) {
      case 'administrativo':
        return 'Dashboard Administrativo';
      case 'operacional':
        return 'Dashboard Operacional';
      case 'atendimento':
        return 'Painel de Atendimento';
      case 'producao':
        return 'Dashboard de Produção';
      default:
        return 'Dashboard';
    }
  };

  const getDashboardDescription = (tipo: TipoDashboard): string => {
    switch (tipo) {
      case 'administrativo':
        return 'Visão completa da farmácia com acesso a todos os módulos';
      case 'operacional':
        return 'Controle operacional e de produção';
      case 'atendimento':
        return 'Ferramentas para atendimento ao cliente';
      case 'producao':
        return 'Controle de produção e manipulação';
      default:
        return '';
    }
  };

  return {
    tipoDashboard: usuario?.dashboard,
    titulo: usuario?.dashboard ? getDashboardTitle(usuario.dashboard) : '',
    descricao: usuario?.dashboard ? getDashboardDescription(usuario.dashboard) : '',
    perfilUsuario: usuario?.usuario.perfil?.tipo
  };
}; 