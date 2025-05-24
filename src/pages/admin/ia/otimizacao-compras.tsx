import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function OtimizacaoComprasPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Target className="h-8 w-8 text-emerald-600" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Otimização de Compras</h1>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                IA Optimization
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Algoritmos de IA para otimizar estratégias de compras e fornecedores
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-emerald-600" />
              Sistema de Compras Inteligente
            </CardTitle>
            <CardDescription>
              Funcionalidade em desenvolvimento para próximas versões
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
              <p className="text-muted-foreground">
                Este módulo será implementado nas próximas atualizações do sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 