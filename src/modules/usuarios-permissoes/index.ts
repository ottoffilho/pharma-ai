// Módulo de Usuários e Permissões - Pharma.AI
// Exportações principais do módulo M09-USUARIOS_PERMISSOES

// Tipos
export * from './types';

// Serviços
export { AuthService } from './services/authService';

// Hooks
export {
  useAuth,
  useAuthState,
  usePermissoes,
  useUsuarios,
  AuthContext
} from './hooks/useAuth';

// Componentes
export { AuthProvider } from './components/AuthProvider';
export {
  ProtectedComponent,
  withPermission,
  ProprietarioOnly,
  FarmaceuticoOnly,
  PerfilBased,
  AcessoNegado,
  usePermissionCheck
} from './components/ProtectedComponent';
export { DashboardAdministrativo } from './components/DashboardAdministrativo';
export { DashboardAtendimento } from './components/DashboardAtendimento';
export { DashboardRouter, useDashboardInfo } from './components/DashboardRouter'; 