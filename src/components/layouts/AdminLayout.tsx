import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronsLeft, 
  ChevronDown,
  Home, 
  LayoutDashboard, 
  ListFilter, 
  Package, 
  PanelLeft, 
  PanelLeftClose,
  Users, 
  FileText, 
  DatabaseBackup, 
  Database,
  Box,
  BadgePercent,
  DollarSign,
  PieChart,
  Receipt,
  Brain,
  Sparkles,
  TrendingUp,
  Target,
  BarChart3,
  Monitor,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuthSimple } from '@/modules/usuarios-permissoes/hooks/useAuthSimple';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import AdminChatbotWidget from '@/components/chatbot/AdminChatbotWidget';
import { useResizeObserver } from '@/hooks/use-resize-observer';

// Importando as imagens do logo
import logoImagem from '@/assets/logo/pharma-image2.png';
import logoTexto from '@/assets/logo/pharma-texto2.png';
import logoHorizontal from '@/assets/logo/phama-horizon.png';
import logoIcon from '@/assets/logo/Sem nome (500 x 500 px).png';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarDropdown,
  SidebarProvider
} from '@/components/ui/sidebar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mainContentRef, mainContentSize] = useResizeObserver<HTMLDivElement>();
  const [databaseError, setDatabaseError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { usuario, logout, carregando } = useAuthSimple();

  // Verificar se as tabelas essenciais existem
  useEffect(() => {
    const verificarTabelas = async () => {
      try {
        // Tentar acessar algumas tabelas essenciais para verificar se existem
        const { error: usuariosError } = await supabase
          .from('usuarios')
          .select('id')
          .limit(1);
        
        if (usuariosError) {
          console.error('Erro ao acessar tabela de usuários:', usuariosError);
          setDatabaseError(true);
          setErrorMessage('A tabela de usuários não foi encontrada no banco de dados. O sistema pode estar com problemas.');
          return;
        }

        // Se chegou aqui, não encontrou erros
        setDatabaseError(false);
      } catch (error) {
        console.error('Erro ao verificar tabelas:', error);
        setDatabaseError(true);
        setErrorMessage('Ocorreu um erro ao acessar o banco de dados. O sistema pode estar com problemas.');
      }
    };

    // Executar verificação apenas se o usuário estiver autenticado
    if (usuario && !carregando) {
      verificarTabelas();
    }
  }, [usuario, carregando]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Navigation links
  const navLinks = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="h-5 w-5 text-homeo-blue" />,
    },
    {
      title: 'Inteligência Artificial',
      href: '/admin/ia',
      icon: <Brain className="h-5 w-5 text-homeo-accent" />,
      submenu: [
        { title: 'Processamento de Receitas', href: '/admin/ia/processamento-receitas' },
        { title: 'Previsão de Demanda', href: '/admin/ia/previsao-demanda' },
        { title: 'Otimização de Compras', href: '/admin/ia/otimizacao-compras' },
        { title: 'Análise de Clientes', href: '/admin/ia/analise-clientes' },
        { title: 'Monitoramento IA', href: '/admin/ia/monitoramento' },
      ],
    },
    {
      title: 'Pedidos',
      href: '/admin/pedidos',
      icon: <FileText className="h-5 w-5 text-homeo-green" />,
      submenu: [
        { title: 'Listar Pedidos', href: '/admin/pedidos' },
        { title: 'Nova Receita', href: '/admin/pedidos/nova-receita' },
      ],
    },
    {
      title: 'Estoque',
      href: '/admin/estoque',
      icon: <Box className="h-5 w-5 text-orange-500" />,
      submenu: [
        { title: 'Insumos', href: '/admin/estoque/insumos' },
        { title: 'Embalagens', href: '/admin/estoque/embalagens' },
        { title: 'Novo Lote', href: '/admin/estoque/lotes/novo' },
        { title: 'Importar NF-e', href: '/admin/estoque/importacao-nf' },
      ],
    },
    {
      title: 'Produção',
      href: '/admin/producao/overview',
      icon: <Package className="h-5 w-5 text-blue-500" />,
      submenu: [
        { title: 'Ordens de Produção', href: '/admin/producao' },
        { title: 'Nova Ordem', href: '/admin/producao/nova' },
      ],
    },
    {
      title: 'Financeiro',
      href: '/admin/financeiro',
      icon: <DollarSign className="h-5 w-5 text-emerald-600" />,
      submenu: [
        { title: 'Categorias', href: '/admin/financeiro/categorias' },
        { title: 'Fluxo de Caixa', href: '/admin/financeiro/caixa' },
        { title: 'Contas a Pagar', href: '/admin/financeiro/contas-a-pagar' },
      ],
    },
    {
      title: 'Cadastros',
      href: '/admin/cadastros',
      icon: <Database className="h-5 w-5 text-indigo-500" />,
      submenu: [
        { title: 'Fornecedores', href: '/admin/cadastros/fornecedores' },
      ],
    },
    {
      title: 'Usuários',
      href: '/admin/usuarios',
      icon: <Users className="h-5 w-5 text-purple-500" />,
    },
  ];

  // Se encontrou erro no banco de dados, mostrar alerta
  if (databaseError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-[450px] shadow-lg">
          <CardHeader className="bg-red-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <CardTitle>Problema no Sistema</CardTitle>
            </div>
            <CardDescription>
              Foi detectado um problema no banco de dados do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro de Conexão</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Tabelas necessárias não encontradas no banco de dados.'}
              </AlertDescription>
            </Alert>
            
            <p className="text-sm text-gray-600 mb-4">
              O sistema não consegue acessar as tabelas necessárias para o funcionamento
              correto. Isso pode ser causado por uma manutenção no banco de dados
              ou por problemas na conexão.
            </p>
            
            <div className="p-4 bg-amber-50 rounded-md border border-amber-200 mb-4">
              <h3 className="font-medium text-amber-800 mb-1">Instruções para resolver:</h3>
              <ol className="text-sm text-amber-700 space-y-1 pl-4 list-decimal">
                <li>Faça logout utilizando o botão abaixo</li>
                <li>Limpe o cache do navegador (Ctrl+F5)</li> 
                <li>Tente acessar novamente o sistema</li>
                <li>Se o problema persistir, entre em contato com o suporte</li>
              </ol>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <a 
              href="/login"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair do Sistema
            </a>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={isSidebarOpen}>
      <div 
        className="min-h-screen flex relative overflow-x-hidden"
        style={{ 
          "--current-sidebar-width": isSidebarOpen ? "var(--sidebar-width)" : "var(--sidebar-collapsed-width)" 
        } as React.CSSProperties}
      >
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "hidden md:block border-r transition-all duration-300 ease-in-out fixed top-0 h-full z-10",
            isSidebarOpen ? "w-64" : "w-24"
          )}
        >
          {/* Sidebar Header */}
          <div className="p-4 flex items-center justify-between border-b h-16">
            <div className={cn("flex items-center", !isSidebarOpen && "justify-center w-full")}>
              {isSidebarOpen ? (
                <Link to="/admin" className="flex items-center">
                  <img src={logoHorizontal} alt="Pharma.AI" className="h-10" />
                </Link>
              ) : (
                <Link to="/admin">
                  <img src={logoIcon} alt="Logo" className="h-12 w-12 object-contain" />
                </Link>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn("", !isSidebarOpen && "hidden")}
            >
              <ChevronsLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn("hidden", !isSidebarOpen && "block w-full")}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Links - VERSÃO DESKTOP */}
          <nav className="flex-1 overflow-y-auto py-4 h-[calc(100%-8rem)]">
            <SidebarMenu>
              {navLinks.map((link, index) => 
                link.submenu ? (
                  <SidebarDropdown 
                    key={index}
                    icon={link.icon}
                    label={isSidebarOpen ? link.title : ""}
                    isActive={link.submenu.some(sublink => location.pathname === sublink.href)}
                    href={link.href}
                  >
                    {link.submenu.map((sublink, subIndex) => (
                      <SidebarMenuSubButton
                        key={subIndex}
                        asChild
                        isActive={location.pathname === sublink.href}
                      >
                        <Link to={sublink.href}>{sublink.title}</Link>
                      </SidebarMenuSubButton>
                    ))}
                  </SidebarDropdown>
                ) : (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton 
                      asChild
                      isActive={location.pathname === link.href}
                    >
                      <Link to={link.href}>
                        {link.icon}
                        {isSidebarOpen && <span>{link.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </nav>

          {/* User Section */}
          <div className="border-t p-4 absolute bottom-0 w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-start gap-2 px-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="/avatar-placeholder.png" alt={usuario?.usuario?.nome} />
                    <AvatarFallback>{usuario?.usuario?.nome?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {isSidebarOpen && (
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-medium truncate max-w-[150px]">
                        {usuario?.usuario?.nome}
                      </span>
                      <span className="text-xs text-gray-500 truncate max-w-[150px]">
                        {usuario?.usuario?.perfil?.nome}
                      </span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/admin/perfil" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Meu Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/configuracoes" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-500">
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="w-[300px] sm:max-w-sm p-0">
            <SheetHeader className="p-4 border-b">
              <div className="flex items-center">
                <img src={logoHorizontal} alt="Pharma.AI" className="h-10" />
              </div>
            </SheetHeader>
            <nav className="flex-1 overflow-y-auto py-4">
              <SidebarMenu>
                {navLinks.map((link, index) => 
                  link.submenu ? (
                    <SidebarDropdown 
                      key={index}
                      icon={link.icon}
                      label={link.title}
                      isActive={link.submenu.some(sublink => location.pathname === sublink.href)}
                      href={link.href}
                    >
                      {link.submenu.map((sublink, subIndex) => (
                        <SidebarMenuSubButton
                          key={subIndex}
                          asChild
                          isActive={location.pathname === sublink.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Link to={sublink.href}>{sublink.title}</Link>
                        </SidebarMenuSubButton>
                      ))}
                    </SidebarDropdown>
                  ) : (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton 
                        asChild
                        isActive={location.pathname === link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link to={link.href}>
                          {link.icon}
                          <span>{link.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </nav>
            <div className="border-t p-4">
              <div className="flex items-center gap-2 mb-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/avatar-placeholder.png" alt={usuario?.usuario?.nome} />
                  <AvatarFallback>{usuario?.usuario?.nome?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{usuario?.usuario?.nome}</span>
                  <span className="text-xs text-gray-500">{usuario?.usuario?.perfil?.nome}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" asChild className="justify-start">
                  <Link to="/admin/perfil" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <User className="h-4 w-4" />
                    <span>Meu Perfil</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="justify-start">
                  <Link to="/admin/configuracoes" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </Button>
                <Button variant="destructive" onClick={handleLogout} className="justify-start">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sair</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div 
          ref={mainContentRef}
          className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300"
          style={{ 
            marginLeft: "var(--current-sidebar-width)",
            width: "calc(100% - var(--current-sidebar-width))"
          }}
        >
          {/* Top Bar */}
          <AdminHeader 
            onMenuClick={() => setIsMobileMenuOpen(true)}
            user={usuario?.usuario || null}
            onLogout={handleLogout}
          />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-auto py-6 w-full px-4 md:px-6">
            {/* Botão de emergência para logout foi removido daqui */}
            
            <div className="container-fluid w-full max-w-none m-0 p-0">
              {children}
            </div>
          </main>
          
          {/* Chatbot */}
          <AdminChatbotWidget />
        </div>
      </div>
    </SidebarProvider>
  );
}
