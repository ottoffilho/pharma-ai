
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layouts/AdminLayout';
import { CategoriaFinanceiraForm } from '@/components/financeiro/CategoriaFinanceiraForm';

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
      return data;
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
    
    return <CategoriaFinanceiraForm id={id} defaultValues={categoria} />;
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
