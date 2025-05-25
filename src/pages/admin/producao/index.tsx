import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Eye, Edit, Trash2, Clock, CheckCircle, AlertCircle, XCircle, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layouts/AdminLayout';
import { OrdemProducao } from '@/integrations/supabase/types';

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

export default function OrdensProducaoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>('');
  const { toast } = useToast();

  const { data: ordens, isLoading, error, refetch } = useQuery({
    queryKey: ['ordens-producao', searchTerm, statusFilter, prioridadeFilter],
    queryFn: async () => {
      let query = supabase
        .from('ordens_producao')
        .select(`
          *,
          receitas_processadas (
            id,
            patient_name,
            medications
          ),
          usuarios_internos!ordens_producao_usuario_responsavel_id_fkey (
            id,
            nome_completo
          ),
          farmaceutico:usuarios_internos!ordens_producao_farmaceutico_responsavel_id_fkey (
            id,
            nome_completo
          )
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

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar ordens de produção:', error);
        throw error;
      }

      return data as (OrdemProducao & {
        pedidos?: { id: string; status: string; total_amount: number | null };
        receitas_processadas?: { id: string; patient_name: string | null; medications: Record<string, unknown> };
        usuarios_internos?: { id: string; nome_completo: string };
        farmaceutico?: { id: string; nome_completo: string };
      })[];
    },
  });

  const handleDeleteOrdem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ordens_producao')
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

  if (error) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                Erro ao carregar ordens de produção. Tente novamente.
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Ordens de Produção</h1>
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

        {/* Filtros */}
        <Card>
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

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = ordens?.filter(ordem => ordem.status === status).length || 0;
            const Icon = config.icon;
            return (
              <Card key={status}>
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

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Ordens</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando ordens de produção...</div>
            ) : ordens && ordens.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead>Valor Estimado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordens.map((ordem) => {
                    const statusInfo = statusConfig[ordem.status as keyof typeof statusConfig];
                    const prioridadeInfo = prioridadeConfig[ordem.prioridade as keyof typeof prioridadeConfig];
                    const StatusIcon = statusInfo?.icon || Clock;

                    return (
                      <TableRow key={ordem.id}>
                        <TableCell className="font-medium">
                          {ordem.numero_ordem}
                        </TableCell>
                        <TableCell>
                          {ordem.receitas_processadas?.patient_name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo?.color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusInfo?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={prioridadeInfo?.color}>
                            {prioridadeInfo?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ordem.usuarios_internos?.nome_completo || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {formatDate(ordem.data_criacao)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(ordem.custo_total_estimado)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link to={`/admin/producao/${ordem.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link to={`/admin/producao/${ordem.id}/editar`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteOrdem(ordem.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma ordem de produção encontrada.</p>
                <Link to="/admin/producao/nova">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar primeira ordem
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 