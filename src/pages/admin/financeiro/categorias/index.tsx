
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layouts/AdminLayout';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';

export default function CategoriasFinanceirasPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState<string | null>(null);

  // Consultar categorias
  const { data: categorias, isLoading, isError, error } = useQuery({
    queryKey: ['categorias-financeiras'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias_financeiras')
        .select('*')
        .eq('is_deleted', false)
        .order('tipo', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Mutação para excluir categoria (soft delete)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categorias_financeiras')
        .update({ is_deleted: true })
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast({
        title: 'Categoria excluída',
        description: 'A categoria foi excluída com sucesso.',
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['categorias-financeiras'] });
    },
    onError: (error: unknown) => {
      console.error('Erro ao excluir categoria:', error);
      toast({
        title: 'Erro ao excluir',
        description: (error instanceof Error ? error.message : 'Erro desconhecido') || 'Ocorreu um erro ao excluir a categoria.',
        variant: 'destructive',
      });
    },
  });

  const handleExcluir = (id: string) => {
    setCategoriaParaExcluir(id);
  };

  const confirmarExclusao = () => {
    if (categoriaParaExcluir) {
      deleteMutation.mutate(categoriaParaExcluir);
      setCategoriaParaExcluir(null);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="py-8 text-center">Carregando categorias...</div>;
    }

    if (isError) {
      return (
        <div className="py-8 text-center text-red-500">
          Erro ao carregar categorias: {(error as Error).message}
        </div>
      );
    }

    if (!categorias || categorias.length === 0) {
      return (
        <div className="py-8 text-center text-gray-500">
          Nenhuma categoria financeira encontrada. Clique no botão "Nova Categoria" para criar.
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categorias.map((categoria: Record<string, unknown>) => (
            <TableRow key={categoria.id}>
              <TableCell className="font-medium">{categoria.nome}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    categoria.tipo === 'receita'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {categoria.tipo === 'receita' ? 'Receita' : 'Despesa'}
                </span>
              </TableCell>
              <TableCell>{categoria.descricao || '-'}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/financeiro/categorias/editar/${categoria.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleExcluir(categoria.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a categoria &quot;{categoria.nome}&quot;?
                          Esta ação não poderá ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmarExclusao}>
                          Confirmar
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
          <h1 className="text-2xl font-bold">Categorias Financeiras</h1>
          <Button onClick={() => navigate('/admin/financeiro/categorias/novo')}>
            <Plus className="h-4 w-4 mr-1" />
            Nova Categoria
          </Button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {renderContent()}
        </div>
      </div>
    </AdminLayout>
  );
}
