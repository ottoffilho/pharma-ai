// Tipos para o Sistema de Usuários e Permissões - Pharma.AI
// Módulo: M09-USUARIOS_PERMISSOES

/**
 * Perfis de usuário disponíveis no sistema
 */
export enum PerfilUsuario {
  PROPRIETARIO = 'PROPRIETARIO',
  FARMACEUTICO = 'FARMACEUTICO', 
  ATENDENTE = 'ATENDENTE',
  MANIPULADOR = 'MANIPULADOR',
  CUSTOMIZADO = 'CUSTOMIZADO'
}

/**
 * Tipos de dashboard disponíveis
 */
export enum TipoDashboard {
  ADMINISTRATIVO = 'administrativo',
  OPERACIONAL = 'operacional', 
  ATENDIMENTO = 'atendimento',
  PRODUCAO = 'producao'
}

/**
 * Módulos do sistema
 */
export enum ModuloSistema {
  CADASTROS_ESSENCIAIS = 'cadastros_essenciais',
  ATENDIMENTO = 'atendimento',
  ORCAMENTACAO = 'orcamentacao', 
  ESTOQUE = 'estoque',
  MANIPULACAO = 'manipulacao',
  FINANCEIRO = 'financeiro',
  FISCAL = 'fiscal',
  PDV = 'pdv',
  USUARIOS_PERMISSOES = 'usuarios_permissoes',
  RELATORIOS = 'relatorios',
  CONFIGURACOES = 'configuracoes'
}

/**
 * Ações possíveis em cada módulo
 */
export enum AcaoPermissao {
  CRIAR = 'criar',
  LER = 'ler', 
  EDITAR = 'editar',
  EXCLUIR = 'excluir',
  APROVAR = 'aprovar',
  EXPORTAR = 'exportar'
}

/**
 * Níveis de acesso aos dados
 */
export enum NivelAcesso {
  PROPRIO = 'proprio',     // Apenas dados próprios
  SETOR = 'setor',         // Dados do setor/equipe
  TODOS = 'todos'          // Todos os dados
}

/**
 * Interface para uma permissão específica
 */
export interface Permissao {
  id: string;
  modulo: ModuloSistema;
  acao: AcaoPermissao;
  nivel: NivelAcesso;
  condicoes?: Record<string, any>; // Condições específicas (ex: horário, IP)
}

/**
 * Interface para perfil de usuário
 */
export interface PerfilUsuarioInterface {
  id: string;
  nome: string;
  tipo: PerfilUsuario;
  dashboard: TipoDashboard;
  descricao?: string;
  permissoes: Permissao[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Interface para usuário do sistema
 */
export interface Usuario {
  id: string;
  email: string;
  nome: string;
  telefone?: string;
  perfil_id: string;
  perfil?: PerfilUsuarioInterface;
  ativo: boolean;
  ultimo_acesso?: string;
  created_at: string;
  updated_at: string;
  
  // Campos específicos do Supabase Auth
  auth_id?: string;
  email_confirmado?: boolean;
}

/**
 * Interface para sessão do usuário
 */
export interface SessaoUsuario {
  usuario: Usuario;
  permissoes: Permissao[];
  dashboard: TipoDashboard;
  token?: string;
  expires_at?: string;
}

/**
 * Interface para log de auditoria
 */
export interface LogAuditoria {
  id: string;
  usuario_id: string;
  usuario?: Usuario;
  acao: string;
  modulo: ModuloSistema;
  recurso: string;
  dados_anteriores?: Record<string, any>;
  dados_novos?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

/**
 * Interface para configurações de segurança
 */
export interface ConfiguracaoSeguranca {
  id: string;
  max_tentativas_login: number;
  tempo_bloqueio_minutos: number;
  tempo_sessao_horas: number;
  exigir_2fa: boolean;
  ips_permitidos?: string[];
  horarios_permitidos?: {
    inicio: string;
    fim: string;
    dias_semana: number[];
  };
  created_at: string;
  updated_at: string;
}

/**
 * Interface para resposta de autenticação
 */
export interface RespostaAuth {
  sucesso: boolean;
  usuario?: SessaoUsuario;
  erro?: string;
  requer_2fa?: boolean;
}

/**
 * Interface para criação/edição de usuário
 */
export interface CriarEditarUsuario {
  email: string;
  nome: string;
  telefone?: string;
  perfil_id: string;
  senha?: string;
  ativo: boolean;
}

/**
 * Interface para filtros de usuários
 */
export interface FiltrosUsuarios {
  perfil?: PerfilUsuario;
  ativo?: boolean;
  busca?: string;
  data_inicio?: string;
  data_fim?: string;
}

/**
 * Interface para estatísticas de usuários
 */
export interface EstatisticasUsuarios {
  total: number;
  ativos: number;
  por_perfil: Record<PerfilUsuario, number>;
  ultimos_acessos: {
    hoje: number;
    semana: number;
    mes: number;
  };
}

/**
 * Utilitários de tipo para verificação de permissões
 */
export type VerificarPermissao = (
  modulo: ModuloSistema,
  acao: AcaoPermissao,
  nivel?: NivelAcesso
) => boolean;

export type TemPermissao = (permissao: string) => boolean;

/**
 * Props para componentes de proteção
 */
export interface ProtecaoProps {
  children: React.ReactNode;
  modulo: ModuloSistema;
  acao: AcaoPermissao;
  nivel?: NivelAcesso;
  fallback?: React.ReactNode;
}

/**
 * Props para dashboards
 */
export interface DashboardProps {
  usuario: Usuario;
  permissoes: Permissao[];
} 