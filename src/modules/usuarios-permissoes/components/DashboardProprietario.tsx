// Dashboard do Proprietário - Sistema Multi-Farmácia
// Módulo: M09-USUARIOS_PERMISSOES
// Versão: 3.1 - Interface Funcional com Melhor Tratamento de Erros

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Building2,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Crown,
  MapPin,
  Phone,
  Mail,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  DollarSign,
  ShoppingCart,
  Star,
  Target,
  Calendar,
  Clock,
  Award,
  Sparkles,
  ChevronRight,
  Eye,
  Settings,
  Newspaper,
  Filter,
  Download,
  Percent
} from 'lucide-react';
import { SeletorFarmacia } from './SeletorFarmacia';
import type { DashboardProps, EstatisticasProprietario, Farmacia } from '../types';
import { supabase } from '@/integrations/supabase/client';

// =====================================================
// INTERFACES LOCAIS
// =====================================================

interface FiltrosPeriodo {
  data_inicio?: string;
  data_fim?: string;
  incluir_comparacao: boolean;
  incluir_detalhes_usuarios: boolean;
}

interface ComparacaoPeriodo {
  total_vendas_atual: number;
  total_vendas_anterior: number;
  variacao_percentual: number;
  quantidade_vendas_atual: number;
  quantidade_vendas_anterior: number;
  ticket_medio_atual: number;
  ticket_medio_anterior: number;
}

// =====================================================
// DADOS MOCK PARA FALLBACK
// =====================================================

const DADOS_MOCK: EstatisticasProprietario = {
  total_farmacias: 1,
  total_usuarios: 5,
  total_produtos: 150,
  vendas_30_dias: [
    {
      farmacia_id: 'farmacia-demo-1',
      farmacia_nome: 'Farmácia Demo 1',
      total_vendas: 125000,
      quantidade_vendas: 850,
      ticket_medio: 147.06
    }
  ],
  estoque_consolidado: [
    {
      produto_id: 'prod-1',
      produto_nome: 'Dipirona 500mg',
      estoque_total: 2400,
      farmacias_com_estoque: 1,
      tipo_produto: 'MEDICAMENTO'
    },
    {
      produto_id: 'prod-2',
      produto_nome: 'Paracetamol 750mg',
      estoque_total: 1800,
      farmacias_com_estoque: 1,
      tipo_produto: 'MEDICAMENTO'
    },
    {
      produto_id: 'prod-3',
      produto_nome: 'Ibuprofeno 600mg',
      estoque_total: 1200,
      farmacias_com_estoque: 1,
      tipo_produto: 'MEDICAMENTO'
    }
  ],
  comparacao_periodo_anterior: {
    total_vendas_atual: 125000,
    total_vendas_anterior: 106250,
    variacao_percentual: 17.6,
    quantidade_vendas_atual: 850,
    quantidade_vendas_anterior: 765,
    ticket_medio_atual: 147.06,
    ticket_medio_anterior: 138.89
  }
};

/**
 * Dashboard Completo para Proprietários
 * Interface moderna com filtros de período, comparações e cache inteligente
 */
export const DashboardProprietario: React.FC<DashboardProps> = ({ usuario, permissoes }) => {
  const { toast } = useToast();
  const [farmaciaExpandida, setFarmaciaExpandida] = useState<string | null>(null);
  const [animacaoAtiva, setAnimacaoAtiva] = useState(false);
  const [usandoDadosMock, setUsandoDadosMock] = useState(false);
  
  // Estados para filtros
  const [filtros, setFiltros] = useState<FiltrosPeriodo>({
    incluir_comparacao: true,
    incluir_detalhes_usuarios: true
  });

  // Animação de entrada
  useEffect(() => {
    setAnimacaoAtiva(true);
  }, []);

  // =====================================================
  // BUSCA DE DADOS COM FALLBACK ROBUSTO
  // =====================================================

  // Buscar estatísticas consolidadas do proprietário
  const { 
    data: estatisticas, 
    isLoading: carregandoEstatisticas, 
    refetch: recarregarEstatisticas, 
    error: erroEstatisticas 
  } = useQuery({
    queryKey: [
      'estatisticas-proprietario', 
      usuario.id, // Usar ID do usuário sempre
      filtros.data_inicio, 
      filtros.data_fim,
      filtros.incluir_comparacao,
      filtros.incluir_detalhes_usuarios
    ],
    queryFn: async (): Promise<EstatisticasProprietario> => {
      try {
        console.log('🔍 DashboardProprietario - Dados do usuário:', {
          usuario_id: usuario.id,
          proprietario_id: usuario.proprietario_id,
          farmacia_id: usuario.farmacia_id,
          perfil: usuario.perfil?.tipo
        });

        // Usar o ID do usuário como proprietario_id se não estiver definido
        const proprietarioId = usuario.proprietario_id || usuario.id;
        console.log('🏪 DashboardProprietario - Usando proprietario_id:', proprietarioId);

        // Tentar chamar a Edge Function
        const { data, error } = await supabase.functions.invoke('dashboard-proprietario', {
          body: {
            proprietario_id: proprietarioId,
            ...filtros
          }
        });

        if (error) {
          console.warn('⚠️ Erro na Edge Function, usando dados mock:', error);
          setUsandoDadosMock(true);
          return DADOS_MOCK;
        }

        if (!data || !data.data) {
          console.warn('⚠️ Dados vazios da Edge Function, usando dados mock');
          setUsandoDadosMock(true);
          return DADOS_MOCK;
        }

        console.log('✅ Dados recebidos da Edge Function:', data);
        setUsandoDadosMock(false);
        return data.data;

      } catch (error) {
        console.error('❌ Erro ao buscar estatísticas do proprietário:', error);
        console.log('🔄 Usando dados mock como fallback');
        setUsandoDadosMock(true);
        
        // Mostrar toast de aviso
        toast({
          title: "Modo Demonstração",
          description: "Exibindo dados de demonstração. Verifique a conexão com o banco de dados.",
          variant: "destructive",
        });

        return DADOS_MOCK;
      }
    },
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
    staleTime: 2 * 60 * 1000, // Dados são considerados atuais por 2 minutos
    retry: 1, // Tentar apenas uma vez antes de usar fallback
  });

  // =====================================================
  // FUNÇÕES AUXILIARES
  // =====================================================

  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarPercentual = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(valor / 100);
  };

  const obterCorVariacao = (variacao: number): string => {
    if (variacao > 0) return 'text-green-600';
    if (variacao < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const obterIconeVariacao = (variacao: number) => {
    if (variacao > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (variacao < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  // =====================================================
  // HANDLERS DE AÇÕES - BOTÕES FUNCIONAIS
  // =====================================================

  const handleNovaFarmacia = () => {
    toast({
      title: "Nova Farmácia",
      description: "Redirecionando para cadastro de nova farmácia...",
    });
    // Aqui você pode implementar navegação para a página de cadastro
    window.location.href = '/admin/farmacias/nova';
  };

  const handleGerenciarUsuarios = () => {
    toast({
      title: "Gerenciar Usuários",
      description: "Redirecionando para gestão de usuários...",
    });
    window.location.href = '/admin/usuarios';
  };

  const handleTransferirEstoque = () => {
    toast({
      title: "Transferência de Estoque",
      description: "Redirecionando para transferência entre farmácias...",
    });
    window.location.href = '/admin/estoque/transferencia';
  };

  const handleRelatorios = () => {
    toast({
      title: "Relatórios",
      description: "Redirecionando para módulo de relatórios...",
    });
    window.location.href = '/admin/relatorios';
  };

  // =====================================================
  // HANDLERS DE FILTROS
  // =====================================================

  const handleFiltroChange = (novosFiltros: Partial<FiltrosPeriodo>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  };

  const resetarFiltros = () => {
    setFiltros({
      data_inicio: undefined,
      data_fim: undefined,
      incluir_comparacao: true,
      incluir_detalhes_usuarios: true
    });
  };

  const definirPeriodoPreset = (preset: 'hoje' | '7dias' | '30dias' | '90dias') => {
    const hoje = new Date();
    const inicios = {
      hoje: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()),
      '7dias': new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30dias': new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90dias': new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000)
    };

    setFiltros(prev => ({
      ...prev,
      data_inicio: inicios[preset].toISOString().split('T')[0],
      data_fim: hoje.toISOString().split('T')[0]
    }));
  };

  // =====================================================
  // CÁLCULOS DERIVADOS
  // =====================================================

  // Calcular métricas principais
  const totalVendas = estatisticas?.vendas_30_dias?.reduce((acc, item) => acc + item.total_vendas, 0) || 0;
  const totalQuantidadeVendas = estatisticas?.vendas_30_dias?.reduce((acc, item) => acc + item.quantidade_vendas, 0) || 0;
  const ticketMedio = totalQuantidadeVendas > 0 ? totalVendas / totalQuantidadeVendas : 0;

  // Calcular eficiência operacional (mock)
  const eficienciaOperacional = Math.min(95, Math.round(70 + (estatisticas?.total_farmacias || 1) * 5));

  // Determinar melhor farmácia
  const melhorFarmacia = estatisticas?.vendas_30_dias?.reduce((melhor, atual) => 
    atual.total_vendas > melhor.total_vendas ? atual : melhor
  , estatisticas?.vendas_30_dias?.[0] || { farmacia_nome: 'N/A', total_vendas: 0 });

  // =====================================================
  // RENDERIZAÇÃO
  // =====================================================

  // Sempre usar dados - mock se necessário
  const dadosExibicao = estatisticas || DADOS_MOCK;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 transition-all duration-1000 ${animacaoAtiva ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header Surpreendente */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Dashboard do Proprietário
                    </h1>
                    <p className="text-gray-600 text-lg">
                      Bem-vindo de volta, <span className="font-semibold text-gray-800">{usuario.nome}</span>! 
                      <Sparkles className="inline h-4 w-4 ml-1 text-yellow-500" />
                    </p>
                  </div>
                </div>
                
                {/* Indicador de Status */}
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {dadosExibicao.total_farmacias || 0} Farmácias Ativas
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Activity className="h-3 w-3 mr-1" />
                    Sistema Operacional
                  </Badge>
                  {carregandoEstatisticas && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Carregando
                    </Badge>
                  )}
                  {usandoDadosMock && (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Modo Demo
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Ações Rápidas do Header */}
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => recarregarEstatisticas()}
                  disabled={carregandoEstatisticas}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${carregandoEstatisticas ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Alerta de Modo Demonstração */}
        {usandoDadosMock && (
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">Modo Demonstração Ativo</p>
                  <p className="text-sm text-orange-700">
                    Os dados exibidos são fictícios para demonstração. Verifique a configuração do banco de dados.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* =====================================================
            CONTROLES DE FILTRO
            ===================================================== */}
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Filter className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg">Filtros e Período</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={resetarFiltros}>
                Resetar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Presets de Período */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Períodos Rápidos</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'hoje', label: 'Hoje' },
                  { key: '7dias', label: 'Últimos 7 dias' },
                  { key: '30dias', label: 'Últimos 30 dias' },
                  { key: '90dias', label: 'Últimos 90 dias' }
                ].map(preset => (
                  <Button
                    key={preset.key}
                    variant="outline"
                    size="sm"
                    onClick={() => definirPeriodoPreset(preset.key as any)}
                    className="bg-white/80"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Período Customizado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data de Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={filtros.data_inicio || ''}
                  onChange={(e) => handleFiltroChange({ data_inicio: e.target.value })}
                  className="bg-white/80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_fim">Data de Fim</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={filtros.data_fim || ''}
                  onChange={(e) => handleFiltroChange({ data_fim: e.target.value })}
                  className="bg-white/80"
                />
              </div>
            </div>

            {/* Opções Avançadas */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="incluir_comparacao"
                  checked={filtros.incluir_comparacao}
                  onCheckedChange={(checked) => handleFiltroChange({ incluir_comparacao: checked })}
                />
                <Label htmlFor="incluir_comparacao" className="text-sm">
                  Incluir comparação com período anterior
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="incluir_detalhes_usuarios"
                  checked={filtros.incluir_detalhes_usuarios}
                  onCheckedChange={(checked) => handleFiltroChange({ incluir_detalhes_usuarios: checked })}
                />
                <Label htmlFor="incluir_detalhes_usuarios" className="text-sm">
                  Incluir detalhes de usuários
                </Label>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* =====================================================
            MÉTRICAS PRINCIPAIS COM COMPARAÇÃO
            ===================================================== */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total de Vendas */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm font-medium">Total de Vendas</p>
                  <p className="text-3xl font-bold text-gray-800">{formatarMoeda(totalVendas)}</p>
                  
                  {/* Comparação com período anterior */}
                  {dadosExibicao.comparacao_periodo_anterior && (
                    <div className={`flex items-center gap-1 ${obterCorVariacao(dadosExibicao.comparacao_periodo_anterior.variacao_percentual)}`}>
                      {obterIconeVariacao(dadosExibicao.comparacao_periodo_anterior.variacao_percentual)}
                      <span className="text-sm font-medium">
                        {dadosExibicao.comparacao_periodo_anterior.variacao_percentual > 0 ? '+' : ''}
                        {formatarPercentual(Math.abs(dadosExibicao.comparacao_periodo_anterior.variacao_percentual))}
                      </span>
                      <span className="text-xs text-gray-500">vs período anterior</span>
                    </div>
                  )}
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantity de Vendas */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm font-medium">Vendas Realizadas</p>
                  <p className="text-3xl font-bold text-gray-800">{totalQuantidadeVendas.toLocaleString('pt-BR')}</p>
                  
                  {/* Comparação */}
                  {dadosExibicao.comparacao_periodo_anterior && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="text-sm">
                        vs {dadosExibicao.comparacao_periodo_anterior.quantidade_vendas_anterior} anterior
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Médio */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm font-medium">Ticket Médio</p>
                  <p className="text-3xl font-bold text-gray-800">{formatarMoeda(ticketMedio)}</p>
                  
                  {/* Comparação */}
                  {dadosExibicao.comparacao_periodo_anterior && (
                    <div className="flex items-center gap-1 text-purple-600">
                      <Target className="h-4 w-4" />
                      <span className="text-sm">
                        vs {formatarMoeda(dadosExibicao.comparacao_periodo_anterior.ticket_medio_anterior)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <Target className="h-7 w-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Farmácias Ativas */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm font-medium">Farmácias Ativas</p>
                  <p className="text-3xl font-bold text-gray-800">{dadosExibicao.total_farmacias || 0}</p>
                  
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">Todas operacionais</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Resto do componente continua igual... */}
        {/* Performance por Farmácia */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Performance por Farmácia</CardTitle>
                  <CardDescription>
                    {filtros.data_inicio && filtros.data_fim 
                      ? `Período: ${new Date(filtros.data_inicio).toLocaleDateString('pt-BR')} a ${new Date(filtros.data_fim).toLocaleDateString('pt-BR')}`
                      : 'Últimos 30 dias'
                    }
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary">{dadosExibicao.vendas_30_dias?.length || 0} farmácias</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dadosExibicao.vendas_30_dias?.map((farmacia, index) => {
                const participacao = totalVendas > 0 ? (farmacia.total_vendas / totalVendas) * 100 : 0;
                const isExpanded = farmaciaExpandida === farmacia.farmacia_id;
                
                return (
                  <div 
                    key={farmacia.farmacia_id}
                    className="p-4 rounded-xl bg-gradient-to-r from-white/50 to-gray-50/50 border border-gray-200/50 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                            index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                            index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                            'bg-gradient-to-br from-blue-400 to-blue-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{farmacia.farmacia_nome}</h3>
                            <p className="text-sm text-gray-600">
                              {farmacia.quantidade_vendas} vendas • Ticket: {formatarMoeda(farmacia.ticket_medio || farmacia.total_vendas / Math.max(farmacia.quantidade_vendas, 1))}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-800">{formatarMoeda(farmacia.total_vendas)}</p>
                          <p className="text-sm text-gray-600">{participacao.toFixed(1)}% do total</p>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFarmaciaExpandida(isExpanded ? null : farmacia.farmacia_id)}
                          className="hover:bg-white/80"
                        >
                          <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Barra de Progresso */}
                    <div className="mt-3">
                      <Progress value={participacao} className="h-2" />
                    </div>
                    
                    {/* Detalhes Expandidos */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200/50">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white/60 rounded-lg p-3">
                            <p className="text-xs text-gray-600">Vendas</p>
                            <p className="font-semibold">{farmacia.quantidade_vendas}</p>
                          </div>
                          <div className="bg-white/60 rounded-lg p-3">
                            <p className="text-xs text-gray-600">Ticket Médio</p>
                            <p className="font-semibold">{formatarMoeda(farmacia.ticket_medio || farmacia.total_vendas / Math.max(farmacia.quantidade_vendas, 1))}</p>
                          </div>
                          <div className="bg-white/60 rounded-lg p-3">
                            <p className="text-xs text-gray-600">Participação</p>
                            <p className="font-semibold">{participacao.toFixed(1)}%</p>
                          </div>
                          <div className="bg-white/60 rounded-lg p-3">
                            <p className="text-xs text-gray-600">Posição</p>
                            <p className="font-semibold">#{index + 1}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Estoque Consolidado */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Estoque Consolidado</CardTitle>
                <CardDescription>Produtos com maior disponibilidade na rede</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {dadosExibicao.estoque_consolidado?.slice(0, 8).map((produto, index) => (
                <div 
                  key={produto.produto_id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-white/50 to-gray-50/30 border border-gray-200/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{produto.produto_nome}</h4>
                      <p className="text-sm text-gray-600">
                        {produto.farmacias_com_estoque} farmácias • {produto.tipo_produto || 'MEDICAMENTO'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{produto.estoque_total.toLocaleString('pt-BR')} un</p>
                    <Badge 
                      variant={produto.estoque_total > 1000 ? "default" : produto.estoque_total > 500 ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {produto.estoque_total > 1000 ? 'Alto' : produto.estoque_total > 500 ? 'Médio' : 'Baixo'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Métricas Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Eficiência Operacional */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Eficiência Operacional</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{eficienciaOperacional}%</p>
                  <Progress value={eficienciaOperacional} className="mt-2 h-2" />
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Melhor Farmácia */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Melhor Performance</p>
                  <p className="text-lg font-bold text-gray-800 mt-1 truncate">{melhorFarmacia?.farmacia_nome}</p>
                  <p className="text-sm text-gray-600">{formatarMoeda(melhorFarmacia?.total_vendas || 0)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Produtos Cadastrados */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Produtos Cadastrados</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{(dadosExibicao.total_produtos || 0).toLocaleString('pt-BR')}</p>
                  <p className="text-sm text-gray-600">No catálogo</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
                  <Package className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Ações Rápidas */}
        <Card className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white border-0 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <CardContent className="relative p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Ações Rápidas</h3>
              <p className="text-purple-100">Gerencie sua rede de farmácias com eficiência</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="ghost" className="h-auto p-4 text-white hover:bg-white/20 flex flex-col items-center gap-2" onClick={handleNovaFarmacia}>
                <Plus className="h-8 w-8" />
                <span className="text-sm font-medium">Nova Farmácia</span>
              </Button>
              
              <Button variant="ghost" className="h-auto p-4 text-white hover:bg-white/20 flex flex-col items-center gap-2" onClick={handleGerenciarUsuarios}>
                <Users className="h-8 w-8" />
                <span className="text-sm font-medium">Gerenciar Usuários</span>
              </Button>
              
              <Button variant="ghost" className="h-auto p-4 text-white hover:bg-white/20 flex flex-col items-center gap-2" onClick={handleTransferirEstoque}>
                <Package className="h-8 w-8" />
                <span className="text-sm font-medium">Transferir Estoque</span>
              </Button>
              
              <Button variant="ghost" className="h-auto p-4 text-white hover:bg-white/20 flex flex-col items-center gap-2" onClick={handleRelatorios}>
                <BarChart3 className="h-8 w-8" />
                <span className="text-sm font-medium">Relatórios</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer com informações adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Informações do Sistema */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg">Informações do Sistema</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Dashboard Otimizado</p>
                  <p className="text-sm text-blue-600">
                    {dadosExibicao.metadata?.cached ? 'Dados em cache' : 'Dados em tempo real'} 
                    {dadosExibicao.metadata?.periodo_customizado && ' • Período customizado'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Sistema Multi-Farmácia Ativo</p>
                  <p className="text-sm text-green-600">
                    Última atualização: {dadosExibicao.metadata?.data_atualizacao ? 
                      new Date(dadosExibicao.metadata.data_atualizacao).toLocaleString('pt-BR') : 
                      'Agora'
                    }
                  </p>
                </div>
              </div>

              {dadosExibicao.usuarios_detalhados && (
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-800">
                      {dadosExibicao.usuarios_detalhados.total_usuarios} Usuários Ativos
                    </p>
                    <p className="text-sm text-purple-600">
                      Distribuídos em todas as farmácias da rede
                    </p>
                  </div>
                </div>
              )}
              
            </CardContent>
          </Card>

          {/* Suporte */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg">Suporte Técnico</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Telefone</p>
                  <p className="text-sm text-gray-600">(11) 9999-9999</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">E-mail</p>
                  <p className="text-sm text-gray-600">suporte@pharma.ai</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Horário de Atendimento</p>
                  <p className="text-sm text-gray-600">Segunda à Sexta, 8h às 18h</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
};

export default DashboardProprietario; 