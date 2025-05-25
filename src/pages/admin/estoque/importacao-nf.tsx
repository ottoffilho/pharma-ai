import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import ImportacaoNF from '@/components/ImportacaoNF/ImportacaoNF';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ImportacaoNFPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Importar Nota Fiscal</h1>
            <p className="text-muted-foreground">
              Importe arquivos XML de notas fiscais para atualizar automaticamente o estoque
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload de XML da Nota Fiscal</CardTitle>
            <CardDescription>
              Selecione o arquivo XML da nota fiscal para processar automaticamente os produtos e atualizar o estoque.
              O sistema irá extrair informações dos produtos, fornecedores e criar os lotes automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImportacaoNF />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como funciona a importação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Upload do XML</h3>
                <p className="text-sm text-muted-foreground">
                  Faça upload do arquivo XML da nota fiscal recebida do fornecedor
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Processamento</h3>
                <p className="text-sm text-muted-foreground">
                  O sistema extrai automaticamente dados dos produtos, fornecedor e valores
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Atualização</h3>
                <p className="text-sm text-muted-foreground">
                  Produtos são criados/atualizados e lotes são registrados no estoque
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ImportacaoNFPage; 