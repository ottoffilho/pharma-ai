// Hook de Autenticação - Pharma.AI
// Módulo: M09-USUARIOS_PERMISSOES

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { AuthService } from '../services/authService';
import type {
  SessaoUsuario,
  RespostaAuth,
  ModuloSistema,
  AcaoPermissao,
  NivelAcesso,
  VerificarPermissao
} from '../types';

/**
 * Interface do contexto de autenticação
 */
interface AuthContextType {
  usuario: SessaoUsuario | null;
  carregando: boolean;
  autenticado: boolean;
  login: (email: string, senha: string) => Promise<RespostaAuth>;
  logout: () => Promise<void>;
  verificarPermissao: VerificarPermissao;
  temPermissao: (modulo: ModuloSistema, acao: AcaoPermissao, nivel?: NivelAcesso) => boolean;
  recarregarUsuario: () => Promise<void>;
}

/**
 * Contexto de autenticação
 */
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Hook principal de autenticação
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

/**
 * Hook para gerenciar estado de autenticação
 */
export const useAuthState = () => {
  const [usuario, setUsuario] = useState<SessaoUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  /**
   * Carrega usuário atual da sessão
   */
  const carregarUsuario = useCallback(async () => {
    try {
      setCarregando(true);
      const usuarioAtual = await AuthService.obterUsuarioAtual();
      setUsuario(usuarioAtual);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  /**
   * Realiza login
   */
  const login = useCallback(async (email: string, senha: string): Promise<RespostaAuth> => {
    try {
      setCarregando(true);
      const resposta = await AuthService.login(email, senha);
      
      if (resposta.sucesso && resposta.usuario) {
        setUsuario(resposta.usuario);
      }
      
      return resposta;
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        sucesso: false,
        erro: 'Erro interno do servidor'
      };
    } finally {
      setCarregando(false);
    }
  }, []);

  /**
   * Realiza logout
   */
  const logout = useCallback(async () => {
    try {
      setCarregando(true);
      await AuthService.logout();
      setUsuario(null);
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setCarregando(false);
    }
  }, []);

  /**
   * Verifica se usuário tem permissão específica
   */
  const verificarPermissao = useCallback((
    modulo: ModuloSistema,
    acao: AcaoPermissao,
    nivel?: NivelAcesso
  ): boolean => {
    if (!usuario?.permissoes) {
      return false;
    }

    return AuthService.verificarPermissao(
      usuario.permissoes,
      modulo,
      acao,
      nivel
    );
  }, [usuario]);

  /**
   * Alias para verificarPermissao (compatibilidade)
   */
  const temPermissao = useCallback((
    modulo: ModuloSistema,
    acao: AcaoPermissao,
    nivel?: NivelAcesso
  ): boolean => {
    return verificarPermissao(modulo, acao, nivel);
  }, [verificarPermissao]);

  /**
   * Recarrega dados do usuário
   */
  const recarregarUsuario = useCallback(async () => {
    await carregarUsuario();
  }, [carregarUsuario]);

  // Carregar usuário na inicialização
  useEffect(() => {
    carregarUsuario();
  }, [carregarUsuario]);

  return {
    usuario,
    carregando,
    autenticado: !!usuario,
    login,
    logout,
    verificarPermissao,
    temPermissao,
    recarregarUsuario
  };
};

/**
 * Hook para verificar permissões específicas
 */
export const usePermissoes = () => {
  const { usuario, verificarPermissao } = useAuth();

  /**
   * Verifica se é proprietário
   */
  const isProprietario = useCallback((): boolean => {
    return usuario?.usuario.perfil?.tipo === 'PROPRIETARIO';
  }, [usuario]);

  /**
   * Verifica se é farmacêutico
   */
  const isFarmaceutico = useCallback((): boolean => {
    return usuario?.usuario.perfil?.tipo === 'FARMACEUTICO';
  }, [usuario]);

  /**
   * Verifica se é atendente
   */
  const isAtendente = useCallback((): boolean => {
    return usuario?.usuario.perfil?.tipo === 'ATENDENTE';
  }, [usuario]);

  /**
   * Verifica se é manipulador
   */
  const isManipulador = useCallback((): boolean => {
    return usuario?.usuario.perfil?.tipo === 'MANIPULADOR';
  }, [usuario]);

  /**
   * Verifica se pode acessar módulo financeiro
   */
  const podeAcessarFinanceiro = useCallback((): boolean => {
    return verificarPermissao(ModuloSistema.FINANCEIRO, AcaoPermissao.LER);
  }, [verificarPermissao]);

  /**
   * Verifica se pode gerenciar usuários
   */
  const podeGerenciarUsuarios = useCallback((): boolean => {
    return verificarPermissao(ModuloSistema.USUARIOS_PERMISSOES, AcaoPermissao.CRIAR);
  }, [verificarPermissao]);

  /**
   * Verifica se pode aprovar manipulações
   */
  const podeAprovarManipulacoes = useCallback((): boolean => {
    return verificarPermissao(ModuloSistema.MANIPULACAO, AcaoPermissao.APROVAR);
  }, [verificarPermissao]);

  /**
   * Verifica se pode acessar relatórios
   */
  const podeAcessarRelatorios = useCallback((): boolean => {
    return verificarPermissao(ModuloSistema.RELATORIOS, AcaoPermissao.LER);
  }, [verificarPermissao]);

  /**
   * Verifica se pode exportar dados
   */
  const podeExportarDados = useCallback((): boolean => {
    return verificarPermissao(ModuloSistema.RELATORIOS, AcaoPermissao.EXPORTAR);
  }, [verificarPermissao]);

  /**
   * Verifica se pode editar configurações
   */
  const podeEditarConfiguracoes = useCallback((): boolean => {
    return verificarPermissao(ModuloSistema.CONFIGURACOES, AcaoPermissao.EDITAR);
  }, [verificarPermissao]);

  return {
    isProprietario,
    isFarmaceutico,
    isAtendente,
    isManipulador,
    podeAcessarFinanceiro,
    podeGerenciarUsuarios,
    podeAprovarManipulacoes,
    podeAcessarRelatorios,
    podeExportarDados,
    podeEditarConfiguracoes,
    verificarPermissao
  };
};

/**
 * Hook para gerenciar usuários (apenas para administradores)
 */
export const useUsuarios = () => {
  const { verificarPermissao } = useAuth();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [estatisticas, setEstatisticas] = useState<any>(null);

  /**
   * Verifica se pode gerenciar usuários
   */
  const podeGerenciar = verificarPermissao(
    ModuloSistema.USUARIOS_PERMISSOES,
    AcaoPermissao.CRIAR
  );

  /**
   * Lista usuários
   */
  const listarUsuarios = useCallback(async (filtros = {}) => {
    if (!podeGerenciar) {
      throw new Error('Sem permissão para listar usuários');
    }

    try {
      setCarregando(true);
      const lista = await AuthService.listarUsuarios(filtros);
      setUsuarios(lista);
      return lista;
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw error;
    } finally {
      setCarregando(false);
    }
  }, [podeGerenciar]);

  /**
   * Cria usuário
   */
  const criarUsuario = useCallback(async (dados: any) => {
    if (!podeGerenciar) {
      throw new Error('Sem permissão para criar usuários');
    }

    try {
      const resultado = await AuthService.criarUsuario(dados);
      
      if (resultado.sucesso) {
        // Recarregar lista
        await listarUsuarios();
      }
      
      return resultado;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }, [podeGerenciar, listarUsuarios]);

  /**
   * Atualiza usuário
   */
  const atualizarUsuario = useCallback(async (id: string, dados: any) => {
    if (!podeGerenciar) {
      throw new Error('Sem permissão para atualizar usuários');
    }

    try {
      const resultado = await AuthService.atualizarUsuario(id, dados);
      
      if (resultado.sucesso) {
        // Recarregar lista
        await listarUsuarios();
      }
      
      return resultado;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }, [podeGerenciar, listarUsuarios]);

  /**
   * Carrega estatísticas
   */
  const carregarEstatisticas = useCallback(async () => {
    if (!podeGerenciar) {
      return;
    }

    try {
      const stats = await AuthService.obterEstatisticas();
      setEstatisticas(stats);
      return stats;
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, [podeGerenciar]);

  return {
    usuarios,
    carregando,
    estatisticas,
    podeGerenciar,
    listarUsuarios,
    criarUsuario,
    atualizarUsuario,
    carregarEstatisticas
  };
}; 