// =====================================================
// PÁGINA PDV (PONTO DE VENDA) - PHARMA.AI
// Interface moderna e intuitiva para vendas
// =====================================================

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useVendasCards } from '@/hooks/useVendasCards';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Calculator, 
  CreditCard,
  Banknote,
  Smartphone,
  User,
  CheckCircle,
  AlertTriangle,
  Package,
  Percent,
  Receipt,
  X,
  DollarSign,
  TrendingUp,
  ShoppingBag
} from 'lucide-react';
import { ItemCarrinho, CarrinhoCompras, ClienteVenda, FormaPagamento } from '@/types/vendas';
import { UUID } from '@/types/database';
import { toast } from '@/hooks/use-toast';

// =====================================================
// INTERFACES LOCAIS
// =====================================================

interface ProdutoPDV {
  id: UUID;
  nome: string;
  codigo_interno?: string;
  codigo_ean?: string;
  preco_venda: number;
  estoque_atual: number;
  categoria_nome?: string;
  controlado: boolean;
  requer_receita: boolean;
  forma_farmaceutica_nome?: string;
}

interface PagamentoPDV {
  forma_pagamento: FormaPagamento;
  valor: number;
  numero_autorizacao?: string;
  bandeira_cartao?: string;
  codigo_transacao?: string;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function PDVPage() {
  // =====================================================
  // ESTADOS
  // =====================================================
  
  const [carrinho, setCarrinho] = useState<CarrinhoCompras>({
    itens: [],
    subtotal: 0,
    desconto_total: 0,
    total: 0
  });
  
  const [produtos, setProdutos] = useState<ProdutoPDV[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [loading, setLoading] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteVenda | null>(null);
  const [pagamentos, setPagamentos] = useState<PagamentoPDV[]>([]);
  const [descontoGeral, setDescontoGeral] = useState({ valor: 0, percentual: 0 });
  const [modalCliente, setModalCliente] = useState(false);
  const [modalPagamento, setModalPagamento] = useState(false);
  const [modalDesconto, setModalDesconto] = useState(false);
  const [observacoes, setObservacoes] = useState('');

  // Hook para dados das vendas
  const {
    data: vendasData,
    isLoading: isLoadingVendas,
    formatarDinheiro,
    formatarTempo
  } = useVendasCards();

  // =====================================================
  // FUNÇÕES DE BUSCA
  // =====================================================
  
  const buscarProdutos = useCallback(async (termo: string) => {
    if (!termo || termo.length < 2) {
      setProdutos([]);
      return;
    }
    
    setLoading(true);
    try {
      // Simular busca de produtos - substituir por chamada real do serviço
      const produtosMock: ProdutoPDV[] = [
        {
          id: '1',
          nome: 'Dipirona 500mg - Caixa com 20 comprimidos',
          codigo_interno: 'DIP001',
          codigo_ean: '7891234567890',
          preco_venda: 12.50,
          estoque_atual: 45,
          categoria_nome: 'Analgésicos',
          controlado: false,
          requer_receita: false,
          forma_farmaceutica_nome: 'Comprimido'
        },
        {
          id: '2',
          nome: 'Amoxicilina 500mg - Caixa com 21 cápsulas',
          codigo_interno: 'AMO001',
          codigo_ean: '7891234567891',
          preco_venda: 25.80,
          estoque_atual: 23,
          categoria_nome: 'Antibióticos',
          controlado: false,
          requer_receita: true,
          forma_farmaceutica_nome: 'Cápsula'
        },
        {
          id: '3',
          nome: 'Rivotril 2mg - Caixa com 30 comprimidos',
          codigo_interno: 'RIV001',
          codigo_ean: '7891234567892',
          preco_venda: 45.60,
          estoque_atual: 8,
          categoria_nome: 'Controlados',
          controlado: true,
          requer_receita: true,
          forma_farmaceutica_nome: 'Comprimido'
        }
      ].filter(p => 
        p.nome.toLowerCase().includes(termo.toLowerCase()) ||
        p.codigo_interno?.toLowerCase().includes(termo.toLowerCase()) ||
        p.codigo_ean?.includes(termo)
      );
      
      setProdutos(produtosMock);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar produtos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // FUNÇÕES DO CARRINHO
  // =====================================================
  
  const adicionarProduto = (produto: ProdutoPDV) => {
    const itemExistente = carrinho.itens.find(item => item.produto_id === produto.id);
    
    if (itemExistente) {
      if (itemExistente.quantidade >= produto.estoque_atual) {
        toast({
          title: "Estoque insuficiente",
          description: `Apenas ${produto.estoque_atual} unidades disponíveis`,
          variant: "destructive"
        });
        return;
      }
      
      atualizarQuantidade(produto.id, itemExistente.quantidade + 1);
    } else {
      if (produto.estoque_atual === 0) {
        toast({
          title: "Produto sem estoque",
          description: "Este produto não possui estoque disponível",
          variant: "destructive"
        });
        return;
      }
      
      const novoItem: ItemCarrinho = {
        produto_id: produto.id,
        produto_nome: produto.nome,
        produto_codigo: produto.codigo_interno,
        quantidade: 1,
        preco_unitario: produto.preco_venda,
        preco_total: produto.preco_venda,
        estoque_disponivel: produto.estoque_atual,
        desconto_valor: 0,
        desconto_percentual: 0
      };
      
      setCarrinho(prev => {
        const novosItens = [...prev.itens, novoItem];
        return calcularTotais(novosItens);
      });
      
      // Limpar busca após adicionar
      setTermoBusca('');
      setProdutos([]);
      
      toast({
        title: "Produto adicionado",
        description: `${produto.nome} foi adicionado ao carrinho`
      });
    }
  };
  
  const atualizarQuantidade = (produtoId: UUID, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerItem(produtoId);
      return;
    }
    
    setCarrinho(prev => {
      const novosItens = prev.itens.map(item => {
        if (item.produto_id === produtoId) {
          const novoPrecoTotal = item.preco_unitario * novaQuantidade - (item.desconto_valor || 0);
          return {
            ...item,
            quantidade: novaQuantidade,
            preco_total: novoPrecoTotal
          };
        }
        return item;
      });
      return calcularTotais(novosItens);
    });
  };
  
  const removerItem = (produtoId: UUID) => {
    setCarrinho(prev => {
      const novosItens = prev.itens.filter(item => item.produto_id !== produtoId);
      return calcularTotais(novosItens);
    });
  };
  
  const calcularTotais = (itens: ItemCarrinho[]): CarrinhoCompras => {
    const subtotal = itens.reduce((acc, item) => acc + (item.preco_unitario * item.quantidade), 0);
    const desconto_total = itens.reduce((acc, item) => acc + (item.desconto_valor || 0), 0) + descontoGeral.valor;
    const total = subtotal - desconto_total;
    
    return {
      itens,
      subtotal,
      desconto_total,
      total: Math.max(0, total)
    };
  };
  
  const limparCarrinho = () => {
    setCarrinho({
      itens: [],
      subtotal: 0,
      desconto_total: 0,
      total: 0
    });
    setPagamentos([]);
    setClienteSelecionado(null);
    setObservacoes('');
    setDescontoGeral({ valor: 0, percentual: 0 });
    
    toast({
      title: "Carrinho limpo",
      description: "Todos os itens foram removidos"
    });
  };

  // =====================================================
  // FUNÇÕES DE PAGAMENTO
  // =====================================================
  
  const adicionarPagamento = (pagamento: PagamentoPDV) => {
    setPagamentos(prev => [...prev, pagamento]);
  };
  
  const removerPagamento = (index: number) => {
    setPagamentos(prev => prev.filter((_, i) => i !== index));
  };
  
  const totalPago = pagamentos.reduce((acc, pag) => acc + pag.valor, 0);
  const restante = carrinho.total - totalPago;
  const troco = totalPago > carrinho.total ? totalPago - carrinho.total : 0;

  // =====================================================
  // FINALIZAR VENDA
  // =====================================================
  
  const finalizarVenda = async () => {
    if (carrinho.itens.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos antes de finalizar a venda",
        variant: "destructive"
      });
      return;
    }
    
    if (restante > 0) {
      toast({
        title: "Pagamento incompleto",
        description: `Faltam R$ ${restante.toFixed(2)} para completar o pagamento`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Aqui seria a chamada para o serviço de vendas
      console.log('Finalizando venda:', {
        carrinho,
        cliente: clienteSelecionado,
        pagamentos,
        observacoes,
        troco
      });
      
      toast({
        title: "Venda finalizada!",
        description: `Venda realizada com sucesso. Troco: R$ ${troco.toFixed(2)}`,
      });
      
      limparCarrinho();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao finalizar venda",
        variant: "destructive"
      });
    }
  };

  // Métricas do PDV
  const pdvMetrics = [
    {
      label: 'Itens no Carrinho',
      value: carrinho.itens.length.toString(),
      change: `${carrinho.itens.reduce((acc, item) => acc + item.quantidade, 0)} unidades`,
      trend: 'up' as const,
      icon: ShoppingBag,
      color: 'text-emerald-600',
      isLoading: false
    },
    {
      label: 'Total da Venda',
      value: formatarDinheiro(carrinho.total),
      change: carrinho.desconto_total > 0 ? `${formatarDinheiro(carrinho.desconto_total)} desconto` : 'Sem desconto',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'text-blue-600',
      isLoading: false
    },
    {
      label: 'Valor Pago',
      value: formatarDinheiro(totalPago),
      change: restante > 0 ? `Restam ${formatarDinheiro(restante)}` : troco > 0 ? `Troco ${formatarDinheiro(troco)}` : 'Pago completo',
      trend: restante > 0 ? 'down' as const : 'up' as const,
      icon: CreditCard,
      color: 'text-purple-600',
      isLoading: false
    },
    {
      label: 'Vendas Hoje',
      value: isLoadingVendas ? '-' : vendasData?.vendas.hoje.toString() || '0',
      change: isLoadingVendas ? '' : `${formatarTempo(vendasData?.vendas.tempoMedioVenda || 0)} tempo médio`,
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'text-orange-600',
      isLoading: isLoadingVendas
    }
  ];

  // =====================================================
  // RENDER
  // =====================================================
  
  return (
    <AdminLayout>
      <div>
        {/* Hero Section */}
        <div className="relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20" />
          <div className="relative px-6 py-16">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center justify-between">
                <div className="space-y-4 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-10 w-10 text-emerald-600" />
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      PDV - Ponto de Venda
                    </h1>
                    <Badge 
                      variant={carrinho.itens.length > 0 ? 'default' : 'secondary'}
                      className="ml-4"
                    >
                      {carrinho.itens.length} itens
                    </Badge>
                  </div>
                  <p className="text-xl text-muted-foreground">
                    Sistema de vendas moderno e intuitivo. Busque produtos, adicione ao carrinho
                    e finalize vendas com múltiplas formas de pagamento em tempo real.
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 blur-3xl opacity-20" />
                    <ShoppingCart className="h-48 w-48 text-emerald-600/20" />
                  </div>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="h-12 px-8"
                  onClick={() => setModalCliente(true)}
                  variant={clienteSelecionado ? 'default' : 'outline'}
                >
                  <User className="h-5 w-5 mr-2" />
                  {clienteSelecionado ? clienteSelecionado.nome : 'Selecionar Cliente'}
                </Button>
                
                <Button 
                  size="lg" 
                  className="h-12 px-8"
                  onClick={() => setModalPagamento(true)}
                  disabled={carrinho.total === 0}
                  variant="outline"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Adicionar Pagamento
                </Button>

                <Button 
                  size="lg" 
                  className="h-12 px-8"
                  onClick={limparCarrinho}
                  variant="outline"
                  disabled={carrinho.itens.length === 0}
                >
                  <X className="h-5 w-5 mr-2" />
                  Limpar Carrinho
                </Button>

                <Button 
                  size="lg" 
                  className="h-12 px-8 ml-auto"
                  onClick={finalizarVenda}
                  disabled={carrinho.itens.length === 0 || restante > 0}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Finalizar Venda
                </Button>
              </div>

              {/* Métricas Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                {pdvMetrics.map((metric, index) => {
                  const IconComponent = metric.icon;
                  return (
                    <Card key={index} className="border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
                          <IconComponent className={`h-4 w-4 ${metric.color}`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-end justify-between">
                          {metric.isLoading ? (
                            <Skeleton className="h-6 w-24" />
                          ) : (
                            <span className="text-2xl font-bold">{metric.value}</span>
                          )}
                          <span className={`text-sm font-medium ${
                            metric.trend === 'up' ? 'text-green-600' : 
                            metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {metric.change}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="px-6 pb-16">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna 1 e 2: Busca e Carrinho */}
              <div className="lg:col-span-2 space-y-6">
                {/* Busca de Produtos */}
                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                        <Search className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle>Buscar Produtos</CardTitle>
                        <CardDescription>
                          Digite o nome, código interno ou EAN do produto
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Digite o nome, código interno ou EAN do produto..."
                        value={termoBusca}
                        onChange={(e) => {
                          setTermoBusca(e.target.value);
                          buscarProdutos(e.target.value);
                        }}
                        className="pl-10 h-12 text-lg"
                      />
                    </div>
                    
                    {loading && (
                      <div className="mt-4 space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                                <Skeleton className="h-3 w-1/4" />
                              </div>
                              <Skeleton className="h-10 w-20" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {produtos.length > 0 && (
                      <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
                        {produtos.map((produto) => (
                          <div
                            key={produto.id}
                            className="p-4 border rounded-lg hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-950/20 dark:hover:to-teal-950/20 cursor-pointer transition-all duration-200 group"
                            onClick={() => adicionarProduto(produto)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium group-hover:text-emerald-700 transition-colors">
                                  {produto.nome}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                  <span>Código: {produto.codigo_interno}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {produto.categoria_nome}
                                  </Badge>
                                  {produto.controlado && (
                                    <Badge variant="destructive" className="text-xs">
                                      Controlado
                                    </Badge>
                                  )}
                                  {produto.requer_receita && (
                                    <Badge variant="secondary" className="text-xs">
                                      Receita
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  <span className={`${produto.estoque_atual <= 10 ? 'text-red-600 font-medium' : ''}`}>
                                    Estoque: {produto.estoque_atual} unidades
                                  </span>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="font-bold text-emerald-600 text-lg">
                                  {formatarDinheiro(produto.preco_venda)}
                                </div>
                                <Button size="sm" className="mt-2 group-hover:scale-105 transition-transform">
                                  <Plus className="h-4 w-4 mr-1" />
                                  Adicionar
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {termoBusca && produtos.length === 0 && !loading && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Nenhum produto encontrado</p>
                        <p className="text-sm">Tente buscar por outro termo</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Carrinho de Compras */}
                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle>
                            Carrinho de Compras ({carrinho.itens.length} itens)
                          </CardTitle>
                          <CardDescription>
                            {carrinho.itens.reduce((acc, item) => acc + item.quantidade, 0)} unidades no total
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {carrinho.itens.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <h3 className="text-lg font-medium mb-2">Carrinho Vazio</h3>
                        <p>Busque e adicione produtos para iniciar uma venda</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {carrinho.itens.map((item) => (
                          <div key={item.produto_id} className="p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800/50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium">{item.produto_nome}</div>
                                <div className="text-sm text-muted-foreground">
                                  Código: {item.produto_codigo}
                                </div>
                                <div className="text-sm text-emerald-600 font-medium mt-1">
                                  {formatarDinheiro(item.preco_unitario)} x {item.quantidade} = {formatarDinheiro(item.preco_total)}
                                </div>
                                {(item.desconto_valor || 0) > 0 && (
                                  <div className="text-sm text-red-600">
                                    Desconto: {formatarDinheiro(item.desconto_valor || 0)}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => atualizarQuantidade(item.produto_id, item.quantidade - 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                
                                <span className="w-12 text-center font-medium">
                                  {item.quantidade}
                                </span>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => atualizarQuantidade(item.produto_id, item.quantidade + 1)}
                                  disabled={item.quantidade >= item.estoque_disponivel}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removerItem(item.produto_id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Resumo do Carrinho */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Subtotal:</span>
                              <span>{formatarDinheiro(carrinho.subtotal)}</span>
                            </div>
                            
                            {carrinho.desconto_total > 0 && (
                              <div className="flex justify-between text-sm text-red-600">
                                <span>Desconto:</span>
                                <span>- {formatarDinheiro(carrinho.desconto_total)}</span>
                              </div>
                            )}
                            
                            <Separator />
                            
                            <div className="flex justify-between text-lg font-bold">
                              <span>Total:</span>
                              <span className="text-emerald-600">{formatarDinheiro(carrinho.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Coluna 3: Sidebar - Cliente, Resumo e Pagamentos */}
              <div className="space-y-6">
                {/* Cliente */}
                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle>Cliente</CardTitle>
                        <CardDescription>
                          Selecione um cliente
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-muted-foreground mb-4">Nenhum cliente selecionado</p>
                      <Dialog open={modalCliente} onOpenChange={setModalCliente}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Selecionar Cliente
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Selecionar Cliente</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input placeholder="Buscar por nome, CPF ou telefone..." />
                            <div className="text-center py-8 text-muted-foreground">
                              <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>Digite para buscar clientes</p>
                            </div>
                            <Button 
                              onClick={() => setModalCliente(false)} 
                              className="w-full"
                              variant="outline"
                            >
                              Venda sem Cliente
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>

                {/* Resumo Financeiro */}
                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                        <Calculator className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle>Resumo da Venda</CardTitle>
                        <CardDescription>
                          Valores e totais da transação
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-medium">{formatarDinheiro(carrinho.subtotal)}</span>
                      </div>
                      
                      {carrinho.desconto_total > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>Desconto:</span>
                          <span className="font-medium">- {formatarDinheiro(carrinho.desconto_total)}</span>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-emerald-600">{formatarDinheiro(carrinho.total)}</span>
                      </div>
                      
                      {totalPago > 0 && (
                        <>
                          <Separator className="my-3" />
                          <div className="flex justify-between text-blue-600">
                            <span>Valor Pago:</span>
                            <span className="font-medium">{formatarDinheiro(totalPago)}</span>
                          </div>
                          
                          {restante > 0 && (
                            <div className="flex justify-between text-orange-600">
                              <span>Restante:</span>
                              <span className="font-medium">{formatarDinheiro(restante)}</span>
                            </div>
                          )}
                          
                          {troco > 0 && (
                            <div className="flex justify-between text-green-600 font-bold text-lg">
                              <span>Troco:</span>
                              <span>{formatarDinheiro(troco)}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Status do Pagamento */}
                    {carrinho.total > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Status do Pagamento</span>
                          <span className="text-sm text-muted-foreground">
                            {totalPago === 0 ? '0%' : Math.round((totalPago / carrinho.total) * 100) + '%'}
                          </span>
                        </div>
                        <Progress 
                          value={totalPago === 0 ? 0 : Math.min((totalPago / carrinho.total) * 100, 100)} 
                          className="h-3" 
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Observações */}
                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-gray-500 to-slate-500 text-white">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle>Observações</CardTitle>
                        <CardDescription>
                          Anotações sobre a venda
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Observações sobre a venda..."
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </CardContent>
                </Card>

                {/* Finalizar Venda */}
                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardContent className="pt-6">
                    <Button 
                      onClick={finalizarVenda}
                      className="w-full h-14 text-lg font-medium group-hover:scale-[1.02] transition-transform"
                      disabled={carrinho.itens.length === 0 || restante > 0}
                      size="lg"
                    >
                      <CheckCircle className="h-6 w-6 mr-3" />
                      {restante > 0 && carrinho.itens.length > 0 ? 
                        `Faltam ${formatarDinheiro(restante)}` : 
                        'Finalizar Venda'
                      }
                    </Button>
                    
                    {restante > 0 && carrinho.itens.length > 0 && (
                      <Alert className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Adicione os pagamentos para completar a venda
                        </AlertDescription>
                      </Alert>
                    )}

                    {troco > 0 && (
                      <Alert className="mt-4 border-green-200 bg-green-50 dark:bg-green-950/20">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700 dark:text-green-400">
                          Troco a devolver: <strong>{formatarDinheiro(troco)}</strong>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 