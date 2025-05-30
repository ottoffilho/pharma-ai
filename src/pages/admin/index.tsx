import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  ShoppingCart, 
  FlaskConical, 
  Box, 
  AlertCircle, 
  TrendingUp, 
  DollarSign, 
  Calculator, 
  Info, 
  Brain, 
  Sparkles, 
  Lightbulb, 
  BarChart,
  Users,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  Calendar,
  PieChart,
  LineChart
} from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

const AdminDashboard: React.FC = () => {
  // Query to get count of processed recipes
  const { data: receitasCount, isLoading: receitasLoading } = useQuery({
    queryKey: ['receitasCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('receitas_processadas')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw new Error(error.message);
      return count || 0;
    }
  });

  // Query to get count of orders
  const { data: pedidosCount, isLoading: pedidosLoading } = useQuery({
    queryKey: ['pedidosCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw new Error(error.message);
      return count || 0;
    }
  });

  // Query to get count of inputs
  const { data: insumosCount, isLoading: insumosLoading } = useQuery({
    queryKey: ['insumosCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('insumos')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw new Error(error.message);
      return count || 0;
    }
  });

  // Query to get count of packages
  const { data: embalagensCount, isLoading: embalagensLoading } = useQuery({
    queryKey: ['embalagensCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('embalagens')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw new Error(error.message);
      return count || 0;
    }
  });

  // Query to get users count
  const { data: usuariosCount, isLoading: usuariosLoading } = useQuery({
    queryKey: ['usuariosCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw new Error(error.message);
      return count || 0;
    }
  });

  // Calculate if any queries are loading
  const isLoading = receitasLoading || pedidosLoading || insumosLoading || embalagensLoading || usuariosLoading;

  // Helper function to format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // Data for charts
  const metricsData = [
    {
      name: 'Receitas',
      value: receitasCount || 0,
      color: '#10b981',
      icon: FileText,
      trend: undefined,
      trendUp: null
    },
    {
      name: 'Pedidos',
      value: pedidosCount || 0,
      color: '#3b82f6',
      icon: ShoppingCart,
      trend: undefined,
      trendUp: null
    },
    {
      name: 'Insumos',
      value: insumosCount || 0,
      color: '#f59e0b',
      icon: FlaskConical,
      trend: undefined,
      trendUp: null
    },
    {
      name: 'Embalagens',
      value: embalagensCount || 0,
      color: '#8b5cf6',
      icon: Box,
      trend: undefined,
      trendUp: null
    }
  ];

  const pieChartData = [
    { name: 'Receitas Processadas', value: receitasCount || 0, color: '#10b981' },
    { name: 'Pedidos Ativos', value: pedidosCount || 0, color: '#3b82f6' },
    { name: 'Insumos Disponíveis', value: insumosCount || 0, color: '#f59e0b' },
    { name: 'Tipos de Embalagem', value: embalagensCount || 0, color: '#8b5cf6' }
  ];

  // Query para obter dados de tendência real dos últimos 6 meses
  const { data: trendDataReal } = useQuery({
    queryKey: ['trendData'],
    queryFn: async () => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data, error } = await supabase
        .from('receitas_processadas')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString());
      
      if (error) throw new Error(error.message);
      
      // Agrupar por mês
      const monthlyData = data?.reduce((acc: Record<string, number>, item) => {
        const month = new Date(item.created_at).toLocaleDateString('pt-BR', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {}) || {};
      
      // Converter para formato do gráfico
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
      return months.map(month => ({
        month,
        receitas: monthlyData[month] || 0,
        pedidos: 0, // TODO: Buscar dados reais de pedidos
        insumos: 0  // TODO: Buscar dados reais de insumos
      }));
    }
  });

  // Usar dados reais se disponíveis, caso contrário array vazio
  const trendData = trendDataReal || [];

  return (
    <AdminLayout>
      <TooltipProvider>
        <div className="container-section py-8 space-y-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-homeo-blue to-homeo-accent bg-clip-text text-transparent">
                Dashboard Pharma.AI
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Painel inteligente com insights em tempo real da sua farmácia
            </p>
          </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Activity className="h-3 w-3 mr-1" />
                Sistema Online
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Brain className="h-3 w-3 mr-1" />
                IA Ativa
              </Badge>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricsData.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                  <div className="absolute inset-0 bg-gradient-to-br opacity-5" style={{ backgroundColor: metric.color }} />
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${metric.color}15` }}>
                        <IconComponent className="h-5 w-5" style={{ color: metric.color }} />
                      </div>
                      <div className="flex items-center gap-1">
                        {metric.trendUp ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${metric.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.trend}
                        </span>
                      </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold" style={{ color: metric.color }}>
                        {isLoading ? '...' : formatNumber(metric.value)}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">
                        {metric.name}
                      </p>
                      <Progress 
                        value={metric.value > 0 ? Math.min((metric.value / 100) * 100, 100) : 0} 
                        className="h-2"
                        style={{ 
                          backgroundColor: `${metric.color}20`,
                        }}
                      />
                    </div>
                </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-homeo-blue" />
                    Visão Geral dos Dados
                  </h3>
                  <p className="text-sm text-muted-foreground">Distribuição atual dos recursos</p>
                </div>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Este Mês
                    </Button>
              </div>
              
              {!isLoading ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={metricsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        stroke="#64748b"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke="#64748b"
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#3b82f6" 
                        radius={[8, 8, 0, 0]}
                        stroke="#2563eb"
                        strokeWidth={1}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                    </div>
              ) : (
                <div className="h-80 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-homeo-blue mx-auto mb-4"></div>
                    <p className="text-gray-500">Carregando dados...</p>
                  </div>
                </div>
              )}
              </Card>
              
            {/* Pie Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-homeo-accent" />
                    Distribuição por Categoria
                  </h3>
                  <p className="text-sm text-muted-foreground">Proporção dos recursos cadastrados</p>
                </div>
              </div>
              
              {!isLoading ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {pieChartData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                    ))}
                  </div>
                    </div>
              ) : (
                <div className="h-80 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-homeo-accent mx-auto mb-4"></div>
                    <p className="text-gray-500">Carregando dados...</p>
                  </div>
                </div>
              )}
              </Card>
          </div>

          {/* Trend Analysis */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-green-500" />
                  Tendências dos Últimos 6 Meses
                </h3>
                <p className="text-sm text-muted-foreground">Evolução dos principais indicadores</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Crescimento
                </Badge>
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPedidos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInsumos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="receitas"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorReceitas)"
                  />
                  <Area
                    type="monotone"
                    dataKey="pedidos"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPedidos)"
                  />
                  <Area
                    type="monotone"
                    dataKey="insumos"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorInsumos)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* AI Insights Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-homeo-accent/10 to-white border-homeo-accent/30 hover:shadow-lg transition-all hover:scale-105">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-homeo-accent" />
                  <CardTitle className="text-lg">IA Processamento</CardTitle>
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  </div>
                  <CardDescription>
                  Sistema inteligente para análise de receitas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Precisão da IA</span>
                    <span className="text-sm font-medium text-green-600">98.5%</span>
                  </div>
                  <Progress value={98.5} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Nossa IA está pronta para processar receitas com alta precisão
                  </p>
                </div>
                </CardContent>
                <CardFooter>
                <Link to="/admin/ia/processamento-receitas" className="w-full">
                    <Button className="w-full bg-homeo-accent hover:bg-homeo-accent/90">
                    <Zap className="h-4 w-4 mr-2" />
                    Testar IA
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-white border-blue-500/30 hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">Previsões Inteligentes</CardTitle>
                  </div>
                  <CardDescription>
                  Análise preditiva para otimização
                  </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Módulo</span>
                    <Badge variant="outline" className="text-xs">Em Breve</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs">Previsão de demanda</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs">Otimização de compras</span>
                    </div>
                  </div>
                </div>
                </CardContent>
                <CardFooter>
                  <Link to="/admin/ia/previsao-demanda" className="w-full">
                    <Button variant="outline" className="w-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
                      Conhecer Módulo
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500/10 to-white border-yellow-500/30 hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <CardTitle className="text-lg">Insights Avançados</CardTitle>
                  </div>
                  <CardDescription>
                  Análises detalhadas do seu negócio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-3">
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Info className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Dica do Sistema</span>
                    </div>
                    <p className="text-xs text-yellow-700">
                      Cadastre mais insumos para ampliar sua capacidade de atendimento
                    </p>
                  </div>
                </div>
                </CardContent>
                <CardFooter>
                <Link to="/admin/estoque/insumos" className="w-full">
                    <Button variant="outline" className="w-full border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white">
                    Ver Sugestões
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
          </div>
          
          {/* Quick Actions */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-xl font-semibold">Ações Rápidas</h3>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Acesso Direto
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/admin/pedidos/nova-receita">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 hover:bg-homeo-green/10 hover:border-homeo-green">
                  <FileText className="h-6 w-6 text-homeo-green" />
                  <span className="text-sm">Nova Receita</span>
                </Button>
              </Link>
              
              <Link to="/admin/estoque/insumos">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 hover:bg-orange-500/10 hover:border-orange-500">
                  <FlaskConical className="h-6 w-6 text-orange-500" />
                  <span className="text-sm">Gerenciar Insumos</span>
                </Button>
              </Link>
              
              <Link to="/admin/usuarios">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 hover:bg-purple-500/10 hover:border-purple-500">
                  <Users className="h-6 w-6 text-purple-500" />
                  <span className="text-sm">Usuários</span>
                </Button>
              </Link>
              
              <Link to="/admin/ia/processamento-receitas">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 hover:bg-homeo-accent/10 hover:border-homeo-accent">
                  <Brain className="h-6 w-6 text-homeo-accent" />
                  <span className="text-sm">Módulos IA</span>
                </Button>
              </Link>
            </div>
            </Card>
        </div>
      </TooltipProvider>
    </AdminLayout>
  );
};

export default AdminDashboard;
