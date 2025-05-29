// =====================================================
// OVERVIEW DO SISTEMA DE VENDAS - PHARMA.AI
// =====================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart,
  CreditCard,
  Receipt,
  Users,
  TrendingUp,
  Calendar,
  BarChart3,
  Clock,
  DollarSign,
  Package,
  Target,
  ArrowRight,
  PlusCircle,
  Search,
  FileText,
  CheckCircle,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/layouts/AdminLayout';

interface VendaFeatureCard {
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
  isNew?: boolean;
}

const vendaFeatures: VendaFeatureCard[] = [
  {
    title: 'PDV - Ponto de Venda',
    description: 'Sistema completo de vendas com interface moderna, busca inteligente e múltiplas formas de pagamento.',
    icon: <ShoppingCart className="h-6 w-6" />,
    href: '/admin/vendas/pdv',
    stats: [
      { label: 'Vendas hoje', value: '47', trend: 'up' },
      { label: 'Ticket médio', value: 'R$ 85,40', trend: 'up' }
    ],
    status: 'ativo',
    gradient: 'from-emerald-500 to-teal-500',
    isNew: true
  },
  {
    title: 'Fechamento de Vendas',
    description: 'Finalize vendas pendentes e em aberto, gerencie pagamentos e confirme transações.',
    icon: <CheckCircle className="h-6 w-6" />,
    href: '/admin/vendas/fechamento',
    stats: [
      { label: 'Vendas pendentes', value: '3', trend: 'stable' },
      { label: 'Valor total', value: 'R$ 325,80', trend: 'stable' }
    ],
    status: 'ativo',
    gradient: 'from-green-500 to-emerald-500',
    isNew: true
  },
  {
    title: 'Histórico de Vendas',
    description: 'Consulte o histórico completo de vendas com filtros avançados e detalhes de transações.',
    icon: <History className="h-6 w-6" />,
    href: '/admin/vendas/historico',
    stats: [
      { label: 'Vendas finalizadas', value: '1.247', trend: 'up' },
      { label: 'Valor total', value: 'R$ 106.435,20', trend: 'up' }
    ],
    status: 'ativo',
    gradient: 'from-blue-500 to-indigo-500'
  },
  {
    title: 'Controle de Caixa',
    description: 'Abertura e fechamento de caixa, controle de sangria e conferência de valores.',
    icon: <CreditCard className="h-6 w-6" />,
    href: '/admin/vendas/caixa',
    stats: [
      { label: 'Caixa atual', value: 'R$ 2.456,80', trend: 'stable' },
      { label: 'Diferença', value: 'R$ 0,00', trend: 'stable' }
    ],
    status: 'ativo',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    title: 'Relatório de Vendas',
    description: 'Visualize estatísticas completas, análise por período e performance de vendedores.',
    icon: <BarChart3 className="h-6 w-6" />,
    href: '/admin/vendas/relatorios',
    stats: [
      { label: 'Vendas mês', value: '1.247', trend: 'up' },
      { label: 'Crescimento', value: '+12.5%', trend: 'up' }
    ],
    status: 'em-breve',
    gradient: 'from-violet-500 to-purple-500'
  },
  {
    title: 'Gestão de Clientes',
    description: 'Cadastro e acompanhamento de clientes, histórico de compras e programa de fidelidade.',
    icon: <Users className="h-6 w-6" />,
    href: '/admin/vendas/clientes',
    stats: [
      { label: 'Clientes ativos', value: '342', trend: 'up' },
      { label: 'Novos (mês)', value: '28', trend: 'up' }
    ],
    status: 'em-breve',
    gradient: 'from-purple-500 to-pink-500'
  }
];

// Métricas de vendas
const vendasMetrics = [
  {
    label: 'Vendas Hoje',
    value: '47',
    change: '+8 vs ontem',
    trend: 'up' as const,
    icon: ShoppingCart,
    color: 'text-emerald-600'
  },
  {
    label: 'Faturamento Hoje',
    value: 'R$ 4.023,80',
    change: '+15.2%',
    trend: 'up' as const,
    icon: DollarSign,
    color: 'text-blue-600'
  },
  {
    label: 'Ticket Médio',
    value: 'R$ 85,40',
    change: '+5.8%',
    trend: 'up' as const,
    icon: Target,
    color: 'text-purple-600'
  },
  {
    label: 'Tempo Médio/Venda',
    value: '3m 42s',
    change: '-12s',
    trend: 'down' as const,
    icon: Clock,
    color: 'text-orange-600'
  }
];

// Vendas recentes (mock)
const vendasRecentes = [
  {
    id: '20241226001',
    cliente: 'Maria Silva',
    valor: 156.50,
    forma_pagamento: 'Cartão de Crédito',
    horario: '14:35',
    status: 'finalizada'
  },
  {
    id: '20241226002',
    cliente: 'João Santos',
    valor: 78.90,
    forma_pagamento: 'PIX',
    horario: '14:28',
    status: 'finalizada'
  },
  {
    id: '20241226003',
    cliente: 'Ana Costa',
    valor: 234.20,
    forma_pagamento: 'Dinheiro',
    horario: '14:15',
    status: 'finalizada'
  },
  {
    id: '20241226004',
    cliente: 'Carlos Oliveira',
    valor: 45.80,
    forma_pagamento: 'Cartão de Débito',
    horario: '13:58',
    status: 'finalizada'
  }
];

export default function VendasOverview() {
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
                    <ShoppingCart className="h-10 w-10 text-emerald-600" />
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      Sistema de Vendas
                    </h1>
                    <Badge variant="secondary" className="ml-2">Nova Feature</Badge>
                  </div>
                  <p className="text-xl text-muted-foreground">
                    PDV moderno e intuitivo para farmácias. Gerencie vendas, clientes, estoque e 
                    pagamentos com interface responsiva e relatórios em tempo real.
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 blur-3xl opacity-20" />
                    <ShoppingCart className="h-48 w-48 text-emerald-600/20" />
                  </div>
                </div>
              </div>

              {/* Ação Rápida */}
              <div className="mt-8 flex gap-4">
                <Link to="/admin/vendas/pdv">
                  <Button size="lg" className="h-12 px-8">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Abrir PDV
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="h-12 px-8" disabled>
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Ver Relatórios
                </Button>
              </div>

              {/* Métricas Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                {vendasMetrics.map((metric, index) => {
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
                            metric.trend === 'up' ? 'text-green-600' : 
                            metric.trend === 'down' ? 'text-blue-600' : 'text-gray-600'
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

        {/* Content Grid */}
        <div className="px-6 pb-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Features Grid - 2/3 da largura */}
              <div className="lg:col-span-2">
                <div className="grid gap-6 md:grid-cols-2">
                  {vendaFeatures.map((feature, index) => (
                    <Card 
                      key={index} 
                      className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Gradient Background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                      
                      <CardHeader className="relative">
                        <div className="flex items-start justify-between">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}>
                            {feature.icon}
                          </div>
                          <div className="flex items-center gap-2">
                            {feature.isNew && (
                              <Badge variant="secondary" className="text-xs">NOVO</Badge>
                            )}
                            <Badge 
                              variant={feature.status === 'ativo' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {feature.status === 'ativo' ? 'Ativo' : 
                               feature.status === 'beta' ? 'Beta' : 'Em Breve'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors">
                            {feature.title}
                          </CardTitle>
                          <CardDescription className="text-sm leading-relaxed">
                            {feature.description}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="relative space-y-4">
                        {feature.stats && (
                          <div className="grid grid-cols-2 gap-4">
                            {feature.stats.map((stat, statIndex) => (
                              <div key={statIndex} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="text-lg font-bold">{stat.value}</div>
                                <div className="text-xs text-muted-foreground">{stat.label}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2">
                          <Link to={feature.href}>
                            <Button 
                              variant={feature.status === 'ativo' ? 'default' : 'outline'}
                              size="sm"
                              disabled={feature.status !== 'ativo'}
                              className="group-hover:scale-105 transition-transform"
                            >
                              {feature.status === 'ativo' ? 'Acessar' : 'Em Breve'}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Sidebar - 1/3 da largura */}
              <div className="space-y-6">
                {/* Status do Caixa */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Status do Caixa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant="secondary">Fechado</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Último fechamento:</span>
                        <span className="text-sm">Ontem, 18:30</span>
                      </div>
                      <Button className="w-full" disabled>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Abrir Caixa
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Vendas Recentes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      Vendas Recentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {vendasRecentes.map((venda) => (
                        <div key={venda.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{venda.cliente}</div>
                              <div className="text-xs text-muted-foreground">
                                {venda.id} • {venda.horario}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {venda.forma_pagamento}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-emerald-600">
                                R$ {venda.valor.toFixed(2)}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {venda.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <Button variant="outline" size="sm" className="w-full" disabled>
                        <Search className="h-4 w-4 mr-2" />
                        Ver Todas as Vendas
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Produtos em Destaque */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Mais Vendidos Hoje
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { produto: 'Dipirona 500mg', vendas: 12, valor: 150.00 },
                        { produto: 'Amoxicilina 500mg', vendas: 8, valor: 206.40 },
                        { produto: 'Rivotril 2mg', vendas: 5, valor: 228.00 }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div>
                            <div className="font-medium">{item.produto}</div>
                            <div className="text-muted-foreground">{item.vendas} vendas</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">R$ {item.valor.toFixed(2)}</div>
                          </div>
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
    </AdminLayout>
  );
} 