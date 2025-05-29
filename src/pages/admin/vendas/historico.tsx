import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Calendar, Filter, Eye, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { vendasService } from '@/services/vendasService';
import { Venda } from '@/types/vendas';
import { useToast } from '@/hooks/use-toast';

export default function HistoricoVendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [filteredVendas, setFilteredVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [paymentFilter, setPaymentFilter] = useState<string>('todos');
  const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const { toast } = useToast();

  useEffect(() => {
    loadVendas();
  }, []);

  useEffect(() => {
    filterVendas();
  }, [vendas, searchTerm, statusFilter, paymentFilter, dateRange]);

  const loadVendas = async () => {
    try {
      setLoading(true);
      const data = await vendasService.listarVendas();
      setVendas(data);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar histórico de vendas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterVendas = () => {
    let filtered = vendas;

    // Filtro por data
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(venda => {
        const vendaDate = new Date(venda.data_venda);
        return vendaDate >= dateRange.from && vendaDate <= dateRange.to;
      });
    }

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(venda =>
        venda.numero_venda.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venda.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venda.cliente_documento?.includes(searchTerm)
      );
    }

    // Filtro por status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(venda => venda.status === statusFilter);
    }

    // Filtro por status de pagamento
    if (paymentFilter !== 'todos') {
      filtered = filtered.filter(venda => venda.status_pagamento === paymentFilter);
    }

    setFilteredVendas(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalizada': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      case 'aberta': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'parcial': return 'bg-orange-100 text-orange-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const showDetails = async (venda: Venda) => {
    try {
      const vendaCompleta = await vendasService.obterVenda(venda.id);
      setSelectedVenda(vendaCompleta);
      setDetailsOpen(true);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar detalhes da venda',
        variant: 'destructive'
      });
    }
  };

  const handlePrint = (venda: Venda) => {
    // Implementar impressão da venda
    toast({
      title: 'Impressão',
      description: 'Preparando venda para impressão...'
    });
  };

  const handleExport = () => {
    // Implementar exportação para Excel/CSV
    toast({
      title: 'Exportação',
      description: 'Preparando exportação...'
    });
  };

  const totalVendas = filteredVendas.length;
  const totalValor = filteredVendas.reduce((sum, venda) => sum + Number(venda.total), 0);
  const vendasFinalizadas = filteredVendas.filter(v => v.status === 'finalizada').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Histórico de Vendas</h1>
          <p className="text-gray-600">Consulte e gerencie todas as vendas realizadas</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Vendas</p>
                <p className="text-2xl font-bold">{totalVendas}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vendas Finalizadas</p>
                <p className="text-2xl font-bold">{vendasFinalizadas}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold">
                  {totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Filter className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Número, cliente ou documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="aberta">Aberta</SelectItem>
                  <SelectItem value="finalizada">Finalizada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Pagamento</label>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Período</label>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de vendas */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Carregando vendas...
                  </TableCell>
                </TableRow>
              ) : filteredVendas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Nenhuma venda encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredVendas.map((venda) => (
                  <TableRow key={venda.id}>
                    <TableCell className="font-mono">{venda.numero_venda}</TableCell>
                    <TableCell>
                      {format(new Date(venda.data_venda), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{venda.cliente_nome || 'Cliente Avulso'}</div>
                        {venda.cliente_documento && (
                          <div className="text-sm text-gray-500">{venda.cliente_documento}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {Number(venda.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(venda.status)}>
                        {venda.status === 'finalizada' ? 'Finalizada' :
                         venda.status === 'cancelada' ? 'Cancelada' :
                         venda.status === 'aberta' ? 'Aberta' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusColor(venda.status_pagamento)}>
                        {venda.status_pagamento === 'pago' ? 'Pago' :
                         venda.status_pagamento === 'pendente' ? 'Pendente' :
                         venda.status_pagamento === 'parcial' ? 'Parcial' : 'Cancelado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => showDetails(venda)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrint(venda)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de detalhes da venda */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalhes da Venda {selectedVenda?.numero_venda}
            </DialogTitle>
          </DialogHeader>
          
          {selectedVenda && (
            <div className="space-y-6">
              {/* Informações da venda */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Informações da Venda</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Número:</span>
                      <span className="font-mono">{selectedVenda.numero_venda}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Data:</span>
                      <span>{format(new Date(selectedVenda.data_venda), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge className={getStatusColor(selectedVenda.status)}>
                        {selectedVenda.status === 'finalizada' ? 'Finalizada' :
                         selectedVenda.status === 'cancelada' ? 'Cancelada' :
                         selectedVenda.status === 'aberta' ? 'Aberta' : 'Rascunho'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pagamento:</span>
                      <Badge className={getPaymentStatusColor(selectedVenda.status_pagamento)}>
                        {selectedVenda.status_pagamento === 'pago' ? 'Pago' :
                         selectedVenda.status_pagamento === 'pendente' ? 'Pendente' :
                         selectedVenda.status_pagamento === 'parcial' ? 'Parcial' : 'Cancelado'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Cliente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Nome:</span>
                      <span>{selectedVenda.cliente_nome || 'Cliente Avulso'}</span>
                    </div>
                    {selectedVenda.cliente_documento && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Documento:</span>
                        <span>{selectedVenda.cliente_documento}</span>
                      </div>
                    )}
                    {selectedVenda.cliente_telefone && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Telefone:</span>
                        <span>{selectedVenda.cliente_telefone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Itens da venda */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Itens da Venda</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Preço Unit.</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedVenda.itens?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.produto_nome}</div>
                              {item.produto_codigo && (
                                <div className="text-sm text-gray-500">Cód: {item.produto_codigo}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{Number(item.quantidade)}</TableCell>
                          <TableCell className="text-right">
                            {Number(item.preco_unitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {Number(item.preco_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Resumo financeiro */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span>{Number(selectedVenda.subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    {selectedVenda.desconto_valor && Number(selectedVenda.desconto_valor) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Desconto:</span>
                        <span className="text-red-600">
                          -{Number(selectedVenda.desconto_valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{Number(selectedVenda.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    {selectedVenda.troco && Number(selectedVenda.troco) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Troco:</span>
                        <span>{Number(selectedVenda.troco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pagamentos */}
              {selectedVenda.pagamentos && selectedVenda.pagamentos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Pagamentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Forma de Pagamento</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead>Autorização</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedVenda.pagamentos.map((pagamento) => (
                          <TableRow key={pagamento.id}>
                            <TableCell>
                              {pagamento.forma_pagamento === 'dinheiro' ? 'Dinheiro' :
                               pagamento.forma_pagamento === 'cartao_credito' ? 'Cartão de Crédito' :
                               pagamento.forma_pagamento === 'cartao_debito' ? 'Cartão de Débito' :
                               pagamento.forma_pagamento === 'pix' ? 'PIX' :
                               pagamento.forma_pagamento === 'transferencia' ? 'Transferência' :
                               pagamento.forma_pagamento === 'boleto' ? 'Boleto' :
                               pagamento.forma_pagamento === 'convenio' ? 'Convênio' :
                               pagamento.forma_pagamento}
                              {pagamento.bandeira_cartao && (
                                <div className="text-sm text-gray-500">{pagamento.bandeira_cartao}</div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {Number(pagamento.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {pagamento.numero_autorizacao || pagamento.codigo_transacao || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Observações */}
              {selectedVenda.observacoes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedVenda.observacoes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 