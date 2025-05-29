// =====================================================
// PÁGINA DE DETALHES DO LOTE - PHARMA.AI
// Módulo M04 - Gestão de Estoque
// =====================================================

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ArrowLeft,
  Package,
  Calendar,
  Building2,
  Barcode,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Edit,
  FileText,
  MapPin,
  Calculator,
  Clock,
  Activity,
  Layers,
  Info
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layouts/AdminLayout';

const DetalhesLotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Buscar dados do lote
  const { data: lote, isLoading, error } = useQuery({
    queryKey: ['lote', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lote')
        .select(`
          *,
          produtos (
            id,
            nome,
            codigo_interno,
            unidade_medida,
            categoria,
            tipo
          ),
          fornecedores (
            id,
            nome,
            documento,
            telefone,
            email
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
    onError: (error: Error) => {
      console.error('Erro ao carregar lote:', error);
      toast({
        title: "Erro ao carregar",
        description: "Ocorreu um erro ao carregar os dados do lote.",
        variant: "destructive",
      });
    }
  });

  // Função para determinar status do lote
  const getStatusLote = (lote: any) => {
    if (!lote.data_validade) return { status: 'sem-validade', label: 'Sem validade', variant: 'secondary' as const, icon: Info };
    
    const hoje = new Date();
    const dataValidade = new Date(lote.data_validade);
    const diasParaVencer = Math.ceil((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasParaVencer < 0) {
      return { status: 'vencido', label: 'Vencido', variant: 'destructive' as const, icon: AlertTriangle };
    } else if (diasParaVencer <= 30) {
      return { status: 'vencimento-proximo', label: 'Vence em breve', variant: 'outline' as const, icon: Clock };
    } else {
      return { status: 'valido', label: 'Válido', variant: 'default' as const, icon: CheckCircle };
    }
  };

  // Calcular dias para vencimento
  const getDiasParaVencimento = (dataValidade: string | null) => {
    if (!dataValidade) return null;
    const hoje = new Date();
    const validade = new Date(dataValidade);
    return Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Calcular porcentagem do estoque utilizado
  const getPorcentagemUtilizada = (inicial: number, atual: number) => {
    if (inicial === 0) return 0;
    return Math.round(((inicial - atual) / inicial) * 100);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="w-full">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
            <p className="text-muted-foreground">Carregando detalhes do lote...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !lote) {
    return (
      <AdminLayout>
        <div className="w-full">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">Erro ao carregar lote</h3>
                  <p className="text-red-700">{(error as Error)?.message || 'Lote não encontrado'}</p>
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={() => navigate('/admin/estoque/lotes')} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Lotes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const status = getStatusLote(lote);
  const diasParaVencimento = getDiasParaVencimento(lote.data_validade);
  const porcentagemUtilizada = getPorcentagemUtilizada(lote.quantidade_inicial, lote.quantidade_atual);
  const StatusIcon = status.icon;

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Header */}
        <div className="relative w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20" />
          <div className="relative px-6 py-8 w-full">
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
                    <Package className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                      Lote {lote.numero_lote}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      {lote.produtos?.nome || 'Produto não encontrado'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(`/admin/estoque/lotes/editar/${lote.id}`)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Lote
                </Button>
              </div>
            </div>

            {/* Status e Badge */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge variant={status.variant} className="px-3 py-1 text-sm">
                <StatusIcon className="h-4 w-4 mr-2" />
                {status.label}
              </Badge>
              {diasParaVencimento !== null && diasParaVencimento > 0 && (
                <Badge variant="outline" className="px-3 py-1 text-sm">
                  <Clock className="h-4 w-4 mr-2" />
                  {diasParaVencimento} dias para vencer
                </Badge>
              )}
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                <Activity className="h-4 w-4 mr-2" />
                {porcentagemUtilizada}% utilizado
              </Badge>
            </div>
          </div>
        </div>

        {/* Cards de Informações */}
        <div className="px-6 w-full -mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Informações Básicas */}
            <Card className="border-0 shadow-lg lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
                    <Layers className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Informações do Lote</CardTitle>
                    <CardDescription>Dados completos do lote selecionado</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Barcode className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Número do Lote</p>
                        <p className="text-lg font-semibold">{lote.numero_lote}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Produto/Insumo</p>
                        <p className="text-lg font-semibold">{lote.produtos?.nome}</p>
                        <p className="text-sm text-muted-foreground">{lote.produtos?.codigo_interno}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Fornecedor</p>
                        <p className="text-lg font-semibold">{lote.fornecedores?.nome || 'Não informado'}</p>
                        {lote.fornecedores?.documento && (
                          <p className="text-sm text-muted-foreground">Documento: {lote.fornecedores.documento}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Data de Validade</p>
                        <p className="text-lg font-semibold">
                          {lote.data_validade 
                            ? format(new Date(lote.data_validade), 'dd/MM/yyyy', { locale: ptBR })
                            : 'Não informada'
                          }
                        </p>
                      </div>
                    </div>

                    {lote.data_fabricacao && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Data de Fabricação</p>
                          <p className="text-lg font-semibold">
                            {format(new Date(lote.data_fabricacao), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    )}

                    {lote.preco_custo_unitario && (
                      <div className="flex items-center gap-3">
                        <Calculator className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Custo Unitário</p>
                          <p className="text-lg font-semibold">
                            R$ {lote.preco_custo_unitario.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {lote.observacoes && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Observações</p>
                        <p className="text-sm leading-relaxed bg-gray-50 p-3 rounded-lg">
                          {lote.observacoes}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Estoque e Estatísticas */}
            <div className="space-y-6">
              {/* Card de Quantidade */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle>Estoque</CardTitle>
                      <CardDescription>Controle de quantidades</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Quantidade Inicial</span>
                      <span className="text-lg font-bold">{lote.quantidade_inicial}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Quantidade Atual</span>
                      <span className="text-lg font-bold text-green-600">{lote.quantidade_atual}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Quantidade Utilizada</span>
                      <span className="text-lg font-bold text-orange-600">
                        {lote.quantidade_inicial - lote.quantidade_atual}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Unidade</span>
                      <span className="text-sm font-medium">{lote.produtos?.unidade_medida || 'UN'}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Barra de Progresso */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Utilização</span>
                      <span>{porcentagemUtilizada}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          porcentagemUtilizada > 80 ? 'bg-red-500' :
                          porcentagemUtilizada > 60 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${porcentagemUtilizada}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Alertas */}
              {(diasParaVencimento !== null && diasParaVencimento <= 30) && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <CardTitle className="text-yellow-900">Alerta</CardTitle>
                        <CardDescription className="text-yellow-700">
                          Atenção necessária
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {diasParaVencimento < 0 ? (
                      <p className="text-red-700 font-medium">
                        ⚠️ Este lote está vencido há {Math.abs(diasParaVencimento)} dias
                      </p>
                    ) : (
                      <p className="text-yellow-700">
                        ⏰ Este lote vence em {diasParaVencimento} dias
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Card de Informações do Produto */}
              {lote.produtos && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                        <Package className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle>Produto</CardTitle>
                        <CardDescription>Informações do produto</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tipo</span>
                      <Badge variant="secondary">{lote.produtos.tipo}</Badge>
                    </div>
                    
                    {lote.produtos.categoria && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Categoria</span>
                        <span className="text-sm font-medium">{lote.produtos.categoria}</span>
                      </div>
                    )}
                    
                    {lote.produtos.subcategoria && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Subcategoria</span>
                        <span className="text-sm font-medium">{lote.produtos.subcategoria}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Histórico e Ações */}
        <div className="px-6 w-full mt-6 mb-10">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-gray-100 to-slate-100">
                  <Activity className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <CardTitle>Informações Técnicas</CardTitle>
                  <CardDescription>Dados de controle e auditoria</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Criado em</p>
                  <p className="font-medium">
                    {format(new Date(lote.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Última atualização</p>
                  <p className="font-medium">
                    {format(new Date(lote.updated_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">
                    {lote.ativo ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">ID do Sistema</p>
                  <p className="font-mono text-xs">
                    {lote.id.substring(0, 8)}...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DetalhesLotePage; 