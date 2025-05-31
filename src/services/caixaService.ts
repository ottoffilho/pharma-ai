import { supabase } from '@/integrations/supabase/client';

// Interfaces para o sistema de caixa
export interface CaixaStatus {
  id: string;
  data_abertura: string;
  data_fechamento?: string;
  usuario_abertura: string;
  usuario_fechamento?: string;
  valor_inicial: number;
  valor_final?: number;
  total_vendas: number;
  total_sangrias: number;
  total_suprimentos: number;
  valor_esperado: number;
  diferenca?: number;
  status: 'aberto' | 'fechado' | 'suspenso';
  observacoes?: string;
  observacoes_fechamento?: string;
  usuario_id: string;
  created_at: string;
  updated_at: string;
}

export interface MovimentoCaixa {
  id: string;
  abertura_caixa_id: string;
  usuario_id: string;
  venda_id?: string;
  tipo: 'sangria' | 'suprimento' | 'venda' | 'estorno';
  valor: number;
  descricao?: string;
  created_at: string;
  usuario?: {
    nome: string;
    email: string;
  };
}

export interface ResumoVendas {
  total_vendas: number;
  vendas_dinheiro: number;
  vendas_cartao: number;
  vendas_pix: number;
  vendas_outros: number;
  quantidade_vendas: number;
  periodo_inicio: string;
  periodo_fim: string;
}

export interface AbrirCaixaData {
  valor_inicial: number;
  observacoes?: string;
}

export interface FecharCaixaData {
  valor_final: number;
  observacoes?: string;
}

export interface MovimentoData {
  tipo: 'sangria' | 'suprimento';
  valor: number;
  descricao: string;
}

class CaixaService {
  /**
   * Garantir que as tabelas do caixa existam
   */
  private async garantirTabelasExistem(): Promise<boolean> {
    try {
      // Testar se a tabela abertura_caixa existe fazendo uma query simples
      const { error } = await supabase
        .from('abertura_caixa')
        .select('id')
        .limit(1);

      if (error) {
        // Se a tabela não existir, tentamos criá-la via SQL direto
        if (error.code === '42P01') { // relation does not exist
          console.warn('Tabela abertura_caixa não existe. Tentando criar...');
          return false;
        }
        // Outros erros podem ser de permissão ou estrutura, mas a tabela existe
        return true;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao verificar tabelas:', error);
      return false;
    }
  }

  /**
   * Obter caixa ativo (sem fechar)
   */
  async obterCaixaAtivo(): Promise<CaixaStatus | null> {
    try {
      // Verificar se as tabelas existem
      const tabelasExistem = await this.garantirTabelasExistem();
      if (!tabelasExistem) {
        throw new Error('As tabelas do sistema de caixa ainda não foram criadas. Execute as migrações necessárias.');
      }

      // Buscar por data_fechamento null (caixa ainda não fechado)
      const { data, error } = await supabase
        .from('abertura_caixa')
        .select('*')
        .is('data_fechamento', null)
        .order('data_abertura', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Erro ao obter caixa ativo:', error);
        throw new Error(`Erro ao buscar caixa ativo: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      // Buscar dados do usuário separadamente
      let nomeUsuario = 'Usuário desconhecido';
      if (data.usuario_id) {
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('nome, email')
          .eq('id', data.usuario_id)
          .single();
        
        nomeUsuario = usuario?.nome || usuario?.email || 'Usuário desconhecido';
      }

      return {
        ...data,
        status: data.status || (data.data_fechamento ? 'fechado' : 'aberto'), // Fallback para status
        usuario_abertura: nomeUsuario
      };
    } catch (error) {
      console.error('Erro no service ao obter caixa ativo:', error);
      throw error;
    }
  }

  /**
   * Abrir novo caixa
   */
  async abrirCaixa(dados: AbrirCaixaData): Promise<CaixaStatus> {
    try {
      // Verificar se há caixa já aberto
      const caixaAtual = await this.obterCaixaAtivo();
      if (caixaAtual) {
        throw new Error('Já existe um caixa aberto. Feche-o antes de abrir um novo.');
      }

      // Obter usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se o usuário existe na tabela usuarios
      const { data: usuarioExistente } = await supabase
        .from('usuarios')
        .select('id')
        .eq('supabase_auth_id', user.id)
        .single();

      // Se não existir, usar apenas o ID do auth.users
      let usuarioId = user.id;
      
      if (!usuarioExistente) {
        console.warn('Usuário não encontrado na tabela usuarios, usando auth.users ID');
        // Tentar criar entrada básica na tabela usuarios se ela existir
        try {
          await supabase
            .from('usuarios')
            .insert({
              supabase_auth_id: user.id,
              nome: user.email?.split('@')[0] || 'Usuário',
              email: user.email,
              perfil_id: '70e5ffc4-96f3-4a99-933d-4f0fd5468b51' // Perfil Atendente como padrão
            });
        } catch (insertError) {
          console.warn('Não foi possível criar usuário na tabela usuarios:', insertError);
        }
      } else {
        // Se existe, usar o ID da tabela usuarios
        usuarioId = usuarioExistente.id;
      }

      // Inserir novo caixa (sem a coluna status para evitar erros)
      const { data, error } = await supabase
        .from('abertura_caixa')
        .insert({
          usuario_id: usuarioId,
          valor_inicial: dados.valor_inicial,
          observacoes: dados.observacoes
        })
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao abrir caixa:', error);
        
        // Se ainda der erro de foreign key, tentar abordagem alternativa
        if (error.code === '23503') {
          throw new Error('Usuário não está configurado no sistema. Entre em contato com o administrador.');
        }
        
        throw new Error(`Erro ao abrir caixa: ${error.message}`);
      }

      return {
        ...data,
        status: data.status || 'aberto', // Fallback para status
        usuario_abertura: user.email?.split('@')[0] || 'Usuário desconhecido'
      };
    } catch (error) {
      console.error('Erro no service ao abrir caixa:', error);
      throw error;
    }
  }

  /**
   * Fechar caixa atual
   */
  async fecharCaixa(caixaId: string, dados: FecharCaixaData): Promise<CaixaStatus> {
    try {
      // Obter usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Atualizar caixa - usar apenas data_fechamento
      const { data, error } = await supabase
        .from('abertura_caixa')
        .update({
          data_fechamento: new Date().toISOString(),
          valor_final: dados.valor_final,
          usuario_fechamento: user.id,
          observacoes_fechamento: dados.observacoes,
          diferenca: dados.valor_final - 0 // Será calculado pelo trigger
        })
        .eq('id', caixaId)
        .is('data_fechamento', null) // Só permite fechar caixas ainda abertos
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao fechar caixa:', error);
        throw new Error(`Erro ao fechar caixa: ${error.message}`);
      }

      // Buscar dados do usuário separadamente
      let nomeUsuario = 'Usuário desconhecido';
      if (data.usuario_id) {
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('nome, email')
          .eq('id', data.usuario_id)
          .single();
        
        nomeUsuario = usuario?.nome || usuario?.email || 'Usuário desconhecido';
      }

      return {
        ...data,
        status: data.status || 'fechado', // Fallback para status
        usuario_abertura: nomeUsuario
      };
    } catch (error) {
      console.error('Erro no service ao fechar caixa:', error);
      throw error;
    }
  }

  /**
   * Registrar movimento de caixa (sangria/suprimento)
   */
  async registrarMovimento(caixaId: string, dados: MovimentoData): Promise<MovimentoCaixa> {
    try {
      // Obter usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('movimentos_caixa')
        .insert({
          abertura_caixa_id: caixaId,
          usuario_id: user.id,
          tipo: dados.tipo,
          valor: dados.valor,
          descricao: dados.descricao
        })
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao registrar movimento:', error);
        throw new Error(`Erro ao registrar movimento: ${error.message}`);
      }

      // Buscar dados do usuário separadamente
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('nome, email')
        .eq('id', user.id)
        .single();

      return {
        ...data,
        usuario: {
          nome: usuario?.nome || 'Usuário desconhecido',
          email: usuario?.email || ''
        }
      };
    } catch (error) {
      console.error('Erro no service ao registrar movimento:', error);
      throw error;
    }
  }

  /**
   * Obter movimentos do caixa atual
   */
  async obterMovimentosCaixa(caixaId: string, limite: number = 20): Promise<MovimentoCaixa[]> {
    try {
      // Buscar movimentos sem JOIN
      const { data: movimentos, error } = await supabase
        .from('movimentos_caixa')
        .select('*')
        .eq('abertura_caixa_id', caixaId)
        .order('created_at', { ascending: false })
        .limit(limite);

      if (error) {
        console.error('Erro ao obter movimentos:', error);
        throw new Error(`Erro ao buscar movimentos: ${error.message}`);
      }

      if (!movimentos || movimentos.length === 0) {
        return [];
      }

      // Buscar dados dos usuários separadamente
      const usuarioIds = [...new Set(movimentos.map(m => m.usuario_id))];
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id, nome, email')
        .in('id', usuarioIds);

      // Mapear os dados
      return movimentos.map(movimento => {
        const usuario = usuarios?.find(u => u.id === movimento.usuario_id);
        return {
          ...movimento,
          usuario: {
            nome: usuario?.nome || 'Usuário desconhecido',
            email: usuario?.email || ''
          }
        };
      });
    } catch (error) {
      console.error('Erro no service ao obter movimentos:', error);
      throw error;
    }
  }

  /**
   * Obter resumo de vendas do caixa atual
   */
  async obterResumoVendas(caixaId: string): Promise<ResumoVendas> {
    try {
      // Buscar vendas sem JOIN
      const { data: vendas, error } = await supabase
        .from('vendas')
        .select('id, total, status, created_at')
        .eq('caixa_id', caixaId)
        .eq('status', 'finalizada');

      if (error) {
        console.error('Erro ao obter vendas:', error);
        throw new Error(`Erro ao buscar vendas: ${error.message}`);
      }

      if (!vendas || vendas.length === 0) {
        return {
          total_vendas: 0,
          vendas_dinheiro: 0,
          vendas_cartao: 0,
          vendas_pix: 0,
          vendas_outros: 0,
          quantidade_vendas: 0,
          periodo_inicio: new Date().toISOString(),
          periodo_fim: new Date().toISOString()
        };
      }

      // Buscar pagamentos separadamente
      const vendaIds = vendas.map(v => v.id);
      const { data: pagamentos } = await supabase
        .from('vendas_pagamentos')
        .select('venda_id, forma_pagamento, valor')
        .in('venda_id', vendaIds);

      // Calcular totais por forma de pagamento
      let vendas_dinheiro = 0;
      let vendas_cartao = 0;
      let vendas_pix = 0;
      let vendas_outros = 0;

      if (pagamentos) {
        pagamentos.forEach(pagamento => {
          switch (pagamento.forma_pagamento?.toLowerCase()) {
            case 'dinheiro':
              vendas_dinheiro += pagamento.valor || 0;
              break;
            case 'cartao':
            case 'cartão':
            case 'credito':
            case 'crédito':
            case 'debito':
            case 'débito':
              vendas_cartao += pagamento.valor || 0;
              break;
            case 'pix':
              vendas_pix += pagamento.valor || 0;
              break;
            default:
              vendas_outros += pagamento.valor || 0;
              break;
          }
        });
      }

      const total_vendas = vendas.reduce((sum, venda) => sum + (venda.total || 0), 0);

      return {
        total_vendas,
        vendas_dinheiro,
        vendas_cartao,
        vendas_pix,
        vendas_outros,
        quantidade_vendas: vendas.length,
        periodo_inicio: vendas[vendas.length - 1]?.created_at || new Date().toISOString(),
        periodo_fim: vendas[0]?.created_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro no service ao obter resumo de vendas:', error);
      throw error;
    }
  }

  /**
   * Obter histórico de caixas
   */
  async obterHistoricoCaixas(limite: number = 20, offset: number = 0): Promise<CaixaStatus[]> {
    try {
      const { data: caixas, error } = await supabase
        .from('abertura_caixa')
        .select('*')
        .order('data_abertura', { ascending: false })
        .range(offset, offset + limite - 1);

      if (error) {
        console.error('Erro ao obter histórico:', error);
        throw new Error(`Erro ao buscar histórico: ${error.message}`);
      }

      if (!caixas || caixas.length === 0) {
        return [];
      }

      // Buscar dados dos usuários separadamente
      const usuarioIds = [...new Set(caixas.map(c => c.usuario_id).filter(Boolean))];
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id, nome, email')
        .in('id', usuarioIds);

      return caixas.map(caixa => {
        const usuario = usuarios?.find(u => u.id === caixa.usuario_id);
        return {
          ...caixa,
          status: caixa.status || (caixa.data_fechamento ? 'fechado' : 'aberto'), // Fallback para status
          usuario_abertura: usuario?.nome || usuario?.email || 'Usuário desconhecido'
        };
      });
    } catch (error) {
      console.error('Erro no service ao obter histórico:', error);
      throw error;
    }
  }

  /**
   * Recalcular totais do caixa baseado nas vendas e movimentos
   */
  async recalcularTotaisCaixa(caixaId: string): Promise<void> {
    try {
      // Buscar vendas do caixa
      const { data: vendas } = await supabase
        .from('vendas')
        .select('total')
        .eq('caixa_id', caixaId)
        .eq('status', 'finalizada');

      // Buscar movimentos do caixa
      const { data: movimentos } = await supabase
        .from('movimentos_caixa')
        .select('tipo, valor')
        .eq('abertura_caixa_id', caixaId);

      // Calcular totais
      const totalVendas = vendas?.reduce((sum, v) => sum + (parseFloat(v.total?.toString() || '0')), 0) || 0;
      const totalSangrias = movimentos?.filter(m => m.tipo === 'sangria').reduce((sum, m) => sum + (parseFloat(m.valor?.toString() || '0')), 0) || 0;
      const totalSuprimentos = movimentos?.filter(m => m.tipo === 'suprimento').reduce((sum, m) => sum + (parseFloat(m.valor?.toString() || '0')), 0) || 0;

      // Buscar valor inicial
      const { data: caixa } = await supabase
        .from('abertura_caixa')
        .select('valor_inicial')
        .eq('id', caixaId)
        .single();

      const valorInicial = parseFloat(caixa?.valor_inicial?.toString() || '0');
      const valorEsperado = valorInicial + totalVendas + totalSuprimentos - totalSangrias;

      // Atualizar totais
      const { error } = await supabase
        .from('abertura_caixa')
        .update({
          total_vendas: totalVendas,
          total_sangrias: totalSangrias,
          total_suprimentos: totalSuprimentos,
          valor_esperado: valorEsperado,
          updated_at: new Date().toISOString()
        })
        .eq('id', caixaId);

      if (error) {
        console.error('Erro ao recalcular totais:', error);
        throw new Error(`Erro ao recalcular totais: ${error.message}`);
      }

      console.log('✅ Totais do caixa recalculados:', {
        totalVendas,
        totalSangrias,
        totalSuprimentos,
        valorEsperado
      });

    } catch (error) {
      console.error('Erro no service ao recalcular totais:', error);
      throw error;
    }
  }
}

export const caixaService = new CaixaService(); 