
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import PrivateRoute from "./components/Auth/PrivateRoute";

const queryClient = new QueryClient();

// Wrap the entire app with React.StrictMode
const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
              
              {/* Usuários Routes */}
              <Route path="/admin/usuarios" element={<UsuariosListPage />} />
              <Route path="/admin/usuarios/novo" element={<NovoUsuarioPage />} />
              <Route path="/admin/usuarios/editar/:id" element={<EditarUsuarioPage />} />
            </Route>

            {/* Catch-all route - must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
