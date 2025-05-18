
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// Zod schema for form validation
const loteInsumoSchema = z.object({
  insumo_id: z.string({
    required_error: "Por favor, selecione um insumo",
  }),
  numero_lote: z.string({
    required_error: "Número do lote é obrigatório",
  }).min(1, "Número do lote é obrigatório"),
  quantidade_inicial: z.number({
    required_error: "Quantidade inicial é obrigatória",
    invalid_type_error: "Quantidade inicial deve ser um número",
  }).positive("Quantidade inicial deve ser maior que zero"),
  quantidade_atual: z.number({
    required_error: "Quantidade atual é obrigatória",
    invalid_type_error: "Quantidade atual deve ser um número",
  }).nonnegative("Quantidade atual não pode ser negativa"),
  data_validade: z.date().nullable(),
  fornecedor_id: z.string().nullable(),
  custo_unitario_lote: z.number().nullable(),
  localizacao: z.string().nullable(),
  notas: z.string().nullable(),
  unidade_medida: z.string()
});

type LoteFormValues = z.infer<typeof loteInsumoSchema>;

interface LoteInsumoFormProps {
  initialData?: any;
  isEditing?: boolean;
  loteId?: string;
  insumoId?: string;
}

const LoteInsumoForm = ({ initialData, isEditing = false, loteId, insumoId }: LoteInsumoFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedInsumoId, setSelectedInsumoId] = useState<string | null>(insumoId || null);

  // Form initialization
  const form = useForm<LoteFormValues>({
    resolver: zodResolver(loteInsumoSchema),
    defaultValues: {
      insumo_id: insumoId || "",
      numero_lote: "",
      quantidade_inicial: 0,
      quantidade_atual: 0,
      data_validade: null,
      fornecedor_id: null,
      custo_unitario_lote: null,
      localizacao: null,
      notas: null,
      unidade_medida: ""
    }
  });

  // Fetch insumos data for select
  const { data: insumos, isLoading: isLoadingInsumos } = useQuery({
    queryKey: ['insumos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insumos')
        .select('id, nome, unidade_medida')
        .eq('is_deleted', false)
        .order('nome');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch fornecedores data for select
  const { data: fornecedores, isLoading: isLoadingFornecedores } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fornecedores')
        .select('id, nome')
        .order('nome');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch specific insumo details when selected to get the unit of measure
  const { data: selectedInsumo, isLoading: isLoadingInsumoDetails } = useQuery({
    queryKey: ['insumo', selectedInsumoId],
    queryFn: async () => {
      if (!selectedInsumoId) return null;
      
      const { data, error } = await supabase
        .from('insumos')
        .select('id, nome, unidade_medida')
        .eq('id', selectedInsumoId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedInsumoId,
  });

  // Fetch lote data in edit mode
  const { data: loteData, isLoading: isLoadingLote } = useQuery({
    queryKey: ['lote', loteId],
    queryFn: async () => {
      if (!loteId) return null;
      
      const { data, error } = await supabase
        .from('lotes_insumos')
        .select(`
          id,
          insumo_id,
          numero_lote,
          data_validade,
          quantidade_inicial,
          quantidade_atual,
          unidade_medida,
          fornecedor_id,
          custo_unitario_lote,
          localizacao,
          notas
        `)
        .eq('id', loteId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!loteId && isEditing,
  });

  // Update form when lote data is loaded in edit mode
  useEffect(() => {
    if (loteData) {
      setSelectedInsumoId(loteData.insumo_id);
      form.reset({
        insumo_id: loteData.insumo_id,
        numero_lote: loteData.numero_lote,
        quantidade_inicial: loteData.quantidade_inicial,
        quantidade_atual: loteData.quantidade_atual,
        data_validade: loteData.data_validade ? new Date(loteData.data_validade) : null,
        fornecedor_id: loteData.fornecedor_id,
        custo_unitario_lote: loteData.custo_unitario_lote,
        localizacao: loteData.localizacao,
        notas: loteData.notas,
        unidade_medida: loteData.unidade_medida
      });
    }
  }, [loteData, form]);

  // Effect to update form when insumo changes
  useEffect(() => {
    if (selectedInsumo) {
      form.setValue('unidade_medida', selectedInsumo.unidade_medida);
    }
  }, [selectedInsumo, form]);

  // Handling insumo selection
  const handleInsumoChange = (insumoId: string) => {
    setSelectedInsumoId(insumoId);
    form.setValue('insumo_id', insumoId);
  };

  // Create/update mutation
  const mutation = useMutation({
    mutationFn: async (values: LoteFormValues) => {
      // For creation, set quantidade_atual = quantidade_inicial
      if (!isEditing) {
        values.quantidade_atual = values.quantidade_inicial;
      }
      
      // Format the date to ISO string if it exists
      const formattedDate = values.data_validade ? values.data_validade.toISOString().split('T')[0] : null;
      
      if (isEditing && loteId) {
        const { data, error } = await supabase
          .from('lotes_insumos')
          .update({
            insumo_id: values.insumo_id,
            numero_lote: values.numero_lote,
            data_validade: formattedDate,
            quantidade_inicial: values.quantidade_inicial,
            quantidade_atual: values.quantidade_atual,
            quantidade: values.quantidade_atual, // Set quantidade to match quantidade_atual
            unidade_medida: values.unidade_medida,
            fornecedor_id: values.fornecedor_id || null,
            custo_unitario_lote: values.custo_unitario_lote || null,
            localizacao: values.localizacao || null,
            notas: values.notas || null
          })
          .eq('id', loteId);
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('lotes_insumos')
          .insert({
            insumo_id: values.insumo_id,
            numero_lote: values.numero_lote,
            data_validade: formattedDate,
            quantidade_inicial: values.quantidade_inicial,
            quantidade_atual: values.quantidade_atual,
            quantidade: values.quantidade_atual, // Set quantidade to match quantidade_atual
            unidade_medida: values.unidade_medida,
            fornecedor_id: values.fornecedor_id || null,
            custo_unitario_lote: values.custo_unitario_lote || null,
            localizacao: values.localizacao || null,
            notas: values.notas || null
          })
          .select();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Lote atualizado" : "Lote criado",
        description: isEditing 
          ? "O lote foi atualizado com sucesso." 
          : "Um novo lote foi criado com sucesso.",
        variant: "success",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
      queryClient.invalidateQueries({ queryKey: ['lotes', form.getValues().insumo_id] });
      
      // Navigate back
      navigateBack();
    },
    onError: (error) => {
      console.error("Erro ao salvar lote:", error);
      toast({
        title: "Erro",
        description: `Ocorreu um erro ao ${isEditing ? 'atualizar' : 'criar'} o lote. Por favor, tente novamente.`,
        variant: "destructive",
      });
    }
  });

  function onSubmit(values: LoteFormValues) {
    mutation.mutate(values);
  }

  function navigateBack() {
    if (selectedInsumoId) {
      navigate(`/admin/estoque/insumos/editar/${selectedInsumoId}`);
    } else {
      navigate('/admin/estoque/insumos');
    }
  }

  const isLoading = isLoadingLote || mutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isEditing ? 'Editar Lote de Insumo' : 'Novo Lote de Insumo'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize as informações do lote' : 'Cadastre um novo lote para um insumo'}
          </p>
        </div>
        <Button variant="outline" onClick={navigateBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>

      {(isLoadingLote || isLoadingInsumos || isLoadingInsumoDetails) ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Insumo Select */}
              <FormField
                control={form.control}
                name="insumo_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insumo</FormLabel>
                    <Select 
                      onValueChange={(value) => handleInsumoChange(value)}
                      value={field.value || undefined}
                      disabled={isEditing || !!insumoId || isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um insumo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {insumos?.map((insumo) => (
                          <SelectItem key={insumo.id} value={insumo.id}>
                            {insumo.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Número do Lote */}
              <FormField
                control={form.control}
                name="numero_lote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Lote</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: LOT123456" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unidade de Medida - Readonly */}
              <FormField
                control={form.control}
                name="unidade_medida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade de Medida</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        readOnly
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      A unidade de medida é definida pelo insumo selecionado
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantidade Inicial */}
              <FormField
                control={form.control}
                name="quantidade_inicial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade Inicial</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                          
                          // If creating new, set quantidade_atual = quantidade_inicial
                          if (!isEditing) {
                            form.setValue('quantidade_atual', isNaN(value) ? 0 : value);
                          }
                        }}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantidade Atual (only editable in edit mode) */}
              <FormField
                control={form.control}
                name="quantidade_atual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade Atual</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                        disabled={!isEditing || isLoading}
                      />
                    </FormControl>
                    {!isEditing && (
                      <FormDescription>
                        Na criação, a quantidade atual será igual à quantidade inicial
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Data de Validade */}
              <FormField
                control={form.control}
                name="data_validade"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Validade</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isLoading}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={isLoading}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Data de validade do lote (opcional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fornecedor */}
              <FormField
                control={form.control}
                name="fornecedor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={isLoading || isLoadingFornecedores}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um fornecedor (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fornecedores?.map((fornecedor) => (
                          <SelectItem key={fornecedor.id} value={fornecedor.id}>
                            {fornecedor.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Custo Unitário do Lote */}
              <FormField
                control={form.control}
                name="custo_unitario_lote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo Unitário do Lote (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00" 
                        {...field}
                        value={field.value === null ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Custo unitário específico deste lote (opcional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Localização */}
              <FormField
                control={form.control}
                name="localizacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Prateleira A3, Gaveta B2" 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Local de armazenamento do lote (opcional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notas */}
            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionais</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais sobre este lote..." 
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Salvando..." : "Criando..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? "Salvar Alterações" : "Salvar Lote"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default LoteInsumoForm;
