
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layouts/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
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

// Define the type for embalagem data
type Embalagem = {
  id: string;
  nome: string;
  tipo: string;
  volume_capacidade: string | null;
  custo_unitario: number;
  estoque_atual: number;
  estoque_minimo: number;
  estoque_maximo: number | null;
  fornecedor_id: string | null;
  descricao: string | null;
  fornecedores: {
    nome: string | null;
  } | null;
  is_deleted: boolean;
};

const EmbalagensListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [embalagensToDelete, setEmbalagemToDelete] = useState<Embalagem | null>(null);

  // Fetch embalagens data with fornecedor info - filter out deleted items
  const { data: embalagens, isLoading, isError, error } = useQuery({
    queryKey: ['embalagens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('embalagens')
        .select('*, fornecedores(nome)')
        .eq('is_deleted', false);
      
      if (error) throw error;
      return data as Embalagem[];
    },
  });

  // Mutation for soft delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('embalagens')
        .update({ is_deleted: true })
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['embalagens'] });
      
      toast({
        title: "Embalagem excluída",
        description: "A embalagem foi excluída com sucesso.",
        variant: "success",
      });
      
      setDeleteDialogOpen(false);
      setEmbalagemToDelete(null);
    },
    onError: (error) => {
      console.error('Erro ao excluir embalagem:', error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a embalagem. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  });

  const handleEdit = (id: string) => {
    navigate(`/admin/estoque/embalagens/editar/${id}`);
  };

  const handleDelete = (embalagem: Embalagem) => {
    setEmbalagemToDelete(embalagem);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (embalagensToDelete) {
      deleteMutation.mutate(embalagensToDelete.id);
    }
  };

  const handleAddNew = () => {
    navigate('/admin/estoque/embalagens/novo');
  };

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <>
      <AdminLayout>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Gestão de Embalagens</h1>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" /> Nova Embalagem
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : isError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              <p>Erro ao carregar embalagens: {(error as Error).message}</p>
            </div>
          ) : embalagens && embalagens.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Volume/Capacidade</TableHead>
                  <TableHead>Custo Unitário</TableHead>
                  <TableHead>Estoque Atual</TableHead>
                  <TableHead>Estoque Mínimo</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {embalagens.map((embalagem) => (
                  <TableRow key={embalagem.id}>
                    <TableCell>{embalagem.nome}</TableCell>
                    <TableCell>{embalagem.tipo}</TableCell>
                    <TableCell>{embalagem.volume_capacidade || '-'}</TableCell>
                    <TableCell>{formatCurrency(embalagem.custo_unitario)}</TableCell>
                    <TableCell>
                      <span 
                        className={
                          embalagem.estoque_atual <= embalagem.estoque_minimo 
                            ? "text-red-600 font-semibold" 
                            : ""
                        }
                      >
                        {embalagem.estoque_atual}
                      </span>
                    </TableCell>
                    <TableCell>{embalagem.estoque_minimo}</TableCell>
                    <TableCell>{embalagem.fornecedores?.nome || 'Não especificado'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(embalagem.id)}>
                          <Edit className="h-4 w-4 mr-1" /> Editar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(embalagem)}
                          disabled={deleteMutation.isPending && embalagensToDelete?.id === embalagem.id}
                        >
                          {deleteMutation.isPending && embalagensToDelete?.id === embalagem.id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-1" />
                          )}
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-md">
              <p className="text-gray-600 mb-4">Nenhuma embalagem encontrada.</p>
              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Nova Embalagem
              </Button>
            </div>
          )}
        </div>
      </AdminLayout>

      {/* Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a embalagem <strong>{embalagensToDelete?.nome}</strong>?
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

export default EmbalagensListPage;
