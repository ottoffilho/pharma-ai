
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, ShoppingCart, FlaskConical, Box, AlertCircle, TrendingUp, DollarSign, Calculator } from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard: React.FC = () => {
  // Query to get count of processed recipes
  const { data: receitasCount, isLoading: receitasLoading } = useQuery({
    queryKey: ['receitasCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('receitas_processadas')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw new Error(error.message);
      return count || 0;
    }
  });

  // Query to get count of orders
  const { data: pedidosCount, isLoading: pedidosLoading } = useQuery({
    queryKey: ['pedidosCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw new Error(error.message);
      return count || 0;
    }
  });

  // Query to get count of inputs
  const { data: insumosCount, isLoading: insumosLoading } = useQuery({
    queryKey: ['insumosCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('insumos')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw new Error(error.message);
      return count || 0;
    }
  });

  // Query to get count of packages
  const { data: embalagensCount, isLoading: embalagensLoading } = useQuery({
    queryKey: ['embalagensCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('embalagens')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw new Error(error.message);
      return count || 0;
    }
  });

  // Calculate if any queries are loading
  const isLoading = receitasLoading || pedidosLoading || insumosLoading || embalagensLoading;

  return (
    <AdminLayout>
      <div className="container-section py-8">
        <h1 className="heading-lg mb-4">Dashboard</h1>
        <p className="text-gray-600 mb-8">Bem-vindo ao painel administrativo do Homeo-AI.</p>
        
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Métricas Principais</h2>
          <Separator className="mb-4" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Receitas Processadas */}
            <Card className="bg-gradient-to-br from-homeo-green-light to-white">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Receitas Processadas</CardTitle>
                  <FileText className="h-5 w-5 text-homeo-green" />
                </div>
                <CardDescription>Total de receitas analisadas pela IA</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {isLoading ? 
                    <span className="text-gray-400">...</span> : 
                    receitasCount
                  }
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/admin/pedidos" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Receitas
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            {/* Card 2: Pedidos Criados */}
            <Card className="bg-gradient-to-br from-homeo-blue-light to-white">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Pedidos Criados</CardTitle>
                  <ShoppingCart className="h-5 w-5 text-homeo-blue" />
                </div>
                <CardDescription>Total de pedidos gerados a partir de receitas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {isLoading ? 
                    <span className="text-gray-400">...</span> : 
                    pedidosCount
                  }
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/admin/pedidos" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Pedidos
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            {/* Card 3: Insumos Cadastrados */}
            <Card className="bg-gradient-to-br from-homeo-green-light to-white">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Insumos Cadastrados</CardTitle>
                  <FlaskConical className="h-5 w-5 text-homeo-green-dark" />
                </div>
                <CardDescription>Variedade de matérias-primas no estoque</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {isLoading ? 
                    <span className="text-gray-400">...</span> : 
                    insumosCount
                  }
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/admin/estoque/insumos" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Gerenciar Insumos
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            {/* Card 4: Embalagens Cadastradas */}
            <Card className="bg-gradient-to-br from-homeo-blue-light to-white">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Embalagens Cadastradas</CardTitle>
                  <Box className="h-5 w-5 text-homeo-blue-dark" />
                </div>
                <CardDescription>Tipos de embalagens disponíveis</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {isLoading ? 
                    <span className="text-gray-400">...</span> : 
                    embalagensCount
                  }
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/admin/estoque/embalagens" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Gerenciar Embalagens
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        {/* Future Metrics Section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Módulos Futuros</h2>
          <Separator className="mb-4" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Future Card: Faturamento Total */}
            <Card className="bg-gradient-to-br from-gray-100 to-white opacity-70">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Faturamento Total</CardTitle>
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <CardDescription>Valor total faturado em pedidos</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium text-gray-500 italic">
                  Disponível após Módulo Financeiro
                </p>
              </CardContent>
            </Card>
            
            {/* Future Card: Custo Médio */}
            <Card className="bg-gradient-to-br from-gray-100 to-white opacity-70">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Custo Médio por Pedido</CardTitle>
                  <Calculator className="h-5 w-5 text-gray-400" />
                </div>
                <CardDescription>Cálculo do custo médio de produção</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium text-gray-500 italic">
                  Disponível após Módulo Orçamentação
                </p>
              </CardContent>
            </Card>
            
            {/* Future Card: Alertas de Estoque */}
            <Card className="bg-gradient-to-br from-gray-100 to-white opacity-70">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Alertas de Estoque</CardTitle>
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                </div>
                <CardDescription>Insumos com estoque abaixo do mínimo</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium text-gray-500 italic">
                  Implementação Futura
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Chart Placeholder */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Análises e Tendências</h2>
          <Separator className="mb-4" />
          
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-500">Gráfico de Tendência de Pedidos/Faturamento</h3>
            <p className="text-gray-400">Implementação Futura</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
