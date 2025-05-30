// =====================================================
// PÁGINA - DETALHES DO CLIENTE
// =====================================================

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingCart,
  CreditCard,
  FileText,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  Package,
  Clock,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// =====================================================
// TIPOS E INTERFACES
// =====================================================

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  cpf?: string;
  cnpj?: string;
  tipo_pessoa: 'PF' | 'PJ';
  nome_fantasia?: string;
  rg?: string;
  observacoes?: string;
  data_nascimento?: string;
  total_compras: number;
  ultima_compra?: string;
  pontos_fidelidade: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface Compra {
  id: string;
  data_venda: string;
  valor_total: number;
  status: string;
  produtos_vendidos: any[];
}

interface Estatisticas {
  total_vendas: number;
  ticket_medio: number;
  ultima_compra: string | null;
  produtos_favoritos: string[];
  freq_compras_mes: number;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function DetalhesClientePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("perfil");

  // Query para buscar dados do cliente
  const { data: cliente, isLoading: loadingCliente, error: errorCliente } = useQuery({
    queryKey: ['cliente', id],
    queryFn: async () => {
      if (!id) throw new Error('ID do cliente não fornecido');
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Cliente;
    },
    enabled: !!id,
  });

  // Query para buscar compras do cliente
  const { data: compras = [], isLoading: loadingCompras } = useQuery({
    queryKey: ['cliente-compras', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('vendas')
        .select(`
          id,
          data_venda,
          valor_total,
          status,
          produtos_vendidos
        `)
        .eq('cliente_id', id)
        .order('data_venda', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as Compra[];
    },
    enabled: !!id,
  });

  // Query para estatísticas do cliente
  const { data: estatisticas } = useQuery({
    queryKey: ['cliente-estatisticas', id],
    queryFn: async () => {
      if (!id) return null;
      
      // Calcular estatísticas básicas
      const stats: Estatisticas = {
        total_vendas: compras.length,
        ticket_medio: compras.length > 0 ? compras.reduce((acc, compra) => acc + compra.valor_total, 0) / compras.length : 0,
        ultima_compra: compras.length > 0 ? compras[0].data_venda : null,
        produtos_favoritos: [],
        freq_compras_mes: 0
      };
      
      return stats;
    },
    enabled: !!compras,
  });

  // Loading states
  if (loadingCliente) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (errorCliente || !cliente) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cliente não encontrado</h2>
          <p className="text-gray-600 mb-6">O cliente solicitado não foi encontrado ou você não tem permissão para visualizá-lo.</p>
          <Button onClick={() => navigate('/admin/clientes')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Clientes
          </Button>
        </div>
      </AdminLayout>
    );
  }

  // Formatação de dados
  const formatarDocumento = (cpf?: string, cnpj?: string) => {
    if (cpf) {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (cnpj) {
      return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return 'Não informado';
  };

  const formatarTelefone = (telefone?: string) => {
    if (!telefone) return 'Não informado';
    return telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  const formatarEndereco = () => {
    const parts = [cliente.endereco, cliente.cidade, cliente.estado, cliente.cep].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Não informado';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/clientes')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <User className="h-6 w-6" />
                {cliente.nome}
              </h1>
              <p className="text-muted-foreground">
                {cliente.tipo_pessoa === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'} • 
                Cliente desde {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={cliente.ativo ? "default" : "secondary"}>
              {cliente.ativo ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Ativo
                </>
              ) : (
                <>
                  <XCircle className="mr-1 h-3 w-3" />
                  Inativo
                </>
              )}
            </Badge>
            <Button onClick={() => navigate(`/admin/clientes/${id}/editar`)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Compras</p>
                  <p className="text-2xl font-bold">{cliente.total_compras || 0}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(cliente.total_compras || 0)}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pontos Fidelidade</p>
                  <p className="text-2xl font-bold">{cliente.pontos_fidelidade || 0}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Última Compra</p>
                  <p className="text-sm font-medium">
                    {cliente.ultima_compra 
                      ? new Date(cliente.ultima_compra).toLocaleDateString('pt-BR')
                      : 'Nunca'
                    }
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Conteúdo */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="compras" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Histórico de Compras
            </TabsTrigger>
            <TabsTrigger value="observacoes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Observações
            </TabsTrigger>
          </TabsList>

          {/* Aba Perfil */}
          <TabsContent value="perfil" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dados Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nome</label>
                      <p className="font-medium">{cliente.nome}</p>
                    </div>
                    {cliente.nome_fantasia && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nome Fantasia</label>
                        <p className="font-medium">{cliente.nome_fantasia}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {cliente.tipo_pessoa === 'PF' ? 'CPF' : 'CNPJ'}
                      </label>
                      <p className="font-medium">{formatarDocumento(cliente.cpf, cliente.cnpj)}</p>
                    </div>
                    {cliente.rg && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">RG</label>
                        <p className="font-medium">{cliente.rg}</p>
                      </div>
                    )}
                  </div>

                  {cliente.data_nascimento && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                      <p className="font-medium">
                        {new Date(cliente.data_nascimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contato */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="font-medium">{cliente.email || 'Não informado'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                      <p className="font-medium">{formatarTelefone(cliente.telefone)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                      <p className="font-medium">{formatarEndereco()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Compras */}
          <TabsContent value="compras" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Últimas Compras
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCompras ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : compras.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma compra realizada ainda</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Produtos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {compras.map((compra) => (
                        <TableRow key={compra.id}>
                          <TableCell>
                            {new Date(compra.data_venda).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(compra.valor_total)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={compra.status === 'finalizada' ? 'default' : 'secondary'}>
                              {compra.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {compra.produtos_vendidos?.length || 0} item(s)
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Observações */}
          <TabsContent value="observacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-[200px] p-4 bg-muted/50 rounded-lg">
                  {cliente.observacoes ? (
                    <p className="whitespace-pre-wrap">{cliente.observacoes}</p>
                  ) : (
                    <p className="text-muted-foreground italic">Nenhuma observação registrada</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
} 