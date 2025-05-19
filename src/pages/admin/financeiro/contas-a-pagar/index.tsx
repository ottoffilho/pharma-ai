
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, isAfter, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  CalendarIcon, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2,
  FilterX,
  Receipt,
  CreditCard
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RegistrarPagamentoContaDialog } from '@/components/financeiro/RegistrarPagamentoContaDialog';
import { DateRange } from 'react-day-picker';

// Status badge variant mapping
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'pendente': return 'outline';
    case 'pago': return 'success';
    case 'vencido': return 'destructive';
    case 'cancelada': return 'secondary';
    default: return 'outline';
  }
};

// Format currency values
const formatCurrency = (value: number | null) => {
  if (value === null) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default function ContasAPagarPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for filters
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: addDays(new Date(), 30)
  });
  const [fornecedorFilter, setFornecedorFilter] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for account to delete
  const [contaToDelete, setContaToDelete] = useState<any | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  
  // State for the payment registration dialog
  const [selectedConta, setSelectedConta] = useState<any | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  // Fetch data from Supabase
  const { data: contas, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['contas_a_pagar', statusFilter, dateRange, fornecedorFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('contas_a_pagar')
        .select(`
          *,
          fornecedores:fornecedor_id (nome),
          categorias:categoria_id (nome, tipo)
        `)
        .eq('is_deleted', false);
      
      // Apply filters if they exist
      if (statusFilter) {
        query = query.eq('status_conta', statusFilter);
      }
      
      if (dateRange?.from) {
        query = query.gte('data_vencimento', format(dateRange.from, 'yyyy-MM-dd'));
      }
      
      if (dateRange?.to) {
        query = query.lte('data_vencimento', format(dateRange.to, 'yyyy-MM-dd'));
      }
      
      if (fornecedorFilter) {
        query = query.eq('fornecedor_id', fornecedorFilter);
      }
      
      if (searchTerm) {
        query = query.ilike('descricao', `%${searchTerm}%`);
      }
      
      // Order by data_vencimento
      query = query.order('data_vencimento');
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Update status for overdue accounts
      const today = new Date();
      const processedData = data.map(conta => {
        if (conta.status_conta === 'pendente' && 
            isAfter(today, new Date(conta.data_vencimento))) {
          return { ...conta, status_conta: 'vencido' };
        }
        return conta;
      });
      
      return processedData;
    },
  });
  
  // Fetch suppliers for filter
  const { data: fornecedores } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data;
    },
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contas_a_pagar')
        .update({ is_deleted: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas_a_pagar'] });
      toast({
        title: "Conta removida",
        description: "A conta a pagar foi removida com sucesso.",
        variant: "success",
      });
      setIsDeleteAlertOpen(false);
      setContaToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Não foi possível remover a conta: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });
  
  // Calculate summary values
  const totalPendente = contas
    ?.filter(conta => conta.status_conta === 'pendente' || conta.status_conta === 'vencido')
    .reduce((acc, conta) => acc + Number(conta.valor_previsto), 0) || 0;
  
  const totalPago = contas
    ?.filter(conta => conta.status_conta === 'pago')
    .reduce((acc, conta) => acc + Number(conta.valor_pago || 0), 0) || 0;
  
  const totalVencido = contas
    ?.filter(conta => conta.status_conta === 'vencido')
    .reduce((acc, conta) => acc + Number(conta.valor_previsto), 0) || 0;
  
  // Handle navigation to new account page
  const handleNewConta = () => {
    navigate('/admin/financeiro/contas-a-pagar/novo');
  };
  
  // Handle navigation to edit account page
  const handleEdit = (id: string) => {
    navigate(`/admin/financeiro/contas-a-pagar/editar/${id}`);
  };
  
  // Open delete confirmation dialog
  const handleDelete = (conta: any) => {
    setContaToDelete(conta);
    setIsDeleteAlertOpen(true);
  };
  
  // Open payment registration dialog
  const handleRegisterPayment = (conta: any) => {
    setSelectedConta(conta);
    setIsPaymentDialogOpen(true);
  };
  
  // Reset filters
  const resetFilters = () => {
    setStatusFilter(undefined);
    setDateRange({
      from: subDays(new Date(), 30),
      to: addDays(new Date(), 30)
    });
    setFornecedorFilter(undefined);
    setSearchTerm('');
  };
  
  // Check status and render appropriate badge
  useEffect(() => {
    // Auto-update overdue status
    const updateOverdueStatus = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('contas_a_pagar')
        .update({ status_conta: 'vencido' })
        .eq('status_conta', 'pendente')
        .lt('data_vencimento', today);
      
      if (error) {
        console.error('Erro ao atualizar contas vencidas:', error);
      } else {
        refetch();
      }
    };
    
    updateOverdueStatus();
  }, [refetch]);
  
  return (
    <AdminLayout>
      <div className="container py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Contas a Pagar</h1>
            <p className="text-gray-500">Gerencie as contas e despesas a pagar</p>
          </div>
          <Button onClick={handleNewConta}>
            <Plus className="mr-2 h-4 w-4" /> Nova Conta
          </Button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(totalPendente)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(totalPago)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground text-red-500">Total Vencido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-500">{formatCurrency(totalVencido)}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search filter */}
              <div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar conta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              {/* Status filter */}
              <div>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Date range filter */}
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                            {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                          </>
                        ) : (
                          format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                        )
                      ) : (
                        <span>Selecione datas</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto" align="center">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                      locale={ptBR}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Supplier filter */}
              <div>
                <Select
                  value={fornecedorFilter}
                  onValueChange={setFornecedorFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedores?.map((fornecedor) => (
                      <SelectItem key={fornecedor.id} value={fornecedor.id}>
                        {fornecedor.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
              >
                <FilterX className="mr-2 h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Accounts Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-md">
                <p>Erro ao carregar contas: {(error as Error).message}</p>
              </div>
            ) : contas && contas.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data Venc.</TableHead>
                    <TableHead>Valor Prev.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Pag.</TableHead>
                    <TableHead>Valor Pago</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contas.map((conta) => (
                    <TableRow key={conta.id}>
                      <TableCell>{conta.descricao}</TableCell>
                      <TableCell>{conta.fornecedores?.nome || '—'}</TableCell>
                      <TableCell>{conta.categorias?.nome || '—'}</TableCell>
                      <TableCell>{format(new Date(conta.data_vencimento), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{formatCurrency(conta.valor_previsto)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(conta.status_conta)}>
                          {conta.status_conta.charAt(0).toUpperCase() + conta.status_conta.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {conta.data_pagamento 
                          ? format(new Date(conta.data_pagamento), 'dd/MM/yyyy')
                          : '—'}
                      </TableCell>
                      <TableCell>{conta.valor_pago ? formatCurrency(conta.valor_pago) : '—'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {conta.status_conta === 'pendente' && (
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleRegisterPayment(conta)}
                              title="Registrar Pagamento"
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEdit(conta.id)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(conta)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Nenhuma conta encontrada</h3>
                <p className="text-gray-500 mb-4">
                  Não há contas a pagar registradas ou que correspondam aos filtros aplicados.
                </p>
                <Button onClick={handleNewConta}>
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Conta
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog 
          open={isDeleteAlertOpen} 
          onOpenChange={setIsDeleteAlertOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a conta "{contaToDelete?.descricao}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(contaToDelete?.id)}
                className="bg-red-500 hover:bg-red-600"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  "Confirmar"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Payment Registration Dialog */}
        <RegistrarPagamentoContaDialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          conta={selectedConta}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['contas_a_pagar'] });
            setIsPaymentDialogOpen(false);
            setSelectedConta(null);
          }}
        />
      </div>
    </AdminLayout>
  );
}
