
import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import EmbalagemForm from '@/components/estoque/EmbalagemForm';

const NovaEmbalagemPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Nova Embalagem</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <EmbalagemForm />
        </div>
      </div>
    </AdminLayout>
  );
};

export default NovaEmbalagemPage;
