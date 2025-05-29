import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Settings, TrendingUp, Bell, Shield, Database, Globe, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ConfiguracoesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">
              Configure as preferências do sistema e personalize sua experiência
            </p>
          </div>
        </div>

        {/* Categorias de configuração */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card de Markup */}
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle>Markup e Precificação</CardTitle>
                  <CardDescription>
                    Configure margens de lucro por categoria
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <ul className="text-sm space-y-1.5 text-muted-foreground">
                <li>• Markup padrão global</li>
                <li>• Margens específicas por categoria</li>
                <li>• Regras de precificação automática</li>
              </ul>
            </CardContent>
            <CardFooter className="pt-0">
              <Button asChild variant="outline" className="w-full mt-2">
                <Link to="/admin/configuracoes/markup">
                  Configurar Markup
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Card Financeiro */}
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>Financeiro</CardTitle>
                  <CardDescription>
                    Configurações financeiras e fiscais
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <ul className="text-sm space-y-1.5 text-muted-foreground">
                <li>• Impostos e alíquotas</li>
                <li>• Formas de pagamento</li>
                <li>• Centros de custo</li>
              </ul>
            </CardContent>
            <CardFooter className="pt-0">
              <Button asChild variant="outline" className="w-full mt-2" disabled>
                <Link to="/admin/configuracoes/financeiro">
                  Em breve
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Card Sistema */}
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle>Sistema</CardTitle>
                  <CardDescription>
                    Configurações gerais do sistema
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <ul className="text-sm space-y-1.5 text-muted-foreground">
                <li>• Backup e sincronização</li>
                <li>• Permissões de usuários</li>
                <li>• Parâmetros do sistema</li>
              </ul>
            </CardContent>
            <CardFooter className="pt-0">
              <Button asChild variant="outline" className="w-full mt-2" disabled>
                <Link to="/admin/configuracoes/sistema">
                  Em breve
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 