import React, { useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import ImportacaoNF from '@/components/ImportacaoNF/ImportacaoNF';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Package, 
  Truck, 
  Database,
  ArrowRight,
  Download,
  History,
  BarChart3,
  Clock,
  FileCheck,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useNFe } from '@/hooks/useNFe';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ImportacaoNFPage: React.FC = () => {
  // Usar o hook personalizado para obter dados reais
  const {
    metricas,
    historicoImportacoes,
    isLoading,
    isError,
    notasProcessadasFormatado,
    produtosImportadosFormatado,
    taxaSucessoFormatada,
    tempoMedioFormatado,
    formatarDinheiro,
    recarregarDados
  } = useNFe();
  
  // Adicionar logs para debug
  useEffect(() => {
    console.log('🔍 Estado atual dos dados de NF-e:');
    console.log('Métricas:', metricas);
    console.log('Histórico:', historicoImportacoes);
    console.log('isLoading:', isLoading);
    console.log('isError:', isError);
    
    // Se houver erro, tentar recarregar os dados após um pequeno delay
    if (isError) {
      console.log('⚠️ Erro detectado, tentando recarregar dados...');
      const reloadTimer = setTimeout(() => {
        recarregarDados();
      }, 3000);
      
      return () => clearTimeout(reloadTimer);
    }
  }, [metricas, historicoImportacoes, isLoading, isError, recarregarDados]);

  // Formatar data para exibição em horário brasileiro
  const formatarData = (dataString: string) => {
    try {
      console.log('📅 Formatando data:', dataString);
      
      const dataUTC = new Date(dataString);
      console.log('📅 Data UTC parseada:', dataUTC);
      
      // Criar uma nova data ajustada para UTC-3 (horário de Brasília)
      const dataLocal = new Date(dataUTC.getTime() - (3 * 60 * 60 * 1000)); // Subtrair 3 horas
      console.log('📅 Data ajustada UTC-3:', dataLocal);
      
      const dataFormatada = format(dataLocal, 'dd/MM/yyyy HH:mm', { locale: ptBR });
      console.log('📅 Data formatada final:', dataFormatada);
      
      return dataFormatada;
    } catch (e) {
      console.error('❌ Erro ao formatar data:', e);
      console.error('❌ Data original:', dataString);
      return 'Data inválida';
    }
  };

  // Obter a classe CSS para o status
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PROCESSADA':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'RECEBIDA':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'CANCELADA':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Verificar se temos dados reais para exibir
  const temDados = !isLoading && metricas && (
    metricas.total_notas_processadas > 0 || 
    metricas.total_produtos_importados > 0
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />
          <div className="relative px-6 py-12">
            <div className="flex items-center justify-between">
              <div className="space-y-4 max-w-3xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Importação de NF-e
                    </h1>
                    <p className="text-xl text-muted-foreground mt-2">
                      Automatize a entrada de produtos com importação inteligente de XML
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 blur-3xl opacity-20" />
                  <Upload className="h-32 w-32 text-indigo-600/20" />
                </div>
              </div>
            </div>

            {/* Métricas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">NF-e Processadas</p>
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <p className="text-2xl font-bold">{notasProcessadasFormatado}</p>
                      )}
                    </div>
                    <FileCheck className="h-8 w-8 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Produtos Importados</p>
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <p className="text-2xl font-bold text-green-600">{produtosImportadosFormatado}</p>
                      )}
                    </div>
                    <Package className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</p>
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <p className="text-2xl font-bold text-blue-600">{taxaSucessoFormatada}</p>
                      )}
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <p className="text-2xl font-bold text-purple-600">{tempoMedioFormatado}</p>
                      )}
                    </div>
                    <Zap className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="px-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
                  <Upload className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle>Upload de XML da Nota Fiscal</CardTitle>
                  <CardDescription>
                    Selecione o arquivo XML da nota fiscal para processar automaticamente os produtos e atualizar o estoque
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ImportacaoNF />
            </CardContent>
          </Card>
        </div>

        {/* Como Funciona */}
        <div className="px-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Como funciona a importação</CardTitle>
                  <CardDescription>
                    Processo automatizado em 3 etapas simples
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative">
                  <div className="flex flex-col items-center text-center p-6 border-2 border-dashed border-indigo-200 rounded-lg hover:border-indigo-300 transition-colors">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">1. Upload do XML</h3>
                    <p className="text-sm text-muted-foreground">
                      Faça upload do arquivo XML da nota fiscal recebida do fornecedor. 
                      O sistema aceita arquivos de até 10MB.
                    </p>
                  </div>
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-indigo-400" />
                  </div>
                </div>
                
                <div className="relative">
                  <div className="flex flex-col items-center text-center p-6 border-2 border-dashed border-green-200 rounded-lg hover:border-green-300 transition-colors">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                      <Database className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">2. Processamento</h3>
                    <p className="text-sm text-muted-foreground">
                      O sistema extrai automaticamente dados dos produtos, fornecedor, 
                      valores e informações fiscais do XML.
                    </p>
                  </div>
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-green-400" />
                  </div>
                </div>
                
                <div className="flex flex-col items-center text-center p-6 border-2 border-dashed border-purple-200 rounded-lg hover:border-purple-300 transition-colors">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">3. Atualização</h3>
                  <p className="text-sm text-muted-foreground">
                    Produtos são criados/atualizados automaticamente e lotes são 
                    registrados no estoque com rastreabilidade completa.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Importações */}
        <div className="px-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                  <History className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Histórico de Importações</CardTitle>
                  <CardDescription>
                    Últimas notas fiscais processadas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : historicoImportacoes && historicoImportacoes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2">Nota Fiscal</th>
                        <th className="pb-2">Fornecedor</th>
                        <th className="pb-2">Valor</th>
                        <th className="pb-2">Data</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoImportacoes.map((nf: { id: string; numero_nf?: string; chave_acesso: string; fornecedor?: { nome_fantasia?: string; nome?: string }; valor_total_nota: number; created_at: string; status: string }) => (
                        <tr key={nf.id} className="border-b">
                          <td className="py-3">
                            <div>
                              <div className="font-medium">NF-e #{nf.numero_nf || '—'}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-xs">
                                {nf.chave_acesso}
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            {nf.fornecedor?.nome_fantasia || nf.fornecedor?.nome || 'Fornecedor não encontrado'}
                          </td>
                          <td className="py-3">
                            {formatarDinheiro(nf.valor_total_nota)}
                          </td>
                          <td className="py-3">
                            {formatarData(nf.created_at)}
                          </td>
                          <td className="py-3">
                            <Badge className={getStatusClass(nf.status)}>
                              {nf.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/admin/fiscal/nota-fiscal/${nf.id}`}>
                                Detalhes
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="mb-2">
                    <AlertCircle className="h-12 w-12 mx-auto text-gray-300" />
                  </div>
                  <p className="font-medium mb-1">Nenhuma nota fiscal importada</p>
                  <p className="text-sm">
                    Importe sua primeira nota fiscal utilizando o formulário acima
                  </p>
                </div>
              )}
              
              {/* Debug info - exibido apenas durante desenvolvimento */}
              {process.env.NODE_ENV === 'development' && isError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm">
                  <p className="font-medium text-red-800">Erro na carga de dados</p>
                  <p className="text-red-600">Verifique o console para mais detalhes.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ImportacaoNFPage; 