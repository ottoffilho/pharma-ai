// =====================================================
// SERVIÇO DE NOTAS FISCAIS - PHARMA.AI
// Módulo M10 - Fiscal
// =====================================================

import supabase, { TABLES, formatSupabaseError, uploadFile, STORAGE_BUCKETS } from './supabase';
import { FornecedorService } from './fornecedorService';
import { buscarProdutoPorCodigo, atualizarEstoqueProduto } from './produtoService';
import { MarkupService } from './markupService';
import { loteService } from './loteService';
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
    console.log('🔍 Buscando nota fiscal por chave:', chaveAcesso);

    const { data, error } = await supabase
      .from(TABLES.NOTA_FISCAL)
      .select('*')
      .eq('chave_acesso', chaveAcesso)
      .maybeSingle();

    if (error) {
      console.error('❌ Erro ao buscar nota fiscal por chave:', error);
      // Em caso de erro, retornar null para permitir continuar
      return null;
    }

    if (data) {
      console.log('✅ Nota fiscal encontrada:', data.numero_nf);
    } else {
      console.log('ℹ️ Nota fiscal não encontrada');
    }

    return data;
  } catch (error) {
    console.error('❌ Erro no serviço de busca por chave:', error);
    // Em caso de erro, retornar null para permitir continuar
    return null;
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
    console.log('🚀 Iniciando importação do XML:', arquivo.name);
    
    // 0. Verificar se o usuário está autenticado
    console.log('🔐 Verificando autenticação...');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('❌ Usuário não autenticado');
      resultado.erros.push('Usuário não autenticado. Faça login para importar notas fiscais.');
      return resultado;
    }
    console.log('✅ Usuário autenticado');

    // 1. Upload do arquivo XML para storage
    console.log('📤 Fazendo upload do arquivo...');
    const nomeArquivo = `${Date.now()}_${arquivo.name}`;
    const caminhoArquivo = `uploads/${nomeArquivo}`;
    
    await uploadFile(STORAGE_BUCKETS.NF_XML, caminhoArquivo, arquivo);
    console.log('✅ Upload concluído');

    // 2. Ler e processar o XML
    console.log('📄 Lendo e processando XML...');
    const xmlText = await arquivo.text();
    console.log('📄 XML lido, tamanho:', xmlText.length, 'caracteres');
    
    const dadosNFe = await processarXMLNFe(xmlText);
    console.log('✅ XML processado:', {
      chave: dadosNFe.chaveAcesso,
      numero: dadosNFe.numeroNF,
      itens: dadosNFe.itens?.length || 0
    });

    // 3. Verificar se nota já existe
    console.log('🔍 Verificando se nota já existe...');
    const notaExistente = await buscarNotaFiscalPorChave(dadosNFe.chaveAcesso);
    if (notaExistente) {
      console.warn('⚠️ Nota fiscal já existe');
      resultado.erros.push(`Nota fiscal ${dadosNFe.numeroNF} já foi importada anteriormente`);
      return resultado;
    }
    console.log('✅ Nota fiscal é nova');

    // 4. Importar/atualizar fornecedor
    console.log('🏢 Importando fornecedor...');
    const fornecedorId = await importarFornecedorDoXML(dadosNFe.fornecedor);
    resultado.fornecedor_id = fornecedorId;
    console.log('✅ Fornecedor processado:', fornecedorId);

    // 5. Processar produtos e lotes
    console.log('📦 Processando produtos...');
    const produtosProcessados = await processarProdutosDoXML(dadosNFe.itens, fornecedorId);
    resultado.produtos_importados = produtosProcessados.total;
    resultado.produtos_novos = produtosProcessados.novos;
    resultado.produtos_atualizados = produtosProcessados.atualizados;
    resultado.lotes_criados = produtosProcessados.lotes;
    console.log('✅ Produtos processados:', {
      total: produtosProcessados.total,
      novos: produtosProcessados.novos,
      atualizados: produtosProcessados.atualizados,
      lotes: produtosProcessados.lotes
    });

    // 6. Criar nota fiscal
    console.log('📋 Criando nota fiscal...');
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
    console.log('✅ Nota fiscal criada:', notaFiscal.id);

    // 7. Criar itens da nota fiscal e atualizar estoque
    console.log('📝 Criando itens da nota fiscal...');
    const produtosProcessadosArray = produtosProcessados.produtosProcessados as { produtoId: UUID; loteId?: UUID; item: Record<string, unknown> }[];
    
    for (let i = 0; i < produtosProcessadosArray.length; i++) {
      const produtoProcessado = produtosProcessadosArray[i];
      console.log(`📝 Processando item ${i + 1}/${produtosProcessadosArray.length}...`);
      
      try {
        const produtoProcessado = produtosProcessadosArray[i];
        const item = produtoProcessado.item;
        
        // 7.1. Criar item da nota fiscal
        await criarItemNotaFiscal({
          nota_fiscal_id: notaFiscal.id,
          produto_id: produtoProcessado.produtoId,
          lote_id: produtoProcessado.loteId,
          numero_item: item.numeroItem as number,
          quantidade_comercial: item.quantidadeComercial as number,
          valor_unitario_comercial: item.valorUnitarioComercial as number,
          quantidade_tributaria: item.quantidadeTributaria as number,
          valor_unitario_tributario: item.valorUnitarioTributario as number,
          valor_total_produto: item.valorTotalProduto as number,
          valor_frete: item.valorFrete as number || 0,
          cfop: item.cfop as string,
          ncm: item.ncm as string,
          origem_mercadoria: item.origemMercadoria as number,
          cst_icms: item.cstICMS as string,
          base_calculo_icms: item.baseCalculoICMS as number,
          aliquota_icms: item.aliquotaICMS as number,
          valor_icms: item.valorICMS as number,
          cst_ipi: item.cstIPI as string,
          valor_ipi: item.valorIPI as number || 0,
          cst_pis: item.cstPIS as string,
          aliquota_pis: item.aliquotaPIS as number,
          valor_pis: item.valorPIS as number,
          cst_cofins: item.cstCOFINS as string,
          aliquota_cofins: item.aliquotaCOFINS as number,
          valor_cofins: item.valorCOFINS as number,
          valor_total_tributos: item.valorTotalTributos as number || 0
        });

        // 7.2. Atualizar estoque do produto (entrada de mercadoria)
        const quantidadeEntrada = item.quantidadeComercial as number;
        await atualizarEstoqueProduto(produtoProcessado.produtoId, quantidadeEntrada, 'entrada');
        
        console.log(`✅ Item ${i + 1} processado com sucesso`);
      } catch (error) {
        console.error(`❌ Erro ao criar item ${i + 1}:`, error);
        resultado.erros.push(`Erro ao criar item: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    console.log('🎉 Importação concluída com sucesso!');
    resultado.sucesso = true;
    return resultado;

  } catch (error) {
    console.error('💥 Erro na importação do XML:', error);
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
    
    // Processar datas corretamente
    const dataEmissaoRaw = getTextContent(ide, 'dhEmi') || '';
    const dataSaidaEntradaRaw = getTextContent(ide, 'dhSaiEnt');
    
    // Converter datas para formato ISO
    const dataEmissao = dataEmissaoRaw ? new Date(dataEmissaoRaw).toISOString() : new Date().toISOString();
    const dataSaidaEntrada = dataSaidaEntradaRaw ? new Date(dataSaidaEntradaRaw).toISOString() : null;

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
  return await FornecedorService.buscarOuCriarFornecedor({
    cnpj: dadosFornecedor.cnpj as string,
    razaoSocial: dadosFornecedor.razaoSocial as string,
    nomeFantasia: dadosFornecedor.nomeFantasia as string,
    inscricaoEstadual: dadosFornecedor.inscricaoEstadual as string,
    telefone: dadosFornecedor.telefone as string,
    logradouro: dadosFornecedor.logradouro as string,
    numero: dadosFornecedor.numero as string,
    complemento: dadosFornecedor.complemento as string,
    bairro: dadosFornecedor.bairro as string,
    cidade: dadosFornecedor.cidade as string,
    uf: dadosFornecedor.uf as string,
    cep: dadosFornecedor.cep as string,
  });
};

/**
 * Processa produtos do XML e retorna estatísticas
 */
const processarProdutosDoXML = async (itens: Record<string, unknown>[], fornecedorId: UUID): Promise<Record<string, unknown>> => {
  console.log('📦 Iniciando processamento de produtos. Total de itens:', itens.length);
  
  let novos = 0;
  let atualizados = 0;
  let lotes = 0;
  const produtosProcessados: { produtoId: UUID; loteId?: UUID; item: Record<string, unknown> }[] = [];
  
  // Cache para evitar consultas duplicadas
  const cacheProdutos = new Map<string, Produto | null>();
  
  for (let index = 0; index < itens.length; index++) {
    const item = itens[index];
    console.log(`📦 Processando produto ${index + 1}/${itens.length}...`);
    
    try {
      const produtoData = item.produto as {
        codigoInterno: string;
        nome: string;
        ncm?: string;
        codigoEAN?: string;
        cfop?: string;
        unidadeComercial?: string;
        unidadeTributaria?: string;
        origem?: number;
        cstIcms?: string;
        cstIpi?: string;
        cstPis?: string;
        cstCofins?: string;
        aliquotaIcms?: number;
        aliquotaIpi?: number;
        aliquotaPis?: number;
        aliquotaCofins?: number;
        lote?: {
          numeroLote: string;
          dataValidade?: string;
          quantidade?: number;
        };
      };
      
      if (!produtoData || !produtoData.codigoInterno) {
        console.warn('⚠️ Item sem código interno válido:', item);
        continue;
      }
      
      console.log(`🔍 Buscando produto com código: ${produtoData.codigoInterno}`);
      
      // 1. Verificar se produto já existe (com cache para evitar consultas duplicadas)
      let produto = cacheProdutos.get(produtoData.codigoInterno);
      
      if (produto === undefined) {
        console.log('🔍 Produto não está no cache, buscando no banco...');
        // Primeira consulta para este código - buscar no banco
        produto = await buscarProdutoPorCodigo(produtoData.codigoInterno);
        cacheProdutos.set(produtoData.codigoInterno, produto);
        console.log('✅ Busca no banco concluída');
      } else {
        console.log('✅ Produto encontrado no cache');
      }
      
      if (produto) {
        // Produto existe - atualizar se necessário
        atualizados++;
        console.log(`✅ Produto existente encontrado: ${produto.nome}`);
      } else {
        console.log('🆕 Produto não existe, criando novo...');
        
        // Produto não existe - criar novo
        const custoProduto = (item.valorUnitarioComercial as number) || 0;
        console.log(`💰 Custo do produto: ${custoProduto}`);
        
        // Determinar categoria para markup baseado no tipo de produto
        let categoria = 'medicamentos'; // padrão
        const nomeProduto = (produtoData.nome || '').toUpperCase();
        
        if (nomeProduto.includes('FRASCO') || nomeProduto.includes('POTE') || nomeProduto.includes('EMBALAGEM')) {
          categoria = 'embalagens';
        } else if (nomeProduto.includes('INSUMO') || nomeProduto.includes('VEÍCULO') || nomeProduto.includes('EXCIPIENTE')) {
          categoria = 'insumos';
        }
        
        console.log(`📊 Categoria determinada: ${categoria}`);
        console.log('💹 Calculando markup...');
        
        // Calcular markup automático
        const markupService = new MarkupService();
        const markupCalculado = await markupService.calcularMarkup(custoProduto, categoria);
        
        console.log('✅ Markup calculado:', markupCalculado);
        
        const novoProduto = {
          // Campos obrigatórios da tabela produtos
          nome: produtoData.nome || 'Produto Importado',
          tipo: classificarTipoProduto(produtoData.ncm, produtoData.nome), // Classificação automática
          unidade_medida: produtoData.unidadeComercial || 'UN', // Campo obrigatório  
          custo_unitario: custoProduto, // Campo obrigatório
          markup: markupCalculado.markup,
          markup_personalizado: false, // Usar markup padrão da categoria
          fornecedor_id: fornecedorId,
          
          // Campos adicionais para produtos da NF-e
          codigo_interno: produtoData.codigoInterno,
          codigo_ean: produtoData.codigoEAN === 'SEM GTIN' ? null : produtoData.codigoEAN,
          ncm: produtoData.ncm || '',
          cfop: produtoData.cfop,
          unidade_comercial: produtoData.unidadeComercial,
          unidade_tributaria: produtoData.unidadeTributaria,
          origem: produtoData.origem || 0,
          
          // Informações fiscais
          cst_icms: produtoData.cstIcms,
          cst_ipi: produtoData.cstIpi,
          cst_pis: produtoData.cstPis,
          cst_cofins: produtoData.cstCofins,
          aliquota_icms: produtoData.aliquotaIcms || 0,
          aliquota_ipi: produtoData.aliquotaIpi || 0,
          aliquota_pis: produtoData.aliquotaPis || 0,
          aliquota_cofins: produtoData.aliquotaCofins || 0,
          
          // Controle
          preco_custo: custoProduto,
          preco_venda: markupCalculado.preco_venda,
          estoque_atual: 0,
          estoque_minimo: 1,
          produto_revenda: true,
          ativo: true,
          is_deleted: false
        };

        const { data: produtoInserido, error: errorProduto } = await supabase
          .from(TABLES.PRODUTO)
          .insert(novoProduto)
          .select()
          .single();

        if (errorProduto) {
          throw new Error(formatSupabaseError(errorProduto));
        }
        
        // Atualizar variável para ter consistência
        produto = produtoInserido;
        
        // Atualizar cache com o produto criado
        cacheProdutos.set(produtoData.codigoInterno, produto);
        novos++;
        console.log(`✅ Novo produto criado: ${produto.nome}`);
      }
      
      // 2. Processar lote se existir
      let loteId: UUID | undefined;
      if (produtoData.lote) {
        try {
          console.log(`📦 Processando lote: ${produtoData.lote.numeroLote}`);
          
          // Criar ou atualizar lote usando o serviço de lotes
          const loteCriado = await loteService.criarLoteDoXML({
            produto_id: produto.id,
            numero_lote: produtoData.lote.numeroLote,
            data_validade: produtoData.lote.dataValidade,
            quantidade: produtoData.lote.quantidade || (item.quantidadeComercial as number),
            preco_custo_unitario: item.valorUnitarioComercial as number,
            fornecedor_id: fornecedorId
          });
          
          loteId = loteCriado.id;
          lotes++;
          console.log(`✅ Lote processado: ${loteCriado.numero_lote} (ID: ${loteId})`);
          
        } catch (error) {
          console.error(`❌ Erro ao processar lote ${produtoData.lote.numeroLote}:`, error);
          // Continuar processamento mesmo com erro no lote
        }
      }
      
      // 3. Adicionar à lista de produtos processados
      produtosProcessados.push({
        produtoId: produto.id,
        loteId,
        item
      });
      
      console.log(`✅ Produto ${index + 1} processado com sucesso`);
      
    } catch (error) {
      console.error(`❌ Erro ao processar produto ${index + 1}:`, error);
      // Continuar processamento mesmo com erro em um item
    }
  }
  
  console.log('📦 Processamento de produtos concluído:', {
    total: itens.length,
    novos,
    atualizados,
    lotes,
    processados: produtosProcessados.length
  });
  
  return {
    total: itens.length,
    novos,
    atualizados,
    lotes,
    produtosProcessados
  };
};

// =====================================================
// FUNÇÕES AUXILIARES PARA ESTOQUE
// =====================================================

/**
 * Calcula estoque mínimo inteligente baseado no tipo de produto
 */
const calcularEstoqueMinimoInteligente = (nomeProduto: string, quantidadeComprada: number): number => {
  const nome = nomeProduto.toUpperCase();
  
  // Para produtos de alta rotação (Florais de Bach), manter estoque maior
  if (nome.includes('BACH') || nome.includes('FLORAL')) {
    return Math.max(2, Math.ceil(quantidadeComprada * 0.5));
  }
  
  // Para tinturas-mãe, estoque moderado
  if (nome.includes('TM') || nome.includes('TINTURA')) {
    return Math.max(1, Math.ceil(quantidadeComprada * 0.3));
  }
  
  // Para homeopáticos (CH), estoque baixo pois são específicos
  if (nome.includes('CH') || nome.includes('CENTESIMAL')) {
    return Math.max(1, Math.ceil(quantidadeComprada * 0.2));
  }
  
  // Padrão: 25% da quantidade comprada, mínimo 1
  return Math.max(1, Math.ceil(quantidadeComprada * 0.25));
};

/**
 * Calcula estoque máximo inteligente baseado no tipo de produto
 */
const calcularEstoqueMaximoInteligente = (nomeProduto: string, quantidadeComprada: number): number => {
  const nome = nomeProduto.toUpperCase();
  
  // Para produtos de alta rotação (Florais de Bach), estoque maior
  if (nome.includes('BACH') || nome.includes('FLORAL')) {
    return Math.max(10, quantidadeComprada * 3);
  }
  
  // Para tinturas-mãe, estoque moderado
  if (nome.includes('TM') || nome.includes('TINTURA')) {
    return Math.max(5, quantidadeComprada * 2);
  }
  
  // Para homeopáticos (CH), estoque controlado
  if (nome.includes('CH') || nome.includes('CENTESIMAL')) {
    return Math.max(3, Math.ceil(quantidadeComprada * 1.5));
  }
  
  // Padrão: 2x a quantidade comprada, mínimo 5
  return Math.max(5, quantidadeComprada * 2);
};

// =====================================================
// FUNÇÃO DE CLASSIFICAÇÃO DE TIPO DE PRODUTO
// =====================================================

/**
 * Classifica o tipo do produto baseado em NCM e nome
 * Com foco específico em farmácia de manipulação
 */
function classificarTipoProduto(ncm: string, nome: string): string {
  const ncmLimpo = (ncm || '').replace(/\D/g, '');
  const nomeUpper = (nome || '').toUpperCase();

  // === EMBALAGENS ESPECÍFICAS PARA FARMÁCIA DE MANIPULAÇÃO ===
  
  // NCMs específicos de embalagens para farmácia
  const ncmEmbalagensFarmacia = [
    // Frascos e recipientes de plástico
    '39232990', // Outros artigos de plástico (categoria que inclui frascos, potes)
    '39233000', // Garrafas, frascos e artigos similares
    '39234000', // Bobinas, carretéis e suportes similares
    '39269090', // Outras obras de plástico
    '39199090', // Outros artigos de plástico
    
    // Frascos e recipientes de vidro
    '70109010', // Frascos de vidro para medicamentos
    '70109090', // Outros recipientes de vidro
    '70139000', // Artigos de vidro para mesa, cozinha, laboratório
    '70200000', // Outras obras de vidro
    
    // Embalagens de papel/papelão
    '48194000', // Sacos de papel multifolhados
    '48195000', // Outras embalagens de papel e papelão
    '48211000', // Rótulos de papel ou cartão, impressos
    '48219000', // Outros rótulos de papel ou cartão
    '48236900', // Outras bandejas, pratos, copos de papel/cartão
    
    // Tampas e fechos
    '83099000', // Outras rolhas, tampas e fechos
    '39235000', // Rolhas, tampas e fechos de plástico
    
    // Seringas e materiais para aplicação
    '90183100', // Seringas, mesmo com agulhas
    '90183200', // Agulhas tubulares de metal
    '90189010', // Instrumentos para medicina
    
    // Embalagens secundárias e de transporte
    '48194000', // Sacos de papel
    '63053200', // Sacas para produtos a granel
    '39232100', // Sacas e sacos de polímeros de etileno
    '39232990', // Outros artigos de plástico
    
    // Fitas e materiais de vedação
    '39191000', // Chapas e tiras autoadesivas de plástico
    '48239000', // Outros papéis, cartões, guata de celulose
    
    // Embalagens especiais para homeopatia
    '70109010', // Frascos conta-gotas
    '39269000', // Artigos de plástico para medicamentos
    
    // Materiais de proteção e lacração
    '39232990', // Filmes de proteção
    '83099000', // Lacres e selos de segurança
  ];
  
  // Verificação por NCM completo (8 dígitos)
  if (ncmEmbalagensFarmacia.includes(ncmLimpo)) {
    return 'EMBALAGEM';
  }
  
  // Verificação por prefixos de NCM de embalagens
  const prefixosEmbalagemFarmacia = [
    '3923', // Artigos de transporte ou embalagem, de plásticos
    '3926', // Outras obras de plásticos
    '4819', // Caixas, sacos e embalagens de papel/cartão
    '4821', // Rótulos de papel ou cartão
    '4823', // Outros papéis, cartões de celulose
    '7010', // Garrafas, frascos e recipientes de vidro
    '7013', // Objetos de vidro para mesa/cozinha
    '7020', // Outras obras de vidro
    '7612', // Recipientes de alumínio
    '8309', // Rolhas, tampas e fechos
    '9018', // Instrumentos para medicina/veterinária (seringas, etc.)
  ];
  
  if (prefixosEmbalagemFarmacia.some(prefixo => ncmLimpo.startsWith(prefixo))) {
    return 'EMBALAGEM';
  }

  // === CLASSIFICAÇÃO POR PALAVRAS-CHAVE NO NOME ===
  
  // Palavras-chave específicas de embalagens farmacêuticas
  const palavrasEmbalagem = [
    'FRASCO', 'POTE', 'BISNAGA', 'TAMPA', 'RÓTULO', 'EMBALAGEM', 'AMPOLA',
    'SERINGA', 'AGULHA', 'CONTA-GOTAS', 'GOTEJADOR', 'VIDRO', 'PLÁSTICO',
    'RECIPIENTE', 'CONTAINER', 'LACRE', 'SELO', 'ETIQUETA', 'ADESIVO',
    'SACO', 'SACOLA', 'ENVELOPE', 'CAIXA', 'CARTUCHO', 'TUBO',
    'BOIÃO', 'JARRO', 'FLACONETE', 'VIAL', 'AMPOULE'
  ];
  
  if (palavrasEmbalagem.some(palavra => nomeUpper.includes(palavra))) {
    return 'EMBALAGEM';
  }

  // === COSMÉTICOS POR NCM ===
  const ncmCosmeticos = ['3301', '3302', '3303', '3304', '3305', '3306', '3307'];
  if (ncmCosmeticos.some(prefixo => ncmLimpo.startsWith(prefixo))) {
    return 'COSMÉTICO';
  }

  // === MEDICAMENTOS POR NCM ===
  const ncmMedicamentos = ['3003', '3004', '3002'];
  if (ncmMedicamentos.some(prefixo => ncmLimpo.startsWith(prefixo))) {
    return 'MEDICAMENTO';
  }

  // === INSUMOS/MATÉRIAS-PRIMAS POR NCM ===
  const ncmInsumos = ['28', '29', '38'];
  if (ncmInsumos.some(prefixo => ncmLimpo.startsWith(prefixo))) {
    return 'INSUMO';
  }

  // === CLASSIFICAÇÃO POR PALAVRAS-CHAVE FARMACÊUTICAS ===
  
  // Cosméticos e produtos de beleza
  if (/(ÓLEO ESSENCIAL|BATOM|PROTETOR SOLAR|HIDRATANTE|SHAMPOO|CONDICIONADOR|SABONETE|PERFUME|COLÔNIA|DESODORANTE|CREME FACIAL|LOÇÃO|SÉRUM|MÁSCARA|ESFOLIANTE|TÔNICO|DEMAQUILANTE|BASE|PÓ|RÍMEL|SOMBRA|BLUSH|GLOSS|ESMALTE|REMOVEDOR|ACETONA|MAQUIAGEM|COSMÉTICO|BELEZA|ANTI-IDADE|ANTIRRUGAS|CLAREADOR|BRONZEADOR|AUTOBRONZEADOR|FPS|PROTEÇÃO SOLAR)/.test(nomeUpper)) {
    return 'COSMÉTICO';
  }
  
  // Insumos e excipientes
  if (/(EXCIPIENTE|VEÍCULO|INSUMO|CONSERVANTE|ESTABILIZANTE|DILUENTE)/.test(nomeUpper)) {
    return 'INSUMO';
  }
  
  // Formas farmacêuticas - Medicamentos
  if (/(COMPRIMIDO|CÁPSULA|CREME|SOLUÇÃO|GEL|POMADA|XAROPE|SUSPENSÃO|ELIXIR)/.test(nomeUpper)) {
    return 'MEDICAMENTO';
  }
  
  // Matérias-primas ativas
  if (/(PRINCÍPIO ATIVO|MATÉRIA PRIMA|ATIVO|EXTRATO|TINTURA)/.test(nomeUpper)) {
    return 'MATERIA_PRIMA';
  }
  
  // Homeopáticos específicos
  if (/(CH|DH|LM|FC|TM|FLORAL|BACH|DINAMIZAÇÃO|POTÊNCIA)/.test(nomeUpper)) {
    return 'HOMEOPATICO';
  }

  // === FALLBACK INTELIGENTE ===
  
  // Se contém números que parecem potência homeopática
  if (/\d+(CH|DH|LM|FC)/.test(nomeUpper)) {
    return 'HOMEOPATICO';
  }
  
  // Se o nome sugere manipulação
  if (/(MANIPULADO|FÓRMULA|PREPARAÇÃO)/.test(nomeUpper)) {
    return 'MEDICAMENTO';
  }
  
  // Fallback final baseado no NCM
  if (ncmLimpo.startsWith('30')) {
    return 'MEDICAMENTO'; // Grupo 30 geralmente são medicamentos
  }
  
  if (ncmLimpo.startsWith('33')) {
    return 'COSMÉTICO'; // Grupo 33 são cosméticos
  }

  // Fallback padrão
  return 'OUTRO';
}

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