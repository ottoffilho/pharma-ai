
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layouts/AdminLayout';

const PedidosPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="container-section py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="heading-lg">Pedidos</h1>
          <Link to="/admin/pedidos/nova-receita">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Receita
            </Button>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-lg font-medium mb-4">Nenhum pedido encontrado</h2>
          <p className="text-muted-foreground mb-6">
            Comece adicionando uma nova receita para criar seu primeiro pedido.
          </p>
          <Link to="/admin/pedidos/nova-receita">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Receita
            </Button>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PedidosPage;
