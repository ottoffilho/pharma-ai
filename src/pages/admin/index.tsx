import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, ShoppingCart, FlaskConical, Box, AlertCircle, TrendingUp, DollarSign, Calculator, Info, Brain, Sparkles, Lightbulb, BarChart } from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

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

  // Calculate if any queries are loading
  const isLoading = receitasLoading || pedidosLoading || insumosLoading || embalagensLoading;

  // Helper function to format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // Data for the simple chart
  const chartData = [
    {
      name: 'Receitas',
      value: receitasCount || 0,
      color: '#10b981' // homeo-green
    },
    {
      name: 'Pedidos',
      value: pedidosCount || 0,
      color: '#3b82f6' // homeo-blue
    },
    {
      name: 'Insumos',
      value: insumosCount || 0,
      color: '#f59e0b' // orange
    },
    {
      name: 'Embalagens',
      value: embalagensCount || 0,
      color: '#8b5cf6' // purple
    }
  ];

  return (
    <AdminLayout>
      <TooltipProvider>
        <div className="container-section py-8">
          <div className="mb-8">
            <h1 className="heading-lg mb-4">Dashboard Pharma.AI</h1>
            <p className="text-muted-foreground text-lg">
              Bem-vindo ao painel inteligente da sua farmácia. Aqui você acompanha todas as operações potencializadas pela Inteligência Artificial.
            </p>
          </div>
          
          {/* Métricas Principais */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">Métricas Principais</h2>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Acompanhe os indicadores essenciais do seu negócio, todos integrados com IA para otimizar seus processos.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Separator className="mb-4" />
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Receitas Processadas */}
              <Card className="bg-gradient-to-br from-homeo-green/10 to-white border-homeo-green/20 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">Receitas Processadas</CardTitle>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Total de receitas que foram digitalizadas e analisadas pela Inteligência Artificial do Pharma.AI, prontas para orçamentação e manipulação.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <FileText className="h-5 w-5 text-homeo-green" />
                  </div>
                  <CardDescription>IA identifica automaticamente medicamentos e dosagens</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-homeo-green">
                    {isLoading ? 
                      <span className="text-gray-400">...</span> : 
                      formatNumber(receitasCount || 0)
                    }
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to="/admin/pedidos" className="w-full">
                    <Button variant="outline" size="sm" className="w-full border-homeo-green text-homeo-green hover:bg-homeo-green hover:text-white">
                      Ver Receitas
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              {/* Card 2: Pedidos Criados */}
              <Card className="bg-gradient-to-br from-homeo-blue/10 to-white border-homeo-blue/20 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">Pedidos Criados</CardTitle>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Número de pedidos gerados a partir de receitas validadas, refletindo a demanda ativa de seus clientes.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <ShoppingCart className="h-5 w-5 text-homeo-blue" />
                  </div>
                  <CardDescription>Conversão inteligente de receitas em pedidos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-homeo-blue">
                    {isLoading ? 
                      <span className="text-gray-400">...</span> : 
                      formatNumber(pedidosCount || 0)
                    }
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to="/admin/pedidos" className="w-full">
                    <Button variant="outline" size="sm" className="w-full border-homeo-blue text-homeo-blue hover:bg-homeo-blue hover:text-white">
                      Ver Pedidos
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              {/* Card 3: Insumos Cadastrados */}
              <Card className="bg-gradient-to-br from-orange-500/10 to-white border-orange-500/20 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">Insumos Cadastrados</CardTitle>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Variedade de matérias-primas disponíveis para manipulação. Quanto maior a variedade, mais receitas você pode atender.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <FlaskConical className="h-5 w-5 text-orange-500" />
                  </div>
                  <CardDescription>Base de conhecimento para manipulação</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-orange-500">
                    {isLoading ? 
                      <span className="text-gray-400">...</span> : 
                      formatNumber(insumosCount || 0)
                    }
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to="/admin/estoque/insumos" className="w-full">
                    <Button variant="outline" size="sm" className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
                      Gerenciar Insumos
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              {/* Card 4: Embalagens Cadastradas */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-white border-purple-500/20 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">Embalagens Cadastradas</CardTitle>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Tipos de embalagens disponíveis para seus medicamentos. Essencial para calcular custos e apresentação final.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Box className="h-5 w-5 text-purple-500" />
                  </div>
                  <CardDescription>Opções de apresentação dos medicamentos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-500">
                    {isLoading ? 
                      <span className="text-gray-400">...</span> : 
                      formatNumber(embalagensCount || 0)
                    }
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to="/admin/estoque/embalagens" className="w-full">
                    <Button variant="outline" size="sm" className="w-full border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white">
                      Gerenciar Embalagens
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Nova Seção: Insights da IA */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-6 w-6 text-homeo-accent" />
              <h2 className="text-xl font-semibold">Pharma.AI em Ação</h2>
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </div>
            <Separator className="mb-4" />
            
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card IA 1: Inteligência em Receitas */}
              <Card className="bg-gradient-to-br from-homeo-accent/10 to-white border-homeo-accent/30 hover:shadow-lg transition-all hover:scale-105">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-homeo-accent" />
                    <CardTitle className="text-lg">Inteligência em Receitas</CardTitle>
                  </div>
                  <CardDescription>
                    Nossa IA está pronta para analisar suas receitas automaticamente!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comece enviando uma nova receita para ver como nossa tecnologia identifica medicamentos, dosagens e instruções de forma inteligente.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to="/admin/pedidos/nova-receita" className="w-full">
                    <Button className="w-full bg-homeo-accent hover:bg-homeo-accent/90">
                      Testar IA Agora
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Card IA 2: Previsões Futuras */}
              <Card className="bg-gradient-to-br from-blue-500/10 to-white border-blue-500/30 hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">Previsões Inteligentes</CardTitle>
                  </div>
                  <CardDescription>
                    Em breve: IA que prevê demandas e otimiza compras
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Nas próximas atualizações, o Pharma.AI trará previsões de demanda de insumos e otimizações automáticas para suas compras.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to="/admin/ia/previsao-demanda" className="w-full">
                    <Button variant="outline" className="w-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
                      Conhecer Módulo
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Card IA 3: Descubra Mais */}
              <Card className="bg-gradient-to-br from-yellow-500/10 to-white border-yellow-500/30 hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <CardTitle className="text-lg">Explore a IA</CardTitle>
                  </div>
                  <CardDescription>
                    Descubra como nossa IA transforma sua farmácia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Explore todos os módulos de Inteligência Artificial disponíveis e veja como eles podem revolucionar seus processos.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to="/admin/ia/processamento-receitas" className="w-full">
                    <Button variant="outline" className="w-full border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white">
                      Ver Todos Módulos
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
          
          {/* Módulos Futuros */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">Módulos em Desenvolvimento</h2>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Funcionalidades que serão liberadas nas próximas versões para completar seu sistema de gestão farmacêutica.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Separator className="mb-4" />
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Future Card: Faturamento Total */}
              <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200 opacity-75 hover:opacity-90 transition-opacity">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">Faturamento Total</CardTitle>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Acompanhe o valor total faturado em seus pedidos, uma vez que o Módulo Financeiro estiver integrado.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <CardDescription>Controle financeiro completo dos seus pedidos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium text-gray-500 italic">
                    Disponível após Módulo Financeiro
                  </p>
                </CardContent>
              </Card>
              
              {/* Future Card: Custo Médio */}
              <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200 opacity-75 hover:opacity-90 transition-opacity">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">Custo Médio por Pedido</CardTitle>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Calcule automaticamente o custo médio de produção para otimizar sua margem de lucro.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Calculator className="h-5 w-5 text-gray-400" />
                  </div>
                  <CardDescription>Análise de custos para melhor precificação</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium text-gray-500 italic">
                    Disponível após Módulo Orçamentação
                  </p>
                </CardContent>
              </Card>
              
              {/* Future Card: Alertas de Estoque */}
              <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200 opacity-75 hover:opacity-90 transition-opacity">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">Alertas Inteligentes</CardTitle>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Receba notificações proativas sobre insumos que estão com estoque abaixo do mínimo definido, ajudando a evitar faltas.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <CardDescription>Notificações automáticas de estoque baixo</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium text-gray-500 italic">
                    Implementação Futura
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Análises e Tendências com Gráfico */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">Visão Geral dos Dados</h2>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Visualização gráfica dos seus dados principais. Análises mais detalhadas e tendências estarão disponíveis com a evolução dos módulos.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Separator className="mb-4" />
            
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">Resumo das Métricas Atuais</h3>
                  <p className="text-sm text-muted-foreground">Visualização dos dados do seu dashboard</p>
                </div>
                <BarChart className="h-5 w-5 text-homeo-blue" />
              </div>
              
              {!isLoading ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '8px' 
                        }}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Carregando dados...</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </TooltipProvider>
    </AdminLayout>
  );
};

export default AdminDashboard;
