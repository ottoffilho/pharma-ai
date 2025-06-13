import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import EmbalagemForm from '@/components/estoque/EmbalagemForm';

const NovaEmbalagemPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="w-full p-6">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Nova Embalagem</h1>
        <div className="bg-white dark:bg-slate-900/70 border dark:border-slate-800 p-8 rounded-lg shadow-lg backdrop-blur-sm">
          <EmbalagemForm />
        </div>
      </div>
    </AdminLayout>
  );
};

export default NovaEmbalagemPage;
