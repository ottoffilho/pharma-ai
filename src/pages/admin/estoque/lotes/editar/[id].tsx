// =====================================================
// PÁGINA DE EDIÇÃO DE LOTE - PHARMA.AI
// Módulo M04 - Gestão de Estoque
// =====================================================

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft,
  Package,
  Edit,
  AlertTriangle,
  Loader2,
  Settings,
  CheckCircle,
  Save,
  Calendar,
  Layers
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layouts/AdminLayout';
import LoteInsumoForm from '@/components/estoque/LoteInsumoForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EditarLotePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Buscar dados do lote para verificar se existe
  const { data: lote, isLoading, error } = useQuery({
    queryKey: ['lote-editar', id],
    queryFn: async () => {
      if (!id) throw new Error('ID do lote não fornecido');

      const { data, error } = await supabase
        .from('lote')
        .select(`
          *,
          produtos (
            id,
            nome,
            codigo_interno,
            tipo
          ),
          fornecedores (
            id,
            nome
          )
        `)
        .eq('id', id)
        .eq('ativo', true)
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
        <div className="w-full">
          {/* Loading Hero */}
          <div className="relative w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20" />
            <div className="relative px-6 py-12 w-full">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                    <Edit className="h-8 w-8" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    Editar Lote
                  </h1>
                </div>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
                <p className="text-muted-foreground">Carregando dados do lote...</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !lote) {
    return (
      <AdminLayout>
        <div className="w-full">
          {/* Error Hero */}
          <div className="relative w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 dark:from-red-950/20 dark:via-pink-950/20 dark:to-rose-950/20" />
            <div className="relative px-6 py-12 w-full">
              <div className="flex items-center gap-4 mb-6">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/admin/estoque/lotes')}
                  className="hover:bg-red-100"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 text-white">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      Erro ao Carregar
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      Não foi possível carregar os dados do lote
                    </p>
                  </div>
                </div>
              </div>

              <Card className="border-red-200 bg-red-50 max-w-2xl">
                <CardContent className="p-6">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Erro ao carregar dados do lote: {(error as Error)?.message || 'Lote não encontrado'}
                    </AlertDescription>
                  </Alert>
                  <div className="mt-4 flex gap-3">
                    <Button 
                      onClick={() => navigate('/admin/estoque/lotes')} 
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar para Lotes
                    </Button>
                    <Button 
                      onClick={() => window.location.reload()} 
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <Loader2 className="h-4 w-4 mr-2" />
                      Tentar Novamente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Hero Section */}
        <div className="relative w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20" />
          <div className="relative px-6 py-12 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/admin/estoque/lotes')}
                  className="hover:bg-orange-100"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                    <Edit className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                      Editar Lote
                    </h1>
                    <p className="text-xl text-muted-foreground mt-2">
                      Lote {lote.numero_lote} - {lote.produtos?.nome}
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 blur-3xl opacity-20" />
                  <Layers className="h-32 w-32 text-orange-600/20" />
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Produto</p>
                      <p className="text-lg font-bold">{lote.produtos?.nome}</p>
                      <p className="text-sm text-muted-foreground">{lote.produtos?.codigo_interno}</p>
                    </div>
                    <Package className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fornecedor</p>
                      <p className="text-lg font-bold">{lote.fornecedores?.nome || 'Não informado'}</p>
                    </div>
                    <Settings className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Estoque Atual</p>
                      <p className="text-lg font-bold">{lote.quantidade_atual}</p>
                      <p className="text-sm text-muted-foreground">de {lote.quantidade_inicial}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="px-6 w-full -mt-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100">
                  <Edit className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Formulário de Edição</CardTitle>
                  <CardDescription>
                    Altere as informações do lote conforme necessário
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <LoteInsumoForm 
                isEditing={true}
                loteId={id}
              />
            </CardContent>
          </Card>
        </div>

        {/* Informações Importantes */}
        <div className="px-6 w-full mt-6 mb-10">
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-blue-900 dark:text-blue-100">Dicas de Edição</CardTitle>
                  <CardDescription className="text-blue-700 dark:text-blue-300">
                    Orientações para modificar os dados do lote
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Campos Editáveis
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 ml-6">
                    <li>• Quantidade atual do lote</li>
                    <li>• Data de validade</li>
                    <li>• Preço de custo unitário</li>
                    <li>• Observações e notas</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Campos Protegidos
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 ml-6">
                    <li>• Número do lote (rastreabilidade)</li>
                    <li>• Produto/insumo vinculado</li>
                    <li>• Quantidade inicial</li>
                    <li>• Data de criação</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditarLotePage;
