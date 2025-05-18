
import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import UsuarioInternoForm from '@/components/usuarios/UsuarioInternoForm';

const NovoUsuarioPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Novo Usuário</h1>
          <p className="text-muted-foreground">Cadastre um novo usuário interno do sistema</p>
        </div>

        <div className="bg-white p-6 rounded-md shadow">
          <UsuarioInternoForm isEditing={false} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default NovoUsuarioPage;
