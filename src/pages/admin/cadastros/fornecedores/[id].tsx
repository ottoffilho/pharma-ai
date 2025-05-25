import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layouts/AdminLayout';
import FornecedorForm from '@/components/cadastros/FornecedorForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import type { Fornecedor } from '@/integrations/supabase/types';

export default function EditarFornecedorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Buscar dados do fornecedor específico
  const {
    data: fornecedor,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['fornecedor', id],
    queryFn: async () => {
      if (!id) throw new Error('ID do fornecedor não fornecido');
      
      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      return data as Fornecedor;
    },
    enabled: !!id, // Só executa a query se o ID estiver disponível
  });

  // Render de estado de carregamento
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container py-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array(4).fill(null).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Render de estado de erro
  if (error || !fornecedor) {
    return (
      <AdminLayout>
        <div className="container py-6">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Fornecedor não encontrado</h2>
            <p className="text-muted-foreground mb-6">
              {error instanceof Error ? error.message : 'O fornecedor solicitado não foi encontrado.'}
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/cadastros/fornecedores')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para lista
              </Button>
              <Button
                onClick={() => window.location.reload()}
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Render normal com dados do fornecedor
  return (
    <AdminLayout>
      <div className="container py-6">
        <FornecedorForm
          initialData={fornecedor}
          isEditing={true}
          fornecedorId={id}
        />
      </div>
    </AdminLayout>
  );
} 