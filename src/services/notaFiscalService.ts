// =====================================================
// SERVIÇO DE NOTAS FISCAIS - PHARMA.AI
// Módulo M10 - Fiscal
// =====================================================

import supabase, { TABLES, formatSupabaseError, uploadFile, STORAGE_BUCKETS } from './supabase';
import type {
  NotaFiscal,
  NotaFiscalCompleta,
  CreateNotaFiscal,
  UpdateNotaFiscal,
  ItemNotaFiscal,
  CreateItemNotaFiscal,
  FiltrosNotaFiscal,
  PaginationParams,
  PaginatedResponse,
  ImportacaoNFe,
  ResultadoImportacaoNFe,
  UUID
} from '../types/database';

// =====================================================
// CRUD BÁSICO DE NOTAS FISCAIS
// =====================================================

/**
 * Busca notas fiscais com filtros e paginação
 */
export const buscarNotasFiscais = async (
  filtros: FiltrosNotaFiscal = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResponse<NotaFiscalCompleta>> => {
  try {
    const {
      page = 1,
      limit = 50,
      orderBy = 'data_emissao',
      orderDirection = 'desc'
    } = pagination;

    const offset = (page - 1) * limit;

    // Query base com relacionamentos
    let query = supabase
      .from(TABLES.NOTA_FISCAL)
      .select(`
        *,
        fornecedor:fornecedor_id(
          id, 
          cnpj, 
          razao_social, 
          nome_fantasia,
          cidade,
          uf
        )
      `);

    // Aplicar filtros
    if (filtros.fornecedor_id) {
      query = query.eq('fornecedor_id', filtros.fornecedor_id);
    }

    if (filtros.data_emissao_inicio) {
      query = query.gte('data_emissao', filtros.data_emissao_inicio);
    }

    if (filtros.data_emissao_fim) {
      query = query.lte('data_emissao', filtros.data_emissao_fim);
    }

    if (filtros.status) {
      query = query.eq('status', filtros.status);
    }

    if (filtros.numero_nf) {
      query = query.eq('numero_nf', filtros.numero_nf);
    }

    if (filtros.chave_acesso) {
      query = query.eq('chave_acesso', filtros.chave_acesso);
    }

    // Contar total de registros
    const { count } = await supabase
      .from(TABLES.NOTA_FISCAL)
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
    console.error('Erro ao buscar notas fiscais:', error);
    throw error;
  }
};

/**
 * Busca nota fiscal por ID com todos os relacionamentos
 */
export const buscarNotaFiscalPorId = async (id: UUID): Promise<NotaFiscalCompleta | null> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.NOTA_FISCAL)
      .select(`
        *,
        fornecedor:fornecedor_id(*),
        itens:item_nota_fiscal(
          *,
          produto:produto_id(
            id,
            codigo_interno,
            nome,
            unidade_comercial,
            categoria_produto:categoria_produto_id(nome),
            forma_farmaceutica:forma_farmaceutica_id(nome, sigla)
          ),
          lote:lote_id(
            id,
            numero_lote,
            data_fabricacao,
            data_validade,
            quantidade_atual
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Nota fiscal não encontrada
      }
      throw new Error(formatSupabaseError(error));
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar nota fiscal por ID:', error);
    throw error;
  }
};

/**
 * Busca nota fiscal por chave de acesso
 */
export const buscarNotaFiscalPorChave = async (chaveAcesso: string): Promise<NotaFiscal | null> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.NOTA_FISCAL)
      .select('*')
      .eq('chave_acesso', chaveAcesso)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Nota fiscal não encontrada
      }
      throw new Error(formatSupabaseError(error));
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar nota fiscal por chave:', error);
    throw error;
  }
};

/**
 * Cria uma nova nota fiscal
 */
export const criarNotaFiscal = async (notaFiscal: CreateNotaFiscal): Promise<NotaFiscal> => {
  try {
    // Validar se chave de acesso já existe
    const notaExistente = await buscarNotaFiscalPorChave(notaFiscal.chave_acesso);
    if (notaExistente) {
      throw new Error(`Nota fiscal com chave "${notaFiscal.chave_acesso}" já existe`);
    }

    const { data, error } = await supabase
      .from(TABLES.NOTA_FISCAL)
      .insert(notaFiscal)
      .select()
      .single();

    if (error) {
      throw new Error(formatSupabaseError(error));
    }

    return data;
  } catch (error) {
    console.error('Erro ao criar nota fiscal:', error);
    throw error;
  }
};

/**
 * Atualiza uma nota fiscal existente
 */
export const atualizarNotaFiscal = async (notaFiscal: UpdateNotaFiscal): Promise<NotaFiscal> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.NOTA_FISCAL)
      .update(notaFiscal)
      .eq('id', notaFiscal.id)
      .select()
      .single();

    if (error) {
      throw new Error(formatSupabaseError(error));
    }

    return data;
  } catch (error) {
    console.error('Erro ao atualizar nota fiscal:', error);
    throw error;
  }
};

// =====================================================
// GERENCIAMENTO DE ITENS DA NOTA FISCAL
// =====================================================

/**
 * Busca itens de uma nota fiscal
 */
export const buscarItensNotaFiscal = async (notaFiscalId: UUID): Promise<ItemNotaFiscal[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.ITEM_NOTA_FISCAL)
      .select(`
        *,
        produto:produto_id(
          id,
          codigo_interno,
          nome,
          unidade_comercial
        ),
        lote:lote_id(
          id,
          numero_lote,
          data_validade
        )
      `)
      .eq('nota_fiscal_id', notaFiscalId)
      .order('numero_item');

    if (error) {
      throw new Error(formatSupabaseError(error));
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar itens da nota fiscal:', error);
    throw error;
  }
};

/**
 * Cria um item da nota fiscal
 */
export const criarItemNotaFiscal = async (item: CreateItemNotaFiscal): Promise<ItemNotaFiscal> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.ITEM_NOTA_FISCAL)
      .insert(item)
      .select()
      .single();

    if (error) {
      throw new Error(formatSupabaseError(error));
    }

    return data;
  } catch (error) {
    console.error('Erro ao criar item da nota fiscal:', error);
    throw error;
  }
};

// =====================================================
// IMPORTAÇÃO DE XML DE NF-e
// =====================================================

/**
 * Processa arquivo XML de NF-e e importa para o banco
 */
export const importarXMLNotaFiscal = async (
  arquivo: File,
  opcoes: Partial<ImportacaoNFe> = {}
): Promise<ResultadoImportacaoNFe> => {
  const resultado: ResultadoImportacaoNFe = {
    sucesso: false,
    produtos_importados: 0,
    produtos_novos: 0,
    produtos_atualizados: 0,
    lotes_criados: 0,
    erros: [],
    avisos: []
  };

  try {
    // 1. Upload do arquivo XML para storage
    const nomeArquivo = `${Date.now()}_${arquivo.name}`;
    const caminhoArquivo = `uploads/${nomeArquivo}`;
    
    await uploadFile(STORAGE_BUCKETS.NF_XML, caminhoArquivo, arquivo);

    // 2. Ler e processar o XML
    const xmlText = await arquivo.text();
    const dadosNFe = await processarXMLNFe(xmlText);

    // 3. Verificar se nota já existe
    const notaExistente = await buscarNotaFiscalPorChave(dadosNFe.chaveAcesso);
    if (notaExistente) {
      resultado.erros.push(`Nota fiscal ${dadosNFe.numeroNF} já foi importada anteriormente`);
      return resultado;
    }

    // 4. Importar/atualizar fornecedor
    const fornecedorId = await importarFornecedorDoXML(dadosNFe.fornecedor);
    resultado.fornecedor_id = fornecedorId;

    // 5. Processar produtos e lotes
    const produtosProcessados = await processarProdutosDoXML(dadosNFe.itens, fornecedorId);
    resultado.produtos_importados = produtosProcessados.total;
    resultado.produtos_novos = produtosProcessados.novos;
    resultado.produtos_atualizados = produtosProcessados.atualizados;
    resultado.lotes_criados = produtosProcessados.lotes;

    // 6. Criar nota fiscal
    const notaFiscal = await criarNotaFiscal({
      chave_acesso: dadosNFe.chaveAcesso,
      numero_nf: dadosNFe.numeroNF,
      serie: dadosNFe.serie,
      modelo: dadosNFe.modelo,
      data_emissao: dadosNFe.dataEmissao,
      data_saida_entrada: dadosNFe.dataSaidaEntrada,
      fornecedor_id: fornecedorId,
      valor_produtos: dadosNFe.valorProdutos,
      valor_frete: dadosNFe.valorFrete,
      valor_seguro: 0,
      valor_desconto: 0,
      valor_outras_despesas: 0,
      valor_total_nota: dadosNFe.valorTotalNota,
      valor_icms: dadosNFe.valorICMS,
      valor_ipi: dadosNFe.valorIPI,
      valor_pis: dadosNFe.valorPIS,
      valor_cofins: dadosNFe.valorCOFINS,
      valor_total_tributos: dadosNFe.valorTotalTributos,
      status: 'RECEBIDA'
    });

    resultado.nota_fiscal_id = notaFiscal.id;

    // 7. Criar itens da nota fiscal
    for (const item of dadosNFe.itens) {
      await criarItemNotaFiscal({
        nota_fiscal_id: notaFiscal.id,
        produto_id: item.produtoId,
        lote_id: item.loteId,
        numero_item: item.numeroItem,
        quantidade_comercial: item.quantidadeComercial,
        valor_unitario_comercial: item.valorUnitarioComercial,
        quantidade_tributaria: item.quantidadeTributaria,
        valor_unitario_tributario: item.valorUnitarioTributario,
        valor_total_produto: item.valorTotalProduto,
        valor_frete: item.valorFrete,
        cfop: item.cfop,
        ncm: item.ncm,
        origem_mercadoria: item.origemMercadoria,
        cst_icms: item.cstICMS,
        base_calculo_icms: item.baseCalculoICMS,
        aliquota_icms: item.aliquotaICMS,
        valor_icms: item.valorICMS,
        cst_ipi: item.cstIPI,
        valor_ipi: item.valorIPI,
        cst_pis: item.cstPIS,
        aliquota_pis: item.aliquotaPIS,
        valor_pis: item.valorPIS,
        cst_cofins: item.cstCOFINS,
        aliquota_cofins: item.aliquotaCOFINS,
        valor_cofins: item.valorCOFINS,
        valor_total_tributos: item.valorTotalTributos
      });
    }

    resultado.sucesso = true;
    return resultado;

  } catch (error) {
    console.error('Erro na importação do XML:', error);
    resultado.erros.push(error instanceof Error ? error.message : 'Erro desconhecido');
    return resultado;
  }
};

// =====================================================
// FUNÇÕES AUXILIARES PARA PROCESSAMENTO DE XML
// =====================================================

/**
 * Processa o XML da NF-e e extrai dados estruturados
 */
const processarXMLNFe = async (xmlText: string): Promise<Record<string, unknown>> => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Verificar se há erros no parsing
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('XML inválido ou malformado');
    }

    // Extrair dados principais da NF-e
    const infNFe = xmlDoc.querySelector('infNFe');
    if (!infNFe) {
      throw new Error('Elemento infNFe não encontrado no XML');
    }

    const chaveAcesso = infNFe.getAttribute('Id')?.replace('NFe', '') || '';

    // Dados de identificação
    const ide = infNFe.querySelector('ide');
    const numeroNF = parseInt(getTextContent(ide, 'nNF') || '0');
    const serie = parseInt(getTextContent(ide, 'serie') || '0');
    const modelo = parseInt(getTextContent(ide, 'mod') || '55');
    const dataEmissao = getTextContent(ide, 'dhEmi') || '';
    const dataSaidaEntrada = getTextContent(ide, 'dhSaiEnt');

    // Dados do emitente (fornecedor)
    const emit = infNFe.querySelector('emit');
    const fornecedor = extrairDadosFornecedor(emit);

    // Dados dos totais
    const total = infNFe.querySelector('total ICMSTot');
    const valorProdutos = parseFloat(getTextContent(total, 'vProd') || '0');
    const valorFrete = parseFloat(getTextContent(total, 'vFrete') || '0');
    const valorTotalNota = parseFloat(getTextContent(total, 'vNF') || '0');
    const valorICMS = parseFloat(getTextContent(total, 'vICMS') || '0');
    const valorIPI = parseFloat(getTextContent(total, 'vIPI') || '0');
    const valorPIS = parseFloat(getTextContent(total, 'vPIS') || '0');
    const valorCOFINS = parseFloat(getTextContent(total, 'vCOFINS') || '0');
    const valorTotalTributos = parseFloat(getTextContent(total, 'vTotTrib') || '0');

    // Processar itens
    const detElements = infNFe.querySelectorAll('det');
    const itens = Array.from(detElements).map((det, index) => 
      extrairDadosItem(det, index + 1)
    );

    return {
      chaveAcesso,
      numeroNF,
      serie,
      modelo,
      dataEmissao,
      dataSaidaEntrada,
      fornecedor,
      valorProdutos,
      valorFrete,
      valorTotalNota,
      valorICMS,
      valorIPI,
      valorPIS,
      valorCOFINS,
      valorTotalTributos,
      itens
    };

  } catch (error) {
    console.error('Erro ao processar XML:', error);
    throw error;
  }
};

/**
 * Extrai dados do fornecedor do XML
 */
const extrairDadosFornecedor = (emit: Element | null): Record<string, unknown> => {
  if (!emit) throw new Error('Dados do emitente não encontrados');

  const endereco = emit.querySelector('enderEmit');

  return {
    cnpj: getTextContent(emit, 'CNPJ'),
    razaoSocial: getTextContent(emit, 'xNome'),
    nomeFantasia: getTextContent(emit, 'xFant'),
    inscricaoEstadual: getTextContent(emit, 'IE'),
    inscricaoMunicipal: getTextContent(emit, 'IM'),
    cnae: getTextContent(emit, 'CNAE'),
    crt: parseInt(getTextContent(emit, 'CRT') || '0'),
    telefone: getTextContent(emit, 'fone'),
    logradouro: getTextContent(endereco, 'xLgr'),
    numero: getTextContent(endereco, 'nro'),
    complemento: getTextContent(endereco, 'xCpl'),
    bairro: getTextContent(endereco, 'xBairro'),
    cidade: getTextContent(endereco, 'xMun'),
    uf: getTextContent(endereco, 'UF'),
    cep: getTextContent(endereco, 'CEP'),
    codigoMunicipio: getTextContent(endereco, 'cMun')
  };
};

/**
 * Extrai dados de um item do XML
 */
const extrairDadosItem = (det: Element, numeroItem: number): Record<string, unknown> => {
  const prod = det.querySelector('prod');
  const imposto = det.querySelector('imposto');

  // Dados do produto
  const codigoInterno = getTextContent(prod, 'cProd');
  const codigoEAN = getTextContent(prod, 'cEAN');
  const nome = getTextContent(prod, 'xProd');
  const ncm = getTextContent(prod, 'NCM');
  const cfop = getTextContent(prod, 'CFOP');
  const unidadeComercial = getTextContent(prod, 'uCom');
  const unidadeTributaria = getTextContent(prod, 'uTrib');

  // Quantidades e valores
  const quantidadeComercial = parseFloat(getTextContent(prod, 'qCom') || '0');
  const valorUnitarioComercial = parseFloat(getTextContent(prod, 'vUnCom') || '0');
  const quantidadeTributaria = parseFloat(getTextContent(prod, 'qTrib') || '0');
  const valorUnitarioTributario = parseFloat(getTextContent(prod, 'vUnTrib') || '0');
  const valorTotalProduto = parseFloat(getTextContent(prod, 'vProd') || '0');
  const valorFrete = parseFloat(getTextContent(prod, 'vFrete') || '0');

  // Dados fiscais - ICMS
  const icms = imposto?.querySelector('ICMS')?.firstElementChild;
  const origemMercadoria = parseInt(getTextContent(icms, 'orig') || '0');
  const cstICMS = getTextContent(icms, 'CST');
  const baseCalculoICMS = parseFloat(getTextContent(icms, 'vBC') || '0');
  const aliquotaICMS = parseFloat(getTextContent(icms, 'pICMS') || '0');
  const valorICMS = parseFloat(getTextContent(icms, 'vICMS') || '0');

  // Dados fiscais - IPI
  const ipi = imposto?.querySelector('IPI IPITrib');
  const cstIPI = getTextContent(ipi, 'CST');
  const valorIPI = parseFloat(getTextContent(ipi, 'vIPI') || '0');

  // Dados fiscais - PIS
  const pis = imposto?.querySelector('PIS PISAliq');
  const cstPIS = getTextContent(pis, 'CST');
  const aliquotaPIS = parseFloat(getTextContent(pis, 'pPIS') || '0');
  const valorPIS = parseFloat(getTextContent(pis, 'vPIS') || '0');

  // Dados fiscais - COFINS
  const cofins = imposto?.querySelector('COFINS COFINSAliq');
  const cstCOFINS = getTextContent(cofins, 'CST');
  const aliquotaCOFINS = parseFloat(getTextContent(cofins, 'pCOFINS') || '0');
  const valorCOFINS = parseFloat(getTextContent(cofins, 'vCOFINS') || '0');

  const valorTotalTributos = parseFloat(getTextContent(imposto, 'vTotTrib') || '0');

  // Dados do lote (se existir)
  const rastro = prod?.querySelector('rastro');
  let lote = null;
  if (rastro) {
    lote = {
      numeroLote: getTextContent(rastro, 'nLote'),
      dataFabricacao: getTextContent(rastro, 'dFab'),
      dataValidade: getTextContent(rastro, 'dVal'),
      quantidade: parseFloat(getTextContent(rastro, 'qLote') || '0')
    };
  }

  return {
    numeroItem,
    produto: {
      codigoInterno,
      codigoEAN,
      nome,
      ncm,
      cfop,
      unidadeComercial,
      unidadeTributaria,
      lote
    },
    quantidadeComercial,
    valorUnitarioComercial,
    quantidadeTributaria,
    valorUnitarioTributario,
    valorTotalProduto,
    valorFrete,
    cfop,
    ncm,
    origemMercadoria,
    cstICMS,
    baseCalculoICMS,
    aliquotaICMS,
    valorICMS,
    cstIPI,
    valorIPI,
    cstPIS,
    aliquotaPIS,
    valorPIS,
    cstCOFINS,
    aliquotaCOFINS,
    valorCOFINS,
    valorTotalTributos
  };
};

/**
 * Função auxiliar para extrair texto de elementos XML
 */
const getTextContent = (parent: Element | null, tagName: string): string => {
  if (!parent) return '';
  const element = parent.querySelector(tagName);
  return element?.textContent?.trim() || '';
};

/**
 * Importa ou atualiza fornecedor baseado nos dados do XML
 */
const importarFornecedorDoXML = async (dadosFornecedor: Record<string, unknown>): Promise<UUID> => {
  // Esta função será implementada no fornecedorService
  // Por enquanto, retorna um ID fictício
  return 'fornecedor-id-exemplo';
};

/**
 * Processa produtos do XML e retorna estatísticas
 */
const processarProdutosDoXML = async (itens: Record<string, unknown>[], fornecedorId: UUID): Promise<Record<string, unknown>> => {
  // Esta função será implementada integrando com o produtoService
  // Por enquanto, retorna estatísticas fictícias
  return {
    total: itens.length,
    novos: Math.floor(itens.length * 0.7),
    atualizados: Math.floor(itens.length * 0.3),
    lotes: itens.filter(item => item.produto.lote).length
  };
};

// =====================================================
// VALIDAÇÕES
// =====================================================

/**
 * Valida chave de acesso da NF-e
 */
export const validarChaveAcesso = (chave: string): boolean => {
  // Chave deve ter 44 dígitos
  if (chave.length !== 44) return false;
  
  // Deve conter apenas números
  if (!/^\d+$/.test(chave)) return false;
  
  // Validação do dígito verificador (algoritmo módulo 11)
  const digitos = chave.slice(0, 43);
  const dv = parseInt(chave.charAt(43));
  
  let soma = 0;
  let peso = 2;
  
  for (let i = digitos.length - 1; i >= 0; i--) {
    soma += parseInt(digitos.charAt(i)) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  
  const resto = soma % 11;
  const dvCalculado = resto < 2 ? 0 : 11 - resto;
  
  return dv === dvCalculado;
};

// =====================================================
// EXPORT DEFAULT
// =====================================================

export default {
  buscarNotasFiscais,
  buscarNotaFiscalPorId,
  buscarNotaFiscalPorChave,
  criarNotaFiscal,
  atualizarNotaFiscal,
  buscarItensNotaFiscal,
  criarItemNotaFiscal,
  importarXMLNotaFiscal,
  validarChaveAcesso
}; 