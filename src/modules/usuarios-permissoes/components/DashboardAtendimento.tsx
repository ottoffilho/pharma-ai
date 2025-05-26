// Dashboard de Atendimento - Pharma.AI
// Módulo: M09-USUARIOS_PERMISSOES

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { DashboardProps } from '../types';

/**
 * Dashboard de Atendimento - Para Atendentes e Balconistas
 */
export const DashboardAtendimento: React.FC<DashboardProps> = ({ usuario, permissoes }) => {
  const { logout } = useAuth();
  const [pedidosHoje, setPedidosHoje] = useState(0);
  const [metaDiaria, setMetaDiaria] = useState(15);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados do atendente
    const carregarDados = async () => {
      try {
        // Aqui seria uma chamada real para buscar dados do atendente
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPedidosHoje(8);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  const progressoMeta = (pedidosHoje / metaDiaria) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Painel de Atendimento
              </h1>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Atendente
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Olá, {usuario.nome}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Métricas Pessoais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Pedidos Hoje */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pedidos Hoje
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {carregando ? '...' : pedidosHoje}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Meta Diária */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Meta Diária
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {metaDiaria} pedidos
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Progresso */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Progresso da Meta</span>
              <span className="text-sm font-medium text-gray-900">{Math.round(progressoMeta)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressoMeta, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {pedidosHoje} de {metaDiaria} pedidos
            </p>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Ações Principais */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Ações Rápidas
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Nova Receita */}
                <a
                  href="/admin/pedidos/nova-receita"
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Nova Receita</p>
                  <p className="text-xs text-gray-500">Cadastrar receita</p>
                </a>

                {/* Consultar Estoque */}
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Consultar Estoque</p>
                  <p className="text-xs text-gray-500">Verificar disponibilidade</p>
                </button>

                {/* PDV */}
                <a
                  href="/admin/pdv"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">PDV</p>
                  <p className="text-xs text-gray-500">Ponto de Venda</p>
                </a>

                {/* Orçamentos */}
                <a
                  href="/admin/orcamentos"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Orçamentos</p>
                  <p className="text-xs text-gray-500">Criar orçamento</p>
                </a>

              </div>
            </div>
          </div>

          {/* Pedidos Pendentes */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Meus Pedidos Pendentes
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                
                {/* Pedido 1 */}
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">#1234 - Maria Silva</p>
                      <p className="text-xs text-gray-500">Manipulação - Aguardando produção</p>
                    </div>
                  </div>
                  <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                    Pendente
                  </span>
                </div>

                {/* Pedido 2 */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">#1235 - João Santos</p>
                      <p className="text-xs text-gray-500">Orçamento - Aguardando aprovação</p>
                    </div>
                  </div>
                  <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                    Orçamento
                  </span>
                </div>

                {/* Pedido 3 */}
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">#1236 - Ana Costa</p>
                      <p className="text-xs text-gray-500">Pronto para entrega</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                    Pronto
                  </span>
                </div>

                {/* Ver todos */}
                <div className="text-center pt-2">
                  <a
                    href="/admin/pedidos"
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Ver todos os pedidos
                  </a>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Informações Úteis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Produtos em Falta */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Produtos em Falta
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900">Paracetamol 500mg</span>
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                    Esgotado
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900">Dipirona Sódica</span>
                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                    Baixo
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900">Ibuprofeno 600mg</span>
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                    Esgotado
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lembretes */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Lembretes
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                  <div>
                    <p className="text-sm text-gray-900">Reunião de equipe às 14h</p>
                    <p className="text-xs text-gray-500">Hoje</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                  <div>
                    <p className="text-sm text-gray-900">Verificar receitas vencidas</p>
                    <p className="text-xs text-gray-500">Amanhã</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                  <div>
                    <p className="text-sm text-gray-900">Treinamento novo sistema</p>
                    <p className="text-xs text-gray-500">Sexta-feira</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}; 