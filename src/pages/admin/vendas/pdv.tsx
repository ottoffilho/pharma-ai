// =====================================================
// PÁGINA PDV (PONTO DE VENDA) - PHARMA.AI
// Interface moderna e intuitiva para vendas
// =====================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AdminLayout from '@/components/layouts/AdminLayout';
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
  X
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
      
      setCarrinho(prev => ({
        ...prev,
        itens: [...prev.itens, novoItem]
      }));
    }
    
    // Limpar busca após adicionar
    setTermoBusca('');
    setProdutos([]);
  };
  
  const atualizarQuantidade = (produtoId: UUID, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerItem(produtoId);
      return;
    }
    
    setCarrinho(prev => ({
      ...prev,
      itens: prev.itens.map(item => {
        if (item.produto_id === produtoId) {
          if (novaQuantidade > item.estoque_disponivel) {
            toast({
              title: "Estoque insuficiente",
              description: `Apenas ${item.estoque_disponivel} unidades disponíveis`,
              variant: "destructive"
            });
            return item;
          }
          
          return {
            ...item,
            quantidade: novaQuantidade,
            preco_total: (item.preco_unitario - item.desconto_valor) * novaQuantidade
          };
        }
        return item;
      })
    }));
  };
  
  const removerItem = (produtoId: UUID) => {
    setCarrinho(prev => ({
      ...prev,
      itens: prev.itens.filter(item => item.produto_id !== produtoId)
    }));
  };
  
  const aplicarDesconto = (produtoId: UUID, valor: number, percentual: number) => {
    setCarrinho(prev => ({
      ...prev,
      itens: prev.itens.map(item => {
        if (item.produto_id === produtoId) {
          const descontoValor = percentual > 0 ? (item.preco_unitario * percentual / 100) : valor;
          const precoComDesconto = item.preco_unitario - descontoValor;
          
          return {
            ...item,
            desconto_valor: descontoValor,
            desconto_percentual: percentual,
            preco_total: precoComDesconto * item.quantidade
          };
        }
        return item;
      })
    }));
  };
  
  const limparCarrinho = () => {
    setCarrinho({
      itens: [],
      subtotal: 0,
      desconto_total: 0,
      total: 0
    });
    setClienteSelecionado(null);
    setPagamentos([]);
    setDescontoGeral({ valor: 0, percentual: 0 });
    setObservacoes('');
  };

  // =====================================================
  // CÁLCULOS
  // =====================================================
  
  useEffect(() => {
    const subtotal = carrinho.itens.reduce((acc, item) => acc + item.preco_total, 0);
    const descontoTotal = descontoGeral.percentual > 0 
      ? (subtotal * descontoGeral.percentual / 100) 
      : descontoGeral.valor;
    const total = Math.max(0, subtotal - descontoTotal);
    
    setCarrinho(prev => ({
      ...prev,
      subtotal,
      desconto_total: descontoTotal,
      total
    }));
  }, [carrinho.itens, descontoGeral]);

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

  // =====================================================
  // RENDER
  // =====================================================
  
  return (
    <AdminLayout>
      <div className="p-6 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-8 w-8 text-emerald-600" />
              PDV - Ponto de Venda
            </h1>
            <p className="text-muted-foreground">
              Sistema de vendas rápido e intuitivo
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={limparCarrinho}>
              <X className="h-4 w-4 mr-2" />
              Limpar Carrinho
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Busca e Produtos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Busca de Produtos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Buscar Produtos
                </CardTitle>
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
                    className="pl-10"
                  />
                </div>
                
                {loading && (
                  <div className="text-center py-4">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  </div>
                )}
                
                {produtos.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                    {produtos.map((produto) => (
                      <div
                        key={produto.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                        onClick={() => adicionarProduto(produto)}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{produto.nome}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>Código: {produto.codigo_interno}</span>
                            <Badge variant="outline">{produto.categoria_nome}</Badge>
                            {produto.controlado && (
                              <Badge variant="destructive">Controlado</Badge>
                            )}
                            {produto.requer_receita && (
                              <Badge variant="secondary">Receita</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Estoque: {produto.estoque_atual} unidades
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-600">
                            R$ {produto.preco_venda.toFixed(2)}
                          </div>
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Carrinho de Compras */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Carrinho ({carrinho.itens.length} itens)
                  </span>
                  
                  <div className="flex gap-2">
                    <Dialog open={modalDesconto} onOpenChange={setModalDesconto}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Percent className="h-4 w-4 mr-2" />
                          Desconto
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Aplicar Desconto Geral</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Valor em R$</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0,00"
                              value={descontoGeral.valor}
                              onChange={(e) => setDescontoGeral(prev => ({
                                ...prev,
                                valor: parseFloat(e.target.value) || 0,
                                percentual: 0
                              }))}
                            />
                          </div>
                          <div className="text-center">OU</div>
                          <div>
                            <Label>Percentual (%)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="0"
                              value={descontoGeral.percentual}
                              onChange={(e) => setDescontoGeral(prev => ({
                                ...prev,
                                percentual: parseFloat(e.target.value) || 0,
                                valor: 0
                              }))}
                            />
                          </div>
                          <Button onClick={() => setModalDesconto(false)} className="w-full">
                            Aplicar Desconto
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {carrinho.itens.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Carrinho vazio</p>
                    <p className="text-sm">Busque e adicione produtos para começar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {carrinho.itens.map((item) => (
                      <div key={item.produto_id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{item.produto_nome}</div>
                            <div className="text-sm text-muted-foreground">
                              Código: {item.produto_codigo}
                            </div>
                            <div className="text-sm text-emerald-600 font-medium">
                              R$ {item.preco_unitario.toFixed(2)} cada
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
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
                        
                        <div className="mt-2 flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            Estoque: {item.estoque_disponivel} unidades
                          </div>
                          <div className="font-bold">
                            R$ {item.preco_total.toFixed(2)}
                          </div>
                        </div>
                        
                        {(item.desconto_valor > 0 || item.desconto_percentual > 0) && (
                          <div className="mt-1 text-xs text-red-600">
                            Desconto aplicado: {item.desconto_percentual > 0 
                              ? `${item.desconto_percentual}%` 
                              : `R$ ${item.desconto_valor.toFixed(2)}`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna 2: Resumo e Finalização */}
          <div className="space-y-6">
            {/* Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clienteSelecionado ? (
                  <div className="space-y-2">
                    <div className="font-medium">{clienteSelecionado.nome}</div>
                    <div className="text-sm text-muted-foreground">
                      {clienteSelecionado.documento}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {clienteSelecionado.telefone}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setClienteSelecionado(null)}
                    >
                      Remover Cliente
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-muted-foreground mb-2">Nenhum cliente selecionado</p>
                    <Dialog open={modalCliente} onOpenChange={setModalCliente}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
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
                          <div className="text-center py-4 text-muted-foreground">
                            Digite para buscar clientes
                          </div>
                          <Button 
                            onClick={() => setModalCliente(false)} 
                            className="w-full"
                          >
                            Venda sem Cliente
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumo Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Resumo da Venda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {carrinho.subtotal.toFixed(2)}</span>
                </div>
                
                {carrinho.desconto_total > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Desconto:</span>
                    <span>- R$ {carrinho.desconto_total.toFixed(2)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-emerald-600">R$ {carrinho.total.toFixed(2)}</span>
                </div>
                
                {totalPago > 0 && (
                  <>
                    <div className="flex justify-between text-blue-600">
                      <span>Pago:</span>
                      <span>R$ {totalPago.toFixed(2)}</span>
                    </div>
                    
                    {restante > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Restante:</span>
                        <span>R$ {restante.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {troco > 0 && (
                      <div className="flex justify-between text-green-600 font-bold">
                        <span>Troco:</span>
                        <span>R$ {troco.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Pagamentos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Pagamentos
                  </span>
                  
                  <Dialog open={modalPagamento} onOpenChange={setModalPagamento}>
                    <DialogTrigger asChild>
                      <Button size="sm" disabled={carrinho.total === 0}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Pagamento</DialogTitle>
                      </DialogHeader>
                      <FormaPagamentoForm 
                        onAdd={adicionarPagamento}
                        onClose={() => setModalPagamento(false)}
                        valorSugerido={restante}
                      />
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pagamentos.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum pagamento adicionado</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pagamentos.map((pagamento, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium capitalize">
                            {pagamento.forma_pagamento.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            R$ {pagamento.valor.toFixed(2)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removerPagamento(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Observações */}
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Observações sobre a venda..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Finalizar Venda */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  onClick={finalizarVenda}
                  className="w-full h-12 text-lg"
                  disabled={carrinho.itens.length === 0 || restante > 0}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Finalizar Venda
                </Button>
                
                {restante > 0 && carrinho.itens.length > 0 && (
                  <Alert className="mt-3">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Adicione os pagamentos para finalizar a venda
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// =====================================================
// COMPONENTE PARA FORMA DE PAGAMENTO
// =====================================================

interface FormaPagamentoFormProps {
  onAdd: (pagamento: PagamentoPDV) => void;
  onClose: () => void;
  valorSugerido: number;
}

function FormaPagamentoForm({ onAdd, onClose, valorSugerido }: FormaPagamentoFormProps) {
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('dinheiro');
  const [valor, setValor] = useState(valorSugerido);
  const [numeroAutorizacao, setNumeroAutorizacao] = useState('');
  const [bandeiraCartao, setBandeiraCartao] = useState('');
  const [codigoTransacao, setCodigoTransacao] = useState('');

  const handleSubmit = () => {
    if (valor <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor deve ser maior que zero",
        variant: "destructive"
      });
      return;
    }

    const pagamento: PagamentoPDV = {
      forma_pagamento: formaPagamento,
      valor,
      numero_autorizacao: numeroAutorizacao || undefined,
      bandeira_cartao: bandeiraCartao || undefined,
      codigo_transacao: codigoTransacao || undefined
    };

    onAdd(pagamento);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Forma de Pagamento</Label>
        <Select value={formaPagamento} onValueChange={(value: FormaPagamento) => setFormaPagamento(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dinheiro">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Dinheiro
              </div>
            </SelectItem>
            <SelectItem value="cartao_credito">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Cartão de Crédito
              </div>
            </SelectItem>
            <SelectItem value="cartao_debito">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Cartão de Débito
              </div>
            </SelectItem>
            <SelectItem value="pix">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                PIX
              </div>
            </SelectItem>
            <SelectItem value="transferencia">Transferência</SelectItem>
            <SelectItem value="boleto">Boleto</SelectItem>
            <SelectItem value="convenio">Convênio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Valor</Label>
        <Input
          type="number"
          step="0.01"
          value={valor}
          onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
        />
      </div>

      {(formaPagamento === 'cartao_credito' || formaPagamento === 'cartao_debito') && (
        <>
          <div>
            <Label>Bandeira do Cartão</Label>
            <Input
              placeholder="Visa, Mastercard, etc."
              value={bandeiraCartao}
              onChange={(e) => setBandeiraCartao(e.target.value)}
            />
          </div>
          <div>
            <Label>Número de Autorização</Label>
            <Input
              placeholder="Número de autorização"
              value={numeroAutorizacao}
              onChange={(e) => setNumeroAutorizacao(e.target.value)}
            />
          </div>
        </>
      )}

      {(formaPagamento === 'pix' || formaPagamento === 'transferencia') && (
        <div>
          <Label>Código da Transação</Label>
          <Input
            placeholder="Código/ID da transação"
            value={codigoTransacao}
            onChange={(e) => setCodigoTransacao(e.target.value)}
          />
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={onClose} variant="outline" className="flex-1">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} className="flex-1">
          Adicionar Pagamento
        </Button>
      </div>
    </div>
  );
} 