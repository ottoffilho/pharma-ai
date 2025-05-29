// Hook de Autenticação Simplificado - Pharma.AI
import { useState, useEffect, useCallback, createContext, useContext, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SessaoUsuario, RespostaAuth } from '../types';
import { NivelAcesso, ModuloSistema, AcaoPermissao, TipoDashboard, PerfilUsuario } from '../types';

interface AuthContextType {
  usuario: SessaoUsuario | null;
  carregando: boolean;
  autenticado: boolean;
  login: (email: string, senha: string) => Promise<RespostaAuth>;
  logout: () => Promise<void>;
  forceLogout: () => void;
  erro: string | null;
}

// Cache local para reduzir chamadas repetidas
interface AuthCache {
  usuario: SessaoUsuario | null;
  timestamp: number;
  valido: boolean;
}

// TTL do cache em milissegundos (5 minutos - aumentado para reduzir consultas)
const CACHE_TTL = 5 * 60 * 1000;

// Timeout de segurança reduzido para 8 segundos (mais rápido)
const SAFETY_TIMEOUT = 8 * 1000;

// Máximo de tentativas para carregar usuário - mantido em 1 para evitar loops
const MAX_TENTATIVAS = 1;

// Contador global de erros para detectar loops entre recarregamentos
const getErrorCountFromSession = (): number => {
  try {
    const count = sessionStorage.getItem('auth_error_count');
    return count ? parseInt(count, 10) : 0;
  } catch (e) {
    return 0;
  }
};

const incrementErrorCount = (): number => {
  try {
    const count = getErrorCountFromSession() + 1;
    sessionStorage.setItem('auth_error_count', count.toString());
    return count;
  } catch (e) {
    return 1;
  }
};

const resetErrorCount = (): void => {
  try {
    sessionStorage.removeItem('auth_error_count');
  } catch (e) {
    // Ignorar erros
  }
};

export const AuthSimpleContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthSimple = () => {
  const context = useContext(AuthSimpleContext);
  if (context === undefined) {
    throw new Error('useAuthSimple deve ser usado dentro de um AuthSimpleProvider');
  }
  return context;
};

// Tentar recuperar cache do sessionStorage com fallback
const recuperarCache = (): AuthCache | null => {
  try {
    // Tentar sessionStorage primeiro
    let cacheData = sessionStorage.getItem('auth_cache');
    
    // Se não encontrar no sessionStorage, tentar localStorage como fallback
    if (!cacheData) {
      cacheData = localStorage.getItem('auth_cache_backup');
    }
    
    if (cacheData) {
      const cache = JSON.parse(cacheData) as AuthCache;
      const agora = Date.now();
      
      // Se o cache ainda é válido
      if (cache.valido && (agora - cache.timestamp) < CACHE_TTL) {
        console.log('✅ Cache de autenticação válido encontrado');
        return cache;
      } else {
        console.log('⚠️ Cache de autenticação expirado, removendo...');
        // Limpar cache expirado
        sessionStorage.removeItem('auth_cache');
        localStorage.removeItem('auth_cache_backup');
      }
    }
  } catch (error) {
    console.log('⚠️ Erro ao recuperar cache:', error);
    // Limpar cache corrompido
    try {
      sessionStorage.removeItem('auth_cache');
      localStorage.removeItem('auth_cache_backup');
    } catch (e) {
      // Ignorar erros de limpeza
    }
  }
  return null;
};

// Salvar dados no cache com backup
const salvarCache = (usuario: SessaoUsuario | null) => {
  try {
    const cache: AuthCache = {
      usuario,
      timestamp: Date.now(),
      valido: true
    };
    const cacheString = JSON.stringify(cache);
    
    // Salvar no sessionStorage (principal)
    sessionStorage.setItem('auth_cache', cacheString);
    
    // Backup no localStorage (para persistir entre abas)
    localStorage.setItem('auth_cache_backup', cacheString);
    
    console.log('✅ Cache de autenticação salvo');
  } catch (error) {
    console.log('⚠️ Erro ao salvar cache:', error);
  }
};

// Invalidar cache completamente
const invalidarCache = () => {
  try {
    sessionStorage.removeItem('auth_cache');
    localStorage.removeItem('auth_cache_backup');
    console.log('🗑️ Cache de autenticação invalidado');
  } catch (error) {
    console.log('⚠️ Erro ao invalidar cache:', error);
  }
};

// Verificar se o erro é relacionado a tabela não encontrada
const isTableNotFoundError = (error: unknown): boolean => {
  if (!error) return false;
  
  const errorMessage = typeof error === 'string' 
    ? error 
    : (error as { message?: string; details?: string }).message || 
      (error as { details?: string }).details || 
      JSON.stringify(error);
  
  return errorMessage.includes('relation') && 
         (errorMessage.includes('does not exist') || 
          errorMessage.includes('não existe') ||
          errorMessage.includes('not found'));
};

export const useAuthSimpleState = () => {
  // Estados básicos
  const [usuario, setUsuario] = useState<SessaoUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [ultimoErro, setUltimoErro] = useState<string | null>(null);
  
  // Refs para controle
  const isMountedRef = useRef(true);
  const carregandoRef = useRef(false);

  // Função para forçar logout em emergência
  const forceLogout = useCallback(() => {
    try {
      console.log('🚨 useAuthSimple - Logout forçado iniciado');
      supabase.auth.signOut();
      invalidarCache();
      sessionStorage.clear();
      setUsuario(null);
      setCarregando(false);
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (e) {
      console.error('❌ useAuthSimple - Erro no logout forçado:', e);
      window.location.href = '/login';
    }
  }, []);

  // Função simplificada para carregar usuário
  const carregarUsuario = useCallback(async () => {
    if (carregandoRef.current) {
      console.log('⚠️ useAuthSimple - Carregamento já em andamento');
      return;
    }

    carregandoRef.current = true;
    
    try {
      console.log('🔄 useAuthSimple - Carregando usuário...');
      
      // Verificar sessão
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.log('⚠️ useAuthSimple - Sem sessão ativa');
        if (isMountedRef.current) {
          setUsuario(null);
          setCarregando(false);
          invalidarCache();
        }
        carregandoRef.current = false;
        return;
      }

      const user = session.user;
      console.log('✅ useAuthSimple - Sessão encontrada:', user.email);

      // Buscar dados do usuário com timeout
      const userDataPromise = supabase
        .from('usuarios')
        .select(`
          id,
          email,
          nome,
          telefone,
          perfil_id,
          ativo,
          ultimo_acesso,
          criado_em,
          atualizado_em,
          supabase_auth_id,
          perfis_usuario(
            id,
            nome,
            tipo,
            dashboard_padrao
          )
        `)
        .eq('supabase_auth_id', user.id)
        .eq('ativo', true)
        .single();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout ao buscar usuário')), 3000);
      });

      let userData, userDataError;
      try {
        const result = await Promise.race([
          userDataPromise,
          timeoutPromise
        ]) as { data: unknown; error: unknown };
        userData = result.data;
        userDataError = result.error;
      } catch (timeoutError) {
        console.error('❌ useAuthSimple - Timeout ao buscar usuário:', timeoutError);
        if (isMountedRef.current) {
          setUltimoErro('Timeout ao carregar usuário');
          setCarregando(false);
        }
        carregandoRef.current = false;
        return;
      }

      if (userDataError || !userData) {
        console.error('❌ useAuthSimple - Erro ao buscar usuário:', userDataError);
        if (isMountedRef.current) {
          setUltimoErro('Usuário não encontrado');
          setCarregando(false);
        }
        carregandoRef.current = false;
        return;
      }

      // Buscar permissões com timeout
      const permissoesPromise = supabase
        .from('permissoes')
        .select('*')
        .eq('perfil_id', userData.perfil_id);

      const permissoesTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout ao buscar permissões')), 2000);
      });

      let permissoesData;
      try {
        const result = await Promise.race([
          permissoesPromise,
          permissoesTimeoutPromise
        ]) as { data: unknown };
        permissoesData = result.data;
      } catch (timeoutError) {
        console.error('❌ useAuthSimple - Timeout ao buscar permissões:', timeoutError);
        permissoesData = []; // Usar array vazio como fallback
      }

      const permissoes = (permissoesData as Array<{ id: string; modulo: string; acao: string; perfil_id: string; permitido: boolean; criado_em: string }> || []).map((p) => ({
        id: p.id,
        modulo: p.modulo as ModuloSistema,
        acao: p.acao as AcaoPermissao,
        nivel: NivelAcesso.TODOS,
        perfil_id: p.perfil_id,
        permitido: p.permitido,
        criado_em: p.criado_em,
        condicoes: null
      }));

      const perfilUsuario = userData.perfis_usuario ? {
        id: userData.perfis_usuario.id,
        nome: userData.perfis_usuario.nome,
        tipo: userData.perfis_usuario.tipo as PerfilUsuario,
        dashboard: userData.perfis_usuario.dashboard_padrao as TipoDashboard || TipoDashboard.ADMINISTRATIVO,
        permissoes,
        ativo: userData.ativo,
        created_at: '',
        updated_at: ''
      } : undefined;

      const usuarioObj = {
        id: userData.id,
        email: userData.email,
        nome: userData.nome,
        telefone: userData.telefone || undefined,
        perfil_id: userData.perfil_id,
        perfil: perfilUsuario,
        ativo: userData.ativo,
        ultimo_acesso: userData.ultimo_acesso || undefined,
        created_at: userData.criado_em || '',
        updated_at: userData.atualizado_em || '',
        auth_id: userData.supabase_auth_id || undefined
      };

      const sessao: SessaoUsuario = {
        usuario: usuarioObj,
        permissoes,
        dashboard: (userData.perfis_usuario?.dashboard_padrao as TipoDashboard) || TipoDashboard.ADMINISTRATIVO
      };

      console.log('✅ useAuthSimple - Usuário carregado:', userData.nome);
      
      salvarCache(sessao);
      
      if (isMountedRef.current) {
        setUsuario(sessao);
        setUltimoErro(null);
        setCarregando(false);
      }

      // Atualizar último acesso em background (usando supabase_auth_id para RLS)
      // Fazer isso de forma assíncrona para não bloquear o carregamento
      setTimeout(async () => {
        try {
          const { error: updateError } = await supabase
            .from('usuarios')
            .update({ ultimo_acesso: new Date().toISOString() })
            .eq('supabase_auth_id', user.id); // Usar supabase_auth_id em vez de id da tabela
          
          if (updateError) {
            console.log('⚠️ Erro ao atualizar último acesso:', updateError.message);
            console.log('⚠️ Detalhes do erro:', updateError);
            // Não interromper o fluxo por causa deste erro
          } else {
            console.log('✅ Último acesso atualizado');
          }
        } catch (err) {
          console.log('⚠️ Exceção ao atualizar último acesso:', err);
          // Não interromper o fluxo por causa deste erro
        }
      }, 1000); // Aguardar 1 segundo antes de tentar atualizar

    } catch (error) {
      console.error('❌ useAuthSimple - Erro geral:', error);
      if (isMountedRef.current) {
        setUltimoErro('Erro ao carregar usuário');
        setCarregando(false);
      }
    } finally {
      carregandoRef.current = false;
    }
  }, []);

  // Login simplificado
  const login = useCallback(async (email: string, senha: string): Promise<RespostaAuth> => {
    try {
      console.log('🔐 useAuthSimple - Login:', email);
      setCarregando(true);
      setUltimoErro(null);
      invalidarCache();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      });

      if (error || !data.user) {
        console.error('❌ useAuthSimple - Erro de autenticação:', error);
        return { sucesso: false, erro: 'Credenciais inválidas' };
      }

      console.log('✅ useAuthSimple - Autenticação bem-sucedida');
      
      // Aguardar um pouco e carregar usuário
      await new Promise(resolve => setTimeout(resolve, 1000));
      await carregarUsuario();
      
      return { sucesso: true };

    } catch (error) {
      console.error('❌ useAuthSimple - Erro no login:', error);
      return { sucesso: false, erro: 'Erro interno' };
    } finally {
      setCarregando(false);
    }
  }, [carregarUsuario]);

  // Logout simplificado
  const logout = useCallback(async () => {
    try {
      invalidarCache();
      await supabase.auth.signOut();
      setUsuario(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error instanceof Error ? error : new Error('Erro no logout');
    }
  }, []);

  // Effect principal - SIMPLIFICADO
  useEffect(() => {
    isMountedRef.current = true;
    
    // Verificar cache primeiro
    const cache = recuperarCache();
    if (cache?.usuario) {
      console.log('🚀 useAuthSimple - Cache válido encontrado');
      setUsuario(cache.usuario);
      setCarregando(false);
      return;
    }
    
    // Se não há cache, carregar usuário
    carregarUsuario();
    
    // Timeout de segurança
    const timeoutId = setTimeout(() => {
      if (carregando && isMountedRef.current) {
        console.log('⏰ useAuthSimple - Timeout de segurança');
        setCarregando(false);
      }
    }, SAFETY_TIMEOUT);

    // Listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 useAuthSimple - Auth change:', event);
        
        if (event === 'SIGNED_OUT') {
          if (isMountedRef.current) {
            setUsuario(null);
            setCarregando(false);
            invalidarCache();
          }
        } else if (event === 'SIGNED_IN' && session) {
          console.log('✅ useAuthSimple - Usuário logado');
          await carregarUsuario();
        }
      }
    );

    return () => {
      isMountedRef.current = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [carregarUsuario, carregando]);

  return useMemo(() => ({
    usuario,
    carregando,
    autenticado: !!usuario,
    login,
    logout,
    forceLogout,
    erro: ultimoErro
  }), [usuario, carregando, login, logout, forceLogout, ultimoErro]);
}; 