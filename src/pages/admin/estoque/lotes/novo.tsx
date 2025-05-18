
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '@/components/layouts/AdminLayout';
import LoteInsumoForm from '@/components/estoque/LoteInsumoForm';

const NovoLoteInsumoPage = () => {
  const [searchParams] = useSearchParams();
  const insumoId = searchParams.get('insumoId');

  return (
    <AdminLayout>
      <div className="container py-6">
        <LoteInsumoForm insumoId={insumoId || undefined} />
      </div>
    </AdminLayout>
  );
};

export default NovoLoteInsumoPage;
