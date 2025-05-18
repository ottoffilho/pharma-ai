
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
}

const InsumosPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Buscar dados de insumos do Supabase
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
        .order('nome');

      if (error) throw new Error(error.message);
      return data as Insumo[];
    },
  });

  // Função para navegar para a página de criação de insumos
  const handleNewInsumo = () => {
    navigate('/admin/estoque/insumos/novo');
  };

  // Função para navegar para a página de edição de insumos
  const handleEditInsumo = (id: string) => {
    navigate(`/admin/estoque/insumos/editar/${id}`);
  };

  // Função placeholder para exclusão de insumos
  const handleDeleteInsumo = (id: string) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A exclusão de insumos será implementada em breve.",
      variant: "default",
    });
    console.log('Deletar insumo', id);
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
                          onClick={() => handleDeleteInsumo(insumo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
  );
};

export default InsumosPage;
