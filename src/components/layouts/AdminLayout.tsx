
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
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
              <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-homeo-green">
                Dashboard
              </Link>
              <Link to="/admin/pedidos" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-homeo-green">
                Pedidos
              </Link>
              <Link to="/admin/pedidos/nova-receita" className="px-3 py-2 rounded-md text-sm font-medium text-homeo-green hover:bg-homeo-green hover:bg-opacity-10">
                Nova Receita
              </Link>
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
