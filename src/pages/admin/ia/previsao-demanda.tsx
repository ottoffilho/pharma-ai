import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PrevisaoDemandaPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-8 w-8 text-homeo-blue" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Previsão de Demanda</h1>
              <Badge variant="secondary" className="bg-homeo-blue/10 text-homeo-blue">
                IA Analytics
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Análise preditiva para otimização de estoque e compras
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-homeo-blue" />
                Análise de Tendências
              </CardTitle>
              <CardDescription>
                Identificação de padrões de consumo e sazonalidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Funcionalidade em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  Algoritmos de machine learning para análise de demanda serão implementados em breve.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-600" />
                Recomendações Inteligentes
              </CardTitle>
              <CardDescription>
                Sugestões automáticas de compras baseadas em IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Próxima Atualização</h3>
                <p className="text-muted-foreground">
                  Sistema de recomendações será lançado na próxima versão da plataforma.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 