
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, isAfter, parseISO, startOfDay, endOfDay, subDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Loader2, 
  FileText, 
  Filter,
  CalendarRange,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RegistrarPagamentoContaDialog } from '@/components/financeiro/RegistrarPagamentoContaDialog';
import { DateRange } from 'react-day-picker';

// Status badge variant mapping
const getStatusVariant = (status: string) => {
  switch(status) {
    case 'pendente':
      return 'warning';
    case 'pago':
      return 'success';
    case 'vencido':
      return 'destructive';
    case 'cancelada':
      return 'secondary';
    default:
      return 'default';
  }
};

// Format currency function
const formatCurrency = (value: number | string | null) => {
  if (value === null) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value));
};

export default function ContasAPagarPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for filters
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: addDays(new Date(), 30)
  });
  const [fornecedorFilter, setFornecedorFilter] = useState<string | undefined>(undefined);
  
  // State for dialogs
  const [deletingContaId, setDeletingContaId] = useState<string | null>(null);
  const [selectedConta, setSelectedConta] = useState<any | null>(null);
  const [pagamentoDialogOpen, setPagamentoDialogOpen] = useState(false);

  // Fetch suppliers
  const { data: fornecedores } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch accounts payable with filters and supplier/category names
  const { data: contas, isLoading, refetch } = useQuery({
    queryKey: ['contas_a_pagar', statusFilter, dateRange, fornecedorFilter],
    queryFn: async () => {
      let query = supabase
        .from('contas_a_pagar')
        .select(`
          *,
          fornecedor:fornecedor_id(id, nome),
          categoria:categoria_id(id, nome)
        `)
        .eq('is_deleted', false);
      
      if (statusFilter) {
        query = query.eq('status_conta', statusFilter);
      }
      
      if (dateRange.from) {
        query = query.gte('data_vencimento', dateRange.from.toISOString().split('T')[0]);
      }
      
      if (dateRange.to) {
        query = query.lte('data_vencimento', dateRange.to.toISOString().split('T')[0]);
      }
      
      if (fornecedorFilter) {
        query = query.eq('fornecedor_id', fornecedorFilter);
      }
      
      const { data, error } = await query.order('data_vencimento');
      
      if (error) throw error;

      // Post-process data to check for overdue accounts
      const today = new Date();
      return (data || []).map(conta => {
        // Mark as overdue if status is 'pendente' and vencimento date is past
        if (conta.status_conta === 'pendente' && 
            isAfter(today, parseISO(conta.data_vencimento))) {
          return { ...conta, status_conta: 'vencido' };
        }
        return conta;
      });
    },
  });

  // Calculate summary values
  const totalPendente = contas
    ?.filter(conta => conta.status_conta === 'pendente' || conta.status_conta === 'vencido')
    .reduce((sum, conta) => sum + Number(conta.valor_previsto), 0) || 0;
    
  const totalPago = contas
    ?.filter(conta => conta.status_conta === 'pago')
    .reduce((sum, conta) => sum + Number(conta.valor_pago || 0), 0) || 0;
    
  const totalVencido = contas
    ?.filter(conta => conta.status_conta === 'vencido')
    .reduce((sum, conta) => sum + Number(conta.valor_previsto), 0) || 0;

  // Handle delete (soft delete)
  const handleDelete = async () => {
    if (!deletingContaId) return;
    
    try {
      const { error } = await supabase
        .from('contas_a_pagar')
        .update({ is_deleted: true })
        .eq('id', deletingContaId);
        
      if (error) throw error;
      
      toast({
        title: "Conta removida",
        description: "A conta a pagar foi removida com sucesso.",
        variant: "success",
      });
      
      refetch();
    } catch (error) {
      console.error('Erro ao remover conta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a conta. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeletingContaId(null);
    }
  };

  const handleOpenPagamento = (conta: any) => {
    setSelectedConta(conta);
    setPagamentoDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Contas a Pagar</h1>
          <Button onClick={() => navigate('novo')}>
            <Plus className="mr-2 h-4 w-4" /> Nova Conta a Pagar
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total a Pagar (Pendentes)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPendente)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pago (Período)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPago)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Vencido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{formatCurrency(totalVencido)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Período de Vencimento</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarRange className="mr-2 h-4 w-4" />
                      {dateRange.from && dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                        </>
                      ) : (
                        <span>Selecione um período</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto" align="center">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      locale={ptBR}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Fornecedor</label>
                <Select value={fornecedorFilter} onValueChange={setFornecedorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os fornecedores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os fornecedores</SelectItem>
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
                onClick={() => {
                  setStatusFilter(undefined);
                  setDateRange({
                    from: subDays(new Date(), 30),
                    to: addDays(new Date(), 30)
                  });
                  setFornecedorFilter(undefined);
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Accounts table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : contas && contas.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data Venc.</TableHead>
                    <TableHead>Valor Previsto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Pag.</TableHead>
                    <TableHead>Valor Pago</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contas.map((conta) => (
                    <TableRow key={conta.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {conta.descricao}
                      </TableCell>
                      <TableCell>{conta.fornecedor?.nome || '-'}</TableCell>
                      <TableCell>{conta.categoria?.nome || '-'}</TableCell>
                      <TableCell>
                        {conta.data_vencimento 
                          ? format(new Date(conta.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })
                          : '-'}
                      </TableCell>
                      <TableCell>{formatCurrency(conta.valor_previsto)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(conta.status_conta)}>
                          {conta.status_conta.charAt(0).toUpperCase() + conta.status_conta.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {conta.data_pagamento 
                          ? format(new Date(conta.data_pagamento), 'dd/MM/yyyy', { locale: ptBR })
                          : '-'}
                      </TableCell>
                      <TableCell>{conta.valor_pago ? formatCurrency(conta.valor_pago) : '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`editar/${conta.id}`)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeletingContaId(conta.id)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          
                          {(conta.status_conta === 'pendente' || conta.status_conta === 'vencido') && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenPagamento(conta)}
                              title="Registrar Pagamento"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">Nenhuma conta encontrada</h3>
                <p className="text-muted-foreground">Não há contas a pagar registradas com os filtros selecionados.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete confirmation dialog */}
        <AlertDialog 
          open={!!deletingContaId} 
          onOpenChange={(open) => !open && setDeletingContaId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Conta a Pagar</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta conta a pagar? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Payment registration dialog */}
        {selectedConta && (
          <RegistrarPagamentoContaDialog 
            isOpen={pagamentoDialogOpen}
            onClose={() => {
              setPagamentoDialogOpen(false);
              setSelectedConta(null);
              refetch();
            }}
            conta={selectedConta}
          />
        )}
      </div>
    </AdminLayout>
  );
}
