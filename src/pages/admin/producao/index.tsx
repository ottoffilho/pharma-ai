import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Eye, Edit, Trash2, Clock, CheckCircle, AlertCircle, XCircle, BarChart3, DatabaseIcon, Package, Microscope, ClipboardCheck, FlaskConical, Calendar, Timer, Hourglass, ChevronRight, ArrowRight, ArrowUpRight, BarChart, Beaker, PackageCheck, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layouts/AdminLayout';

// Definindo interface para OrdemProducao
interface OrdemProducao {
  id: string;
  numero_ordem: string;
  status: string;
  prioridade: string;
  receita_id?: string;
  usuario_responsavel_id?: string;
  farmaceutico_responsavel_id?: string;
  data_criacao: string;
  is_deleted: boolean;
  observacoes_gerais?: string;
  receitas_processadas?: any;
  usuarios_internos?: any;
  farmaceutico?: any;
}

const statusConfig = {
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  em_preparacao: { label: 'Em Preparação', color: 'bg-blue-100 text-blue-800', icon: Clock },
  em_manipulacao: { label: 'Em Manipulação', color: 'bg-purple-100 text-purple-800', icon: Clock },
  controle_qualidade: { label: 'Controle de Qualidade', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  finalizada: { label: 'Finalizada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const prioridadeConfig = {
  baixa: { label: 'Baixa', color: 'bg-gray-100 text-gray-800' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  alta: { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  urgente: { label: 'Urgente', color: 'bg-red-100 text-red-800' },
};

interface ProductionFeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  stats?: {
    label: string;
    value: string;
    trend?: 'up' | 'down' | 'stable';
    color?: string;
  }[];
  status: 'ativo' | 'em-breve' | 'beta';
  gradient: string;
}

const productionFeatures: ProductionFeatureCard[] = [
  {
    title: 'Ordens de Produção',
    description: 'Gerencie todo o ciclo de manipulação com rastreabilidade e controle de qualidade.',
    icon: <ClipboardCheck className="h-6 w-6" />,
    href: '/admin/producao',
    stats: [
      { label: 'Em andamento', value: '14', color: 'text-amber-500' },
      { label: 'Concluídas hoje', value: '28', color: 'text-green-500' }
    ],
    status: 'ativo',
    gradient: 'from-blue-500 to-indigo-500'
  },
  {
    title: 'Controle de Qualidade',
    description: 'Validações, testes e aprovações com documentação completa de cada etapa do processo.',
    icon: <Microscope className="h-6 w-6" />,
    href: '/admin/producao/qualidade',
    stats: [
      { label: 'Aprovação', value: '98.2%', color: 'text-green-500' },
      { label: 'Pendentes', value: '4', color: 'text-amber-500' }
    ],
    status: 'em-breve',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Fórmulas Padrão',
    description: 'Biblioteca de fórmulas padronizadas com composição, instruções e controles.',
    icon: <FlaskConical className="h-6 w-6" />,
    href: '/admin/producao/formulas',
    stats: [
      { label: 'Cadastradas', value: '372', color: 'text-blue-500' },
      { label: 'Uso mensal', value: '158', color: 'text-green-500' }
    ],
    status: 'em-breve',
    gradient: 'from-amber-500 to-red-500'
  },
  {
    title: 'Planejamento',
    description: 'Calendário de produção com análise de capacidade e otimização de processos.',
    icon: <Calendar className="h-6 w-6" />,
    href: '/admin/producao/planejamento',
    stats: [
      { label: 'Produtividade', value: '82%', color: 'text-green-500' },
      { label: 'Próximos 7 dias', value: '56 ordens', color: 'text-blue-500' }
    ],
    status: 'em-breve',
    gradient: 'from-green-500 to-teal-500'
  }
];

// Status atual da produção
const productionStatus = {
  today: {
    pending: 12,
    inProgress: 14,
    completed: 28,
    total: 54
  },
  efficiency: 87,
  timeToCompletion: {
    avg: '3.2h',
    change: '-15min'
  },
  alerts: [
    {
      type: 'warning',
      message: '3 ordens aguardando insumos',
      action: '/admin/producao/pendentes'
    },
    {
      type: 'info',
      message: 'Capacidade atual: 85%',
      action: '/admin/producao/capacidade'
    }
  ]
};

// Produção recente
const recentProduction = [
  {
    id: 'OP-2452',
    customer: 'Maria Silva',
    formula: 'Creme Hidratante Corporal',
    status: 'completed',
    completedAt: '14:32'
  },
  {
    id: 'OP-2451',
    customer: 'João Almeida',
    formula: 'Loção Capilar Antiqueda',
    status: 'completed',
    completedAt: '13:45'
  },
  {
    id: 'OP-2450',
    customer: 'Ana Pereira',
    formula: 'Cápsulas de Colágeno com Vitamina C',
    status: 'in-progress',
    estimatedCompletion: '15:30'
  }
];

export default function OrdensProducaoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>('');
  const { toast } = useToast();

  const { data: ordens, isLoading, error, refetch } = useQuery<OrdemProducao[]>({
    queryKey: ['ordens-producao', searchTerm, statusFilter, prioridadeFilter],
    queryFn: async () => {
      try {
        // @ts-ignore - Tabela não definida nos tipos do Supabase
        let query = supabase
          .from('ordens_producao' as any)
          .select(`
            *,
            receita_id,
            usuario_responsavel_id,
            farmaceutico_responsavel_id
          `)
          .eq('is_deleted', false)
          .order('data_criacao', { ascending: false });

        if (searchTerm) {
          query = query.or(`numero_ordem.ilike.%${searchTerm}%,observacoes_gerais.ilike.%${searchTerm}%`);
        }

        if (statusFilter && statusFilter !== 'todos') {
          query = query.eq('status', statusFilter);
        }

        if (prioridadeFilter && prioridadeFilter !== 'todas') {
          query = query.eq('prioridade', prioridadeFilter);
        }

        const { data: ordensData, error: ordensError } = await query;

        if (ordensError) {
          // Verificar se o erro é porque a tabela não existe
          if (ordensError.code === '42P01') {
            console.error('A tabela ordens_producao não existe. Redirecionando para diagnóstico...');
            // Mostrar um toast informando o problema
            toast({
              title: "Tabela não encontrada",
              description: "A tabela 'ordens_producao' não foi encontrada no banco de dados. Use a ferramenta de diagnóstico para resolver.",
              variant: "destructive"
            });
            
            // Adicionar redirecionamento após um breve delay
            setTimeout(() => {
              window.location.href = '/admin/diagnostico-sistema';
            }, 3000);
            
            return []; // Retorna array vazio se a tabela não existir
          }
          console.error('Erro ao buscar ordens de produção:', ordensError);
          throw ordensError;
        }

        // Se não houver ordens ou a tabela não existir, retorna array vazio
        if (!ordensData || ordensData.length === 0) {
          return [];
        }

        // Buscar informações adicionais em queries separadas para evitar problemas de relacionamento
        const ordensProcessadas: OrdemProducao[] = [];

        for (const ordem of ordensData || []) {
          const ordemTipada = ordem as unknown as OrdemProducao;
          // Buscar receita associada
          let receita = null;
          if (ordemTipada.receita_id) {
            try {
              const { data: receitaData } = await supabase
                .from('receitas_processadas')
                .select('id, patient_name, medications')
                .eq('id', ordemTipada.receita_id)
                .single();
              
              receita = receitaData;
            } catch (error) {
              console.warn('Erro ao buscar receita:', error);
              // Continue mesmo se houver erro
            }
          }

          // Buscar usuário responsável
          let usuario = null;
          if (ordemTipada.usuario_responsavel_id) {
            try {
              const { data: usuarioData } = await supabase
                .from('usuarios_internos')
                .select('id, nome_completo')
                .eq('id', ordemTipada.usuario_responsavel_id)
                .single();
              
              usuario = usuarioData;
            } catch (error) {
              console.warn('Erro ao buscar usuário:', error);
              // Continue mesmo se houver erro
            }
          }

          // Buscar farmacêutico responsável
          let farmaceutico = null;
          if (ordemTipada.farmaceutico_responsavel_id) {
            try {
              const { data: farmaceuticoData } = await supabase
                .from('usuarios_internos')
                .select('id, nome_completo')
                .eq('id', ordemTipada.farmaceutico_responsavel_id)
                .single();
              
              farmaceutico = farmaceuticoData;
            } catch (error) {
              console.warn('Erro ao buscar farmacêutico:', error);
              // Continue mesmo se houver erro
            }
          }

          // Adicionar à lista com informações completas
          ordensProcessadas.push({
            ...ordemTipada,
            receitas_processadas: receita,
            usuarios_internos: usuario,
            farmaceutico: farmaceutico
          });
        }

        return ordensProcessadas;
      } catch (error: any) {
        // Se o erro for porque a tabela não existe, retorna array vazio
        if (error.code === '42P01') {
          console.log('Tabela ordens_producao não existe ainda');
          return [];
        }
        throw error;
      }
    },
    retry: 1, // Reduzir o número de tentativas se houver erro
  });

  const handleDeleteOrdem = async (id: string) => {
    try {
      // @ts-ignore - Tabela não definida nos tipos do Supabase
      const { error } = await supabase
        .from('ordens_producao' as any)
        .update({ is_deleted: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Ordem de produção excluída com sucesso.',
      });

      refetch();
    } catch (error) {
      console.error('Erro ao excluir ordem:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir ordem de produção.',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Checar se o erro é específico sobre tabela não existir
  const isTableNotExistError = error && (error as any)?.code === '42P01';

  if (error && !isTableNotExistError) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                Erro ao carregar ordens de produção. Tente novamente.
                <p className="text-sm mt-2">{(error as Error).message}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Ordens de Produção</h1>
            <p className="text-muted-foreground">
              Gerencie as ordens de produção e manipulação
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/producao/relatorios">
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Relatórios
              </Button>
            </Link>
            <Link to="/admin/producao/nova">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Ordem
              </Button>
            </Link>
          </div>
        </div>

        {/* Aviso se tabela não existir */}
        {isTableNotExistError && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center text-amber-800 gap-2">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <h3 className="font-medium">Módulo em Implementação</h3>
                  <p>O módulo de Produção está em fase de implementação. As tabelas necessárias ainda não foram criadas no banco de dados.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        {!isTableNotExistError && (
          <Card className="w-full mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por número ou observações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as prioridades</SelectItem>
                    {Object.entries(prioridadeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setPrioridadeFilter('');
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estatísticas - apenas mostrar se não houver erro de tabela não existente */}
        {!isTableNotExistError && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 w-full">
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = ordens?.filter(ordem => ordem.status === status).length || 0;
              const Icon = config.icon;
              return (
                <Card key={status} className="w-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {config.label}
                        </p>
                        <p className="text-2xl font-bold">{count}</p>
                      </div>
                      <Icon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Tabela de Ordens */}
        <Card className="w-full">
          <CardContent className="pt-6 w-full overflow-auto">
            {isTableNotExistError ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <DatabaseIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Tabela não encontrada</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  O módulo de produção está em desenvolvimento e a tabela <code>ordens_producao</code> ainda não foi criada no banco de dados.
                </p>
                <div className="flex gap-4">
                  <Button asChild variant="outline">
                    <Link to="/admin">
                      Voltar ao Dashboard
                    </Link>
                  </Button>
                  <Button asChild variant="default">
                    <Link to="/admin/diagnostico-sistema">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Diagnosticar Problema
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Data Criação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex justify-center items-center">
                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                            Carregando ordens...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : ordens && ordens.length > 0 ? (
                      ordens.map((ordem) => {
                        const statusInfo = statusConfig[ordem.status as keyof typeof statusConfig];
                        const prioridadeInfo = prioridadeConfig[ordem.prioridade as keyof typeof prioridadeConfig];
                        const StatusIcon = statusInfo?.icon || Clock;

                        return (
                          <TableRow key={ordem.id}>
                            <TableCell className="font-medium">{ordem.numero_ordem}</TableCell>
                            <TableCell>
                              {ordem.receitas_processadas?.patient_name || "Não especificado"}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusInfo?.color || "bg-gray-100"} variant="outline">
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {statusInfo?.label || "Desconhecido"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={prioridadeInfo?.color || "bg-gray-100"} variant="outline">
                                {prioridadeInfo?.label || "Normal"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {ordem.usuarios_internos?.nome_completo || "Não atribuído"}
                            </TableCell>
                            <TableCell>
                              {ordem.data_criacao ? formatDate(ordem.data_criacao) : "N/A"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end items-center gap-2">
                                <Link to={`/admin/producao/${ordem.id}`}>
                                  <Button variant="ghost" size="icon">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Link to={`/admin/producao/${ordem.id}/editar`}>
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteOrdem(ordem.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <p className="mb-2 text-muted-foreground">Nenhuma ordem de produção encontrada.</p>
                            <Link to="/admin/producao/nova">
                              <Button variant="outline" size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Criar Nova Ordem
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 