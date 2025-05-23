import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronsLeft, 
  Home, 
  LayoutDashboard, 
  ListFilter, 
  Package, 
  PanelLeft, 
  PanelLeftClose,
  Users, 
  FileText, 
  DatabaseBackup, 
  Box,
  BadgePercent,
  DollarSign,
  PieChart,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

  // Navigation links
  const navLinks = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Pedidos',
      href: '/admin/pedidos',
      icon: <FileText className="h-5 w-5" />,
      submenu: [
        { title: 'Listar Pedidos', href: '/admin/pedidos' },
        { title: 'Nova Receita', href: '/admin/pedidos/nova-receita' },
      ],
    },
    {
      title: 'Estoque',
      icon: <Box className="h-5 w-5" />,
      submenu: [
        { title: 'Insumos', href: '/admin/estoque/insumos' },
        { title: 'Embalagens', href: '/admin/estoque/embalagens' },
        { title: 'Novo Lote', href: '/admin/estoque/lotes/novo' },
      ],
    },
    {
      title: 'Financeiro',
      icon: <DollarSign className="h-5 w-5" />,
      submenu: [
        { title: 'Categorias', href: '/admin/financeiro/categorias' },
        { title: 'Fluxo de Caixa', href: '/admin/financeiro/caixa' },
        { title: 'Contas a Pagar', href: '/admin/financeiro/contas-a-pagar' },
      ],
    },
    {
      title: 'Usuários',
      href: '/admin/usuarios',
      icon: <Users className="h-5 w-5" />,
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
              
              return (
                <div key={item.title} className="mb-1">
                  {item.href ? (
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-primary/5"
                      )}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {isSidebarOpen && <span>{item.title}</span>}
                    </Link>
                  ) : (
                    <div
                      className={cn(
                        "flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-primary/5"
                      )}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {isSidebarOpen && (
                        <div className="flex justify-between items-center w-full">
                          <span>{item.title}</span>
                          {hasSubmenu && <ChevronRight className={cn("h-4 w-4", isActive && "transform rotate-90")} />}
                        </div>
                      )}
                    </div>
                  )}

                  {isSidebarOpen && hasSubmenu && (
                    <div className="ml-7 pl-3 border-l space-y-1 mt-1">
                      {item.submenu!.map((subitem) => (
                        <Link
                          key={subitem.href}
                          to={subitem.href}
                          className={cn(
                            "flex items-center px-2 py-1.5 text-sm font-medium rounded-md",
                            location.pathname === subitem.href
                              ? "text-primary"
                              : "text-muted-foreground hover:text-primary"
                          )}
                        >
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

        {/* Sidebar Footer */}
        <div className="p-4 border-t">
          {isSidebarOpen ? (
            <div className="flex flex-col space-y-2">
              <div className="text-sm font-medium">{user?.email}</div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="icon" onClick={handleLogout} title="Sair">
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          )}
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
                  
                  return (
                    <div key={item.title} className="mb-1">
                      {item.href ? (
                        <Link
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-primary/5"
                          )}
                        >
                          <span className="mr-3">{item.icon}</span>
                          <span>{item.title}</span>
                        </Link>
                      ) : (
                        <div
                          className={cn(
                            "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-primary/5"
                          )}
                        >
                          <span className="mr-3">{item.icon}</span>
                          <div className="flex justify-between items-center w-full">
                            <span>{item.title}</span>
                            {hasSubmenu && <ChevronRight className={cn("h-4 w-4", isActive && "transform rotate-90")} />}
                          </div>
                        </div>
                      )}

                      {hasSubmenu && (
                        <div className="ml-7 pl-3 border-l space-y-1 mt-1">
                          {item.submenu!.map((subitem) => (
                            <Link
                              key={subitem.href}
                              to={subitem.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={cn(
                                "flex items-center px-2 py-1.5 text-sm font-medium rounded-md",
                                location.pathname === subitem.href
                                  ? "text-primary"
                                  : "text-muted-foreground hover:text-primary"
                              )}
                            >
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
              <div className="flex flex-col space-y-3">
                <div className="text-sm font-medium">{user?.email}</div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Sair
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-0">
        <div className="md:hidden h-16" /> {/* Spacer for mobile header */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
