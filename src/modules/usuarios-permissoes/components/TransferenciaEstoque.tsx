// Transferência de Estoque - Sistema Multi-Farmácia
// Módulo: M09-USUARIOS_PERMISSOES

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSimple } from '../hooks/useAuthSimple';
import { useFarmaciaAtual } from './SeletorFarmacia';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowRightLeft,
  Package,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Search,
  Loader2
} from 'lucide-react';
import type { TransferenciaEstoque, Farmacia } from '../types';

// Schema de validação para transferência
const transferenciaSchema = z.object({
  produto_id: z.string().min(1, 'Selecione um produto'),
  farmacia_destino_id: z.string().min(1, 'Selecione a farmácia de destino'),
  quantidade: z.number().min(1, 'Quantidade deve ser maior que zero'),
  observacoes: z.string().optional()
});

type TransferenciaFormData = z.infer<typeof transferenciaSchema>;

interface TransferenciaEstoqueProps {
  className?: string;
  onTransferenciaCompleta?: () => void;
}

interface Produto {
  id: string;
  nome: string;
  tipo: string;
  categoria: string;
  estoque_atual: number;
  unidade_medida: string;
}

/**
 * Componente para transferência de estoque entre farmácias
 */
export const TransferenciaEstoque: React.FC<TransferenciaEstoqueProps> = ({
  className = '',
  onTransferenciaCompleta
}) => {
  const { usuario } = useAuthSimple();
  const { farmacia, farmaciasDisponiveis } = useFarmaciaAtual();
  const { toast } = useToast();
  const [dialogAberto, setDialogAberto] = useState(false);
  const [fazendoTransferencia, setFazendoTransferencia] = useState(false);
  const [buscaProduto, setBuscaProduto] = useState('');

  // Form setup
  const form = useForm<TransferenciaFormData>({
    resolver: zodResolver(transferenciaSchema),
    defaultValues: {
      produto_id: '',
      farmacia_destino_id: '',
      quantidade: 1,
      observacoes: ''
    }
  });

  // Buscar produtos disponíveis na farmácia atual
  const { data: produtos, isLoading: carregandoProdutos } = useQuery({
    queryKey: ['produtos-estoque', farmacia?.id, buscaProduto],
    queryFn: async (): Promise<Produto[]> => {
      if (!farmacia?.id) return [];

      try {
        let query = supabase
          .from('produtos')
          .select('id, nome, tipo, categoria, estoque_atual, unidade_medida')
          .eq('farmacia_id', farmacia.id)
          .eq('ativo', true)
          .eq('is_deleted', false)
          .gt('estoque_atual', 0)
          .order('nome');

        if (buscaProduto.trim()) {
          query = query.ilike('nome', `%${buscaProduto.trim()}%`);
        }

        const { data, error } = await query.limit(50);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
      }
    },
    enabled: !!farmacia?.id,
    staleTime: 2 * 60 * 1000 // 2 minutos
  });

  // Farmácias de destino (excluindo a atual)
  const farmaciasDestino = farmaciasDisponiveis.filter(f => f.id !== farmacia?.id);

  // Produto selecionado
  const produtoSelecionado = produtos?.find(p => p.id === form.watch('produto_id'));

  /**
   * Realizar transferência de estoque
   */
  const realizarTransferencia = useCallback(async (data: TransferenciaFormData) => {
    if (!farmacia?.id || !usuario?.proprietario_id) {
      toast({
        title: 'Erro',
        description: 'Informações de farmácia não encontradas.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setFazendoTransferencia(true);

      // Chamar Edge Function para transferência
      const response = await fetch('/api/transferir-estoque', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          produto_id: data.produto_id,
          farmacia_origem_id: farmacia.id,
          farmacia_destino_id: data.farmacia_destino_id,
          quantidade: data.quantidade,
          observacoes: data.observacoes || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na transferência');
      }

      const resultado = await response.json();

      toast({
        title: 'Transferência realizada',
        description: `${data.quantidade} unidades transferidas com sucesso.`,
      });

      // Reset form e fechar dialog
      form.reset();
      setDialogAberto(false);

      // Callback de conclusão
      if (onTransferenciaCompleta) {
        onTransferenciaCompleta();
      }

    } catch (error) {
      console.error('Erro na transferência:', error);
      toast({
        title: 'Erro na transferência',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setFazendoTransferencia(false);
    }
  }, [farmacia?.id, usuario?.proprietario_id, form, toast, onTransferenciaCompleta]);

  // Se não há farmácias de destino, não mostrar o componente
  if (!farmacia || farmaciasDestino.length === 0) {
    return null;
  }

  return (
    <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          Transferir Estoque
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transferir Estoque Entre Farmácias
          </DialogTitle>
          <DialogDescription>
            Transfira produtos da {farmacia.nome_fantasia} para outra farmácia da rede.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(realizarTransferencia)} className="space-y-6">
            {/* Farmácia de origem (readonly) */}
            <div className="space-y-2">
              <Label>Farmácia de Origem</Label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{farmacia.nome_fantasia}</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Atual
                  </Badge>
                </div>
              </div>
            </div>

            {/* Busca de produto */}
            <div className="space-y-2">
              <Label>Buscar Produto</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Digite o nome do produto..."
                  value={buscaProduto}
                  onChange={(e) => setBuscaProduto(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Seleção de produto */}
            <FormField
              control={form.control}
              name="produto_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {carregandoProdutos ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Carregando produtos...</span>
                        </div>
                      ) : produtos?.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          {buscaProduto ? 'Nenhum produto encontrado' : 'Nenhum produto com estoque disponível'}
                        </div>
                      ) : (
                        produtos?.map((produto) => (
                          <SelectItem key={produto.id} value={produto.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{produto.nome}</span>
                              <Badge variant="outline" className="ml-2">
                                {produto.estoque_atual} {produto.unidade_medida}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Informações do produto selecionado */}
            {produtoSelecionado && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Produto Selecionado</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Categoria:</span>
                    <span className="ml-2 font-medium">{produtoSelecionado.categoria}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Estoque Disponível:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {produtoSelecionado.estoque_atual} {produtoSelecionado.unidade_medida}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Farmácia de destino */}
            <FormField
              control={form.control}
              name="farmacia_destino_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farmácia de Destino</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a farmácia de destino" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {farmaciasDestino.map((farmaciaDestino) => (
                        <SelectItem key={farmaciaDestino.id} value={farmaciaDestino.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>{farmaciaDestino.nome_fantasia}</span>
                            {farmaciaDestino.matriz && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Matriz
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantidade */}
            <FormField
              control={form.control}
              name="quantidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max={produtoSelecionado?.estoque_atual || 999999}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    {produtoSelecionado && (
                      <>Máximo disponível: {produtoSelecionado.estoque_atual} {produtoSelecionado.unidade_medida}</>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Observações */}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Motivo da transferência, instruções especiais, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botões */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="submit"
                disabled={fazendoTransferencia || !produtoSelecionado}
                className="flex-1"
              >
                {fazendoTransferencia ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Transferindo...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Confirmar Transferência
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogAberto(false)}
                disabled={fazendoTransferencia}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TransferenciaEstoque; 