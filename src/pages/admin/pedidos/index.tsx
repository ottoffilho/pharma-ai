import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Package, 
  Plus, 
  Search, 
  CheckCircle, 
  AlertCircle,
  Truck,
  Receipt,
  ClipboardList,
  FileSearch,
  ArrowRight,
  Calendar,
  BarChart3,
  TrendingUp,
  CreditCard,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AdminLayout from '@/components/layouts/AdminLayout';

interface PedidoFeatureCard {
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

const pedidoFeatures: PedidoFeatureCard[] = [
  {
    title: 'Listagem de Pedidos',
    description: 'Visualize todos os pedidos da farmácia, com filtros avançados e acompanhamento de status.',
    icon: <ClipboardList className="h-6 w-6" />,
    href: '/admin/pedidos/listar',
    stats: [
      { label: 'Pedidos ativos', value: '86', trend: 'up' },
      { label: 'Tempo médio', value: '2.3 dias', trend: 'down' }
    ],
    status: 'ativo',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    title: 'Nova Receita',
    description: 'Cadastre novas receitas com processamento inteligente via IA para extração automática de dados.',
    icon: <FileSearch className="h-6 w-6" />,
    href: '/admin/pedidos/nova-receita',
    stats: [
      { label: 'Precisão da IA', value: '98.5%', trend: 'up' },
      { label: 'Tempo de processamento', value: '3.2 seg', trend: 'down' }
    ],
    status: 'ativo',
    gradient: 'from-blue-500 to-indigo-500'
  },
  {
    title: 'Acompanhamento de Produção',
    description: 'Acompanhe o status de produção dos pedidos em tempo real e gerencie o fluxo de trabalho.',
    icon: <Package className="h-6 w-6" />,
    href: '/admin/producao',
    stats: [
      { label: 'Em produção', value: '42', trend: 'up' },
      { label: 'Concluídos hoje', value: '23', trend: 'up' }
    ],
    status: 'ativo',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Entrega e Rastreamento',
    description: 'Gerencie entregas, imprima etiquetas e acompanhe o status de envio dos pedidos.',
    icon: <Truck className="h-6 w-6" />,
    href: '/admin/pedidos/entregas',
    stats: [
      { label: 'Aguardando entrega', value: '18', trend: 'down' },
      { label: 'Entregues (mês)', value: '256', trend: 'up' }
    ],
    status: 'em-breve',
    gradient: 'from-orange-500 to-red-500'
  }
];

// Métricas de pedidos
const pedidoMetrics = [
  {
    label: 'Pedidos Pendentes',
    value: '32',
    change: '+5',
    trend: 'up' as const,
    icon: AlertCircle,
    color: 'text-amber-600'
  },
  {
    label: 'Receitas Processadas',
    value: '478',
    change: '+12.3%',
    trend: 'up' as const,
    icon: Receipt,
    color: 'text-blue-600'
  },
  {
    label: 'Faturamento do Mês',
    value: 'R$ 63.459,00',
    change: '+8.2%',
    trend: 'up' as const,
    icon: CreditCard,
    color: 'text-green-600'
  },
  {
    label: 'Tempo Médio de Entrega',
    value: '2.4 dias',
    change: '-0.3 dias',
    trend: 'down' as const,
    icon: Calendar,
    color: 'text-purple-600'
  }
];

export default function PedidosOverview() {
  return (
    <AdminLayout>
      <div>
        {/* Hero Section */}
        <div className="relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20" />
          <div className="relative px-6 py-16">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center justify-between">
                <div className="space-y-4 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <FileText className="h-10 w-10 text-emerald-600" />
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      Central de Pedidos
                    </h1>
                  </div>
                  <p className="text-xl text-muted-foreground">
                    Gerencie todos os pedidos e receitas em um único lugar. Desde o processamento da receita 
                    até a entrega, com rastreabilidade completa e insights detalhados.
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 blur-3xl opacity-20" />
                    <FileText className="h-48 w-48 text-emerald-600/20" />
                  </div>
                </div>
              </div>

              {/* Métricas Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                {pedidoMetrics.map((metric, index) => {
                  const IconComponent = metric.icon;
                  return (
                    <Card key={index} className="border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
                          <IconComponent className={`h-4 w-4 ${metric.color}`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-end justify-between">
                          <span className="text-2xl font-bold">{metric.value}</span>
                          <span className={`text-sm font-medium ${
                            metric.trend === 'up' && metric.label === 'Pedidos Pendentes' ? 'text-amber-600' :
                            metric.trend === 'up' ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            {metric.change}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="px-6 pb-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 md:grid-cols-2">
              {pedidoFeatures.map((feature, index) => (
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
                                  stat.trend === 'down' ? 'text-blue-500' : 
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
                        {feature.status === 'em-breve' ? 'Em breve' : 'Acessar'}
                        {feature.status !== 'em-breve' && (
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        )}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Seção Adicional - Estatísticas */}
            <div className="mt-12">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Insights de Pedidos</h2>
                    <p className="text-muted-foreground">Estatísticas e tendências do seu fluxo de pedidos</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Principais Clientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {['Ana Silva', 'João Santos', 'Maria Oliveira'].map((name, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-emerald-500" />
                              <span className="text-sm font-medium">{name}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {12 - i * 3} pedidos
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Manipulações Populares</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { name: 'Fórmula Emagrecedora', percent: 32 },
                          { name: 'Cápsulas Vitamínicas', percent: 28 },
                          { name: 'Cremes Dermatológicos', percent: 25 }
                        ].map((item, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{item.name}</span>
                              <span className="text-xs font-medium">{item.percent}%</span>
                            </div>
                            <Progress value={item.percent} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Status dos Pedidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { status: 'Em Produção', count: 42, color: 'text-blue-500 bg-blue-100' },
                          { status: 'Pronto para Entrega', count: 18, color: 'text-green-500 bg-green-100' },
                          { status: 'Aguardando Aprovação', count: 7, color: 'text-amber-500 bg-amber-100' },
                          { status: 'Cancelados', count: 3, color: 'text-red-500 bg-red-100' }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-sm">{item.status}</span>
                            <Badge className={`${item.color} border-0`}>
                              {item.count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
