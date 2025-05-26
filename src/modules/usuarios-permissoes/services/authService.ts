// Serviço de Autenticação e Permissões - Pharma.AI
// Módulo: M09-USUARIOS_PERMISSOES

import { supabase } from '../../../services/supabase';
import type {
  Usuario,
  SessaoUsuario,
  RespostaAuth,
  CriarEditarUsuario,
  FiltrosUsuarios,
  EstatisticasUsuarios,
  LogAuditoria,
  PerfilUsuarioInterface,
  ModuloSistema,
  AcaoPermissao,
  NivelAcesso,
  PerfilUsuario
} from '../types';

/**
 * Serviço de Autenticação e Gerenciamento de Usuários
 */
export class AuthService {
  
  /**
   * Realiza login do usuário
   */
  static async login(email: string, senha: string): Promise<RespostaAuth> {
    try {
      // Autenticação via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      });

      if (authError) {
        return {
          sucesso: false,
          erro: 'Credenciais inválidas'
        };
      }

      // Buscar dados completos do usuário
      const usuario = await this.obterUsuarioCompleto(authData.user.id);
      
      if (!usuario) {
        return {
          sucesso: false,
          erro: 'Usuário não encontrado no sistema'
        };
      }

      if (!usuario.ativo) {
        return {
          sucesso: false,
          erro: 'Usuário inativo. Contate o administrador.'
        };
      }

      // Registrar log de acesso
      await this.registrarLogAuditoria(
        usuario.id,
        'LOGIN',
        ModuloSistema.USUARIOS_PERMISSOES,
        'sessao',
        {},
        { timestamp: new Date().toISOString() }
      );

      // Atualizar último acesso
      await this.atualizarUltimoAcesso(usuario.id);

      const sessao: SessaoUsuario = {
        usuario,
        permissoes: usuario.perfil?.permissoes || [],
        dashboard: usuario.perfil?.dashboard || 'atendimento',
        token: authData.session?.access_token,
        expires_at: authData.session?.expires_at?.toString()
      };

      return {
        sucesso: true,
        usuario: sessao
      };

    } catch (error) {
      console.error('Erro no login:', error);
      return {
        sucesso: false,
        erro: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Realiza logout do usuário
   */
  static async logout(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Registrar log de logout
        const usuario = await this.obterUsuarioCompleto(user.id);
        if (usuario) {
          await this.registrarLogAuditoria(
            usuario.id,
            'LOGOUT',
            ModuloSistema.USUARIOS_PERMISSOES,
            'sessao',
            {},
            { timestamp: new Date().toISOString() }
          );
        }
      }

      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  }

  /**
   * Obtém usuário atual da sessão
   */
  static async obterUsuarioAtual(): Promise<SessaoUsuario | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }

      const usuario = await this.obterUsuarioCompleto(user.id);
      
      if (!usuario || !usuario.ativo) {
        return null;
      }

      return {
        usuario,
        permissoes: usuario.perfil?.permissoes || [],
        dashboard: usuario.perfil?.dashboard || 'atendimento'
      };

    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }

  /**
   * Obtém dados completos do usuário incluindo perfil e permissões
   */
  static async obterUsuarioCompleto(authId: string): Promise<Usuario | null> {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          perfil:perfis_usuario(
            *,
            permissoes:permissoes_perfil(
              permissao:permissoes(*)
            )
          )
        `)
        .eq('auth_id', authId)
        .single();

      if (error || !data) {
        return null;
      }

      // Transformar permissões para formato adequado
      const permissoes = data.perfil?.permissoes?.map((p: any) => p.permissao) || [];
      
      return {
        ...data,
        perfil: data.perfil ? {
          ...data.perfil,
          permissoes
        } : undefined
      };

    } catch (error) {
      console.error('Erro ao obter usuário completo:', error);
      return null;
    }
  }

  /**
   * Verifica se usuário tem permissão específica
   */
  static verificarPermissao(
    permissoes: any[],
    modulo: ModuloSistema,
    acao: AcaoPermissao,
    nivel?: NivelAcesso
  ): boolean {
    return permissoes.some(p => 
      p.modulo === modulo && 
      p.acao === acao && 
      (!nivel || p.nivel === nivel || p.nivel === NivelAcesso.TODOS)
    );
  }

  /**
   * Cria novo usuário
   */
  static async criarUsuario(dados: CriarEditarUsuario): Promise<{ sucesso: boolean; erro?: string; usuario?: Usuario }> {
    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: dados.email,
        password: dados.senha || this.gerarSenhaTemporaria(),
        email_confirm: true
      });

      if (authError) {
        return {
          sucesso: false,
          erro: 'Erro ao criar usuário: ' + authError.message
        };
      }

      // Criar registro na tabela usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .insert({
          auth_id: authData.user.id,
          email: dados.email,
          nome: dados.nome,
          telefone: dados.telefone,
          perfil_id: dados.perfil_id,
          ativo: dados.ativo
        })
        .select()
        .single();

      if (userError) {
        // Reverter criação no Auth se falhou na tabela
        await supabase.auth.admin.deleteUser(authData.user.id);
        return {
          sucesso: false,
          erro: 'Erro ao salvar dados do usuário'
        };
      }

      return {
        sucesso: true,
        usuario: userData
      };

    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return {
        sucesso: false,
        erro: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Lista usuários com filtros
   */
  static async listarUsuarios(filtros: FiltrosUsuarios = {}): Promise<Usuario[]> {
    try {
      let query = supabase
        .from('usuarios')
        .select(`
          *,
          perfil:perfis_usuario(*)
        `);

      if (filtros.ativo !== undefined) {
        query = query.eq('ativo', filtros.ativo);
      }

      if (filtros.busca) {
        query = query.or(`nome.ilike.%${filtros.busca}%,email.ilike.%${filtros.busca}%`);
      }

      if (filtros.data_inicio) {
        query = query.gte('created_at', filtros.data_inicio);
      }

      if (filtros.data_fim) {
        query = query.lte('created_at', filtros.data_fim);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return [];
    }
  }

  /**
   * Atualiza usuário
   */
  static async atualizarUsuario(id: string, dados: Partial<CriarEditarUsuario>): Promise<{ sucesso: boolean; erro?: string }> {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update(dados)
        .eq('id', id);

      if (error) {
        return {
          sucesso: false,
          erro: 'Erro ao atualizar usuário'
        };
      }

      return { sucesso: true };

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return {
        sucesso: false,
        erro: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Registra log de auditoria
   */
  static async registrarLogAuditoria(
    usuarioId: string,
    acao: string,
    modulo: ModuloSistema,
    recurso: string,
    dadosAnteriores: Record<string, any>,
    dadosNovos: Record<string, any>
  ): Promise<void> {
    try {
      await supabase
        .from('logs_auditoria')
        .insert({
          usuario_id: usuarioId,
          acao,
          modulo,
          recurso,
          dados_anteriores: dadosAnteriores,
          dados_novos: dadosNovos,
          ip_address: await this.obterIP(),
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Erro ao registrar log de auditoria:', error);
    }
  }

  /**
   * Atualiza último acesso do usuário
   */
  private static async atualizarUltimoAcesso(usuarioId: string): Promise<void> {
    try {
      await supabase
        .from('usuarios')
        .update({ ultimo_acesso: new Date().toISOString() })
        .eq('id', usuarioId);
    } catch (error) {
      console.error('Erro ao atualizar último acesso:', error);
    }
  }

  /**
   * Gera senha temporária
   */
  private static gerarSenhaTemporaria(): string {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
  }

  /**
   * Obtém IP do usuário
   */
  private static async obterIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Obtém estatísticas de usuários
   */
  static async obterEstatisticas(): Promise<EstatisticasUsuarios> {
    try {
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('ativo, perfil:perfis_usuario(tipo), ultimo_acesso');

      const total = usuarios?.length || 0;
      const ativos = usuarios?.filter(u => u.ativo).length || 0;
      
      const porPerfil = usuarios?.reduce((acc, u) => {
        const tipo = u.perfil?.tipo || PerfilUsuario.ATENDENTE;
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {} as Record<PerfilUsuario, number>) || {} as Record<PerfilUsuario, number>;

      const agora = new Date();
      const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
      const semanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
      const mesAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);

      const ultimosAcessos = {
        hoje: usuarios?.filter(u => u.ultimo_acesso && new Date(u.ultimo_acesso) >= hoje).length || 0,
        semana: usuarios?.filter(u => u.ultimo_acesso && new Date(u.ultimo_acesso) >= semanaAtras).length || 0,
        mes: usuarios?.filter(u => u.ultimo_acesso && new Date(u.ultimo_acesso) >= mesAtras).length || 0
      };

      return {
        total,
        ativos,
        por_perfil: porPerfil,
        ultimos_acessos: ultimosAcessos
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        total: 0,
        ativos: 0,
        por_perfil: {} as Record<PerfilUsuario, number>,
        ultimos_acessos: { hoje: 0, semana: 0, mes: 0 }
      };
    }
  }
} 