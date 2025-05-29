import React from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '@/components/layouts/AdminLayout';
import ProdutoForm from '@/components/estoque/ProdutoForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Package } from 'lucide-react';

const EditarProdutoPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Hero Section */}
        <div className="relative w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20" />
          <div className="relative px-6 py-12 w-full">
            <div className="flex items-center justify-between">
              <div className="space-y-4 max-w-3xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                    <Edit className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Editar Produto
                    </h1>
                    <p className="text-xl text-muted-foreground mt-2">
                      Altere as informações do produto
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="px-6 pb-6 w-full">
          <Card className="border-0 shadow-sm w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Editar Produto
              </CardTitle>
              <CardDescription>
                Atualize as informações do produto abaixo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProdutoForm produtoId={id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditarProdutoPage; 