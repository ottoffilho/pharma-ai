import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

export default function PerfilPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <User className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e preferências
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
            <CardDescription>
              Esta página será implementada em uma próxima versão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Funcionalidade em Desenvolvimento</h3>
              <p className="text-muted-foreground">
                A página de perfil do usuário será implementada nas próximas atualizações.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 