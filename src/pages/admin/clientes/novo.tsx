// =====================================================
// PÁGINA - NOVO CLIENTE
// =====================================================

import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import ClienteForm from '@/components/clientes/ClienteForm';

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function NovoClientePage() {
  return (
    <AdminLayout>
      <ClienteForm />
    </AdminLayout>
  );
} 