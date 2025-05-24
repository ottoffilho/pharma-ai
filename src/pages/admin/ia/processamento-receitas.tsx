import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, FileText, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ProcessamentoReceitasPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Brain className="h-8 w-8 text-homeo-accent" />
            <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Processamento de Receitas</h1>
              <Badge variant="secondary" className="bg-homeo-accent/10 text-homeo-accent">
                IA Powered
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Tecnologia de IA para processamento automático e análise de receitas médicas
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-homeo-green" />
                OCR Inteligente
              </CardTitle>
              <CardDescription>
                Reconhecimento ótico de caracteres para receitas digitalizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Módulo em desenvolvimento para próximas versões
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-homeo-accent" />
                Análise Semântica
              </CardTitle>
              <CardDescription>
                Interpretação inteligente do conteúdo das receitas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Funcionalidade será implementada em breve
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Validação Automática
              </CardTitle>
              <CardDescription>
                Verificação automática de dosagens e interações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Em desenvolvimento - versão beta em breve
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Status do Desenvolvimento</CardTitle>
            <CardDescription>
              Acompanhe o progresso das funcionalidades de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">OCR Inteligente</span>
                <Badge variant="secondary">Planejado</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Análise Semântica</span>
                <Badge variant="secondary">Em Análise</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Validação Automática</span>
                <Badge variant="secondary">Planejado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 