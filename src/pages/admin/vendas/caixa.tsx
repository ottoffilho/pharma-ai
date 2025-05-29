import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calculator, 
  DollarSign, 
  CreditCard, 
  Banknote, 
  TrendingUp, 
  TrendingDown,
  Clock,
  User,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuthSimple } from '@/modules/usuarios-permissoes/hooks/useAuthSimple';

interface CaixaStatus {
  id?: string;
  data_abertura: string;
  data_fechamento?: string;
  usuario_abertura: string;
  usuario_fechamento?: string;
  valor_inicial: number;
  valor_final?: number;
  valor_vendas: number;
  valor_sangrias: number;
  valor_suprimentos: number;
  valor_calculado: number;
  status: 'aberto' | 'fechado';
  observacoes_abertura?: string;
  observacoes_fechamento?: string;
}

interface MovimentoCaixa {
  id: string;
  tipo: 'sangria' | 'suprimento';
  valor: number;
  descricao: string;
  usuario: string;
  data_movimento: string;
}

interface ResumoVendas {
  total_vendas: number;
  vendas_dinheiro: number;
  vendas_cartao: number;
  vendas_pix: number;
  vendas_outros: number;
  quantidade_vendas: number;
}

export default function ControleCaixa() {
  const [caixaAtual, setCaixaAtual] = useState<CaixaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [movimentos, setMovimentos] = useState<MovimentoCaixa[]>([]);
  const [resumoVendas, setResumoVendas] = useState<ResumoVendas | null>(null);
  
  // Estados para abertura de caixa
  const [aberturaOpen, setAberturaOpen] = useState(false);
  const [valorInicialAbertura, setValorInicialAbertura] = useState('');
  const [observacoesAbertura, setObservacoesAbertura] = useState('');
  
  // Estados para fechamento de caixa
  const [fechamentoOpen, setFechamentoOpen] = useState(false);
  const [valorFinalFechamento, setValorFinalFechamento] = useState('');
  const [observacoesFechamento, setObservacoesFechamento] = useState('');
  
  // Estados para movimento de caixa
  const [movimentoOpen, setMovimentoOpen] = useState(false);
  const [tipoMovimento, setTipoMovimento] = useState<'sangria' | 'suprimento'>('sangria');
  const [valorMovimento, setValorMovimento] = useState('');
  const [descricaoMovimento, setDescricaoMovimento] = useState('');

  const { usuario } = useAuthSimple();
  const { toast } = useToast();

  useEffect(() => {
    loadCaixaStatus();
  }, []);

  const loadCaixaStatus = async () => {
    try {
      setLoading(true);
      // Aqui seria a chamada real para a API
      // const status = await CaixaService.obterStatusAtual();
      
      // Mock de dados para demonstração
      const mockCaixa: CaixaStatus = {
        id: '1',
        data_abertura: new Date().toISOString(),
        usuario_abertura: usuario?.email || 'Usuario',
        valor_inicial: 200.00,
        valor_vendas: 1500.50,
        valor_sangrias: 300.00,
        valor_suprimentos: 100.00,
        valor_calculado: 1500.50,
        status: 'aberto',
        observacoes_abertura: 'Abertura normal do caixa'
      };
      
      setCaixaAtual(mockCaixa);
      
      // Mock de movimentos
      setMovimentos([
        {
          id: '1',
          tipo: 'sangria',
          valor: 200.00,
          descricao: 'Troco para posto de gasolina',
          usuario: usuario?.email || 'Usuario',
          data_movimento: new Date().toISOString()
        },
        {
          id: '2',
          tipo: 'suprimento',
          valor: 50.00,
          descricao: 'Dinheiro adicional',
          usuario: usuario?.email || 'Usuario',
          data_movimento: new Date().toISOString()
        }
      ]);
      
      // Mock de resumo de vendas
      setResumoVendas({
        total_vendas: 1500.50,
        vendas_dinheiro: 800.00,
        vendas_cartao: 500.50,
        vendas_pix: 200.00,
        vendas_outros: 0.00,
        quantidade_vendas: 15
      });
      
    } catch (error) {
      console.error('Erro ao carregar status do caixa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar informações do caixa',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirCaixa = async () => {
    try {
      if (!valorInicialAbertura || Number(valorInicialAbertura) <= 0) {
        toast({
          title: 'Erro',
          description: 'Informe um valor inicial válido',
          variant: 'destructive'
        });
        return;
      }

      // Aqui seria a chamada real para a API
      // await CaixaService.abrirCaixa({
      //   valor_inicial: Number(valorInicialAbertura),
      //   observacoes: observacoesAbertura
      // });

      toast({
        title: 'Sucesso',
        description: 'Caixa aberto com sucesso'
      });

      setAberturaOpen(false);
      setValorInicialAbertura('');
      setObservacoesAbertura('');
      loadCaixaStatus();

    } catch (error) {
      console.error('Erro ao abrir caixa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao abrir caixa',
        variant: 'destructive'
      });
    }
  };

  const handleFecharCaixa = async () => {
    try {
      if (!valorFinalFechamento || Number(valorFinalFechamento) <= 0) {
        toast({
          title: 'Erro',
          description: 'Informe o valor final do caixa',
          variant: 'destructive'
        });
        return;
      }

      // Aqui seria a chamada real para a API
      // await CaixaService.fecharCaixa({
      //   valor_final: Number(valorFinalFechamento),
      //   observacoes: observacoesFechamento
      // });

      toast({
        title: 'Sucesso',
        description: 'Caixa fechado com sucesso'
      });

      setFechamentoOpen(false);
      setValorFinalFechamento('');
      setObservacoesFechamento('');
      loadCaixaStatus();

    } catch (error) {
      console.error('Erro ao fechar caixa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao fechar caixa',
        variant: 'destructive'
      });
    }
  };

  const handleMovimentoCaixa = async () => {
    try {
      if (!valorMovimento || Number(valorMovimento) <= 0) {
        toast({
          title: 'Erro',
          description: 'Informe um valor válido',
          variant: 'destructive'
        });
        return;
      }

      if (!descricaoMovimento.trim()) {
        toast({
          title: 'Erro',
          description: 'Informe a descrição do movimento',
          variant: 'destructive'
        });
        return;
      }

      // Aqui seria a chamada real para a API
      // await CaixaService.adicionarMovimento({
      //   tipo: tipoMovimento,
      //   valor: Number(valorMovimento),
      //   descricao: descricaoMovimento
      // });

      toast({
        title: 'Sucesso',
        description: `${tipoMovimento === 'sangria' ? 'Sangria' : 'Suprimento'} registrado com sucesso`
      });

      setMovimentoOpen(false);
      setValorMovimento('');
      setDescricaoMovimento('');
      loadCaixaStatus();

    } catch (error) {
      console.error('Erro ao registrar movimento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao registrar movimento',
        variant: 'destructive'
      });
    }
  };

  const valorCalculadoFinal = caixaAtual 
    ? caixaAtual.valor_inicial + caixaAtual.valor_vendas - caixaAtual.valor_sangrias + caixaAtual.valor_suprimentos
    : 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando informações do caixa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Controle de Caixa</h1>
          <p className="text-gray-600">Gerencie abertura, fechamento e movimentações do caixa</p>
        </div>
        <div className="flex gap-2">
          {!caixaAtual || caixaAtual.status === 'fechado' ? (
            <Dialog open={aberturaOpen} onOpenChange={setAberturaOpen}>
              <DialogTrigger asChild>
                <Button>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Abrir Caixa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Abrir Caixa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="valor-inicial">Valor Inicial</Label>
                    <Input
                      id="valor-inicial"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={valorInicialAbertura}
                      onChange={(e) => setValorInicialAbertura(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="observacoes-abertura">Observações (opcional)</Label>
                    <Textarea
                      id="observacoes-abertura"
                      placeholder="Observações sobre a abertura do caixa..."
                      value={observacoesAbertura}
                      onChange={(e) => setObservacoesAbertura(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setAberturaOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAbrirCaixa}>
                      Abrir Caixa
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <>
              <Dialog open={movimentoOpen} onOpenChange={setMovimentoOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Calculator className="h-4 w-4 mr-2" />
                    Movimento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Movimento de Caixa</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Tipo de Movimento</Label>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant={tipoMovimento === 'sangria' ? 'default' : 'outline'}
                          onClick={() => setTipoMovimento('sangria')}
                          className="flex-1"
                        >
                          <TrendingDown className="h-4 w-4 mr-2" />
                          Sangria
                        </Button>
                        <Button
                          variant={tipoMovimento === 'suprimento' ? 'default' : 'outline'}
                          onClick={() => setTipoMovimento('suprimento')}
                          className="flex-1"
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Suprimento
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="valor-movimento">Valor</Label>
                      <Input
                        id="valor-movimento"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={valorMovimento}
                        onChange={(e) => setValorMovimento(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="descricao-movimento">Descrição</Label>
                      <Textarea
                        id="descricao-movimento"
                        placeholder="Motivo do movimento..."
                        value={descricaoMovimento}
                        onChange={(e) => setDescricaoMovimento(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setMovimentoOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleMovimentoCaixa}>
                        Registrar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={fechamentoOpen} onOpenChange={setFechamentoOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Fechar Caixa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Fechar Caixa</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Valor calculado pelo sistema: {valorCalculadoFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </AlertDescription>
                    </Alert>
                    <div>
                      <Label htmlFor="valor-final">Valor Final (conferido)</Label>
                      <Input
                        id="valor-final"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={valorFinalFechamento}
                        onChange={(e) => setValorFinalFechamento(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="observacoes-fechamento">Observações (opcional)</Label>
                      <Textarea
                        id="observacoes-fechamento"
                        placeholder="Observações sobre o fechamento do caixa..."
                        value={observacoesFechamento}
                        onChange={(e) => setObservacoesFechamento(e.target.value)}
                      />
                    </div>
                    {valorFinalFechamento && Number(valorFinalFechamento) !== valorCalculadoFinal && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Diferença encontrada:</strong> {(Number(valorFinalFechamento) - valorCalculadoFinal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setFechamentoOpen(false)}>
                        Cancelar
                      </Button>
                      <Button variant="destructive" onClick={handleFecharCaixa}>
                        Fechar Caixa
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Status do Caixa */}
      {caixaAtual && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Status do Caixa
              </CardTitle>
              <Badge variant={caixaAtual.status === 'aberto' ? 'default' : 'secondary'}>
                {caixaAtual.status === 'aberto' ? 'Aberto' : 'Fechado'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Valor Inicial</p>
                <p className="text-2xl font-bold text-blue-600">
                  {caixaAtual.valor_inicial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Vendas</p>
                <p className="text-2xl font-bold text-green-600">
                  +{caixaAtual.valor_vendas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Sangrias</p>
                <p className="text-2xl font-bold text-red-600">
                  -{caixaAtual.valor_sangrias.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Valor Calculado</p>
                <p className="text-2xl font-bold text-purple-600">
                  {valorCalculadoFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Aberto às {format(new Date(caixaAtual.data_abertura), 'HH:mm', { locale: ptBR })}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>{caixaAtual.usuario_abertura}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{format(new Date(caixaAtual.data_abertura), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>
            </div>

            {caixaAtual.observacoes_abertura && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Observações de abertura:</p>
                <p className="text-sm">{caixaAtual.observacoes_abertura}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resumo de Vendas */}
      {resumoVendas && caixaAtual?.status === 'aberto' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Resumo de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Total de Vendas</p>
                <p className="text-lg font-bold">
                  {resumoVendas.total_vendas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-xs text-gray-500">{resumoVendas.quantidade_vendas} vendas</p>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Banknote className="h-6 w-6 text-yellow-600" />
                </div>
                <p className="text-sm text-gray-600">Dinheiro</p>
                <p className="text-lg font-bold">
                  {resumoVendas.vendas_dinheiro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>

              <div className="text-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Cartão</p>
                <p className="text-lg font-bold">
                  {resumoVendas.vendas_cartao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>

              <div className="text-center">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600 font-bold">PIX</span>
                </div>
                <p className="text-sm text-gray-600">PIX</p>
                <p className="text-lg font-bold">
                  {resumoVendas.vendas_pix.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>

              <div className="text-center">
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Calculator className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm text-gray-600">Outros</p>
                <p className="text-lg font-bold">
                  {resumoVendas.vendas_outros.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Movimentos de Caixa */}
      {movimentos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Movimentos de Caixa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Data/Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimentos.map((movimento) => (
                  <TableRow key={movimento.id}>
                    <TableCell>
                      <Badge variant={movimento.tipo === 'sangria' ? 'destructive' : 'default'}>
                        {movimento.tipo === 'sangria' ? (
                          <>
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Sangria
                          </>
                        ) : (
                          <>
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Suprimento
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className={movimento.tipo === 'sangria' ? 'text-red-600' : 'text-green-600'}>
                      {movimento.tipo === 'sangria' ? '-' : '+'}
                      {movimento.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell>{movimento.descricao}</TableCell>
                    <TableCell>{movimento.usuario}</TableCell>
                    <TableCell>
                      {format(new Date(movimento.data_movimento), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Mensagem quando não há caixa aberto */}
      {!caixaAtual && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum caixa aberto</h3>
            <p className="text-gray-600 mb-4">
              Para iniciar as operações, você precisa abrir o caixa informando o valor inicial.
            </p>
            <Dialog open={aberturaOpen} onOpenChange={setAberturaOpen}>
              <DialogTrigger asChild>
                <Button>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Abrir Caixa
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 