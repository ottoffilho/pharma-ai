import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { caixaService, CaixaStatus, MovimentoCaixa, ResumoVendas } from '@/services/caixaService';

export function useCaixa() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para caixa ativo
  const caixaQuery = useQuery({
    queryKey: ['caixa-ativo'],
    queryFn: () => caixaService.obterCaixaAtivo(),
    refetchInterval: 30000, // Atualiza a cada 30 segundos
    retry: (failureCount, error) => {
      // Se a tabela não existir, não tentar novamente
      if (error.message?.includes('does not exist')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Query para movimentos (só executa se há caixa ativo)
  const movimentosQuery = useQuery({
    queryKey: ['movimentos-caixa', caixaQuery.data?.id],
    queryFn: () => caixaQuery.data ? caixaService.obterMovimentosCaixa(caixaQuery.data.id) : Promise.resolve([]),
    enabled: !!caixaQuery.data?.id,
    retry: (failureCount, error) => {
      if (error.message?.includes('does not exist')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Query para resumo de vendas (só executa se há caixa ativo)
  const resumoQuery = useQuery({
    queryKey: ['resumo-vendas', caixaQuery.data?.id],
    queryFn: () => caixaQuery.data ? caixaService.obterResumoVendas(caixaQuery.data.id) : Promise.resolve(null),
    enabled: !!caixaQuery.data?.id,
    retry: (failureCount, error) => {
      if (error.message?.includes('does not exist')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Mutation para abrir caixa
  const abrirCaixaMutation = useMutation({
    mutationFn: (dados: { valor_inicial: number; observacoes?: string }) => 
      caixaService.abrirCaixa(dados),
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Caixa aberto com sucesso'
      });
      queryClient.invalidateQueries({ queryKey: ['caixa-ativo'] });
    },
    onError: (error: Error) => {
      console.error('Erro ao abrir caixa:', error);
      
      // Se a tabela não existir, mostrar erro amigável
      if (error.message?.includes('does not exist')) {
        toast({
          title: 'Sistema ainda não configurado',
          description: 'As tabelas do sistema de caixa ainda não foram criadas. Entre em contato com o administrador.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Erro ao abrir caixa',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  });

  // Mutation para fechar caixa
  const fecharCaixaMutation = useMutation({
    mutationFn: (dados: { caixaId: string; valor_final: number; observacoes?: string }) => 
      caixaService.fecharCaixa(dados.caixaId, { valor_final: dados.valor_final, observacoes: dados.observacoes }),
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Caixa fechado com sucesso'
      });
      queryClient.invalidateQueries({ queryKey: ['caixa-ativo'] });
    },
    onError: (error: Error) => {
      console.error('Erro ao fechar caixa:', error);
      toast({
        title: 'Erro ao fechar caixa',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation para registrar movimento
  const movimentoMutation = useMutation({
    mutationFn: (dados: { caixaId: string; tipo: 'sangria' | 'suprimento'; valor: number; descricao: string }) => 
      caixaService.registrarMovimento(dados.caixaId, { 
        tipo: dados.tipo, 
        valor: dados.valor, 
        descricao: dados.descricao 
      }),
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Movimento registrado com sucesso'
      });
      // Invalidar todas as queries relacionadas ao caixa
      queryClient.invalidateQueries({ queryKey: ['caixa-ativo'] });
      queryClient.invalidateQueries({ queryKey: ['movimentos-caixa'] });
      queryClient.invalidateQueries({ queryKey: ['resumo-vendas'] });
    },
    onError: (error: Error) => {
      console.error('Erro ao registrar movimento:', error);
      toast({
        title: 'Erro ao registrar movimento',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Calcular valor atual do caixa
  const valorAtualCaixa = caixaQuery.data 
    ? caixaQuery.data.valor_inicial + 
      (caixaQuery.data.total_vendas || 0) - 
      (caixaQuery.data.total_sangrias || 0) + 
      (caixaQuery.data.total_suprimentos || 0)
    : 0;

  return {
    // Dados
    caixaAtual: caixaQuery.data,
    movimentos: movimentosQuery.data || [],
    resumoVendas: resumoQuery.data,
    valorAtualCaixa,
    
    // Estados de loading
    isLoadingCaixa: caixaQuery.isLoading,
    isLoadingMovimentos: movimentosQuery.isLoading,
    isLoadingResumo: resumoQuery.isLoading,
    
    // Estados de erro
    errorCaixa: caixaQuery.error,
    errorMovimentos: movimentosQuery.error,
    errorResumo: resumoQuery.error,
    
    // Mutations
    abrirCaixa: abrirCaixaMutation.mutate,
    fecharCaixa: fecharCaixaMutation.mutate,
    registrarMovimento: movimentoMutation.mutate,
    
    // Estados das mutations
    isAbrindoCaixa: abrirCaixaMutation.isPending,
    isFechandoCaixa: fecharCaixaMutation.isPending,
    isRegistrandoMovimento: movimentoMutation.isPending,
    
    // Funções de controle
    refetchCaixa: caixaQuery.refetch,
    refetchMovimentos: movimentosQuery.refetch,
    refetchResumo: resumoQuery.refetch,
  };
} 