// =====================================================
// CONFIGURAÇÃO DO SUPABASE - PHARMA.AI
// Cliente e configurações para integração com banco
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase';

// Configurações do ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente do Supabase não configuradas. ' +
    'Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env'
  );
}

// =====================================================
// CONFIGURAÇÕES DE TABELAS
// =====================================================

export const TABLES = {
  // Módulo M01 - Cadastros Essenciais
  FORNECEDOR: 'fornecedor',
  CATEGORIA_PRODUTO: 'categoria_produto',
  FORMA_FARMACEUTICA: 'forma_farmaceutica',
  PRODUTO: 'produto',
  
  // Módulo M04 - Gestão de Estoque
  LOTE: 'lote',
  
  // Módulo M10 - Fiscal
  NOTA_FISCAL: 'notas_fiscais',
  ITEM_NOTA_FISCAL: 'itens_nota_fiscal',
} as const;

// =====================================================
// CONFIGURAÇÕES DE RLS (ROW LEVEL SECURITY)
// =====================================================

export const RLS_POLICIES = {
  // Políticas básicas para usuários autenticados
  SELECT_AUTHENTICATED: 'Usuários autenticados podem visualizar',
  INSERT_AUTHENTICATED: 'Usuários autenticados podem inserir',
  UPDATE_AUTHENTICATED: 'Usuários autenticados podem atualizar',
  DELETE_AUTHENTICATED: 'Usuários autenticados podem deletar',
} as const;

// =====================================================
// FUNÇÕES UTILITÁRIAS
// =====================================================

/**
 * Verifica se o usuário está autenticado
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

/**
 * Obtém o usuário atual
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Erro ao obter usuário:', error);
    return null;
  }
  return user;
};

/**
 * Obtém a sessão atual
 */
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Erro ao obter sessão:', error);
    return null;
  }
  return session;
};

/**
 * Faz logout do usuário
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
};

// =====================================================
// CONFIGURAÇÕES DE STORAGE
// =====================================================

export const STORAGE_BUCKETS = {
  NF_XML: 'nf-xml', // Para armazenar XMLs de notas fiscais
  DOCUMENTOS: 'documentos', // Para documentos gerais
  IMAGENS: 'imagens', // Para imagens de produtos
} as const;

/**
 * Upload de arquivo para o storage
 */
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File,
  options?: { upsert?: boolean }
) => {
  // Verifica se o bucket existe antes do upload
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.error('Erro ao listar buckets:', bucketError);
    throw new Error('Erro ao acessar o storage. Tente novamente mais tarde.');
  }
  const bucketExists = buckets?.some(b => b.name === bucket);
  if (!bucketExists) {
    console.error(`Bucket ${bucket} não encontrado. Contate o administrador do sistema.`);
    throw new Error(`Bucket ${bucket} não existe no storage.`);
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, options);

  if (error) {
    console.error('Erro no upload:', error);
    throw error;
  }

  return data;
};

/**
 * Obtém URL pública de um arquivo
 */
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

// =====================================================
// CONFIGURAÇÕES DE REALTIME
// =====================================================

/**
 * Subscreve a mudanças em uma tabela
 */
export const subscribeToTable = (
  table: string,
  callback: (payload: unknown) => void,
  filter?: string
) => {
  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter
      },
      callback
    )
    .subscribe();
  
  return channel;
};

/**
 * Remove subscrição
 */
export const unsubscribeFromTable = (channel: ReturnType<typeof subscribeToTable>) => {
  return supabase.removeChannel(channel);
};

// =====================================================
// TRATAMENTO DE ERROS
// =====================================================

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

/**
 * Formata erros do Supabase para exibição
 */
export const formatSupabaseError = (error: unknown): string => {
  if (!error) return 'Erro desconhecido';
  
  const errorMessage = (error as { message?: string })?.message;
  
  // Erros de autenticação
  if (errorMessage?.includes('Invalid login credentials')) {
    return 'Credenciais inválidas. Verifique email e senha.';
  }
  
  if (errorMessage?.includes('Email not confirmed')) {
    return 'Email não confirmado. Verifique sua caixa de entrada.';
  }
  
  // Erros de validação
  if (errorMessage?.includes('duplicate key value')) {
    return 'Registro já existe. Verifique os dados informados.';
  }
  
  if (errorMessage?.includes('violates foreign key constraint')) {
    return 'Erro de relacionamento. Verifique as dependências.';
  }
  
  if (errorMessage?.includes('violates not-null constraint')) {
    return 'Campo obrigatório não preenchido.';
  }
  
  // Erros de RLS
  if (errorMessage?.includes('Row Level Security')) {
    return 'Acesso negado. Verifique suas permissões.';
  }
  
  // Retorna a mensagem original se não houver tratamento específico
  return errorMessage || 'Erro interno do servidor';
};

// =====================================================
// CONFIGURAÇÕES DE PERFORMANCE
// =====================================================

/**
 * Configurações padrão para queries
 */
export const DEFAULT_QUERY_CONFIG = {
  // Limite padrão para listagens
  DEFAULT_LIMIT: 50,
  
  // Limite máximo para evitar sobrecarga
  MAX_LIMIT: 1000,
  
  // Timeout para queries longas (em ms)
  QUERY_TIMEOUT: 30000,
  
  // Configurações de cache
  CACHE_TTL: 5 * 60 * 1000, // 5 minutos
} as const;

/**
 * Aplica configurações padrão a uma query
 */
export const applyDefaultConfig = (query: unknown, limit?: number) => {
  const finalLimit = Math.min(
    limit || DEFAULT_QUERY_CONFIG.DEFAULT_LIMIT,
    DEFAULT_QUERY_CONFIG.MAX_LIMIT
  );
  
  return (query as { limit: (n: number) => unknown }).limit(finalLimit);
};

// =====================================================
// HEALTH CHECK
// =====================================================

/**
 * Verifica a conectividade com o Supabase
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('fornecedores')
      .select('id')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error('Health check falhou:', error);
    return false;
  }
};

// =====================================================
// EXPORT DEFAULT
// =====================================================

export default supabase; 