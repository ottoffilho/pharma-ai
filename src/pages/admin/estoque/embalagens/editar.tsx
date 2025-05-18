
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layouts/AdminLayout';
import EmbalagemForm from '@/components/estoque/EmbalagemForm';

const EditarEmbalagemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: embalagem, isLoading, error } = useQuery({
    queryKey: ['embalagem', id],
    queryFn: async () => {
      if (!id) throw new Error("ID da embalagem não fornecido");
      
      const { data, error } = await supabase
        .from('embalagens')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6 flex justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando dados da embalagem...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            <h3 className="font-bold">Erro ao carregar dados</h3>
            <p>{(error as Error).message}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Editar Embalagem</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          {embalagem ? (
            <EmbalagemForm 
              defaultValues={embalagem}
              isEditing={true}
              embalagemId={id}
            />
          ) : (
            <p>Embalagem não encontrada.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditarEmbalagemPage;
