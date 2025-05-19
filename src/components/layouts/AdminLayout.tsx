
import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Package,
  FlaskConical,
  Box,
  LogOut,
  Menu,
  Users,
  Landmark,
  DollarSign
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Sessão finalizada",
        description: "Você foi desconectado com sucesso.",
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message || "Ocorreu um erro ao tentar sair.",
        variant: "destructive",
      });
    }
  };

  // Função para determinar se um link está ativo
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full bg-gray-50 flex">
        {/* Admin Sidebar */}
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader className="border-b border-slate-200">
            <div className="flex items-center justify-center h-14">
              <Link to="/admin" className="text-homeo-green font-semibold text-xl px-2">
                Homeo-AI
              </Link>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === '/admin'}
                  tooltip="Dashboard"
                >
                  <Link to="/admin">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive('/admin/pedidos')}
                  tooltip="Pedidos"
                >
                  <Link to="/admin/pedidos">
                    <Package />
                    <span>Pedidos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      isActive={isActive('/admin/estoque')}
                      tooltip="Estoque"
                    >
                      <FlaskConical />
                      <span>Estoque</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive('/admin/estoque/insumos')}
                        >
                          <Link to="/admin/estoque/insumos">Insumos</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive('/admin/estoque/embalagens')}
                        >
                          <Link to="/admin/estoque/embalagens">Embalagens</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              {/* Financeiro menu item */}
              <SidebarMenuItem>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      isActive={isActive('/admin/financeiro')}
                      tooltip="Financeiro"
                    >
                      <Landmark />
                      <span>Financeiro</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive('/admin/financeiro/caixa')}
                        >
                          <Link to="/admin/financeiro/caixa">Fluxo de Caixa</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive('/admin/financeiro/categorias')}
                        >
                          <Link to="/admin/financeiro/categorias">Categorias</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive('/admin/usuarios')}
                  tooltip="Usuários"
                >
                  <Link to="/admin/usuarios">
                    <Users />
                    <span>Usuários</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="border-t border-slate-200">
            <div className="p-2">
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="w-full justify-start"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        {/* Main Content Area */}
        <SidebarInset>
          {/* Admin Header - Simplified */}
          <header className="bg-white shadow">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
              <div className="flex items-center">
                <SidebarTrigger />
                <h1 className="ml-4 text-lg font-medium text-gray-700 hidden sm:block">
                  Painel Administrativo
                </h1>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
