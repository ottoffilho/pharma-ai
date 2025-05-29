import React from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  PieChart, 
  Receipt, 
  CreditCard, 
  TrendingUp,
  BarChart3,
  Landmark,
  Wallet,
  LineChart,
  ArrowRight,
  AlertTriangle,
  ChevronUp,
  BadgeDollarSign,
  CalendarRange,
  Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AdminLayout from '@/components/layouts/AdminLayout';

interface FinanceFeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  stats?: {
    label: string;
    value: string;
    trend?: 'up' | 'down' | 'stable';
  }[];
  status: 'ativo' | 'em-breve' | 'beta';
  gradient: string;
}

const financeFeatures: FinanceFeatureCard[] = [
  {
    title: 'Categorias Financeiras',
    description: 'Organize suas finanças com categorias personalizáveis para receitas e despesas.',
    icon: <PieChart className="h-6 w-6" />,
    href: '/admin/financeiro/categorias',
    stats: [
      { label: 'Categorias criadas', value: '28', trend: 'up' },
      { label: 'Categorias em uso', value: '92%', trend: 'up' }
    ],
    status: 'ativo',
    gradient: 'from-blue-500 to-indigo-500'
  },
  {
    title: 'Fluxo de Caixa',
    description: 'Visualize entradas e saídas com análises detalhadas e projeções para o futuro.',
    icon: <LineChart className="h-6 w-6" />,
    href: '/admin/financeiro/caixa',
    stats: [
      { label: 'Saldo atual', value: 'R$ 46.789,45', trend: 'up' },
      { label: 'Movimentações mensais', value: '124', trend: 'stable' }
    ],
    status: 'ativo',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    title: 'Contas a Pagar',
    description: 'Gerencie compromissos financeiros com lembretes e programação automática.',
    icon: <Receipt className="h-6 w-6" />,
    href: '/admin/financeiro/contas-a-pagar',
    stats: [
      { label: 'Contas pendentes', value: '12', trend: 'down' },
      { label: 'Vencendo em 7 dias', value: 'R$ 12.450,00', trend: 'up' }
    ],
    status: 'ativo',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Relatórios Financeiros',
    description: 'Relatórios detalhados e personalizáveis com gráficos interativos e exportação.',
    icon: <BarChart3 className="h-6 w-6" />,
    href: '/admin/financeiro/relatorios',
    stats: [
      { label: 'Relatórios gerados', value: '32', trend: 'up' },
      { label: 'Economia identificada', value: 'R$ 8.600,00', trend: 'up' }
    ],
    status: 'em-breve',
    gradient: 'from-orange-500 to-red-500'
  }
];

// Métricas financeiras
const financeMetrics = [
  {
    label: 'Receita Mensal',
    value: 'R$ 124.586,00',
    change: '+8.4%',
    trend: 'up' as const,
    color: 'text-green-600'
  },
  {
    label: 'Despesas Mensais',
    value: 'R$ 82.315,75',
    change: '-2.1%',
    trend: 'down' as const,
    color: 'text-green-600'
  },
  {
    label: 'Margem de Lucro',
    value: '33.9%',
    change: '+2.7%',
    trend: 'up' as const,
    color: 'text-green-600'
  },
  {
    label: 'Previsão Trimestral',
    value: 'R$ 405.800,00',
    change: '+12.5%',
    trend: 'up' as const,
    color: 'text-green-600'
  }
];

export default function FinanceiroOverview() {
  return (
    <AdminLayout>
      <div>
        {/* Hero Section */}
        <div className="relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/20 dark:via-green-950/20 dark:to-teal-950/20" />
          <div className="relative px-6 py-16">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center justify-between">
                <div className="space-y-4 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <BadgeDollarSign className="h-10 w-10 text-emerald-600" />
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      Central Financeira
                    </h1>
                  </div>
                  <p className="text-xl text-muted-foreground">
                    Administre com eficiência todas as suas operações financeiras, desde controle de caixa 
                    até análises detalhadas, com visualizações claras e acessíveis.
                  </p>
                  <div className="flex items-center gap-4 pt-4">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm font-medium">Fluxo positivo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarRange className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium">Previsão otimista</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-purple-500" />
                      <span className="text-sm font-medium">Gestão inteligente</span>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 blur-3xl opacity-20" />
                    <DollarSign className="h-48 w-48 text-emerald-600/20" />
                  </div>
                </div>
              </div>

              {/* Métricas Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                {financeMetrics.map((metric, index) => (
                  <Card key={index} className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
                        <span className={`flex items-center ${metric.color}`}>
                          {metric.trend === 'up' ? <ChevronUp className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                          <span className="text-xs ml-1">{metric.change}</span>
                        </span>
                      </div>
                      <div className="text-2xl font-bold">{metric.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="px-6 pb-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 md:grid-cols-2">
              {financeFeatures.map((feature, index) => (
                <Card 
                  key={index} 
                  className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.gradient} text-white`}>
                        {feature.icon}
                      </div>
                      <Badge 
                        variant={feature.status === 'ativo' ? 'default' : feature.status === 'beta' ? 'secondary' : 'outline'}
                        className="capitalize"
                      >
                        {feature.status}
                      </Badge>
                    </div>
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {feature.stats && (
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {feature.stats.map((stat, idx) => (
                          <div key={idx} className="space-y-1">
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className="text-lg font-semibold flex items-center gap-1">
                              {stat.value}
                              {stat.trend && (
                                <span className={`text-xs ${
                                  stat.trend === 'up' ? 'text-green-500' : 
                                  stat.trend === 'down' ? 'text-red-500' : 
                                  'text-gray-500'
                                }`}>
                                  {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'}
                                </span>
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button 
                      asChild 
                      className="w-full group"
                      variant={feature.status === 'em-breve' ? 'outline' : 'default'}
                      disabled={feature.status === 'em-breve'}
                    >
                      <Link to={feature.href}>
                        {feature.status === 'em-breve' ? 'Em breve' : 'Acessar módulo'}
                        {feature.status !== 'em-breve' && (
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        )}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Alerta de DRE */}
            <div className="mt-12 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                  <Landmark className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Demonstrativos Financeiros</h3>
                  <p className="text-muted-foreground mb-4">
                    Acompanhe o desempenho financeiro da sua farmácia com demonstrativos 
                    detalhados e fáceis de entender. Compare períodos, analise tendências e tome 
                    decisões informadas.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Receita vs Meta</span>
                        <span className="text-sm text-green-600">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Despesas vs Orçamento</span>
                        <span className="text-sm text-amber-600">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Lucro Líquido (Meta anual)</span>
                        <span className="text-sm text-blue-600">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 