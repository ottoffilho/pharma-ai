
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
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
      const { data, error } = await supabase
        .from('insumos')
        .select('*')
        .eq('is_deleted', false)  // Filtrar apenas insumos não excluídos
        .order('nome');

      if (error) throw new Error(error.message);
      return data as Insumo[];
    },
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
      // Invalida a query para recarregar a lista
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
      
      // Mostra toast de sucesso
      toast({
        title: "Insumo excluído",
        description: "O insumo foi excluído com sucesso.",
        variant: "default",
      });
      
      // Fecha o diálogo de confirmação
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

  // Função para navegar para a página de criação de insumos
  const handleNewInsumo = () => {
    navigate('/admin/estoque/insumos/novo');
  };

  // Função para navegar para a página de edição de insumos
  const handleEditInsumo = (id: string) => {
    navigate(`/admin/estoque/insumos/editar/${id}`);
  };

  // Função para iniciar o processo de exclusão
  const handleDeleteInsumo = (insumo: Insumo) => {
    setInsumoToDelete(insumo);
    setDeleteDialogOpen(true);
  };

  // Função para confirmar a exclusão
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

  // Render de estado de carregamento
  const renderLoading = () => (
    <div className="space-y-3">
      {Array(5).fill(null).map((_, index) => (
        <TableRow key={index}>
          {Array(7).fill(null).map((_, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </div>
  );

  // Render de estado de erro
  const renderError = () => (
    <TableRow>
      <TableCell colSpan={7} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center text-destructive">
          <p className="font-semibold">Erro ao carregar insumos</p>
          <p className="text-sm">{(error as Error)?.message || 'Tente novamente mais tarde'}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  // Render de estado vazio (sem insumos)
  const renderEmpty = () => (
    <TableRow>
      <TableCell colSpan={7} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center">
          <p className="font-semibold">Nenhum insumo cadastrado</p>
          <p className="text-sm text-muted-foreground mb-4">Adicione seu primeiro insumo para iniciar o controle de estoque.</p>
          <Button onClick={handleNewInsumo}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Insumo
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      <AdminLayout>
        <div className="container-section py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="heading-lg">Gestão de Insumos</h1>
            <Button onClick={handleNewInsumo}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Insumo
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Custo Unitário</TableHead>
                  <TableHead className="text-right">Estoque Atual</TableHead>
                  <TableHead className="text-right">Estoque Mínimo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && renderLoading()}
                {error && renderError()}
                {!isLoading && !error && insumos?.length === 0 && renderEmpty()}
                {!isLoading && !error && insumos && insumos.length > 0 && (
                  insumos.map((insumo) => (
                    <TableRow key={insumo.id}>
                      <TableCell className="font-medium">{insumo.nome}</TableCell>
                      <TableCell>{insumo.tipo}</TableCell>
                      <TableCell>{insumo.unidade_medida}</TableCell>
                      <TableCell>{formatCurrency(insumo.custo_unitario)}</TableCell>
                      <TableCell className={`text-right ${insumo.estoque_atual <= insumo.estoque_minimo ? 'text-destructive font-medium' : ''}`}>
                        {insumo.estoque_atual}
                      </TableCell>
                      <TableCell className="text-right">{insumo.estoque_minimo}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditInsumo(insumo.id)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteInsumo(insumo)}
                            disabled={deleteMutation.isPending && insumoToDelete?.id === insumo.id}
                          >
                            {deleteMutation.isPending && insumoToDelete?.id === insumo.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </AdminLayout>

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o insumo <strong>{insumoToDelete?.nome}</strong>?
              <br />
              Esta ação não poderá ser desfeita da interface.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Sim, excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InsumosPage;
