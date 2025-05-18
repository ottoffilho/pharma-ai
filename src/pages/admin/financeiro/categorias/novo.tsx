
import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { CategoriaFinanceiraForm } from '@/components/financeiro/CategoriaFinanceiraForm';

export default function NovaCategoriaPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Nova Categoria Financeira</h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          <CategoriaFinanceiraForm />
        </div>
      </div>
    </AdminLayout>
  );
}
