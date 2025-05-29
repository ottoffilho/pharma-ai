// =====================================================
// SERVIÇO DE VENDAS - PHARMA.AI
// Usando MCP Supabase para todas as operações
// =====================================================

import { 
  Venda, 
  ItemVenda, 
  PagamentoVenda, 
  ClienteVenda,
  VendaCompleta,
  CreateVenda,
  CreateItemVenda,
  CreatePagamentoVenda,
  CreateClienteVenda,
  FiltrosVenda,
  FiltroProdutoPDV,
  ProcessarVendaResponse,
  ValidarEstoqueResponse,
  EstatisticasVendas,
  AberturaCaixa,
  FechamentoCaixa
} from '@/types/vendas';
import { UUID } from '@/types/database';
import { supabase } from '@/lib/supabase';

// =====================================================
// INTERFACE DO SERVIÇO
// =====================================================

export interface VendasServiceInterface {
  // Vendas
  listarVendas(filtros?: FiltrosVenda): Promise<VendaCompleta[]>;
  obterVenda(id: UUID): Promise<VendaCompleta | null>;
  criarVenda(venda: CreateVenda): Promise<ProcessarVendaResponse>;
  atualizarVenda(id: UUID, venda: Partial<CreateVenda>): Promise<boolean>;
  cancelarVenda(id: UUID, motivo?: string): Promise<boolean>;
  finalizarVenda(id: UUID): Promise<ProcessarVendaResponse>;
  
  // Itens da Venda
  adicionarItem(item: CreateItemVenda): Promise<ItemVenda>;
  atualizarItem(id: UUID, item: Partial<CreateItemVenda>): Promise<boolean>;
  removerItem(id: UUID): Promise<boolean>;
  
  // Pagamentos
  adicionarPagamento(pagamento: CreatePagamentoVenda): Promise<PagamentoVenda>;
  removerPagamento(id: UUID): Promise<boolean>;
  
  // Clientes
  listarClientes(termo?: string): Promise<ClienteVenda[]>;
  obterCliente(id: UUID): Promise<ClienteVenda | null>;
  criarCliente(cliente: CreateClienteVenda): Promise<ClienteVenda>;
  atualizarCliente(id: UUID, cliente: Partial<CreateClienteVenda>): Promise<boolean>;
  
  // Produtos para PDV
  buscarProdutosPDV(filtros: FiltroProdutoPDV): Promise<any[]>;
  validarEstoque(itens: CreateItemVenda[]): Promise<ValidarEstoqueResponse>;
  
  // Caixa
  abrirCaixa(valorInicial: number, observacoes?: string): Promise<AberturaCaixa>;
  fecharCaixa(aberturaCaixaId: UUID, valorContado: number, observacoes?: string): Promise<FechamentoCaixa>;
  obterCaixaAtivo(): Promise<AberturaCaixa | null>;
  
  // Relatórios
  obterEstatisticas(dataInicio?: string, dataFim?: string): Promise<EstatisticasVendas>;
}

// =====================================================
// IMPLEMENTAÇÃO DO SERVIÇO
// =====================================================

class VendasService implements VendasServiceInterface {
  
  // =====================================================
  // VENDAS
  // =====================================================
  
  async listarVendas(filtros?: FiltrosVenda): Promise<VendaCompleta[]> {
    try {
      let query = `
        SELECT 
          v.*,
          c.nome as cliente_nome_completo,
          u.nome as usuario_nome,
          json_agg(
            DISTINCT jsonb_build_object(
              'id', iv.id,
              'produto_id', iv.produto_id,
              'produto_nome', iv.produto_nome,
              'produto_codigo', iv.produto_codigo,
              'quantidade', iv.quantidade,
              'preco_unitario', iv.preco_unitario,
              'preco_total', iv.preco_total,
              'desconto_valor', iv.desconto_valor,
              'desconto_percentual', iv.desconto_percentual,
              'observacoes', iv.observacoes
            )
          ) FILTER (WHERE iv.id IS NOT NULL) as itens,
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pv.id,
              'forma_pagamento', pv.forma_pagamento,
              'valor', pv.valor,
              'numero_autorizacao', pv.numero_autorizacao,
              'bandeira_cartao', pv.bandeira_cartao,
              'codigo_transacao', pv.codigo_transacao,
              'data_pagamento', pv.data_pagamento
            )
          ) FILTER (WHERE pv.id IS NOT NULL) as pagamentos
        FROM vendas v
        LEFT JOIN clientes c ON v.cliente_id = c.id
        LEFT JOIN usuarios u ON v.usuario_id = u.id
        LEFT JOIN itens_venda iv ON v.id = iv.venda_id
        LEFT JOIN pagamentos_venda pv ON v.id = pv.venda_id
      `;
      
      const conditions: string[] = [];
      
      if (filtros?.data_inicio) {
        conditions.push(`v.data_venda >= '${filtros.data_inicio}'`);
      }
      
      if (filtros?.data_fim) {
        conditions.push(`v.data_venda <= '${filtros.data_fim}'`);
      }
      
      if (filtros?.status) {
        conditions.push(`v.status = '${filtros.status}'`);
      }
      
      if (filtros?.usuario_id) {
        conditions.push(`v.usuario_id = '${filtros.usuario_id}'`);
      }
      
      if (filtros?.cliente_id) {
        conditions.push(`v.cliente_id = '${filtros.cliente_id}'`);
      }
      
      if (filtros?.numero_venda) {
        conditions.push(`v.numero_venda ILIKE '%${filtros.numero_venda}%'`);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += `
        GROUP BY v.id, c.nome, u.nome
        ORDER BY v.created_at DESC
      `;
      
      // Usar execute_sql do MCP
      const response = await fetch('/api/vendas/listar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, filtros })
      });
      
      if (!response.ok) {
        throw new Error('Erro ao listar vendas');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao listar vendas:', error);
      throw error;
    }
  }
  
  async obterVenda(id: UUID): Promise<VendaCompleta | null> {
    try {
      const query = `
        SELECT 
          v.*,
          c.nome as cliente_nome_completo,
          u.nome as usuario_nome,
          json_agg(
            DISTINCT jsonb_build_object(
              'id', iv.id,
              'produto_id', iv.produto_id,
              'produto_nome', iv.produto_nome,
              'produto_codigo', iv.produto_codigo,
              'quantidade', iv.quantidade,
              'preco_unitario', iv.preco_unitario,
              'preco_total', iv.preco_total,
              'desconto_valor', iv.desconto_valor,
              'desconto_percentual', iv.desconto_percentual,
              'observacoes', iv.observacoes
            )
          ) FILTER (WHERE iv.id IS NOT NULL) as itens,
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pv.id,
              'forma_pagamento', pv.forma_pagamento,
              'valor', pv.valor,
              'numero_autorizacao', pv.numero_autorizacao,
              'bandeira_cartao', pv.bandeira_cartao,
              'codigo_transacao', pv.codigo_transacao,
              'data_pagamento', pv.data_pagamento
            )
          ) FILTER (WHERE pv.id IS NOT NULL) as pagamentos
        FROM vendas v
        LEFT JOIN clientes c ON v.cliente_id = c.id
        LEFT JOIN usuarios u ON v.usuario_id = u.id
        LEFT JOIN itens_venda iv ON v.id = iv.venda_id
        LEFT JOIN pagamentos_venda pv ON v.id = pv.venda_id
        WHERE v.id = $1
        GROUP BY v.id, c.nome, u.nome
      `;
      
      const response = await fetch('/api/vendas/obter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, params: [id] })
      });
      
      if (!response.ok) {
        throw new Error('Erro ao obter venda');
      }
      
      const vendas = await response.json();
      return vendas.length > 0 ? vendas[0] : null;
    } catch (error) {
      console.error('Erro ao obter venda:', error);
      throw error;
    }
  }
  
  async criarVenda(venda: CreateVenda): Promise<ProcessarVendaResponse> {
    try {
      const response = await fetch('/api/vendas/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(venda)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao criar venda');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
  
  async finalizarVenda(id: UUID): Promise<ProcessarVendaResponse> {
    try {
      const response = await fetch('/api/vendas/finalizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venda_id: id })
      });
      
      if (!response.ok) {
        throw new Error('Erro ao finalizar venda');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
  
  async atualizarVenda(id: UUID, venda: Partial<CreateVenda>): Promise<boolean> {
    try {
      const response = await fetch('/api/vendas/atualizar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...venda })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      return false;
    }
  }
  
  async cancelarVenda(id: UUID, motivo?: string): Promise<boolean> {
    try {
      const response = await fetch('/api/vendas/cancelar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venda_id: id, motivo })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Erro ao cancelar venda:', error);
      return false;
    }
  }
  
  // =====================================================
  // ITENS DA VENDA
  // =====================================================
  
  async adicionarItem(item: CreateItemVenda): Promise<ItemVenda> {
    try {
      const response = await fetch('/api/vendas/itens/adicionar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao adicionar item');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      throw error;
    }
  }
  
  async atualizarItem(id: UUID, item: Partial<CreateItemVenda>): Promise<boolean> {
    try {
      const response = await fetch('/api/vendas/itens/atualizar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...item })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      return false;
    }
  }
  
  async removerItem(id: UUID): Promise<boolean> {
    try {
      const response = await fetch('/api/vendas/itens/remover', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Erro ao remover item:', error);
      return false;
    }
  }
  
  // =====================================================
  // PAGAMENTOS
  // =====================================================
  
  async adicionarPagamento(pagamento: CreatePagamentoVenda): Promise<PagamentoVenda> {
    try {
      const response = await fetch('/api/vendas/pagamentos/adicionar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pagamento)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao adicionar pagamento');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao adicionar pagamento:', error);
      throw error;
    }
  }
  
  async removerPagamento(id: UUID): Promise<boolean> {
    try {
      const response = await fetch('/api/vendas/pagamentos/remover', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Erro ao remover pagamento:', error);
      return false;
    }
  }
  
  // =====================================================
  // CLIENTES
  // =====================================================
  
  async listarClientes(termo?: string): Promise<ClienteVenda[]> {
    try {
      let query = `
        SELECT * FROM clientes 
        WHERE ativo = true
      `;
      
      if (termo) {
        query += ` AND (nome ILIKE '%${termo}%' OR documento ILIKE '%${termo}%' OR telefone ILIKE '%${termo}%')`;
      }
      
      query += ` ORDER BY nome LIMIT 50`;
      
      const response = await fetch('/api/vendas/clientes/listar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, termo })
      });
      
      if (!response.ok) {
        throw new Error('Erro ao listar clientes');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      throw error;
    }
  }
  
  async obterCliente(id: UUID): Promise<ClienteVenda | null> {
    try {
      const response = await fetch('/api/vendas/clientes/obter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      if (!response.ok) {
        throw new Error('Erro ao obter cliente');
      }
      
      const clientes = await response.json();
      return clientes.length > 0 ? clientes[0] : null;
    } catch (error) {
      console.error('Erro ao obter cliente:', error);
      throw error;
    }
  }
  
  async criarCliente(cliente: CreateClienteVenda): Promise<ClienteVenda> {
    try {
      const response = await fetch('/api/vendas/clientes/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao criar cliente');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  }
  
  async atualizarCliente(id: UUID, cliente: Partial<CreateClienteVenda>): Promise<boolean> {
    try {
      const response = await fetch('/api/vendas/clientes/atualizar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...cliente })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      return false;
    }
  }
  
  // =====================================================
  // PRODUTOS PARA PDV
  // =====================================================
  
  async buscarProdutosPDV(filtros: FiltroProdutoPDV): Promise<any[]> {
    try {
      let query = `
        SELECT 
          p.*,
          cp.nome as categoria_nome,
          ff.nome as forma_farmaceutica_nome,
          f.nome_fantasia as fornecedor_nome,
          COALESCE(
            (SELECT SUM(l.quantidade_atual) 
             FROM lote l 
             WHERE l.produto_id = p.id 
               AND l.ativo = true 
               AND (l.data_validade IS NULL OR l.data_validade > CURRENT_DATE)
            ), 0
          ) as estoque_total
        FROM produtos p
        LEFT JOIN categorias_produto cp ON p.categoria_produto_id = cp.id
        LEFT JOIN forma_farmaceutica ff ON p.forma_farmaceutica_id = ff.id
        LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
        WHERE p.ativo = true
      `;
      
      if (filtros.termo_busca) {
        query += ` AND (
          p.nome ILIKE '%${filtros.termo_busca}%' OR 
          p.codigo_interno ILIKE '%${filtros.termo_busca}%' OR 
          p.codigo_ean ILIKE '%${filtros.termo_busca}%'
        )`;
      }
      
      if (filtros.categoria_id) {
        query += ` AND p.categoria_produto_id = '${filtros.categoria_id}'`;
      }
      
      if (filtros.apenas_com_estoque) {
        query += ` AND p.estoque_atual > 0`;
      }
      
      if (filtros.controlado !== undefined) {
        query += ` AND p.controlado = ${filtros.controlado}`;
      }
      
      if (filtros.manipulado !== undefined) {
        query += ` AND p.produto_manipulado = ${filtros.manipulado}`;
      }
      
      query += ` ORDER BY p.nome LIMIT 50`;
      
      const response = await fetch('/api/vendas/produtos/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, filtros })
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar produtos');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }
  
  async validarEstoque(itens: CreateItemVenda[]): Promise<ValidarEstoqueResponse> {
    try {
      const response = await fetch('/api/vendas/validar-estoque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens })
      });
      
      if (!response.ok) {
        throw new Error('Erro ao validar estoque');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao validar estoque:', error);
      return {
        valido: false,
        erros: [{
          produto_id: '',
          produto_nome: 'Erro de validação',
          quantidade_solicitada: 0,
          quantidade_disponivel: 0
        }]
      };
    }
  }
  
  // =====================================================
  // CAIXA
  // =====================================================
  
  async obterCaixaAtivo(): Promise<AberturaCaixa | null> {
    try {
      const response = await fetch('/api/vendas/caixa/ativo', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        return null;
      }
      
      const caixas = await response.json();
      return caixas.length > 0 ? caixas[0] : null;
    } catch (error) {
      console.error('Erro ao obter caixa ativo:', error);
      return null;
    }
  }
  
  async abrirCaixa(valorInicial: number, observacoes?: string): Promise<AberturaCaixa> {
    try {
      const response = await fetch('/api/vendas/caixa/abrir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor_inicial: valorInicial, observacoes })
      });
      
      if (!response.ok) {
        throw new Error('Erro ao abrir caixa');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao abrir caixa:', error);
      throw error;
    }
  }
  
  async fecharCaixa(aberturaCaixaId: UUID, valorContado: number, observacoes?: string): Promise<FechamentoCaixa> {
    try {
      const response = await fetch('/api/vendas/caixa/fechar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          abertura_caixa_id: aberturaCaixaId, 
          valor_contado: valorContado, 
          observacoes 
        })
      });
      
      if (!response.ok) {
        throw new Error('Erro ao fechar caixa');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao fechar caixa:', error);
      throw error;
    }
  }
  
  // =====================================================
  // RELATÓRIOS
  // =====================================================
  
  async obterEstatisticas(dataInicio?: string, dataFim?: string): Promise<EstatisticasVendas> {
    try {
      const response = await fetch('/api/vendas/estatisticas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data_inicio: dataInicio, data_fim: dataFim })
      });
      
      if (!response.ok) {
        throw new Error('Erro ao obter estatísticas');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }
}

// Exportar instância única do serviço
export const vendasService = new VendasService();
export default vendasService; 