// Router de Dashboards - Pharma.AI
// Módulo: M09-USUARIOS_PERMISSOES

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useAuthSimple } from '../hooks/useAuthSimple';
import DashboardAdministrativo from './DashboardAdministrativo';
import { DashboardOperacional } from './DashboardOperacional';
import { DashboardAtendimento } from './DashboardAtendimento';
import { DashboardProducao } from './DashboardProducao';
import { AcessoNegado } from './ProtectedComponent';
import type { TipoDashboard } from '../types';
import { AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

/**
 * Router principal para dashboards baseado no perfil do usuário
 * Versão simplificada para melhor performance
 */
export const DashboardRouter: React.FC = () => {
  const { usuario, carregando, autenticado } = useAuthSimple();

  // Loading state simplificado
  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <div className="space-y-2">
                <p className="text-gray-600 font-medium">Carregando dashboard...</p>
                <p className="text-sm text-gray-400">Aguarde um momento...</p>
              </div>
            </div>
          </CardContent>
        </Card>
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

  // Dados do usuário
  const { dashboard: tipoDashboard, usuario: usuarioData, permissoes } = usuario;

  console.log('🎯 DashboardRouter - Dashboard:', tipoDashboard);

  // Renderizar dashboard baseado no tipo
  switch (tipoDashboard) {
    case 'administrativo':
      return (
        <DashboardAdministrativo 
          usuario={usuarioData} 
          permissoes={permissoes} 
        />
      );
    
    case 'operacional':
      return (
        <DashboardOperacional 
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
      return (
        <DashboardProducao 
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
 * Memoizado para evitar re-renders desnecessários
 */
export const useDashboardInfo = () => {
  const { usuario } = useAuthSimple();
  
  return useMemo(() => {
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
  }, [usuario?.dashboard, usuario?.usuario.perfil?.tipo]);
}; 