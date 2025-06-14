import React, { useState, useEffect } from 'react';
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
  LineChart,
  Star,
  Award,
  Shield,
  Rocket,
  Crown,
  Gem,
  Flame,
  Heart,
  Eye,
  Settings,
  Bell,
  MapPin,
  Phone,
  Mail,
  Globe,
  Wifi,
  Database,
  Server,
  Monitor,
  Smartphone,
  Tablet,
  Headphones,
  MessageCircle,
  Send,
  Share2,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  SortAsc,
  MoreHorizontal,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Home,
  Building,
  Store,
  Package,
  Truck,
  ShoppingBag,
  CreditCard,
  Banknote,
  Coins,
  Receipt,
  FileBarChart,
  TrendingDown,
  RotateCcw,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Copy,
  Clipboard,
  Link2,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Percent,
  Divide,
  Equal
} from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');

  // Atualizar horário em tempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Definir saudação baseada no horário
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Bom dia');
    } else if (hour < 18) {
      setGreeting('Boa tarde');
    } else {
      setGreeting('Boa noite');
    }

    return () => clearInterval(timer);
  }, []);

  // Query para fornecedores ativos
  const { data: fornecedoresAtivos, isLoading: fornecedoresLoading } = useQuery({
    queryKey: ['fornecedoresAtivos'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('fornecedores')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw new Error(error.message);
      return count || 0;
    }
  });

  // Query para produtos em estoque
  const { data: produtosEstoque, isLoading: produtosLoading } = useQuery({
    queryKey: ['produtosEstoque'],
    queryFn: async () => {
      // @ts-ignore — tabela "produtos" ainda não está presente nos tipos gerados.
      const { data, error } = await (supabase as any)
        .from('produtos')
        .select('estoque_atual, estoque_minimo, ativo')
        .eq('ativo', true);
      
      if (error) throw new Error(error.message);
      
      const produtosData = (data as any[]) || [];
      const total = produtosData.length;
      const baixoEstoque = produtosData.filter(p => p.estoque_atual <= p.estoque_minimo).length;
      const semEstoque = produtosData.filter(p => p.estoque_atual === 0).length;
      
      return { total, baixoEstoque, semEstoque };
    }
  });

  // Query para pedidos pendentes
  const { data: pedidosPendentes, isLoading: pedidosLoading } = useQuery({
    queryKey: ['pedidosPendentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('id, status, created_at')
        .in('status', ['pendente', 'aguardando_aprovacao', 'em_producao'])
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  // Query para receitas processadas hoje
  const { data: receitasHoje, isLoading: receitasLoading } = useQuery({
    queryKey: ['receitasHoje'],
    queryFn: async () => {
      const hoje = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('receitas_processadas')
        .select('*', { count: 'exact', head: true })
        .gte('processed_at', hoje + 'T00:00:00')
        .lte('processed_at', hoje + 'T23:59:59');
      
      if (error) throw new Error(error.message);
      return count || 0;
    }
  });

  // Query para usuários ativos
  const { data: usuariosAtivos, isLoading: usuariosLoading } = useQuery({
    queryKey: ['usuariosAtivos'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);
      
      if (error) throw new Error(error.message);
      return count || 0;
    }
  });

  // Query para alertas do sistema
  const { data: alertas } = useQuery({
    queryKey: ['alertasAtivos'],
    queryFn: async () => {
      const alertasList = [];
      
      if (produtosEstoque?.semEstoque && produtosEstoque.semEstoque > 0) {
        alertasList.push({
          tipo: 'critico',
          titulo: 'Produtos sem estoque',
          descricao: `${produtosEstoque.semEstoque} produto(s) sem estoque`,
          icone: AlertTriangle,
          cor: 'red'
        });
      }
      
      if (produtosEstoque?.baixoEstoque && produtosEstoque.baixoEstoque > 0) {
        alertasList.push({
          tipo: 'aviso',
          titulo: 'Estoque baixo',
          descricao: `${produtosEstoque.baixoEstoque} produto(s) com estoque baixo`,
          icone: AlertCircle,
          cor: 'yellow'
        });
      }
      
      if (pedidosPendentes && pedidosPendentes.length > 0) {
        alertasList.push({
          tipo: 'info',
          titulo: 'Pedidos pendentes',
          descricao: `${pedidosPendentes.length} pedido(s) aguardando atenção`,
          icone: Clock,
          cor: 'blue'
        });
      }
      
      return alertasList;
    },
    enabled: !!produtosEstoque && !!pedidosPendentes
  });

  // Calculate if any queries are loading
  const isLoading = fornecedoresLoading || produtosLoading || pedidosLoading || receitasLoading || usuariosLoading;

  // Helper function to format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // Helper function to format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Helper function to format time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Helper function to format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Métricas principais do dashboard
  const metricsData = [
    {
      name: 'Usuários Ativos',
      value: usuariosAtivos || 0,
      displayValue: formatNumber(usuariosAtivos || 0),
      color: '#10b981',
      bgGradient: 'from-emerald-500 to-green-600',
      icon: Users,
      trend: '+12.5%',
      trendUp: true,
      subtitle: 'Equipe ativa',
      link: '/admin/usuarios'
    },
    {
      name: 'Fornecedores Ativos',
      value: fornecedoresAtivos || 0,
      displayValue: formatNumber(fornecedoresAtivos || 0),
      color: '#3b82f6',
      bgGradient: 'from-blue-500 to-indigo-600',
      icon: Building,
      trend: '+8.2%',
      trendUp: true,
      subtitle: 'Parceiros comerciais',
      link: '/admin/cadastros/fornecedores'
    },
    {
      name: 'Produtos Ativos',
      value: produtosEstoque?.total || 0,
      displayValue: formatNumber(produtosEstoque?.total || 0),
      color: '#f59e0b',
      bgGradient: 'from-amber-500 to-orange-600',
      icon: Package,
      trend: '+5.1%',
      trendUp: true,
      subtitle: 'Em estoque',
      link: '/admin/estoque'
    },
    {
      name: 'Receitas Hoje',
      value: receitasHoje || 0,
      displayValue: formatNumber(receitasHoje || 0),
      color: '#8b5cf6',
      bgGradient: 'from-purple-500 to-violet-600',
      icon: FileText,
      trend: '+15.3%',
      trendUp: true,
      subtitle: 'Processadas pela IA',
      link: '/admin/ia/processamento-receitas'
    }
  ];

  // Status do sistema
  const systemStatus = {
    online: true,
    iaActive: true,
    lastBackup: '2 horas atrás',
    uptime: '99.9%',
    performance: 'Excelente'
  };

  return (
    <AdminLayout>
      <TooltipProvider>
        <div className="min-h-screen bg-white dark:bg-black">
          {/* Hero Header com Gradiente Dinâmico */}
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
            
            <div className="relative container-section py-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Crown className="h-8 w-8 text-yellow-300" />
                    </div>
                    <div>
                      <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                        {greeting}, Administrador!
                      </h1>
                      <p className="text-blue-100 text-lg mt-1">
                        {formatDate(currentTime)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-blue-100">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-mono text-lg">{formatTime(currentTime)}</span>
                    </div>
                    <Separator orientation="vertical" className="h-6 bg-white/30" />
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-300" />
                      <span>Sistema Operacional</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-500/20 text-green-100 border-green-400/30 backdrop-blur-sm">
                      <Wifi className="h-3 w-3 mr-1" />
                      Online - {systemStatus.uptime}
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-100 border-purple-400/30 backdrop-blur-sm">
                      <Brain className="h-3 w-3 mr-1" />
                      IA Pharma Ativa
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-500/20 text-blue-100 border-blue-400/30 backdrop-blur-sm">
                      <Shield className="h-3 w-3 mr-1" />
                      Backup: {systemStatus.lastBackup}
                    </Badge>
                    <Badge className="bg-amber-500/20 text-amber-100 border-amber-400/30 backdrop-blur-sm">
                      <Zap className="h-3 w-3 mr-1" />
                      Performance: {systemStatus.performance}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container-section py-8 space-y-8">
            {/* Métricas Executivas Premium */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metricsData.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <Link key={index} to={metric.link} className="group">
                    <Card className="relative overflow-hidden group-hover:shadow-2xl group-hover:scale-105 transition-all duration-500 border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                      {/* Gradiente de fundo animado */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${metric.bgGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                      
                      {/* Efeito de brilho */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                      
                      <CardHeader className="pb-3 relative">
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.bgGradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex items-center gap-1">
                            {metric.trendUp ? (
                              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-sm font-bold ${metric.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                              {metric.trend}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="relative">
                        <div className="space-y-3">
                          <div>
                            <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:bg-none dark:text-white">
                              {isLoading ? (
                                <span className="inline-block h-8 w-20 bg-gray-200 rounded animate-pulse" />
                              ) : (
                                metric.displayValue
                              )}
                            </p>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-200 mt-1">
                              {metric.name}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{metric.subtitle}</span>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </div>
                          
                          <Progress 
                            value={metric.value > 0 ? Math.min((metric.value / 100) * 100, 100) : 0} 
                            className="h-2" 
                            indicatorColor={index === 0 ? 'bg-emerald-500' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-amber-500' : 'bg-purple-500'}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Alertas e Notificações Críticas */}
            {alertas && alertas.length > 0 && (
              <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-red-500 animate-pulse" />
                    <CardTitle className="text-lg text-red-700">Alertas do Sistema</CardTitle>
                    <Badge variant="destructive" className="ml-auto">
                      {alertas.length} ativo(s)
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alertas.map((alerta, index) => {
                      const IconeAlerta = alerta.icone;
                      return (
                        <div key={index} className={`flex items-center gap-3 p-3 rounded-lg border ${
                          alerta.cor === 'red' ? 'bg-red-50 border-red-200' :
                          alerta.cor === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-blue-50 border-blue-200'
                        }`}>
                          <IconeAlerta className={`h-5 w-5 ${
                            alerta.cor === 'red' ? 'text-red-500' :
                            alerta.cor === 'yellow' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{alerta.titulo}</p>
                            <p className="text-sm text-gray-600">{alerta.descricao}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            Resolver
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Seção de IA e Insights Avançados */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-purple-200/50 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      IA Farmacêutica
                    </CardTitle>
                    <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                  </div>
                  <CardDescription>
                    Sistema inteligente para análise de receitas e otimização
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Precisão da IA</span>
                      <span className="text-sm font-bold text-green-600">98.7%</span>
                    </div>
                    <Progress value={98.7} className="h-3" indicatorColor="bg-purple-500" />
                    
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-2 bg-white/50 rounded-lg">
                        <p className="text-lg font-bold text-purple-600">{receitasHoje || 0}</p>
                        <p className="text-xs text-gray-600">Receitas hoje</p>
                      </div>
                      <div className="p-2 bg-white/50 rounded-lg">
                        <p className="text-lg font-bold text-indigo-600">24/7</p>
                        <p className="text-xs text-gray-600">Disponível</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to="/admin/ia/processamento-receitas" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
                      <Zap className="h-4 w-4 mr-2" />
                      Acessar IA
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 border-emerald-200/50 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      Análise Preditiva
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Previsões inteligentes para otimização do negócio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Previsão de demanda</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Otimização de compras</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Análise de tendências</span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-800">Insight do Dia</span>
                      </div>
                      <p className="text-xs text-emerald-700">
                        Aumento de 15% na demanda por produtos manipulados previsto para próxima semana
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to="/admin/ia/previsao-demanda" className="w-full">
                    <Button variant="outline" className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white">
                      <BarChart className="h-4 w-4 mr-2" />
                      Ver Análises
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border-amber-200/50 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                      <Flame className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      Performance
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Métricas de desempenho em tempo real
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-600">99.9%</p>
                        <p className="text-xs text-gray-600">Uptime</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">1.2s</p>
                        <p className="text-xs text-gray-600">Resposta</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>CPU</span>
                        <span className="text-green-600">23%</span>
                      </div>
                      <Progress value={23} className="h-2" indicatorColor="bg-emerald-500" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Memória</span>
                        <span className="text-blue-600">45%</span>
                      </div>
                      <Progress value={45} className="h-2" indicatorColor="bg-blue-500" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to="/admin/sistema/monitoramento" className="w-full">
                    <Button variant="outline" className="w-full border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white">
                      <Monitor className="h-4 w-4 mr-2" />
                      Monitoramento
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>

            {/* Fim do conteúdo */}
          </div> {/* container-section */}
        </div> {/* min-h-screen */}
      </TooltipProvider>
    </AdminLayout>
  );
};

export default AdminDashboard;
