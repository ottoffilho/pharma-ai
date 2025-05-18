
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layouts/AdminLayout';
import LoteInsumoForm from '@/components/estoque/LoteInsumoForm';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EditarLoteInsumoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch lote data to check if it exists
  const { isLoading, error } = useQuery({
    queryKey: ['lote', id],
    queryFn: async () => {
      if (!id) throw new Error('ID do lote não fornecido');

      const { data, error } = await supabase
        .from('lotes_insumos')
        .select('id, insumo_id')
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      if (!data) throw new Error('Lote não encontrado');
      
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container py-6 flex justify-center items-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-homeo-green" />
            <p>Carregando dados do lote...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="container py-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar dados do lote: {(error as Error).message}
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate("/admin/estoque/insumos")}>
              Voltar para Insumos
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-6">
        <LoteInsumoForm 
          isEditing={true}
          loteId={id}
        />
      </div>
    </AdminLayout>
  );
};

export default EditarLoteInsumoPage;
