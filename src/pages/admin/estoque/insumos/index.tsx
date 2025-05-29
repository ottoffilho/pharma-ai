import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Search,
  Filter,
  Download,
  Upload,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Boxes,
  FlaskConical,
  Sparkles,
  ArrowUpRight,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

// Tipo para os dados de insumos vindos do Supabase
interface Insumo {
  id: string;
  nome: string;
  tipo: string;
  unidade_medida: string;
  custo_unitario: number;
  estoque_atual: number;
  estoque_minimo: number;
  estoque_maximo?: number;
  fornecedor_id?: string;
  descricao?: string;
  is_deleted: boolean;
}

const InsumosPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // States para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // State para gerenciar o diálogo de confirmação de exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [insumoToDelete, setInsumoToDelete] = useState<Insumo | null>(null);

  // Buscar dados de insumos do Supabase - filtrar apenas os não excluídos
  const {
    data: insumos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['insumos'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('insumos')
          .select('*')
          .eq('is_deleted', false)
          .order('nome');

        if (error) {
          if (error.code === '42P01') {
            return [];
          }
          throw new Error(error.message);
        }
        
        return data as Insumo[];
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === '42P01') {
          console.log('Tabela insumos não existe ainda');
          return [];
        }
        throw error;
      }
    },
    retry: 1,
  });

  // Mutation para realizar a exclusão lógica
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('insumos')
        .update({ is_deleted: true })
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
      
      toast({
        title: "Insumo excluído",
        description: "O insumo foi excluído com sucesso.",
        variant: "default",
      });
      
      setDeleteDialogOpen(false);
      setInsumoToDelete(null);
    },
    onError: (error) => {
      console.error('Erro ao excluir insumo:', error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o insumo. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  });

  // Filtrar insumos baseado na busca e filtros
  const filteredInsumos = insumos?.filter(insumo => {
    const matchesSearch = insumo.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insumo.tipo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || insumo.tipo === filterType;
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'low_stock' && insumo.estoque_atual <= insumo.estoque_minimo) ||
                         (filterStatus === 'normal' && insumo.estoque_atual > insumo.estoque_minimo);
    
    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  // Calcular métricas
  const totalInsumos = insumos?.length || 0;
  const lowStockCount = insumos?.filter(i => i.estoque_atual <= i.estoque_minimo).length || 0;
  const totalValue = insumos?.reduce((sum, i) => sum + (i.custo_unitario * i.estoque_atual), 0) || 0;

  // Total de unidades em estoque (somando todos os insumos)
  const totalUnidades = insumos?.reduce((sum, i) => sum + i.estoque_atual, 0) || 0;

  // Custo médio = valor total / total de unidades (evitar divisão por zero)
  const avgCost = totalUnidades > 0 ? totalValue / totalUnidades : 0;

  // Funções de navegação e ações
  const handleNewInsumo = () => {
    navigate('/admin/estoque/insumos/novo');
  };

  const handleEditInsumo = (id: string) => {
    navigate(`/admin/estoque/insumos/editar/${id}`);
  };

  const handleDeleteInsumo = (insumo: Insumo) => {
    setInsumoToDelete(insumo);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (insumoToDelete) {
      deleteMutation.mutate(insumoToDelete.id);
    }
  };

  // Formatação de valores monetários
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Função para determinar status do estoque
  const getStockStatus = (atual: number, minimo: number) => {
    if (atual <= minimo) return 'critical';
    if (atual <= minimo * 1.5) return 'warning';
    return 'good';
  };

  // Checar se o erro é específico sobre tabela não existir
  const isTableNotExistError = (error: unknown): boolean => {
    return error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === '42P01';
  };

  if (isTableNotExistError(error)) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <CardTitle>Tabela não encontrada</CardTitle>
              <CardDescription>
                A tabela de insumos ainda não foi criada no banco de dados.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => window.location.reload()}>
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 w-full">
        {/* Hero Section */}
        <div className="relative overflow-hidden w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20" />
          <div className="relative px-6 py-12 w-full">
            <div className="flex items-center justify-between">
              <div className="space-y-4 max-w-3xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                    <FlaskConical className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                      Gestão de Insumos
                    </h1>
                    <p className="text-xl text-muted-foreground mt-2">
                      Controle completo de matérias-primas e princípios ativos
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 blur-3xl opacity-20" />
                  <Boxes className="h-32 w-32 text-orange-600/20" />
                </div>
              </div>
            </div>

            {/* Métricas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total de Insumos</p>
                      <p className="text-2xl font-bold">{totalInsumos}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Estoque Baixo</p>
                      <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Custo Médio</p>
                      <p className="text-2xl font-bold">{formatCurrency(avgCost)}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Controles e Filtros */}
        <div className="px-6 w-full">
          <Card className="border-0 shadow-sm w-full">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar insumos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="principio_ativo">Princípio Ativo</SelectItem>
                      <SelectItem value="excipiente">Excipiente</SelectItem>
                      <SelectItem value="materia_prima">Matéria Prima</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="normal">Estoque Normal</SelectItem>
                      <SelectItem value="low_stock">Estoque Baixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar
                  </Button>
                  <Button onClick={handleNewInsumo} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Insumo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Insumos */}
        <div className="px-6 w-full">
          <Card className="border-0 shadow-sm w-full">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-600" />
                    Lista de Insumos
                  </CardTitle>
                  <CardDescription>
                    {filteredInsumos.length} insumo(s) encontrado(s)
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  {filteredInsumos.length} itens
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array(5).fill(null).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error && !isTableNotExistError(error) ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-700 mb-2">Erro ao carregar insumos</h3>
                  <p className="text-muted-foreground mb-4">{(error as Error)?.message || 'Tente novamente mais tarde'}</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Tentar novamente
                  </Button>
                </div>
              ) : filteredInsumos.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum insumo encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                      ? 'Tente ajustar os filtros de busca'
                      : 'Comece criando seu primeiro insumo'
                    }
                  </p>
                  <Button onClick={handleNewInsumo} className="bg-gradient-to-r from-orange-500 to-amber-500">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Insumo
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Insumo</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead>Custo Unit.</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInsumos.map((insumo: Tables<'insumos'>) => {
                        const stockStatus = getStockStatus(insumo.estoque_atual, insumo.estoque_minimo);
                        const totalValue = insumo.custo_unitario * insumo.estoque_atual;
                        
                        return (
                          <TableRow key={insumo.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100">
                                  <FlaskConical className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{insumo.nome}</p>
                                  <p className="text-sm text-muted-foreground">{insumo.unidade_medida}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {insumo.tipo?.replace('_', ' ') || 'Não definido'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="font-medium">{insumo.estoque_atual}</p>
                                <p className="text-muted-foreground">Mín: {insumo.estoque_minimo}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(insumo.custo_unitario)}
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(totalValue)}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={stockStatus === 'critical' ? 'destructive' : 
                                        stockStatus === 'warning' ? 'secondary' : 'default'}
                                className={
                                  stockStatus === 'critical' ? 'bg-red-100 text-red-800' :
                                  stockStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }
                              >
                                {stockStatus === 'critical' ? 'Crítico' :
                                 stockStatus === 'warning' ? 'Baixo' : 'Normal'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditInsumo(insumo.id)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteInsumo(insumo)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o insumo "{insumoToDelete?.nome}"?
                Esta ação não poderá ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default InsumosPage;
