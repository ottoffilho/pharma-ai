
import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/admin" className="text-homeo-green font-semibold text-xl">
              Homeo-AI
            </Link>
            <nav className="ml-6 hidden md:flex space-x-4">
              <Link 
                to="/admin" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/admin' 
                    ? 'text-homeo-green bg-homeo-green bg-opacity-10' 
                    : 'text-gray-700 hover:text-homeo-green'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/admin/pedidos" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/admin/pedidos') 
                    ? 'text-homeo-green bg-homeo-green bg-opacity-10' 
                    : 'text-gray-700 hover:text-homeo-green'
                }`}
              >
                Pedidos
              </Link>
              <div className="relative group">
                <Link 
                  to="/admin/estoque/insumos" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin/estoque') 
                      ? 'text-homeo-green bg-homeo-green bg-opacity-10' 
                      : 'text-gray-700 hover:text-homeo-green'
                  }`}
                >
                  Estoque
                </Link>
                <div className="absolute hidden group-hover:block bg-white shadow-md rounded-md mt-1 py-1 w-48 z-10">
                  <Link 
                    to="/admin/estoque/insumos" 
                    className={`block px-4 py-2 text-sm ${
                      isActive('/admin/estoque/insumos') 
                        ? 'bg-gray-100 text-homeo-green' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Insumos
                  </Link>
                  <Link 
                    to="/admin/estoque/embalagens" 
                    className={`block px-4 py-2 text-sm ${
                      isActive('/admin/estoque/embalagens') 
                        ? 'bg-gray-100 text-homeo-green' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Embalagens
                  </Link>
                </div>
              </div>
            </nav>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleLogout} className="text-sm">
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
