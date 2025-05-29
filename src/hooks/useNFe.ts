import { useQuery } from '@tanstack/react-query';
import { buscarMetricasImportacaoNFe, buscarHistoricoImportacoes, MetricasImportacaoNFe } from '@/services/notaFiscalMetricas';

/**
 * Hook personalizado para gerenciar métricas e histórico de importações de NF-e
 * 
 * @param enabled Define se as consultas serão executadas automaticamente
 * @param staleTime Tempo de validade do cache em milissegundos
 * @returns Objeto contendo dados e estados de carregamento das métricas de NF-e
 */
export function useNFe(enabled = true, staleTime = 1000 * 60 * 5) {
  // Consulta para métricas de importação
  const { 
    data: metricas, 
    isLoading: isLoadingMetricas,
    isError: isErrorMetricas,
    refetch: refetchMetricas
  } = useQuery<MetricasImportacaoNFe>({
    queryKey: ['metricas-importacao-nfe'],
    queryFn: async () => {
      console.log('🔄 Executando buscarMetricasImportacaoNFe...');
      const resultado = await buscarMetricasImportacaoNFe();
      console.log('📊 Métricas retornadas:', resultado);
      return resultado;
    },
    staleTime: 0, // Forçar recarregamento para debug
    gcTime: 0, // Não usar cache durante debug
    enabled,
  });

  // Consulta para histórico de importações
  const {
    data: historicoImportacoes,
    isLoading: isLoadingHistorico,
    isError: isErrorHistorico,
    refetch: refetchHistorico
  } = useQuery({
    queryKey: ['historico-importacoes-nfe'],
    queryFn: async () => {
      console.log('🔄 Executando buscarHistoricoImportacoes...');
      const resultado = await buscarHistoricoImportacoes();
      console.log('📋 Histórico retornado:', resultado);
      return resultado;
    },
    staleTime: 0, // Forçar recarregamento para debug
    gcTime: 0, // Não usar cache durante debug
    enabled,
  });

  /**
   * Formata um valor monetário no padrão brasileiro
   */
  const formatarDinheiro = (valor: number | null | undefined): string => {
    if (valor === null || valor === undefined) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  /**
   * Formata o tempo em segundos para uma string legível
   */
  const formatarTempo = (segundos: number): string => {
    if (!segundos || segundos < 0.1) return '< 0,1s';
    if (segundos > 60) {
      const minutos = Math.floor(segundos / 60);
      const segsRestantes = Math.round(segundos % 60);
      return `${minutos}m ${segsRestantes}s`;
    }
    return `${segundos.toFixed(1).replace('.', ',')}s`;
  };

  /**
   * Recarrega todos os dados
   */
  const recarregarDados = () => {
    refetchMetricas();
    refetchHistorico();
  };

  /**
   * Determina o status de dados
   */
  const getStatusDados = () => {
    if (isLoading) return 'carregando';
    if (isError) return 'erro';
    if (!metricas || metricas.total_notas_processadas === 0) return 'sem_dados';
    return 'com_dados';
  };

  // Calcular valores formatados
  const notasProcessadasFormatado = metricas?.total_notas_processadas?.toString() || '0';
  const produtosImportadosFormatado = metricas?.total_produtos_importados?.toString() || '0';
  const taxaSucessoFormatada = `${Math.round(metricas?.taxa_sucesso || 0)}%`;
  const tempoMedioFormatado = formatarTempo(metricas?.tempo_medio_segundos || 0);

  // Estados agregados
  const isLoading = isLoadingMetricas || isLoadingHistorico;
  const isError = isErrorMetricas || isErrorHistorico;
  const statusDados = getStatusDados();
  const temDados = statusDados === 'com_dados';

  return {
    // Dados brutos
    metricas,
    historicoImportacoes,
    
    // Estados
    isLoading,
    isError,
    temDados,
    statusDados,
    
    // Valores formatados
    notasProcessadasFormatado,
    produtosImportadosFormatado,
    taxaSucessoFormatada,
    tempoMedioFormatado,
    
    // Funções utilitárias
    formatarDinheiro,
    formatarTempo,
    recarregarDados
  };
} 