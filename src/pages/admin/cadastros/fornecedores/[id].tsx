import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import FornecedorForm from '@/components/cadastros/FornecedorForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
        <div className="w-full py-6">
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Render de estado de erro
  if (error) {
    return (
      <AdminLayout>
        <div className="w-full py-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar dados do fornecedor: {(error as Error).message}
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate('/admin/cadastros/fornecedores')}>
              Voltar para Fornecedores
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!fornecedor) {
    return (
      <AdminLayout>
        <div className="w-full py-6">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Fornecedor não encontrado</h2>
            <p className="text-muted-foreground mb-6">
              O fornecedor solicitado não foi encontrado.
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/cadastros/fornecedores')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para lista
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
      <div className="w-full py-6">
        <FornecedorForm
          initialData={fornecedor}
          isEditing={true}
          fornecedorId={id}
        />
      </div>
    </AdminLayout>
  );
} 