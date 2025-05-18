
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Schema de validação Zod para o formulário de embalagens
const embalagemSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  volume_capacidade: z.string().optional(),
  custo_unitario: z.coerce.number().positive('Custo deve ser positivo'),
  fornecedor_id: z.string().optional().nullable(),
  descricao: z.string().optional(),
  estoque_atual: z.coerce.number().int().default(0),
  estoque_minimo: z.coerce.number().int().default(0),
  estoque_maximo: z.coerce.number().int().optional().nullable(),
});

export type EmbalagemFormValues = z.infer<typeof embalagemSchema>;

interface EmbalagemFormProps {
  defaultValues?: Partial<EmbalagemFormValues>;
  isEditing?: boolean;
  embalagemId?: string;
}

const EmbalagemForm: React.FC<EmbalagemFormProps> = ({ 
  defaultValues = {}, 
  isEditing = false,
  embalagemId 
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configurar o formulário com React Hook Form e validação Zod
  const form = useForm<EmbalagemFormValues>({
    resolver: zodResolver(embalagemSchema),
    defaultValues: {
      nome: '',
      tipo: '',
      volume_capacidade: '',
      custo_unitario: 0,
      fornecedor_id: null,
      descricao: '',
      estoque_atual: 0,
      estoque_minimo: 0,
      estoque_maximo: null,
      ...defaultValues
    }
  });

  // Buscar fornecedores para o dropdown
  const { data: fornecedores, isLoading: isFornecedoresLoading } = useQuery({
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

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: EmbalagemFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing && embalagemId) {
        // Atualizar embalagem existente
        const { error } = await supabase
          .from('embalagens')
          .update(data)
          .eq('id', embalagemId);

        if (error) throw error;
        
        toast({
          title: "Embalagem atualizada",
          description: "A embalagem foi atualizada com sucesso.",
        });
      } else {
        // Inserir nova embalagem - garantir que campos obrigatórios estejam presentes
        const newEmbalagem = {
          nome: data.nome,
          tipo: data.tipo,
          custo_unitario: data.custo_unitario,
          volume_capacidade: data.volume_capacidade || null,
          fornecedor_id: data.fornecedor_id || null,
          descricao: data.descricao || null,
          estoque_atual: data.estoque_atual || 0,
          estoque_minimo: data.estoque_minimo || 0,
          estoque_maximo: data.estoque_maximo || null
        };
        
        const { error } = await supabase
          .from('embalagens')
          .insert(newEmbalagem);

        if (error) throw error;
        
        toast({
          title: "Embalagem adicionada",
          description: "A nova embalagem foi adicionada com sucesso.",
        });
      }
      
      // Redirecionar para a lista de embalagens
      navigate('/admin/estoque/embalagens');
    } catch (error: any) {
      console.error('Erro ao salvar embalagem:', error);
      toast({
        title: "Erro",
        description: `Não foi possível salvar a embalagem: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome */}
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da embalagem" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipo */}
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Frasco Gotas">Frasco Gotas</SelectItem>
                    <SelectItem value="Pote Glóbulos">Pote Glóbulos</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Volume/Capacidade */}
          <FormField
            control={form.control}
            name="volume_capacidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volume/Capacidade</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 10ml, 30g" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Custo Unitário */}
          <FormField
            control={form.control}
            name="custo_unitario"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custo Unitário</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
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
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      {isFornecedoresLoading ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Carregando fornecedores...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Selecione um fornecedor" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
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

          {/* Estoque Atual */}
          <FormField
            control={form.control}
            name="estoque_atual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estoque Atual</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Estoque Mínimo */}
          <FormField
            control={form.control}
            name="estoque_minimo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estoque Mínimo</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Estoque Máximo */}
          <FormField
            control={form.control}
            name="estoque_maximo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estoque Máximo</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Descrição */}
          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea placeholder="Descrição da embalagem" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => navigate('/admin/estoque/embalagens')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Atualizando...' : 'Salvando...'}
              </>
            ) : (
              isEditing ? 'Salvar Alterações' : 'Salvar Embalagem'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EmbalagemForm;
