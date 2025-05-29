import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContaPagarForm } from '@/components/financeiro/ContaPagarForm';
import { useToast } from '@/hooks/use-toast';

export default function EditarContaPagarPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: conta, isLoading, error } = useQuery({
    queryKey: ['conta_a_pagar', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('contas_a_pagar')
        .select('*')
        .eq('id', id)
        .eq('is_deleted', false)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Show error toast if the account couldn't be found
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da conta a pagar.",
        variant: "destructive",
      });
      navigate('/admin/financeiro/contas-a-pagar');
    }
  }, [error, toast, navigate]);

  return (
    <AdminLayout>
      <div className="w-full py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/financeiro/contas-a-pagar')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Editar Conta a Pagar</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Atualizar Conta a Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : conta ? (
              <ContaPagarForm 
                contaId={id} 
                onSuccess={() => navigate('/admin/financeiro/contas-a-pagar')} 
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
