import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Activity, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MonitoramentoPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Monitor className="h-8 w-8 text-blue-600" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Monitoramento IA</h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                System Health
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Monitoramento e status dos sistemas de Inteligência Artificial
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Status dos Serviços
              </CardTitle>
              <CardDescription>
                Monitoramento em tempo real dos módulos de IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">OCR Service</span>
                  <Badge variant="secondary">Planejado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">NLP Engine</span>
                  <Badge variant="secondary">Planejado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">ML Analytics</span>
                  <Badge variant="secondary">Planejado</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                Logs e Métricas
              </CardTitle>
              <CardDescription>
                Logs de execução e métricas de performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Dashboard de monitoramento será implementado com os módulos de IA
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 