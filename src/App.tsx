import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import React from "react"; // Explicitly import React
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/index";
import PedidosPage from "./pages/admin/pedidos/index";
import NovaReceitaPage from "./pages/admin/pedidos/nova-receita";
import PrescriptionDetailsPage from "./pages/admin/pedidos/detalhes";
import InsumosPage from "./pages/admin/estoque/insumos/index";
import NovoInsumoPage from "./pages/admin/estoque/insumos/novo";
import EditarInsumoPage from "./pages/admin/estoque/insumos/editar";
import EmbalagensListPage from "./pages/admin/estoque/embalagens/index";
import NovaEmbalagemPage from "./pages/admin/estoque/embalagens/novo";
import EditarEmbalagemPage from "./pages/admin/estoque/embalagens/editar";
import UsuariosListPage from "./pages/admin/usuarios/index";
import NovoUsuarioPage from "./pages/admin/usuarios/novo";
import EditarUsuarioPage from "./pages/admin/usuarios/editar";
import NovoLoteInsumoPage from "./pages/admin/estoque/lotes/novo";
import EditarLoteInsumoPage from "./pages/admin/estoque/lotes/editar/[id]";
import ImportacaoNFPage from "./pages/admin/estoque/importacao-nf";
import FornecedoresPage from "./pages/admin/cadastros/fornecedores/index";
import NovoFornecedorPage from "./pages/admin/cadastros/fornecedores/novo";
import EditarFornecedorPage from "./pages/admin/cadastros/fornecedores/[id]";
import CategoriasFinanceirasPage from "./pages/admin/financeiro/categorias/index";
import NovaCategoriaPage from "./pages/admin/financeiro/categorias/novo";
import EditarCategoriaPage from "./pages/admin/financeiro/categorias/editar";
import FluxoCaixaPage from "./pages/admin/financeiro/caixa/index";
import ContasAPagarPage from "./pages/admin/financeiro/contas-a-pagar/index";
import NovaContaPagarPage from "./pages/admin/financeiro/contas-a-pagar/novo";
import EditarContaPagarPage from "./pages/admin/financeiro/contas-a-pagar/editar/[id]";
import PerfilPage from "./pages/admin/perfil";
import ConfiguracoesPage from "./pages/admin/configuracoes";
import ProcessamentoReceitasPage from "./pages/admin/ia/processamento-receitas";
import PrevisaoDemandaPage from "./pages/admin/ia/previsao-demanda";
import OtimizacaoComprasPage from "./pages/admin/ia/otimizacao-compras";
import AnaliseClientesPage from "./pages/admin/ia/analise-clientes";
import MonitoramentoPage from "./pages/admin/ia/monitoramento";
import OrdensProducaoPage from "./pages/admin/producao/index";
import NovaOrdemProducaoPage from "./pages/admin/producao/nova";
import DetalhesOrdemProducaoPage from "./pages/admin/producao/detalhes";
import EditarOrdemProducaoPage from "./pages/admin/producao/editar";
import ControleQualidadePage from "./pages/admin/producao/controle-qualidade";
import RelatoriosProducaoPage from "./pages/admin/producao/relatorios";
import PrivateRoute from "./components/Auth/PrivateRoute";
import FloatingChatbotWidget from "@/components/chatbot/FloatingChatbotWidget";
import { ChatbotProvider } from "@/contexts/ChatbotContext";
import { useLocation } from "react-router-dom";
import { AuthProvider } from '@/modules/usuarios-permissoes/components/AuthProvider';
import { DashboardRouter } from '@/modules/usuarios-permissoes/components/DashboardRouter';
import { ProtectedComponent } from '@/modules/usuarios-permissoes/components/ProtectedComponent';
import { ModuloSistema, AcaoPermissao } from '@/modules/usuarios-permissoes/types';

const queryClient = new QueryClient();

// Componente para controlar qual chatbot mostrar
const ChatbotController = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Só mostra o chatbot de vendas na landing page (não nas rotas admin)
  if (!isAdminRoute) {
    return <FloatingChatbotWidget />;
  }
  
  return null;
};

// Componente para proteger rotas administrativas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedComponent
      modulo={ModuloSistema.USUARIOS_PERMISSOES}
      acao={AcaoPermissao.LER}
      fallback={<Navigate to="/login" replace />}
    >
      {children}
    </ProtectedComponent>
  );
};

// Wrap the entire app with React.StrictMode
const App = (): JSX.Element => (
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            <ChatbotProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ChatbotController />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/esqueci-senha" element={<div>Página de recuperação de senha</div>} />
                  
                  {/* Protected Routes */}
                  <Route element={<PrivateRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/pedidos" element={<PedidosPage />} />
                    <Route path="/admin/pedidos/nova-receita" element={<NovaReceitaPage />} />
                    <Route path="/admin/pedidos/:id" element={<PrescriptionDetailsPage />} />
                    
                    {/* Estoque Routes */}
                    <Route path="/admin/estoque/insumos" element={<InsumosPage />} />
                    <Route path="/admin/estoque/insumos/novo" element={<NovoInsumoPage />} />
                    <Route path="/admin/estoque/insumos/editar/:id" element={<EditarInsumoPage />} />
                    
                    {/* Embalagens Routes */}
                    <Route path="/admin/estoque/embalagens" element={<EmbalagensListPage />} />
                    <Route path="/admin/estoque/embalagens/novo" element={<NovaEmbalagemPage />} />
                    <Route path="/admin/estoque/embalagens/editar/:id" element={<EditarEmbalagemPage />} />
                    
                    {/* Lotes Routes */}
                    <Route path="/admin/estoque/lotes/novo" element={<NovoLoteInsumoPage />} />
                    <Route path="/admin/estoque/lotes/editar/:id" element={<EditarLoteInsumoPage />} />
                    
                    {/* Importação NF-e */}
                    <Route path="/admin/estoque/importacao-nf" element={<ImportacaoNFPage />} />
                    
                    {/* Financeiro Routes */}
                    <Route path="/admin/financeiro/categorias" element={<CategoriasFinanceirasPage />} />
                    <Route path="/admin/financeiro/categorias/novo" element={<NovaCategoriaPage />} />
                    <Route path="/admin/financeiro/categorias/editar/:id" element={<EditarCategoriaPage />} />
                    <Route path="/admin/financeiro/caixa" element={<FluxoCaixaPage />} />
                    <Route path="/admin/financeiro/contas-a-pagar" element={<ContasAPagarPage />} />
                    <Route path="/admin/financeiro/contas-a-pagar/novo" element={<NovaContaPagarPage />} />
                    <Route path="/admin/financeiro/contas-a-pagar/editar/:id" element={<EditarContaPagarPage />} />
                    
                    {/* Cadastros Routes */}
                    <Route path="/admin/cadastros/fornecedores" element={<FornecedoresPage />} />
                    <Route path="/admin/cadastros/fornecedores/novo" element={<NovoFornecedorPage />} />
                    <Route path="/admin/cadastros/fornecedores/editar/:id" element={<EditarFornecedorPage />} />
                    
                    {/* Usuários Routes */}
                    <Route path="/admin/usuarios" element={<UsuariosListPage />} />
                    <Route path="/admin/usuarios/novo" element={<NovoUsuarioPage />} />
                    <Route path="/admin/usuarios/editar/:id" element={<EditarUsuarioPage />} />
                    
                    {/* Produção Routes */}
                    <Route path="/admin/producao" element={<OrdensProducaoPage />} />
                    <Route path="/admin/producao/nova" element={<NovaOrdemProducaoPage />} />
                    <Route path="/admin/producao/relatorios" element={<RelatoriosProducaoPage />} />
                    <Route path="/admin/producao/:id" element={<DetalhesOrdemProducaoPage />} />
                    <Route path="/admin/producao/:id/editar" element={<EditarOrdemProducaoPage />} />
                    <Route path="/admin/producao/:id/controle-qualidade" element={<ControleQualidadePage />} />
                    
                    {/* IA Routes */}
                    <Route path="/admin/ia/processamento-receitas" element={<ProcessamentoReceitasPage />} />
                    <Route path="/admin/ia/previsao-demanda" element={<PrevisaoDemandaPage />} />
                    <Route path="/admin/ia/otimizacao-compras" element={<OtimizacaoComprasPage />} />
                    <Route path="/admin/ia/analise-clientes" element={<AnaliseClientesPage />} />
                    <Route path="/admin/ia/monitoramento" element={<MonitoramentoPage />} />
                    
                    {/* Perfil e Configurações Routes */}
                    <Route path="/admin/perfil" element={<PerfilPage />} />
                    <Route path="/admin/configuracoes" element={<ConfiguracoesPage />} />
                  </Route>

                  {/* Dashboard Principal - Roteamento Automático */}
                  <Route 
                    path="/admin/*" 
                    element={
                      <ProtectedRoute>
                        <DashboardRouter />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Rotas Específicas de Dashboards */}
                  <Route 
                    path="/admin/dashboard/*" 
                    element={
                      <ProtectedRoute>
                        <DashboardRouter />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Gestão de Usuários */}
                  <Route 
                    path="/admin/usuarios" 
                    element={
                      <ProtectedComponent
                        modulo={ModuloSistema.USUARIOS_PERMISSOES}
                        acao={AcaoPermissao.LER}
                        fallback={<Navigate to="/admin" replace />}
                      >
                        <UsuariosListPage />
                      </ProtectedComponent>
                    } 
                  />
                  <Route 
                    path="/admin/usuarios/novo" 
                    element={
                      <ProtectedComponent
                        modulo={ModuloSistema.USUARIOS_PERMISSOES}
                        acao={AcaoPermissao.CRIAR}
                        fallback={<Navigate to="/admin" replace />}
                      >
                        <NovoUsuarioPage />
                      </ProtectedComponent>
                    } 
                  />
                  <Route 
                    path="/admin/usuarios/editar/:id" 
                    element={
                      <ProtectedComponent
                        modulo={ModuloSistema.USUARIOS_PERMISSOES}
                        acao={AcaoPermissao.EDITAR}
                        fallback={<Navigate to="/admin" replace />}
                      >
                        <EditarUsuarioPage />
                      </ProtectedComponent>
                    } 
                  />
                  
                  {/* Módulos do Sistema - Exemplos */}
                  <Route 
                    path="/admin/cadastros/*" 
                    element={
                      <ProtectedComponent
                        modulo={ModuloSistema.CADASTROS_ESSENCIAIS}
                        acao={AcaoPermissao.LER}
                        fallback={<Navigate to="/admin" replace />}
                      >
                        <div>Módulo de Cadastros</div>
                      </ProtectedComponent>
                    } 
                  />
                  
                  <Route 
                    path="/admin/atendimento/*" 
                    element={
                      <ProtectedComponent
                        modulo={ModuloSistema.ATENDIMENTO}
                        acao={AcaoPermissao.LER}
                        fallback={<Navigate to="/admin" replace />}
                      >
                        <div>Módulo de Atendimento</div>
                      </ProtectedComponent>
                    } 
                  />
                  
                  <Route 
                    path="/admin/estoque/*" 
                    element={
                      <ProtectedComponent
                        modulo={ModuloSistema.ESTOQUE}
                        acao={AcaoPermissao.LER}
                        fallback={<Navigate to="/admin" replace />}
                      >
                        <div>Módulo de Estoque</div>
                      </ProtectedComponent>
                    } 
                  />
                  
                  <Route 
                    path="/admin/financeiro/*" 
                    element={
                      <ProtectedComponent
                        modulo={ModuloSistema.FINANCEIRO}
                        acao={AcaoPermissao.LER}
                        fallback={<Navigate to="/admin" replace />}
                      >
                        <div>Módulo Financeiro</div>
                      </ProtectedComponent>
                    } 
                  />
                  
                  <Route 
                    path="/admin/pdv/*" 
                    element={
                      <ProtectedComponent
                        modulo={ModuloSistema.PDV}
                        acao={AcaoPermissao.LER}
                        fallback={<Navigate to="/admin" replace />}
                      >
                        <div>Módulo PDV</div>
                      </ProtectedComponent>
                    } 
                  />
                  
                  <Route 
                    path="/admin/relatorios/*" 
                    element={
                      <ProtectedComponent
                        modulo={ModuloSistema.RELATORIOS}
                        acao={AcaoPermissao.LER}
                        fallback={<Navigate to="/admin" replace />}
                      >
                        <div>Módulo de Relatórios</div>
                      </ProtectedComponent>
                    } 
                  />
                  
                  {/* Páginas de Erro */}
                  <Route path="/acesso-negado" element={<div>Acesso Negado</div>} />
                  <Route path="/404" element={<div>Página não encontrada</div>} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </BrowserRouter>
            </ChatbotProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);

export default App;
