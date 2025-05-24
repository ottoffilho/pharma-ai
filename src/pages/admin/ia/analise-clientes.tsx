import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AnaliseClientesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-purple-500" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Análise de Clientes</h1>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                IA Analytics
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Insights inteligentes sobre comportamento e perfil dos clientes
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Analytics Avançados
            </CardTitle>
            <CardDescription>
              Funcionalidade em desenvolvimento para próximas versões
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
              <p className="text-muted-foreground">
                Análises comportamentais e segmentação de clientes serão implementadas em breve.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 