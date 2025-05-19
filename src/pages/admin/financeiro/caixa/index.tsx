
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, subDays, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layouts/AdminLayout';
import { MovimentacaoCaixaForm } from '@/components/financeiro/MovimentacaoCaixaForm';
import { CalendarIcon, Plus, ArrowDown, ArrowUp, Edit, Trash2 } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function FluxoCaixaPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isNovaMovimentacaoOpen, setIsNovaMovimentacaoOpen] = useState(false);
  const [isEditMovimentacaoOpen, setIsEditMovimentacaoOpen] = useState(false);
  const [selectedMovimentacao, setSelectedMovimentacao] = useState<any>(null);
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');
  const [dataInicio, setDataInicio] = useState<Date>(startOfMonth(new Date()));
  const [dataFim, setDataFim] = useState<Date>(new Date());

  // Consultar movimentações de caixa
  const { data: movimentacoes, isLoading, isError, error } = useQuery({
    queryKey: ['movimentacoes-caixa', tipoFiltro, dataInicio, dataFim],
    queryFn: async () => {
      let query = supabase
        .from('movimentacoes_caixa')
        .select('*, categorias_financeiras(nome, tipo)')
        .eq('is_deleted', false)
        .gte('data_movimentacao', format(dataInicio, 'yyyy-MM-dd'))
        .lte('data_movimentacao', format(dataFim, 'yyyy-MM-dd'))
        .order('data_movimentacao', { ascending: false });
      
      if (tipoFiltro !== 'todos') {
        query = query.eq('tipo_movimentacao', tipoFiltro);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
  });

  // Mutação para excluir movimentação (soft delete)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('movimentacoes_caixa')
        .update({ is_deleted: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Movimentação excluída",
        description: "A movimentação foi excluída com sucesso.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-caixa'] });
    },
    onError: (error: any) => {
      console.error('Erro ao excluir movimentação:', error);
      toast({
        title: "Erro ao excluir",
        description: error.message || "Ocorreu um erro ao excluir a movimentação.",
        variant: "destructive",
      });
    },
  });

  // Calcular totais
  const calcularTotais = () => {
    if (!movimentacoes || movimentacoes.length === 0) {
      return { totalEntradas: 0, totalSaidas: 0, saldo: 0 };
    }
    
    const totalEntradas = movimentacoes
      .filter((mov: any) => mov.tipo_movimentacao === 'entrada')
      .reduce((total: number, mov: any) => total + parseFloat(mov.valor), 0);
      
    const totalSaidas = movimentacoes
      .filter((mov: any) => mov.tipo_movimentacao === 'saida')
      .reduce((total: number, mov: any) => total + parseFloat(mov.valor), 0);
      
    return {
      totalEntradas,
      totalSaidas,
      saldo: totalEntradas - totalSaidas,
    };
  };

  const { totalEntradas, totalSaidas, saldo } = calcularTotais();

  // Formatar valor em BRL
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const handleExcluir = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEditar = (movimentacao: any) => {
    // Converter a string de data para um objeto Date para o formulário
    const dataMovimentacao = new Date(movimentacao.data_movimentacao);
    
    setSelectedMovimentacao({
      ...movimentacao,
      data_movimentacao: dataMovimentacao,
    });
    
    setIsEditMovimentacaoOpen(true);
  };

  const handleNovaMovimentacaoSuccess = () => {
    setIsNovaMovimentacaoOpen(false);
    toast({
      title: "Movimentação registrada",
      description: "A movimentação foi adicionada com sucesso.",
      variant: "success",
    });
  };

  const handleEditMovimentacaoSuccess = () => {
    setIsEditMovimentacaoOpen(false);
    setSelectedMovimentacao(null);
    toast({
      title: "Movimentação atualizada",
      description: "A movimentação foi atualizada com sucesso.",
      variant: "success",
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="py-8 text-center">Carregando movimentações...</div>;
    }

    if (isError) {
      return (
        <div className="py-8 text-center text-red-500">
          Erro ao carregar movimentações: {(error as Error).message}
        </div>
      );
    }

    if (!movimentacoes || movimentacoes.length === 0) {
      return (
        <div className="py-8 text-center text-gray-500">
          Nenhuma movimentação encontrada no período selecionado.
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movimentacoes.map((mov: any) => (
            <TableRow key={mov.id}>
              <TableCell>
                {format(new Date(mov.data_movimentacao), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell className="font-medium">{mov.descricao}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {mov.tipo_movimentacao === 'entrada' ? (
                    <div className="flex items-center text-green-600">
                      <ArrowUp className="h-4 w-4 mr-1" />
                      <span>Entrada</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <ArrowDown className="h-4 w-4 mr-1" />
                      <span>Saída</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {mov.categorias_financeiras?.nome ? (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100">
                    {mov.categorias_financeiras.nome}
                  </span>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell className={`text-right font-medium ${
                mov.tipo_movimentacao === 'entrada' ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatarValor(mov.valor)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditar(mov)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta movimentação? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-red-600 hover:bg-red-700" 
                          onClick={() => handleExcluir(mov.id)}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Fluxo de Caixa</h1>
          <Dialog open={isNovaMovimentacaoOpen} onOpenChange={setIsNovaMovimentacaoOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Registrar Movimentação</DialogTitle>
              </DialogHeader>
              <MovimentacaoCaixaForm onSuccess={handleNovaMovimentacaoSuccess} />
              <DialogClose className="hidden" />
            </DialogContent>
          </Dialog>
        </div>

        {/* Resumo financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-green-600">Total Entradas</CardTitle>
              <CardDescription>No período selecionado</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{formatarValor(totalEntradas)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-red-600">Total Saídas</CardTitle>
              <CardDescription>No período selecionado</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{formatarValor(totalSaidas)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className={`text-lg ${saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                Saldo do Período
              </CardTitle>
              <CardDescription>Entradas - Saídas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatarValor(saldo)}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Filtros */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Movimentação
              </label>
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="entrada">Entradas</SelectItem>
                  <SelectItem value="saida">Saídas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Início
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataInicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataInicio ? format(dataInicio, 'PP', { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataInicio}
                    onSelect={(date) => date && setDataInicio(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fim
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataFim && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataFim ? format(dataFim, 'PP', { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataFim}
                    onSelect={(date) => date && setDataFim(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Tabela de movimentações */}
          <div className="overflow-x-auto">
            {renderContent()}
          </div>
        </div>

        {/* Dialog para editar movimentação */}
        {selectedMovimentacao && (
          <Dialog open={isEditMovimentacaoOpen} onOpenChange={setIsEditMovimentacaoOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Editar Movimentação</DialogTitle>
              </DialogHeader>
              <MovimentacaoCaixaForm 
                onSuccess={handleEditMovimentacaoSuccess}
                initialData={selectedMovimentacao}
                mode="edit"
                id={selectedMovimentacao.id}
              />
              <DialogClose className="hidden" />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
}
