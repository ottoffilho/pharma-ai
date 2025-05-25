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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdminHeader } from '@/components/layouts/AdminHeader';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      
      if (data?.user) {
        setUser(data.user);
      } else {
        toast({
          title: "Não autorizado",
          description: "Você precisa estar logado para acessar esta página",
          variant: "destructive",
        });
        navigate('/login');
      }
    };
    
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate('/login');
        } else if (session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const toggleSubmenu = (menuTitle: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuTitle]: !prev[menuTitle]
    }));
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
      icon: <FileText className="h-5 w-5 text-homeo-green" />,
      submenu: [
        { title: 'Listar Pedidos', href: '/admin/pedidos' },
        { title: 'Nova Receita', href: '/admin/pedidos/nova-receita' },
      ],
    },
    {
      title: 'Estoque',
      icon: <Box className="h-5 w-5 text-orange-500" />,
      submenu: [
        { title: 'Insumos', href: '/admin/estoque/insumos' },
        { title: 'Embalagens', href: '/admin/estoque/embalagens' },
        { title: 'Novo Lote', href: '/admin/estoque/lotes/novo' },
      ],
    },
    {
      title: 'Financeiro',
      icon: <DollarSign className="h-5 w-5 text-emerald-600" />,
      submenu: [
        { title: 'Categorias', href: '/admin/financeiro/categorias' },
        { title: 'Fluxo de Caixa', href: '/admin/financeiro/caixa' },
        { title: 'Contas a Pagar', href: '/admin/financeiro/contas-a-pagar' },
      ],
    },
    {
      title: 'Cadastros',
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

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b h-16">
          <div className={cn("flex items-center", !isSidebarOpen && "justify-center w-full")}>
            {isSidebarOpen ? (
              <Link to="/admin" className="font-bold text-xl">Pharma.AI</Link>
            ) : (
              <Link to="/admin" className="font-bold text-xl">P</Link>
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

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {navLinks.map((item) => {
              const isActive = item.href ? location.pathname === item.href : item.submenu?.some(subitem => location.pathname === subitem.href);
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isExpanded = expandedMenus[item.title] || isActive;
              
              return (
                <div key={item.title} className="mb-1">
                  {item.href ? (
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg group transition-all duration-200 hover:bg-primary/8",
                        isActive
                          ? "bg-primary/12 text-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="mr-3 transition-transform duration-200 group-hover:scale-110">{item.icon}</span>
                      {isSidebarOpen && <span className="font-medium">{item.title}</span>}
                    </Link>
                  ) : (
                    <button
                      onClick={() => hasSubmenu && toggleSubmenu(item.title)}
                      className={cn(
                        "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 hover:bg-primary/8",
                        isActive
                          ? "bg-primary/12 text-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="mr-3 transition-transform duration-200 hover:scale-110">{item.icon}</span>
                      {isSidebarOpen && (
                        <div className="flex justify-between items-center w-full">
                          <span className="font-medium">{item.title}</span>
                          {hasSubmenu && (
                            <ChevronDown 
                              className={cn(
                                "h-4 w-4 transition-transform duration-200", 
                                isExpanded ? "transform rotate-180" : ""
                              )} 
                            />
                          )}
                        </div>
                      )}
                    </button>
                  )}

                  {isSidebarOpen && hasSubmenu && isExpanded && (
                    <div className="ml-7 pl-3 border-l-2 border-primary/20 space-y-1 mt-2 mb-2 animate-in slide-in-from-top-2 duration-200">
                      {item.submenu!.map((subitem) => (
                        <Link
                          key={subitem.href}
                          to={subitem.href}
                          className={cn(
                            "flex items-center px-3 py-2 text-sm rounded-md transition-all duration-150",
                            location.pathname === subitem.href
                              ? "text-primary bg-primary/8 font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          <div className="w-2 h-2 rounded-full mr-3 bg-current opacity-60"></div>
                          {subitem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer - Removido informações do usuário */}
        <div className="p-4 border-t">
          <div className="text-center text-xs text-muted-foreground">
            Pharma.AI v1.0
          </div>
        </div>
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 h-16 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 h-full">
          <Link to="/admin" className="font-bold text-xl">
            Pharma.AI
          </Link>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <PanelLeft className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="pb-4">
                <SheetTitle>Pharma.AI</SheetTitle>
              </SheetHeader>
              <Separator />
              <nav className="flex flex-col mt-4 space-y-1">
                {navLinks.map((item) => {
                  const isActive = item.href ? location.pathname === item.href : item.submenu?.some(subitem => location.pathname === subitem.href);
                  const hasSubmenu = item.submenu && item.submenu.length > 0;
                  const isExpanded = expandedMenus[item.title] || isActive;
                  
                  return (
                    <div key={item.title} className="mb-1">
                      {item.href ? (
                        <Link
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                            isActive
                              ? "bg-primary/12 text-primary shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-primary/8"
                          )}
                        >
                          <span className="mr-3">{item.icon}</span>
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => hasSubmenu && toggleSubmenu(item.title)}
                          className={cn(
                            "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                            isActive
                              ? "bg-primary/12 text-primary shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-primary/8"
                          )}
                        >
                          <span className="mr-3">{item.icon}</span>
                          <div className="flex justify-between items-center w-full">
                            <span className="font-medium">{item.title}</span>
                            {hasSubmenu && (
                              <ChevronDown 
                                className={cn(
                                  "h-4 w-4 transition-transform duration-200", 
                                  isExpanded ? "transform rotate-180" : ""
                                )} 
                              />
                            )}
                          </div>
                        </button>
                      )}

                      {hasSubmenu && isExpanded && (
                        <div className="ml-7 pl-3 border-l-2 border-primary/20 space-y-1 mt-2 mb-2 animate-in slide-in-from-top-2 duration-200">
                          {item.submenu!.map((subitem) => (
                            <Link
                              key={subitem.href}
                              to={subitem.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={cn(
                                "flex items-center px-3 py-2 text-sm rounded-md transition-all duration-150",
                                location.pathname === subitem.href
                                  ? "text-primary bg-primary/8 font-medium"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              )}
                            >
                              <div className="w-2 h-2 rounded-full mr-3 bg-current opacity-60"></div>
                              {subitem.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
              <Separator className="my-4" />
              {/* Mobile também não precisa mais das informações do usuário aqui */}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-0">
        <div className="md:hidden h-16" /> {/* Spacer for mobile header */}
        
        {/* AdminHeader - Novo header integrado */}
        <AdminHeader user={user} onLogout={handleLogout} />
        
        {/* Main content with proper spacing */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
