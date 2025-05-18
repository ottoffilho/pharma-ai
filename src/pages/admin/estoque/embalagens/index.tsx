
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Loader2, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layouts/AdminLayout';
import { supabase } from '@/integrations/supabase/client';

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
};

const EmbalagensListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch embalagens data with fornecedor info
  const { data: embalagens, isLoading, isError, error } = useQuery({
    queryKey: ['embalagens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('embalagens')
        .select('*, fornecedores(nome)');
      
      if (error) throw error;
      return data as Embalagem[];
    },
  });

  const handleEdit = (id: string) => {
    navigate(`/admin/estoque/embalagens/editar/${id}`);
  };

  const handleDelete = (id: string) => {
    console.log('Delete embalagem with ID:', id);
    toast({
      title: 'Funcionalidade pendente',
      description: 'A exclusão de embalagens será implementada em breve.',
    });
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
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(embalagem.id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Excluir
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
  );
};

export default EmbalagensListPage;
