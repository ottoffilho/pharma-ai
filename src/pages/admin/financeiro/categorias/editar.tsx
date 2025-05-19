
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layouts/AdminLayout';
import { CategoriaFinanceiraForm } from '@/components/financeiro/CategoriaFinanceiraForm';

// Define the shape of our categoria object
interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  descricao: string | null;
  is_deleted: boolean;
}

export default function EditarCategoriaPage() {
  const { id } = useParams<{ id: string }>();
  
  // Buscar dados da categoria
  const { data: categoria, isLoading, isError, error } = useQuery({
    queryKey: ['categoria-financeira', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('categorias_financeiras')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Ensure tipo is properly typed as 'receita' | 'despesa'
      if (data && (data.tipo === 'receita' || data.tipo === 'despesa')) {
        return data as CategoriaFinanceira;
      }
      
      throw new Error('Tipo de categoria inválido');
    },
    enabled: !!id,
  });

  const renderContent = () => {
    if (isLoading) {
      return <div className="py-8 text-center">Carregando dados da categoria...</div>;
    }
    
    if (isError) {
      return (
        <div className="py-8 text-center text-red-500">
          Erro ao carregar dados: {(error as Error).message}
        </div>
      );
    }
    
    if (!categoria) {
      return <div className="py-8 text-center">Categoria não encontrada</div>;
    }
    
    // Convert the database object to the form's expected format
    const formDefaultValues = {
      nome: categoria.nome,
      tipo: categoria.tipo,
      descricao: categoria.descricao || '',
    };
    
    return <CategoriaFinanceiraForm id={id} defaultValues={formDefaultValues} />;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Editar Categoria Financeira</h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          {renderContent()}
        </div>
      </div>
    </AdminLayout>
  );
}
