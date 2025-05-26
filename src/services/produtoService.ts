// =====================================================
// SERVIÇO DE PRODUTOS - PHARMA.AI
// Módulo M01 - Cadastros Essenciais
// =====================================================

import supabase, { formatSupabaseError, applyDefaultConfig } from './supabase';
import type {
  Produto,
  ProdutoCompleto,
  CreateProduto,
  UpdateProduto,
  FiltrosProduto,
  PaginationParams,
  PaginatedResponse,
  UUID
} from '../types/database';
import type { Tables, TablesInsert } from '../types/supabase';

// =====================================================
// CRUD BÁSICO DE PRODUTOS
// =====================================================

/**
 * Busca produtos com filtros e paginação
 */
export const buscarProdutos = async (
  filtros: FiltrosProduto = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResponse<ProdutoCompleto>> => {
  try {
    const {
      page = 1,
      limit = 50,
      orderBy = 'nome',
      orderDirection = 'asc'
    } = pagination;

    const offset = (page - 1) * limit;

    // Query base com relacionamentos
    let query = supabase
      .from<'insumos', Tables<'insumos'>>('insumos')
      .select(`
        *,
        categoria_produto:categoria_produto_id(id, nome, codigo),
        forma_farmaceutica:forma_farmaceutica_id(id, nome, sigla),
        fornecedor:fornecedor_id(id, razao_social, nome_fantasia),
        lotes:lote(id, numero_lote, data_validade, quantidade_atual)
      `);

    // Aplicar filtros
    if (filtros.nome) {
      query = query.ilike('nome', `%${filtros.nome}%`);
    }

    if (filtros.categoria_produto_id) {
      query = query.eq('categoria_produto_id', filtros.categoria_produto_id);
    }

    if (filtros.forma_farmaceutica_id) {
      query = query.eq('forma_farmaceutica_id', filtros.forma_farmaceutica_id);
    }

    if (filtros.fornecedor_id) {
      query = query.eq('fornecedor_id', filtros.fornecedor_id);
    }

    if (filtros.controlado !== undefined) {
      query = query.eq('controlado', filtros.controlado);
    }

    if (filtros.ativo !== undefined) {
      query = query.eq('ativo', filtros.ativo);
    }

    if (filtros.estoque_baixo) {
      query = query.filter('estoque_atual', 'lte', 'estoque_minimo');
    }

    // Contar total de registros
    const { count } = await supabase
      .from<'insumos', Tables<'insumos'>>('insumos')
      .select('*', { count: 'exact', head: true });

    // Aplicar ordenação e paginação
    query = query
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      throw new Error(formatSupabaseError(error));
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
};

/**
 * Busca produto por ID com relacionamentos
 */
export const buscarProdutoPorId = async (id: UUID): Promise<ProdutoCompleto | null> => {
  try {
    const { data, error } = await supabase
      .from<'insumos', Tables<'insumos'>>('insumos')
      .select(`
        *,
        categoria_produto:categoria_produto_id(id, nome, codigo),
        forma_farmaceutica:forma_farmaceutica_id(id, nome, sigla),
        fornecedor:fornecedor_id(id, razao_social, nome_fantasia, cnpj),
        lotes:lote(
          id, 
          numero_lote, 
          data_fabricacao, 
          data_validade, 
          quantidade_inicial,
          quantidade_atual,
          preco_custo_unitario,
          ativo
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Produto não encontrado
      }
      throw new Error(formatSupabaseError(error));
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar produto por ID:', error);
    throw error;
  }
};

/**
 * Busca produto por código interno
 */
export const buscarProdutoPorCodigo = async (codigoInterno: string): Promise<Produto | null> => {
  try {
    // Verificar se o usuário está autenticado antes de fazer a consulta
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn('Usuário não autenticado para buscar produto');
      return null;
    }

    const { data, error } = await supabase
      .from<'insumos', Tables<'insumos'>>('insumos')
      .select('*')
      .eq('codigo_interno', codigoInterno)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Produto não encontrado
      }
      
      // Se for erro de RLS/autenticação, retornar null em vez de erro
      if (error.message?.includes('406') || error.message?.includes('Not Acceptable')) {
        // Log silencioso para não poluir o console
        return null;
      }
      
      throw new Error(formatSupabaseError(error));
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar produto por código:', error);
    // Em caso de erro de rede ou autenticação, retornar null para permitir continuar
    if (error instanceof Error && error.message.includes('406')) {
      return null;
    }
    throw error;
  }
};

/**
 * Cria um novo produto
 */
export const criarProduto = async (produto: CreateProduto): Promise<Produto> => {
  try {
    // Validar se código interno já existe
    const produtoExistente = await buscarProdutoPorCodigo(produto.codigo_interno);
    if (produtoExistente) {
      throw new Error(`Produto com código interno "${produto.codigo_interno}" já existe`);
    }

    const { data, error } = await supabase
      .from<'insumos', TablesInsert<'insumos'>>('insumos')
      .insert(produto)
      .select()
      .single();

    if (error) {
      throw new Error(formatSupabaseError(error));
    }

    return data;
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    throw error;
  }
};

/**
 * Atualiza um produto existente
 */
export const atualizarProduto = async (produto: UpdateProduto): Promise<Produto> => {
  try {
    const { data, error } = await supabase
      .from<'insumos', Tables<'insumos'>>('insumos')
      .update(produto)
      .eq('id', produto.id)
      .select()
      .single();

    if (error) {
      throw new Error(formatSupabaseError(error));
    }

    return data;
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    throw error;
  }
};

/**
 * Exclui um produto (soft delete)
 */
export const excluirProduto = async (id: UUID): Promise<void> => {
  try {
    const { error } = await supabase
      .from<'insumos', Tables<'insumos'>>('insumos')
      .update({ ativo: false })
      .eq('id', id);

    if (error) {
      throw new Error(formatSupabaseError(error));
    }
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    throw error;
  }
};

// =====================================================
// FUNÇÕES ESPECÍFICAS DE NEGÓCIO
// =====================================================

/**
 * Busca produtos com estoque baixo
 */
export const buscarProdutosEstoqueBaixo = async (): Promise<ProdutoCompleto[]> => {
  try {
    const { data, error } = await supabase
      .from<'insumos', Tables<'insumos'>>('insumos')
      .select(`
        *,
        categoria_produto:categoria_produto_id(id, nome),
        fornecedor:fornecedor_id(id, razao_social)
      `)
      .filter('estoque_atual', 'lte', 'estoque_minimo')
      .eq('ativo', true)
      .order('estoque_atual', { ascending: true });

    if (error) {
      throw new Error(formatSupabaseError(error));
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar produtos com estoque baixo:', error);
    throw error;
  }
};

/**
 * Busca produtos controlados
 */
export const buscarProdutosControlados = async (): Promise<ProdutoCompleto[]> => {
  try {
    const { data, error } = await supabase
      .from<'insumos', Tables<'insumos'>>('insumos')
      .select(`
        *,
        categoria_produto:categoria_produto_id(id, nome),
        fornecedor:fornecedor_id(id, razao_social),
        lotes:lote(id, numero_lote, data_validade, quantidade_atual)
      `)
      .eq('controlado', true)
      .eq('ativo', true)
      .order('nome');

    if (error) {
      throw new Error(formatSupabaseError(error));
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar produtos controlados:', error);
    throw error;
  }
};

/**
 * Atualiza estoque de um produto
 */
export const atualizarEstoqueProduto = async (
  id: UUID,
  novaQuantidade: number,
  operacao: 'entrada' | 'saida'
): Promise<Produto> => {
  try {
    // Buscar produto atual
    const produto = await buscarProdutoPorId(id);
    if (!produto) {
      throw new Error('Produto não encontrado');
    }

    let novoEstoque: number;
    if (operacao === 'entrada') {
      novoEstoque = produto.estoque_atual + novaQuantidade;
    } else {
      novoEstoque = produto.estoque_atual - novaQuantidade;
      if (novoEstoque < 0) {
        throw new Error('Estoque insuficiente para a operação');
      }
    }

    return await atualizarProduto({
      id,
      estoque_atual: novoEstoque
    });
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
    throw error;
  }
};

/**
 * Calcula preço de venda baseado no custo e margem
 */
export const calcularPrecoVenda = (precoCusto: number, margemLucro: number): number => {
  return precoCusto * (1 + margemLucro / 100);
};

/**
 * Calcula margem de lucro baseada no custo e preço de venda
 */
export const calcularMargemLucro = (precoCusto: number, precoVenda: number): number => {
  return ((precoVenda - precoCusto) / precoCusto) * 100;
};

// =====================================================
// FUNÇÕES DE BUSCA E AUTOCOMPLETE
// =====================================================

/**
 * Busca produtos para autocomplete
 */
export const buscarProdutosAutocomplete = async (termo: string, limit = 10): Promise<Produto[]> => {
  try {
    const { data, error } = await supabase
      .from<'insumos', Tables<'insumos'>>('insumos')
      .select('id, codigo_interno, nome, unidade_comercial, estoque_atual')
      .or(`nome.ilike.%${termo}%,codigo_interno.ilike.%${termo}%`)
      .eq('ativo', true)
      .order('nome')
      .limit(limit);

    if (error) {
      throw new Error(formatSupabaseError(error));
    }

    return data || [];
  } catch (error) {
    console.error('Erro na busca de autocomplete:', error);
    throw error;
  }
};

/**
 * Busca produtos por categoria
 */
export const buscarProdutosPorCategoria = async (categoriaId: UUID): Promise<ProdutoCompleto[]> => {
  try {
    const { data, error } = await supabase
      .from<'insumos', Tables<'insumos'>>('insumos')
      .select(`
        *,
        categoria_produto:categoria_produto_id(id, nome),
        forma_farmaceutica:forma_farmaceutica_id(id, nome, sigla),
        fornecedor:fornecedor_id(id, razao_social)
      `)
      .eq('categoria_produto_id', categoriaId)
      .eq('ativo', true)
      .order('nome');

    if (error) {
      throw new Error(formatSupabaseError(error));
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar produtos por categoria:', error);
    throw error;
  }
};

// =====================================================
// FUNÇÕES DE CLASSIFICAÇÃO AUTOMÁTICA
// =====================================================

/**
 * Classifica automaticamente um produto baseado no nome
 * Esta função será expandida com IA na Fase 3
 */
export const classificarProdutoAutomaticamente = (nomeProduto: string) => {
  const nome = nomeProduto.toUpperCase();
  
  // Classificação por forma farmacêutica
  let formaFarmaceutica = null;
  if (nome.includes(' TM ') || nome.includes('TINTURA')) {
    formaFarmaceutica = 'TM';
  } else if (nome.includes(' CH ') || nome.includes('CENTESIMAL')) {
    formaFarmaceutica = 'CH';
  } else if (nome.includes(' FC ') || nome.includes('FLUXO')) {
    formaFarmaceutica = 'FC';
  } else if (nome.includes('BACH') || nome.includes('FLORAL')) {
    formaFarmaceutica = 'FLORAL';
  }

  // Classificação por categoria
  let categoria = null;
  if (nome.includes('BACH') || nome.includes('FLORAL')) {
    categoria = 'FLORAIS_BACH';
  } else if (nome.includes('TM') || nome.includes('TINTURA')) {
    categoria = 'TINTURAS_MAES';
  } else if (nome.includes('CH') || nome.includes('FC')) {
    categoria = 'HOMEOPATICOS';
  }

  // Verificar se é controlado (lista básica)
  const controlado = nome.includes('MORFINA') || 
                    nome.includes('CODEINA') || 
                    nome.includes('TRAMADOL');

  return {
    formaFarmaceutica,
    categoria,
    controlado,
    requerReceita: controlado // Por padrão, controlados requerem receita
  };
};

// =====================================================
// VALIDAÇÕES
// =====================================================

/**
 * Valida dados de produto antes da criação/atualização
 */
export const validarProduto = (produto: CreateProduto | UpdateProduto): string[] => {
  const erros: string[] = [];

  // Validações obrigatórias para criação
  if ('codigo_interno' in produto) {
    if (!produto.codigo_interno?.trim()) {
      erros.push('Código interno é obrigatório');
    }
  }

  if ('nome' in produto) {
    if (!produto.nome?.trim()) {
      erros.push('Nome do produto é obrigatório');
    }
  }

  if ('ncm' in produto) {
    if (!produto.ncm?.trim()) {
      erros.push('NCM é obrigatório');
    } else if (produto.ncm.length !== 8) {
      erros.push('NCM deve ter 8 dígitos');
    }
  }

  if ('unidade_comercial' in produto) {
    if (!produto.unidade_comercial?.trim()) {
      erros.push('Unidade comercial é obrigatória');
    }
  }

  // Validações de valores
  if (produto.preco_custo !== undefined && produto.preco_custo < 0) {
    erros.push('Preço de custo não pode ser negativo');
  }

  if (produto.preco_venda !== undefined && produto.preco_venda < 0) {
    erros.push('Preço de venda não pode ser negativo');
  }

  if (produto.estoque_minimo !== undefined && produto.estoque_minimo < 0) {
    erros.push('Estoque mínimo não pode ser negativo');
  }

  if (produto.estoque_maximo !== undefined && produto.estoque_maximo < 0) {
    erros.push('Estoque máximo não pode ser negativo');
  }

  if (produto.estoque_atual !== undefined && produto.estoque_atual < 0) {
    erros.push('Estoque atual não pode ser negativo');
  }

  return erros;
};

// =====================================================
// EXPORT DEFAULT
// =====================================================

export default {
  buscarProdutos,
  buscarProdutoPorId,
  buscarProdutoPorCodigo,
  criarProduto,
  atualizarProduto,
  excluirProduto,
  buscarProdutosEstoqueBaixo,
  buscarProdutosControlados,
  atualizarEstoqueProduto,
  calcularPrecoVenda,
  calcularMargemLucro,
  buscarProdutosAutocomplete,
  buscarProdutosPorCategoria,
  classificarProdutoAutomaticamente,
  validarProduto
}; 