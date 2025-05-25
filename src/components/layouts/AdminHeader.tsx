import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';
import { Badge } from '@/components/ui/badge';

interface AdminHeaderProps {
  user: {
    email?: string;
    id?: string;
  } | null;
  onLogout: () => void;
}

export function AdminHeader({ user, onLogout }: AdminHeaderProps) {
  const breadcrumbs = useBreadcrumbs();

  // Função para obter as iniciais do usuário
  const getUserInitials = (email: string) => {
    if (!email) return 'U';
    const namePart = email.split('@')[0];
    return namePart.substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Lado esquerdo - Breadcrumbs */}
        <div className="flex items-center">
          {breadcrumbs.length > 1 && (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => (
                  <div key={index} data-lov-id={breadcrumb.id} style={{ display: 'contents' }}>
                    <BreadcrumbItem>
                      {breadcrumb.isCurrentPage ? (
                        <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={breadcrumb.href!}>{breadcrumb.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
        </div>

        {/* Lado direito - Ações do usuário */}
        <div className="flex items-center space-x-4">
          {/* Seletor de Tema */}
          <ThemeSwitcher />

          {/* Notificações (Placeholder) */}
          <Button variant="ghost" size="icon" title="Notificações" className="relative">
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>

          {/* Menu do Usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-auto rounded-full px-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.email} />
                  <AvatarFallback>
                    {getUserInitials(user?.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="ml-2 text-sm font-medium">
                  {user?.email}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem asChild>
                <Link to="/admin/perfil" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Meu Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/configuracoes" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={onLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 