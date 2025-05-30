// =====================================================
// PÁGINA - EDITAR CLIENTE
// =====================================================

import React from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import ClienteForm from '@/components/clientes/ClienteForm';
import { useCliente } from '@/hooks/useClientes';

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function EditarClientePage() {
  const { id } = useParams<{ id: string }>();
  
  // Buscar dados do cliente
  const { data: cliente, isLoading, error } = useCliente(id!);

  // Loading state
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando dados do cliente...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error || !cliente) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Cliente não encontrado</h2>
          <p className="text-muted-foreground">
            O cliente solicitado não foi encontrado ou você não tem permissão para acessá-lo.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ClienteForm 
        initialData={cliente}
        isEditing={true}
        clienteId={id}
      />
    </AdminLayout>
  );
} 