import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import PrivateRoute from "./components/Auth/PrivateRoute";
import FloatingChatbotWidget from "@/components/chatbot/FloatingChatbotWidget";
import { ChatbotProvider } from "@/contexts/ChatbotContext";

const queryClient = new QueryClient();

// Wrap the entire app with React.StrictMode
const App = (): JSX.Element => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider>
          <ChatbotProvider>
            <Toaster />
            <Sonner />
            <FloatingChatbotWidget />
            <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              
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
                
                {/* Financeiro Routes */}
                <Route path="/admin/financeiro/categorias" element={<CategoriasFinanceirasPage />} />
                <Route path="/admin/financeiro/categorias/novo" element={<NovaCategoriaPage />} />
                <Route path="/admin/financeiro/categorias/editar/:id" element={<EditarCategoriaPage />} />
                <Route path="/admin/financeiro/caixa" element={<FluxoCaixaPage />} />
                <Route path="/admin/financeiro/contas-a-pagar" element={<ContasAPagarPage />} />
                <Route path="/admin/financeiro/contas-a-pagar/novo" element={<NovaContaPagarPage />} />
                <Route path="/admin/financeiro/contas-a-pagar/editar/:id" element={<EditarContaPagarPage />} />
                
                {/* Usuários Routes */}
                <Route path="/admin/usuarios" element={<UsuariosListPage />} />
                <Route path="/admin/usuarios/novo" element={<NovoUsuarioPage />} />
                <Route path="/admin/usuarios/editar/:id" element={<EditarUsuarioPage />} />
                
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

              {/* Catch-all route - must be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ChatbotProvider>
      </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
